"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * Selectors: #implant-hero, .ih-wrap, .ih-left, .ih-right, .ih-implant
 * Arrows removed per request.
 */
export default function ImplantHero() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inViewOnce, setInViewOnce] = useState(false);
  const prefersReduced = useReducedMotion();

  // subtle parallax on the implant
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 30%"], // middle window
  });
  const y = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [10, -10]);
  const scale = useTransform(scrollYProgress, [0, 1], prefersReduced ? [1, 1] : [0.95, 1]);

  // play once when section enters middle viewport
  useEffect(() => {
    if (prefersReduced) { setInViewOnce(true); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInViewOnce(true); },
      { rootMargin: "-30% 0% -30% 0%", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [prefersReduced]);

  const leftVariants = {
    hidden: { opacity: 0, x: -28 },
    show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };
  const rightVariants = {
    hidden: { opacity: 0, x: 28 },
    show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.12 } },
  };

  return (
    <section id="implant-hero" ref={ref} className="bg-white">
      <div className="ih-wrap mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* tighter gaps so text sits closer to implant */}
        <div className="grid items-center md:grid-cols-3 gap-6 md:gap-4 lg:gap-6">
          {/* LEFT TEXT */}
          <motion.h2
            className="ih-left headline text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] text-slate-900 md:justify-self-end md:pr-2"
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

          {/* IMPLANT */}
          <div className="relative mx-auto">
            <motion.img
              src="/implant.png"
              alt="Titanium dental implant with threads, course hero"
              className="ih-implant block mx-auto select-none"
              style={{ y, scale }}
              width={360}   // pre-size to avoid CLS
              height={560}
              loading="eager"
            />
          </div>

          {/* RIGHT TEXT */}
          <motion.h2
            className="ih-right headline text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] text-slate-900 text-right md:justify-self-start md:pl-2"
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
          #implant-hero * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </section>
  );
}
