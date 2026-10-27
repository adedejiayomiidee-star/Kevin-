import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getPlan } from "@/lib/plans";
import { supabaseAdmin } from "@/lib/supabase";
import { createInvoice } from "@/lib/nowpayments";
import { hashToken, newAccessToken } from "@/lib/crypto";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_COINS = new Set(["usdttrc20", "usdtbsc", "btc", "eth"]);

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const body = await request.json();
    const plan = getPlan(body.planSlug);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const payCurrency = typeof body.payCurrency === "string" ? body.payCurrency : "";
    if (!plan) return NextResponse.json({ error: "Please choose a valid plan." }, { status: 400 });
    if (!EMAIL.test(email) || email.length > 254) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    if (!ALLOWED_COINS.has(payCurrency)) return NextResponse.json({ error: "Unsupported payment option." }, { status: 400 });

    const db = supabaseAdmin();
    const orderId = randomUUID();
    const accessToken = newAccessToken();
    const { error: insertError } = await db.from("orders").insert({
      id: orderId,
      customer_email: email,
      plan_slug: plan.slug,
      amount_usd: plan.priceUsd,
      pay_currency: payCurrency,
      status: "awaiting_payment",
      access_token_hash: hashToken(accessToken),
      request_ip_hash: hashToken(ip)
    });
    if (insertError) throw insertError;

    try {
      const invoice = await createInvoice({
        orderId, amountUsd: plan.priceUsd, email, description: `ProxyHarbor ${plan.name}`, payCurrency
      });
      const { error: updateError } = await db.from("orders").update({
        payment_invoice_id: invoice.invoiceId,
        payment_invoice_url: invoice.invoiceUrl
      }).eq("id", orderId);
      if (updateError) throw updateError;
      return NextResponse.json({
        orderId,
        invoiceUrl: invoice.invoiceUrl,
        orderAccessUrl: `${process.env.APP_BASE_URL?.replace(/\/$/, "")}/api/orders/${orderId}?token=${encodeURIComponent(accessToken)}`
      });
    } catch (e) {
      await db.from("orders").update({ status: "checkout_error" }).eq("id", orderId);
      throw e;
    }
  } catch (error) {
    console.error("checkout_error", error);
    return NextResponse.json({
      error: "Checkout is not ready. The site owner must configure Supabase and NOWPayments environment variables."
    }, { status: 503 });
  }
}