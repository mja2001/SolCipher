import React from "react";

type Plan = {
  name: string;
  priceMonthly: number | "custom";
  features: string[];
  cta: { label: string; href: string };
  highlight?: boolean;
};

const plans: Plan[] = [
  {
    name: "Free",
    priceMonthly: 0,
    features: [
      "1 GB storage",
      "100 MB per file",
      "2 links/day",
      "7-day expiry",
      "Community support",
      "E2E encryption"
    ],
    cta: { label: "Start free", href: "/signup" }
  },
  {
    name: "Personal",
    priceMonthly: 6,
    features: [
      "50 GB storage",
      "2 GB per file",
      "Unlimited links",
      "30-day expiry",
      "Email support",
      "IPFS pinning"
    ],
    cta: { label: "Go Personal", href: "/checkout?plan=personal" }
  },
  {
    name: "Pro",
    priceMonthly: 14,
    features: [
      "200 GB storage",
      "5 GB per file",
      "Custom expiry",
      "Versioning",
      "Priority support",
      "On-chain receipts"
    ],
    cta: { label: "Upgrade to Pro", href: "/checkout?plan=pro" },
    highlight: true
  },
  {
    name: "Team",
    priceMonthly: 49,
    features: [
      "1 TB pooled",
      "10 GB per file",
      "Up to 10 seats",
      "Roles & audit log",
      "SSO-lite",
      "API access"
    ],
    cta: { label: "Start Team", href: "/checkout?plan=team" }
  },
  {
    name: "Enterprise",
    priceMonthly: "custom",
    features: [
      "SSO/SAML + SCIM",
      "BYOK / on-prem KMS",
      "DPA & audit support",
      "99.9% uptime SLA",
      "Named TAM"
    ],
    cta: { label: "Request a quote", href: "/contact?topic=enterprise" }
  }
];

export default function PricingGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold">Choose your plan</h1>
        <p className="mt-2 text-sm text-gray-600">Cancel anytime. Taxes may apply.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {plans.map((p) => (
          <article
            key={p.name}
            className={`rounded-2xl border p-6 shadow-sm ${
              p.highlight ? "border-black shadow-lg" : "border-gray-200"
            }`}
          >
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <div className="mt-3">
              {p.priceMonthly === "custom" ? (
                <span className="text-3xl font-bold">Custom</span>
              ) : (
                <span className="text-3xl font-bold">${p.priceMonthly}</span>
              )}
              {p.priceMonthly !== "custom" && <span className="text-sm text-gray-500">/mo</span>}
            </div>

            <ul className="mt-4 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span aria-hidden>✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <a
              href={p.cta.href}
              className={`mt-6 inline-block w-full rounded-xl px-4 py-2 text-center text-sm font-medium ${
                p.highlight ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {p.cta.label}
            </a>
          </article>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-gray-500">
        Need invoices, crypto payments, or yearly billing? <a href="/contact" className="underline">Contact sales</a>.
      </p>
    </section>
  );
}

