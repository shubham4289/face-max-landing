"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, X } from "lucide-react";

type Props = {
  minutes?: number; // default 10
  anchorId?: string; // e.g., "#pricing" or "#checkout"
};

export default function DealCountdown({ minutes = 10, anchorId = "#pricing" }: Props) {
  const [remaining, setRemaining] = useState<number>(0);
  const [dismissed, setDismissed] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Respect reduced motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Use sessionStorage so it doesn't reset on re-renders/navigation
    const KEY = "fm_deal_deadline";
    const DISMISS_KEY = "fm_deal_dismissed";
    const dismissedStored = sessionStorage.getItem(DISMISS_KEY);
    if (dismissedStored === "1") {
      setDismissed(true);
      return;
    }

    const now = Date.now();
    const stored = sessionStorage.getItem(KEY);
    let deadline: number;

    if (stored && Number(stored) > now) {
      deadline = Number(stored);
    } else {
      deadline = now + minutes * 60 * 1000;
      sessionStorage.setItem(KEY, String(deadline));
    }

    const tick = () => {
      const ms = deadline - Date.now();
      setRemaining(ms > 0 ? ms : 0);
      if (ms <= 0 && intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    tick();
    intervalRef.current = window.setInterval(tick, 1000) as unknown as number;

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [minutes]);

  const onDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("fm_deal_dismissed", "1");
    }
  };

  const mm = Math.floor(remaining / 1000 / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor((remaining / 1000) % 60)
    .toString()
    .padStart(2, "0");

  if (dismissed) return null;

  const Bar = (
    <div className="fixed left-0 right-0 top-16 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="relative rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg"
          role="region"
          aria-label="Limited-time deal"
        >
          <div className="flex items-center gap-4 py-2.5 pl-3 pr-10">
            <Timer className="w-5 h-5 shrink-0" aria-hidden />
            <div className="text-sm sm:text-base">
              <span className="font-semibold">Deal ends in</span>{" "}
              <span aria-live="polite" className="tabular-nums font-mono font-bold">
                {mm}:{ss}
              </span>
              <span className="hidden sm:inline"> — secure your spot now.</span>
            </div>
            <a
              href={anchorId}
              className="ml-auto inline-flex items-center rounded-xl bg-white/95 px-3 py-1.5 text-slate-900 text-sm font-semibold hover:bg-white"
            >
              Enroll Now
            </a>
            <button
              aria-label="Dismiss deal banner"
              onClick={onDismiss}
              className="absolute right-2 top-2 rounded-md p-1 hover:bg-white/10"
            >
              <X className="w-4 h-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (prefersReducedMotion) return Bar;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -12, opacity: 0, filter: "blur(4px)" as any }}
        animate={{ y: 0, opacity: 1, filter: "blur(0px)" as any }}
        exit={{ y: -12, opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {Bar}
      </motion.div>
    </AnimatePresence>
  );
}
