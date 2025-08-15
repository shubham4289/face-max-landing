"use client";
import React, { useEffect, useState } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
} from "framer-motion";

type Props = {
  children: React.ReactNode;
  delay?: number; // seconds
  y?: number; // pixels to rise from
  className?: string;
};
export default function MotionReveal({
  children,
  delay = 0,
  y = 8,
  className,
}: Props) {
  const prefersReduced = useReducedMotion();

  const [isSmall, setIsSmall] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(hover: none)");
    const update = () => {
      const hoverNone = mq.matches;
      const widthSmall = window.innerWidth <= 1024;
      setIsSmall(hoverNone || widthSmall);
    };
    update();
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const finalDelay = isSmall ? 0 : delay;
  const finalDuration = prefersReduced ? 0 : isSmall ? 0.35 : 0.45;

  const [played, setPlayed] = useState(prefersReduced);

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className={className}
        style={played ? undefined : { willChange: "transform, opacity" }}
        initial={{
          opacity: prefersReduced ? 1 : 0,
          y: prefersReduced ? 0 : y,
        }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          type: "tween",
          duration: finalDuration,
          ease: [0.22, 1, 0.36, 1],
          delay: finalDelay,
        }}
        viewport={{ once: true, amount: 0.2, margin: "0px 0px -10% 0px" }}
        onAnimationComplete={() => setPlayed(true)}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
