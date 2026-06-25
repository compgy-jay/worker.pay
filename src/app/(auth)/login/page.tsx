"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setBusy(true);

      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setBusy(false);
        return;
      }

      const redirect = searchParams.get("redirect") || "/dashboard";
      router.push(redirect);
    },
    [email, password, router, searchParams]
  );

  return (
    <>
      <div className="mb-8 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange to-orange-light shadow-lg shadow-orange/20">
          <svg className="h-6 w-6 text-bg-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-muted">Sign in to Pulse</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <button className="primary-button justify-center" disabled={busy}>
          {busy ? "Signing in..." : "Sign in"}
        </button>

        <div className="flex items-center justify-between text-sm">
          <Link href="/signup" className="text-orange hover:underline">
            Create account
          </Link>
          <Link href="/reset-password" className="text-ink-muted hover:text-ink">
            Forgot password?
          </Link>
        </div>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-ink-muted">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
