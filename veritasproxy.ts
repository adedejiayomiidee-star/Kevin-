import type { Plan } from "./plans";

const API_BASE = "https://veritasproxy.com/api/v1";

export type ProxyCredentials = {
  providerPlanId: string;
  status: "active" | "pending";
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  proxyUrl?: string;
  bandwidthGb: number;
};

export async function provisionProxy(plan: Plan, customerReference: string): Promise<ProxyCredentials> {
  const key = process.env.VERITASPROXY_API_KEY;
  if (!key) throw new Error("VERITASPROXY_API_KEY is not configured.");
  const response = await fetch(`${API_BASE}/plans`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "Idempotency-Key": customerReference
    },
    body: JSON.stringify({
      type: plan.supplierType,
      bandwidth_gb: plan.bandwidthGb,
      label: customerReference.slice(0, 64)
    }),
    cache: "no-store"
  });
  const body = await response.json();
  if (!response.ok || !body.plan) {
    throw new Error(`VeritasProxy provisioning failed: ${JSON.stringify(body)}`);
  }
  const p = body.plan;
  const proxyUrl = typeof p.proxy === "string" ? p.proxy : "";
  let host = "ip.veritasproxy.com";
  let port = 8080;
  try {
    if (proxyUrl) {
      const parsed = new URL(proxyUrl);
      host = parsed.hostname;
      port = Number(parsed.port || 8080);
    }
  } catch {}
  return {
    providerPlanId: String(p.id),
    status: p.status === "active" ? "active" : "pending",
    type: String(p.type ?? plan.supplierType),
    host,
    port,
    username: String(p.username ?? ""),
    password: String(p.password ?? ""),
    proxyUrl,
    bandwidthGb: Number(p.bandwidth?.total_gb ?? plan.bandwidthGb)
  };
}