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
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
      });
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}

export function useCountUp(
  value: number,
  duration = 1.2,
  deps: unknown[] = []
) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const start = { val: 0 };
      gsap.to(start, {
        val: value,
        duration,
        ease: "power3.out",
        onUpdate: () => {
          el.textContent = Math.round(start.val).toLocaleString();
        },
      });
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, ...deps]);

  return ref;
}
