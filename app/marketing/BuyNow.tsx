"use client";

import React, { useState } from "react";

export default function BuyNow() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "ORDER_CREATE_FAILED");
      }

      const openCheckout = () => {
        const rzp = new (window as any).Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          order_id: data.orderId,
          name: "The Ultimate Implant Course",
          description: "Lifetime access",
          prefill: { email, name },
          notes: { email, name },
          theme: { color: "#111827" },
          handler: () => {
            setMessage(
              "Payment received — check your email for login instructions."
            );
          },
          modal: {
            ondismiss: () => setLoading(false),
          },
        });
        rzp.open();
        setLoading(false);
      };

      if (typeof window !== "undefined") {
        if ((window as any).Razorpay) {
          openCheckout();
        } else {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = openCheckout;
          script.onerror = () => {
            setError("Failed to load payment script.");
            setLoading(false);
          };
          document.body.appendChild(script);
        }
      }
    } catch (e: any) {
      setError(e.message || "Server error");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          type="email"
          required
          className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Name (optional)
        </label>
        <input
          type="text"
          className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-slate-900 px-4 py-2 text-white font-semibold hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Buy Now"}
      </button>
    </form>
  );
}

