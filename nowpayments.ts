import { createHmac, timingSafeEqual } from "node:crypto";

const API_BASE = "https://api.nowpayments.io/v1";

export async function createInvoice(input: {
  orderId: string; amountUsd: number; email: string; description: string; payCurrency: string;
}) {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const baseUrl = process.env.APP_BASE_URL;
  if (!apiKey || !baseUrl) throw new Error("NOWPayments or APP_BASE_URL is not configured.");
  const response = await fetch(`${API_BASE}/invoice`, {
    method: "POST",
    headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      price_amount: input.amountUsd,
      price_currency: "usd",
      order_id: input.orderId,
      order_description: input.description,
      pay_currency: input.payCurrency,
      ipn_callback_url: `${baseUrl.replace(/\/$/, "")}/api/webhooks/nowpayments`,
      success_url: `${baseUrl.replace(/\/$/, "")}/?payment=return`,
      cancel_url: `${baseUrl.replace(/\/$/, "")}/?payment=cancelled`
    }),
    cache: "no-store"
  });
  const body = await response.json();
  if (!response.ok || !body.invoice_url || !body.id) {
    throw new Error(`NOWPayments invoice creation failed: ${JSON.stringify(body)}`);
  }
  return { invoiceId: String(body.id), invoiceUrl: String(body.invoice_url) };
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return `{${Object.keys(obj).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(obj[key])}`).join(",")}}`;
  }
  const encoded = JSON.stringify(value);
  return encoded ?? "null";
}

export function verifyNowPaymentsSignature(payload: Record<string, unknown>, signature: string | null): boolean {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha512", secret).update(stableStringify(payload)).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}