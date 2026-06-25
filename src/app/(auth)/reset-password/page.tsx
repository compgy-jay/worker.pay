"use client";

import { useState, useCallback, Suspense } from "react";
import Link from "next/link";

function ResetForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setBusy(true);

      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: `${location.origin}/auth/callback` }
      );

      if (authError) {
        setError(authError.message);
        setBusy(false);
        return;
      }

      setSent(true);
      setBusy(false);
    },
    [email]
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
          If an account exists for <strong className="text-ink">{email}</strong>,
          we sent a password reset link.
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
        <h1 className="text-2xl font-bold text-ink">Reset password</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Enter your email address and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleReset} className="flex flex-col gap-4">
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

        <button className="primary-button justify-center" disabled={busy}>
          {busy ? "Sending..." : "Send reset link"}
        </button>

        <p className="text-center text-sm text-ink-muted">
          <Link href="/login" className="text-orange hover:underline">Back to login</Link>
        </p>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-ink-muted">Loading...</div>}>
      <ResetForm />
    </Suspense>
  );
}
