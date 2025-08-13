"use client";
import React from "react";

type Props = {
  /** Your master/base price in INR (number only, no commas) */
  baseInr: number;
  /** Small label under the big price, e.g. "one-time" */
  subLabel?: string;
  /** Optional extra classes for styling the number */
  className?: string;
};

/**
 * Super simple currency converter:
 * - Detects visitor's country/currency via Abstract IP Geolocation
 * - Converts from INR using a small internal rate table (update anytime)
 * - Falls back to INR if unknown
 *
 * NOTE: These are example rates. Update monthly for accuracy.
 */
const RATES_VS_INR: Record<string, number> = {
  // currencyCode: INR -> target rate (target = INR * rate)
  USD: 0.012,  // ₹1 → $0.012  (₹10,000 ≈ $120)
  EUR: 0.011,  // ₹1 → €0.011
  GBP: 0.0095, // ₹1 → £0.0095
  AUD: 0.018,  // ₹1 → A$0.018
  CAD: 0.016,  // ₹1 → C$0.016
  SGD: 0.016,  // ₹1 → S$0.016
  AED: 0.044,  // ₹1 → د.إ0.044
  // add more if you like
};

/** map currency to a “good enough” locale for number formatting */
const LOCALE_BY_CURRENCY: Record<string, string> = {
  USD: "en-US",
  EUR: "de-DE", // decent default for €
  GBP: "en-GB",
  AUD: "en-AU",
  CAD: "en-CA",
  SGD: "en-SG",
  AED: "ar-AE",
  INR: "en-IN",
};

export default function GeoPrice({ baseInr, subLabel = "one-time", className = "" }: Props) {
  const [display, setDisplay] = React.useState<{
    currency: string;
    amount: number;
    locale: string;
  }>({ currency: "INR", amount: baseInr, locale: "en-IN" });

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_ABSTRACT_API_KEY;
        if (!apiKey) throw new Error("Missing NEXT_PUBLIC_ABSTRACT_API_KEY");

        // Ask Abstract about the visitor
        const res = await fetch(
          `https://ipgeolocation.abstractapi.com/v1/?api_key=${apiKey}`
        );
        if (!res.ok) throw new Error("Abstract request failed");
        const data = await res.json();

        const currencyCode: string = data?.currency?.code || "INR";
        const rate = RATES_VS_INR[currencyCode] ?? 1; // 1 means “stay in INR”
        const locale = LOCALE_BY_CURRENCY[currencyCode] ?? "en-IN";

        const converted = Math.round(baseInr * rate);

        if (!cancelled) {
          setDisplay({
            currency: RATES_VS_INR[currencyCode] ? currencyCode : "INR",
            amount: RATES_VS_INR[currencyCode] ? converted : baseInr,
            locale,
          });
        }
      } catch {
        // Fallback to INR silently
        if (!cancelled) {
          setDisplay({ currency: "INR", amount: baseInr, locale: "en-IN" });
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [baseInr]);

  const formatted = new Intl.NumberFormat(display.locale, {
    style: "currency",
    currency: display.currency,
    maximumFractionDigits: 0,
  }).format(display.amount);

  return (
    <div className="flex items-end gap-2">
      <div className={`text-5xl font-extrabold tracking-tight ${className}`}>{formatted}</div>
      <div className="text-slate-500 mb-1 text-sm">{subLabel}</div>
    </div>
  );
}
