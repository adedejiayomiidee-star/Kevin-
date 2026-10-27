/**
 * Internal contract for your chosen proxy reseller.
 * Implement server-side only, after reseller access is approved.
 * Do not expose supplier API keys or raw credentials to the browser.
 */
export type ProvisionRequest = {
  productSlug: string;
  customerEmail: string;
  customerReference: string; // your immutable order ID; used for idempotency/reconciliation
  dataGb?: number;
  billingPeriod?: string;
};

export type ProvisionedProxy = {
  providerPackageId: string;
  status: "active" | "pending";
  host: string;
  port: number;
  username: string;
  password: string;
  expiresAt?: string | null;
  trafficLimitGb?: number | null;
};

export interface ProxyReseller {
  quote(productSlug: string, dataGb?: number): Promise<{ costUsd: number }>;
  provision(input: ProvisionRequest): Promise<ProvisionedProxy>;
  usage(providerPackageId: string): Promise<{ usedGb: number; remainingGb: number }>;
}
