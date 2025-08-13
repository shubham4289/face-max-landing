// app/components/GeoPrice.tsx
"use client";
import React from "react";

type Props = {
  baseInr: number;           // e.g. 24999
  subLabel?: string;         // e.g. "one-time"
};

export default function GeoPrice({ baseInr, subLabel }: Props) {
  const [state, setState] = React.useState<{
    loading: boolean;
    symbol: string;
    code: string;
    amount: number;
  }>({
    loading: true,
    symbol: "₹",
    code: "INR",
    amount: baseInr,
  });

  React.useEffect(() => {
    let dead = false;
    async function run() {
      try {
        const res = await fetch(`/api/geo-price?baseInr=${baseInr}`, { cache: "no-store" });
        const json = await res.json();
        if (dead) return;

        if (json?.ok && json?.currency && json?.price) {
          setState({
            loading: false,
            symbol: json.currency.symbol || "₹",
            code: json.currency.code || "INR",
            amount: json.price.converted ?? baseInr,
          });
        } else {
          setState((s) => ({ ...s, loading: false }));
        }
      } catch {
        setState((s) => ({ ...s, loading: false }));
      }
    }
    run();
    return () => {
      dead = true;
    };
  }, [baseInr]);

  if (state.loading) {
    return (
      <div className="flex items-end gap-2">
        <div className="h-8 w-20 rounded bg-slate-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <div className="text-2xl font-semibold">{state.symbol}</div>
      <div className="text-5xl font-extrabold tracking-tight">
        {state.amount.toLocaleString()}
      </div>
      <div className="text-slate-500 mb-1 text-sm">
        {state.code}{subLabel ? ` • ${subLabel}` : ""}
      </div>
    </div>
  );
}
