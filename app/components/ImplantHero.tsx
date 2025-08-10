"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * Selectors used:
 * #implant-hero, .ih-wrap, .ih-left, .ih-right, .ih-implant, .ih-arrow
 */

export default function ImplantHero() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inViewOnce, setInViewOnce] = useState(false);
  const prefersReduced = useReducedMotion();

  // Parallax on the implant while SECTION scrolls
  const { scrollYProgress } = useScroll({
    target: ref,
    // Trigger while the section passes through middle ~40%:
    // top enters at 30% from top and leaves at 70% => “middle window”
    offset: ["start 70%", "end 30%"],
  });
  const y = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [10, -10]);
  const scale = useTransform(scrollYProgress, [0, 1], prefersReduced ? [1, 1] : [0.95, 1]);

  // Fire the staged reveals once when section hits middle viewport
  useEffect(() => {
    if (prefersReduced) {
      setInViewOnce(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInViewOnce(true);
          }
        });
      },
      {
        root: null,
        // middle ~40% window
        rootMargin: "-30% 0% -30% 0%",
        threshold: 0.01,
      }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [prefersReduced]);

  // Text variants
  const leftVariants = {
    hidden: { opacity: 0, x: -24 },
    show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };
  const rightVariants = {
    hidden: { opacity: 0, x: 24 },
    show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.12 } },
  };

  // Arrow stroke “draw” (SVG stroke-dasharray)
  const arrowAnim = (delay = 0) =>
    prefersReduced
      ? {}
      : {
          pathLength: [0, 1],
          transition: { duration: 0.7, ease: "easeInOut", delay },
        };

  return (
    <section
      id="implant-hero"
      ref={ref}
      className="bg-white"
      aria-label="Implant course hero"
    >
      {/* pre-sized wrapper to avoid CLS */}
      <div className="ih-wrap mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid items-center gap-8 md:gap-10 lg:gap-12 md:grid-cols-3">
          {/* LEFT TEXT */}
          <motion.h2
            className="ih-left text-2xl md:text-3xl font-bold leading-tight text-slate-900"
            initial="hidden"
            animate={inViewOnce ? "show" : "hidden"}
            variants={leftVariants}
          >
            The only
            <br />
            implant
            <br />
            course,
          </motion.h2>

          {/* IMPLANT + ARROWS */}
          <div className="relative mx-auto">
            <motion.img
              src="/implant.png"
              alt="Titanium dental implant with threads, course hero"
              className="ih-implant block mx-auto"
              style={{ y, scale }}
              // reserve space to avoid reflow
              width={360}
              height={560}
              loading="eager"
            />
            {/* ARROWS (hidden on small screens if tight) */}
            <div className="absolute inset-0 pointer-events-none hidden md:block">
              {/* top-left */}
              <svg
                className="ih-arrow absolute -top-6 left-2 w-28 h-20"
                viewBox="0 0 140 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              >
                <motion.path
                  d="M135 10 C70 20 50 40 25 90"
                  initial={{ pathLength: 0 }}
                  animate={inViewOnce ? arrowAnim(0.30) : {}}
                />
                <motion.path
                  d="M20 92 L26 84 M20 92 L30 92"
                  initial={{ pathLength: 0 }}
                  animate={inViewOnce ? arrowAnim(0.45) : {}}
                />
              </svg>

              {/* bottom-left */}
              <svg
                className="ih-arrow absolute bottom-2 left-4 w-32 h-24"
                viewBox="0 0 160 120"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              >
                <motion.path
                  d="M140 100 C100 70 80 60 22 25"
                  initial={{ pathLength: 0 }}
                  animate={inViewOnce ? arrowAnim(0.38) : {}}
                />
                <motion.path
                  d="M20 30 L30 28 M20 30 L26 20"
                  initial={{ pathLength: 0 }}
                  animate={inViewOnce ? arrowAnim(0.52) : {}}
                />
              </svg>

              {/* top-right */}
              <svg
                className="ih-arrow absolute -top-6 right-2 w-28 h-20"
                viewBox="0 0 140 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              >
                <motion.path
                  d="M5 10 C70 20 90 40 115 90"
                  initial={{ pathLength: 0 }}
                  animate={inViewOnce ? arrowAnim(0.46) : {}}
                />
                <motion.path
                  d="M110 92 L116 84 M110 92 L120 92"
                  initial={{ pathLength: 0 }}
                  animate={inViewOnce ? arrowAnim(0.60) : {}}
                />
              </svg>

              {/* bottom-right */}
              <svg
                className="ih-arrow absolute bottom-2 right-4 w-32 h-24"
                viewBox="0 0 160 120"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              >
                <motion.path
                  d="M20 100 C60 70 80 60 138 25"
                  initial={{ pathLength: 0 }}
                  animate={inViewOnce ? arrowAnim(0.54) : {}}
                />
                <motion.path
                  d="M140 30 L134 20 M140 30 L130 28"
                  initial={{ pathLength: 0 }}
                  animate={inViewOnce ? arrowAnim(0.68) : {}}
                />
              </svg>
            </div>
          </div>

          {/* RIGHT TEXT */}
          <motion.h2
            className="ih-right text-2xl md:text-3xl font-bold leading-tight text-slate-900 text-right"
            initial="hidden"
            animate={inViewOnce ? "show" : "hidden"}
            variants={rightVariants}
          >
            You will
            <br />
            ever need
          </motion.h2>
        </div>
      </div>

      {/* reduced motion: show final state without movement */}
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          #implant-hero * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}
