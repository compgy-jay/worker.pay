"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSignup = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setBusy(true);

      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });

      if (authError) {
        setError(authError.message);
        setBusy(false);
        return;
      }

      setSent(true);
      setBusy(false);
    },
    [email, password]
  );

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
          <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="mt-4 text-xl font-bold text-ink">Check your email</h1>
        <p className="mt-2 text-sm text-ink-muted">
          We sent a confirmation link to <strong className="text-ink">{email}</strong>.
          Click the link to activate your account.
        </p>
        <p className="mt-6 text-xs text-ink-muted">
          <Link href="/login" className="text-orange hover:underline">Back to login</Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange to-orange-light shadow-lg shadow-orange/20">
          <svg className="h-6 w-6 text-bg-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-ink">Create account</h1>
        <p className="mt-1 text-sm text-ink-muted">Get started with Pulse</p>
      </div>

      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
            {error}
          </div>
        )}

        <input
          className="control"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          className="control"
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />

        <button className="primary-button justify-center" disabled={busy}>
          {busy ? "Creating account..." : "Create account"}
        </button>

        <p className="text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-orange hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
