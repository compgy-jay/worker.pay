"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function DashboardHero({
  projectName,
  pmName,
  onRecordLabor,
  onPrint,
}: {
  projectName: string;
  pmName: string;
  onRecordLabor: () => void;
  onPrint: () => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!glowRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(glowRef.current, {
        x: 30,
        y: -20,
        duration: 8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }, glowRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[320px] items-center overflow-hidden border-b border-border-subtle"
    >
      <div className="hero-gradient" />
      <div className="hero-grid" />
      <div ref={glowRef} className="hero-glow" style={{ top: "10%", left: "60%" }} />
      <div className="hero-glow" style={{ bottom: "20%", right: "70%", width: "400px", height: "400px" }} />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-16 md:py-20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-orange shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-orange">
              Project Management
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {projectName || "Project Overview"}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-ink-muted md:text-base">
            {pmName
              ? `Project Manager: ${pmName}`
              : "Manage your project teams, resources, and budget with clarity and control"}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3" />
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="primary-button" onClick={onRecordLabor}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Record Labor Cost
        </button>
        <button className="secondary-button" onClick={onPrint}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Report
        </button>
      </div>
    </div>
    </section>
  );
}
