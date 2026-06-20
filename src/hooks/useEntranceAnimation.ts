"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useEntranceAnimation(deps: unknown[] = []) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.querySelectorAll("[data-animate]");
    if (!targets.length) return;

    gsap.set(targets, { opacity: 0, y: 24 });

    const ctx = gsap.context(() => {
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
      });
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}

export function useProgressAnimation(
  value: number,
  deps: unknown[] = []
) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    gsap.set(bar, { width: "0%" });

    const ctx = gsap.context(() => {
      gsap.to(bar, {
        width: `${Math.min(value, 100)}%`,
        duration: 1,
        ease: "power3.out",
      });
    }, bar);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, ...deps]);

  return barRef;
}
