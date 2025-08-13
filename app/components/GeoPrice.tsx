"use client";

import React from "react";

type Props = {
  /** Your base price in INR (e.g., 24999) */
  baseInr: number;
  /** small label under the price, e.g., "one-time" */
  subLabel?: string;
  /** optional className wrapper */
  className?: string;
};

type DisplayPrice = {
  code: string;     // e.g., "USD"
  symbol: string;   // e.g., "$"
  amount: number;   // e.g., 299.99
  formatted: string; // e.g., "$299.99"
};

const FALLBACK: DisplayPrice = {
  code: "INR",
  symbol: "₹",
  amount: 0,
  formatted: "₹0",
};

function fmtCurrency(amount: number, code: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0, // looks nicer for course pricing; change to 2 if you want cents
    }).format(amount);
  } catch {
    // Rare currencies might fail; fallback to simple formatting
    return `${amount.toFixed(0)} ${code}`;
  }
}

export default function GeoPrice({ baseInr, subLabel, className }: Props) {
  const [price, setPrice] = React.useState<DisplayPrice>({
    ...FALLBACK,
    amount: baseInr,
    formatted: fmtCurrency(baseInr, "INR"),
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let canceled = false;

    async function run() {
      try {
        // 1) Detect visitor's currency via Abstract IP Geolocation
        const key = process.env.NEXT_PUBLIC_ABSTRACT_API_KEY;
        const geoUrl = `https://ipgeolocation.abstractapi.com/v1/?api_key=${key}`;
        const geoRes = await fetch(geoUrl);
        const geo = await geoRes.json();

        // Abstract returns: { currency: { code, symbol, ... }, country_code, ... }
        const currencyCode: string = geo?.currency?.code || "INR";
        const currencySymbol: string = geo?.currency?.symbol || "₹";

        // If currency is already INR, no conversion needed
        if (currencyCode === "INR") {
          if (!canceled) {
            setPrice({
              code: "INR",
              symbol: "₹",
              amount: baseInr,
              formatted: fmtCurrency(baseInr, "INR"),
            });
          }
          return;
        }

        // 2) Convert INR -> local currency using a free ECB rates API (no key needed)
        // Docs: https://www.frankfurter.app/
        const rateUrl = `https://api.frankfurter.app/latest?from=INR&to=${currencyCode}`;
        const rateRes = await fetch(rateUrl);
        if (!rateRes.ok) throw new Error("Rate API failed");
        const rateData = await rateRes.json();

        const rate = rateData?.rates?.[currencyCode];
        if (!rate) throw new Error("Rate not found");

        const converted = baseInr * rate;

        if (!canceled) {
          setPrice({
            code: currencyCode,
            symbol: currencySymbol,
            amount: converted,
            formatted: fmtCurrency(converted, currencyCode),
          });
        }
      } catch (e) {
        // On any error: show INR, no crash
        if (!canceled) {
          setPrice({
            code: "INR",
            symbol: "₹",
            amount: baseInr,
            formatted: fmtCurrency(baseInr, "INR"),
          });
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    run();
    return () => {
      canceled = true;
    };
  }, [baseInr]);

  return (
    <div className={className}>
      <div className="mt-4 flex items-end gap-2">
        {/* Symbol kept small to look neat */}
        <div className="text-2xl font-semibold">{price.symbol}</div>
        <div className="text-5xl font-extrabold tracking-tight">
          {loading ? "…" : price.formatted.replace(price.symbol, "").trim()}
        </div>
        <div className="text-slate-500 mb-1 text-sm">{loading ? "" : price.code}</div>
      </div>
      {subLabel && (
        <div className="text-slate-500 mb-1 text-sm">{subLabel}</div>
      )}
      {/* Optional tiny note—remove if you don't want it */}
      {/* <div className="text-[11px] text-slate-400 mt-1">Converted from INR at current ECB rates.</div> */}
    </div>
  );
}
