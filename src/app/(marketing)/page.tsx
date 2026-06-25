"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";

export default function LandingPage() {
  const mainRef = useEntranceAnimation([]);

  return (
    <div ref={mainRef}>
      {/* ─── LANDING HERO ─── */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect fill='%230a0a12' width='1920' height='1080'/%3E%3C/svg%3E"
        >
          <source src="https://cdn.pixabay.com/video/2020/06/12/41828-431406550_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-bg-deep/70 via-bg-deep/50 to-bg-deep/80" />
        <div className="landing-grid" />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 text-center">
          <div className="flex items-center gap-2 rounded-full border border-orange/20 bg-orange/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-orange backdrop-blur-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
            Construction Management Platform
          </div>

          <h1 className="mt-8 font-serif text-4xl font-bold tracking-tight text-ink md:text-6xl lg:text-7xl">
            Pulse
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg">
            Track labor costs, manage materials, monitor budgets, and keep your
            electrical, data, and security projects on time and on budget — all in one place.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="/dashboard"
              className="primary-button px-6 py-3 text-base"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="7 13 12 18 17 13" />
                <polyline points="7 6 12 11 17 6" />
              </svg>
              Launch Dashboard
            </a>
            <button
              className="secondary-button px-6 py-3 text-base"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("showcase")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              See Capabilities
            </button>
          </div>

          <div className="mt-16 flex items-center gap-6 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              Labor Tracking
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              Material Management
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              Budget Control
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              Team Management
            </span>
          </div>

          <div className="mt-8 scroll-indicator">
            <svg className="h-6 w-6 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </div>
        </div>
      </section>

      {/* ─── SHOWCASE ─── */}
      <section id="showcase" className="relative border-t border-border-subtle bg-bg-surface/50">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange">Capabilities</p>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Electrical &bull; Data &bull; Security
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-ink-muted">
              Purpose-built for contractors who handle power, networking, and surveillance.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3" data-animate>
            {/* Electrical */}
            <div className="showcase-card">
              <div className="showcase-canvas">
                <svg viewBox="0 0 280 175" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="30" width="50" height="70" rx="4" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5" fill="rgba(249,115,22,0.04)" />
                  <rect x="16" y="36" width="10" height="10" rx="1" className="electrical-pulse" fill="#34d399" />
                  <rect x="30" y="36" width="10" height="10" rx="1" className="electrical-pulse" fill="#34d399" />
                  <rect x="44" y="36" width="10" height="10" rx="1" className="electrical-pulse" fill="#f87171" />
                  <line x1="22" y1="55" x2="22" y2="90" stroke="rgba(249,115,22,0.3)" strokeWidth="1" />
                  <line x1="48" y1="55" x2="48" y2="90" stroke="rgba(249,115,22,0.3)" strokeWidth="1" />
                  <line x1="60" y1="65" x2="90" y2="65" className="electrical-line" stroke="#f97316" strokeWidth="1.5" />
                  <line x1="90" y1="65" x2="90" y2="45" className="electrical-line" stroke="#f97316" strokeWidth="1.5" />
                  <line x1="90" y1="45" x2="140" y2="45" className="electrical-line-reverse" stroke="#f97316" strokeWidth="1.5" />
                  <line x1="90" y1="65" x2="90" y2="85" className="electrical-line" stroke="#f97316" strokeWidth="1.5" />
                  <line x1="90" y1="85" x2="140" y2="85" className="electrical-line-reverse" stroke="#f97316" strokeWidth="1.5" />
                  <circle cx="140" cy="45" r="6" fill="rgba(249,115,22,0.15)" stroke="#f97316" strokeWidth="1" />
                  <circle cx="140" cy="85" r="6" fill="rgba(249,115,22,0.15)" stroke="#f97316" strokeWidth="1" />
                  <circle cx="140" cy="45" r="2" className="electrical-pulse" fill="#34d399" />
                  <circle cx="140" cy="85" r="2" className="electrical-pulse" fill="#34d399" />
                  <rect x="155" y="25" width="25" height="40" rx="3" stroke="rgba(249,115,22,0.35)" strokeWidth="1" fill="rgba(249,115,22,0.05)" />
                  <text x="167" y="40" textAnchor="middle" fill="rgba(249,115,22,0.5)" fontSize="7" fontFamily="Outfit">V</text>
                  <line x1="160" y1="50" x2="175" y2="50" stroke="rgba(249,115,22,0.25)" strokeWidth="1" />
                  <line x1="160" y1="55" x2="170" y2="55" stroke="rgba(249,115,22,0.25)" strokeWidth="1" />
                  <path d="M162 58 L162 47 L170 47" stroke="#f97316" strokeWidth="1" fill="none" className="electrical-needle" />
                  <rect x="155" y="75" width="25" height="25" rx="3" stroke="rgba(249,115,22,0.35)" strokeWidth="1" fill="rgba(249,115,22,0.05)" />
                  <text x="167" y="90" textAnchor="middle" fill="rgba(249,115,22,0.5)" fontSize="6" fontFamily="Outfit">A</text>
                  <line x1="200" y1="50" x2="240" y2="50" className="electrical-line" stroke="#f97316" strokeWidth="1.5" />
                  <line x1="240" y1="50" x2="240" y2="90" stroke="rgba(249,115,22,0.3)" strokeWidth="1" />
                  <line x1="240" y1="90" x2="265" y2="90" stroke="rgba(249,115,22,0.3)" strokeWidth="1" />
                  <circle cx="265" cy="90" r="5" stroke="rgba(249,115,22,0.3)" strokeWidth="1" fill="none" />
                  <circle cx="265" cy="90" r="2" fill="rgba(249,115,22,0.4)" />
                  <text x="167" y="108" textAnchor="middle" fill="rgba(249,115,22,0.5)" fontSize="7" fontFamily="Outfit">~</text>
                  <text x="167" y="118" textAnchor="middle" fill="rgba(249,115,22,0.35)" fontSize="5" fontFamily="Outfit">LOAD</text>
                  <line x1="10" y1="115" x2="270" y2="115" stroke="rgba(249,115,22,0.08)" strokeWidth="1" strokeDasharray="2 4" />
                  <text x="140" y="132" textAnchor="middle" fill="rgba(249,115,22,0.35)" fontSize="5" fontFamily="Outfit" letterSpacing="3">ELECTRICAL DISTRIBUTION</text>
                  <line x1="200" y1="120" x2="230" y2="140" stroke="rgba(249,115,22,0.15)" strokeWidth="1" />
                  <circle cx="230" cy="140" r="4" fill="rgba(52,211,153,0.15)" stroke="#34d399" strokeWidth="0.5" />
                  <circle cx="230" cy="140" r="1.5" className="electrical-pulse" fill="#34d399" />
                </svg>
              </div>
              <div className="showcase-label">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange/10">
                  <svg className="h-3.5 w-3.5 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Electrical Configuration</p>
                  <p className="text-xs text-ink-muted">Load calculations, circuit mapping, sub-panel distribution</p>
                </div>
              </div>
            </div>

            {/* Network Rack */}
            <div className="showcase-card">
              <div className="showcase-canvas">
                <svg viewBox="0 0 280 175" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="80" y="15" width="140" height="145" rx="3" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="rgba(249,115,22,0.03)" />
                  <rect x="85" y="20" width="130" height="18" rx="2" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.2)" strokeWidth="0.5" />
                  <circle cx="95" cy="29" r="2" className="rack-led" fill="#34d399" />
                  <circle cx="102" cy="29" r="2" className="rack-led" fill="#34d399" />
                  <circle cx="109" cy="29" r="2" className="rack-led" fill="#f87171" />
                  <text x="120" y="33" fill="rgba(249,115,22,0.4)" fontSize="6" fontFamily="Outfit">PATCH PANEL 1</text>
                  <rect x="85" y="42" width="130" height="18" rx="2" fill="rgba(249,115,22,0.04)" stroke="rgba(249,115,22,0.15)" strokeWidth="0.5" />
                  {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
                    <circle key={i} cx={88 + i * 11} cy={51} r="1.5" className="rack-led" fill="#60a5fa" />
                  ))}
                  <text x="120" y="66" fill="rgba(249,115,22,0.25)" fontSize="4" fontFamily="Outfit" textAnchor="middle">SWITCH — 12 PORT PoE+</text>
                  <rect x="85" y="70" width="130" height="18" rx="2" fill="rgba(249,115,22,0.04)" stroke="rgba(249,115,22,0.15)" strokeWidth="0.5" />
                  {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
                    <circle key={i + 12} cx={88 + i * 11} cy={79} r="1.5" className="rack-led" fill="#60a5fa" />
                  ))}
                  <text x="120" y="94" fill="rgba(249,115,22,0.25)" fontSize="4" fontFamily="Outfit" textAnchor="middle">SWITCH — 12 PORT PoE+</text>
                  <rect x="85" y="98" width="130" height="16" rx="2" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.2)" strokeWidth="0.5" />
                  <circle cx="95" cy="107" r="2" className="rack-led" fill="#34d399" />
                  <circle cx="102" cy="107" r="2" className="rack-led" fill="#34d399" />
                  <text x="120" y="111" fill="rgba(249,115,22,0.4)" fontSize="6" fontFamily="Outfit">PATCH PANEL 2</text>
                  <rect x="85" y="118" width="130" height="14" rx="2" fill="rgba(249,115,22,0.04)" stroke="rgba(249,115,22,0.15)" strokeWidth="0.5" />
                  <text x="150" y="129" fill="rgba(249,115,22,0.3)" fontSize="5" fontFamily="Outfit" textAnchor="middle">PDU  —  32A 3-Phase</text>
                  <path d="M60 140 Q70 130 85 50" stroke="rgba(249,115,22,0.25)" strokeWidth="1" fill="none" className="rack-cable" />
                  <path d="M55 145 Q65 120 85 78" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" className="rack-cable" />
                  <path d="M65 148 Q75 135 85 105" stroke="rgba(249,115,22,0.25)" strokeWidth="1" fill="none" className="rack-cable" />
                  <path d="M220 51 Q240 55 245 80 Q250 105 245 130" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" className="rack-cable" />
                  <path d="M220 79 Q235 85 240 110" stroke="rgba(249,115,22,0.25)" strokeWidth="1" fill="none" className="rack-cable" />
                  <rect x="30" y="130" width="25" height="15" rx="2" stroke="rgba(249,115,22,0.2)" strokeWidth="0.5" fill="none" />
                  <text x="42" y="141" textAnchor="middle" fill="rgba(249,115,22,0.3)" fontSize="4" fontFamily="Outfit">Router</text>
                  <line x1="55" y1="137" x2="65" y2="142" stroke="rgba(249,115,22,0.15)" strokeWidth="1" className="rack-cable" />
                  <path d="M235 20 Q240 30 235 40 Q230 50 235 60" stroke="rgba(249,115,22,0.15)" strokeWidth="1" fill="none" className="rack-wave" />
                  <text x="140" y="150" textAnchor="middle" fill="rgba(249,115,22,0.35)" fontSize="5" fontFamily="Outfit" letterSpacing="3">NETWORK RACK — 12U</text>
                </svg>
              </div>
              <div className="showcase-label">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange/10">
                  <svg className="h-3.5 w-3.5 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><path d="M6 6h.01M6 18h.01" /></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Network Rack Configuration</p>
                  <p className="text-xs text-ink-muted">Switch patching, cable management, PoE distribution</p>
                </div>
              </div>
            </div>

            {/* CCTV */}
            <div className="showcase-card">
              <div className="showcase-canvas">
                <svg viewBox="0 0 280 175" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="70" cy="50" r="18" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="rgba(249,115,22,0.04)" />
                  <circle cx="70" cy="50" r="10" stroke="rgba(249,115,22,0.2)" strokeWidth="0.5" fill="rgba(10,10,18,0.5)" />
                  <circle cx="70" cy="50" r="3" fill="rgba(249,115,22,0.3)" />
                  <line x1="70" y1="32" x2="70" y2="22" stroke="rgba(249,115,22,0.2)" strokeWidth="1" />
                  <rect x="64" y="18" width="12" height="6" rx="1" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="rgba(249,115,22,0.05)" />
                  <path d="M70 50 L20 140 L120 140 Z" fill="rgba(249,115,22,0.04)" stroke="rgba(249,115,22,0.12)" strokeWidth="0.5" className="cctv-scan" style={{ transformOrigin: "70px 50px" }} />
                  <rect x="160" y="30" width="95" height="65" rx="3" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="rgba(249,115,22,0.04)" />
                  <rect x="164" y="34" width="87" height="57" rx="1" fill="rgba(10,10,18,0.6)" />
                  <rect x="164" y="34" width="87" height="57" rx="1" fill="rgba(10,10,18,0.4)" />
                  <line x1="164" y1="40" x2="251" y2="40" stroke="rgba(249,115,22,0.08)" strokeWidth="0.5" />
                  <line x1="164" y1="50" x2="251" y2="50" stroke="rgba(249,115,22,0.08)" strokeWidth="0.5" />
                  <line x1="164" y1="60" x2="251" y2="60" stroke="rgba(249,115,22,0.08)" strokeWidth="0.5" />
                  <line x1="164" y1="70" x2="251" y2="70" stroke="rgba(249,115,22,0.08)" strokeWidth="0.5" />
                  <line x1="164" y1="80" x2="251" y2="80" stroke="rgba(249,115,22,0.08)" strokeWidth="0.5" />
                  <line x1="164" y1="90" x2="251" y2="90" stroke="rgba(249,115,22,0.08)" strokeWidth="0.5" />
                  <rect x="164" y="52" width="87" height="3" rx="0.5" fill="rgba(249,115,22,0.15)" className="cctv-feed-line" />
                  <rect x="180" y="62" width="15" height="12" rx="1" stroke="#34d399" strokeWidth="0.5" fill="rgba(52,211,153,0.08)" className="cctv-blip" />
                  <rect x="210" y="68" width="12" height="10" rx="1" stroke="#60a5fa" strokeWidth="0.5" fill="rgba(96,165,250,0.08)" className="cctv-blip" />
                  <text x="225" y="42" fill="rgba(249,115,22,0.3)" fontSize="4" fontFamily="Outfit">CAM-01</text>
                  <circle cx="170" cy="38" r="2" fill="#f87171" />
                  <text x="175" y="41" fill="#f87171" fontSize="3" fontFamily="Outfit" fontWeight="bold">REC</text>
                  <line x1="88" y1="50" x2="160" y2="50" stroke="rgba(249,115,22,0.15)" strokeWidth="1" className="rack-cable" />
                  <text x="124" y="44" textAnchor="middle" fill="rgba(249,115,22,0.2)" fontSize="4" fontFamily="Outfit">CAT6</text>
                  <rect x="170" y="108" width="70" height="22" rx="2" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="rgba(249,115,22,0.03)" />
                  <text x="205" y="122" textAnchor="middle" fill="rgba(249,115,22,0.35)" fontSize="5" fontFamily="Outfit" letterSpacing="2">NVR — 16 CH</text>
                  <circle cx="178" cy="119" r="1.5" className="rack-led" fill="#34d399" />
                  <circle cx="184" cy="119" r="1.5" className="rack-led" fill="#34d399" />
                  <line x1="160" y1="95" x2="180" y2="108" stroke="rgba(249,115,22,0.15)" strokeWidth="1" className="rack-cable" />
                  <text x="140" y="162" textAnchor="middle" fill="rgba(249,115,22,0.35)" fontSize="5" fontFamily="Outfit" letterSpacing="3">CCTV — SURVEILLANCE SYSTEM</text>
                  <rect x="55" y="148" width="60" height="4" rx="2" fill="rgba(249,115,22,0.08)" />
                  <rect x="55" y="148" width="40" height="4" rx="2" fill="rgba(52,211,153,0.3)" />
                  <text x="120" y="152" fill="rgba(249,115,22,0.25)" fontSize="4" fontFamily="Outfit">14 TB</text>
                </svg>
              </div>
              <div className="showcase-label">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange/10">
                  <svg className="h-3.5 w-3.5 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">CCTV &amp; Surveillance</p>
                  <p className="text-xs text-ink-muted">Camera layout, NVR setup, video management system</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES STRIP ─── */}
      <section className="border-t border-border-subtle bg-bg-deep">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-orange/10">
                <svg className="h-5 w-5 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-ink">Team Management</h3>
              <p className="mt-1 text-xs text-ink-muted">Track workers, departments, contacts, and assignments per project phase.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-orange/10">
                <svg className="h-5 w-5 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-ink">Cost Tracking</h3>
              <p className="mt-1 text-xs text-ink-muted">Record labor costs by week, track paid vs. unpaid, and monitor material spend.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-orange/10">
                <svg className="h-5 w-5 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 2 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-ink">Material Control</h3>
              <p className="mt-1 text-xs text-ink-muted">Log materials, categorize by type, track quantities, costs, and suppliers.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-orange/10">
                <svg className="h-5 w-5 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-ink">Budget Oversight</h3>
              <p className="mt-1 text-xs text-ink-muted">Set project budgets, track utilization, and export reports for stakeholders.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DIVIDER / APP ENTRY ─── */}
      <div className="relative border-t border-border-subtle bg-bg-surface/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-14 text-center">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
            <span className="inline-block h-px w-8 bg-border-subtle" />
            GET STARTED
            <span className="inline-block h-px w-8 bg-border-subtle" />
          </div>
          <h2 className="mt-4 font-serif text-2xl font-bold text-ink md:text-3xl">
            Your project dashboard is ready
          </h2>
          <p className="mt-2 max-w-md text-sm text-ink-muted">
            All your data is already here. Jump in and start managing your team, costs, and materials.
          </p>
          <a
            href="/dashboard"
            className="primary-button mt-8 px-8 py-3 text-base"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="7 13 12 18 17 13" />
              <polyline points="7 6 12 11 17 6" />
            </svg>
            Launch Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
