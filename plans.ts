export type Plan = {
  slug: string;
  name: string;
  category: "Residential" | "Datacenter";
  description: string;
  priceUsd: number;
  supplierType: "residential" | "datacenter";
  bandwidthGb: number;
  featured?: boolean;
};

export const PLANS: Plan[] = [
  {
    slug: "residential-5gb",
    name: "Residential Starter",
    category: "Residential",
    description: "5 GB traffic · residential IP pool",
    priceUsd: 7.99,
    supplierType: "residential",
    bandwidthGb: 5
  },
  {
    slug: "residential-10gb",
    name: "Residential Plus",
    category: "Residential",
    description: "10 GB traffic · for larger research tasks",
    priceUsd: 13.99,
    supplierType: "residential",
    bandwidthGb: 10,
    featured: true
  },
  {
    slug: "datacenter-5gb",
    name: "Datacenter Starter",
    category: "Datacenter",
    description: "5 GB traffic · fast datacenter access",
    priceUsd: 5.99,
    supplierType: "datacenter",
    bandwidthGb: 5
  }
];

export function getPlan(slug: unknown): Plan | undefined {
  return typeof slug === "string" ? PLANS.find((p) => p.slug === slug) : undefined;
}