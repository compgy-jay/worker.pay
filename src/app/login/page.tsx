"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { admin, login } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (admin) router.push("/");
  }, [admin, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const err = await login(password);
    setBusy(false);
    if (err) setError(err);
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Reset failed");
      } else {
        setMessage("Password reset successfully. Login with your new password.");
        setMode("login");
        setPassword("");
      }
    } catch { setError("Something went wrong"); }
    setBusy(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-deep px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-amber/15 bg-surface p-8 shadow-2xl shadow-amber/5">
          <div className="mb-6 text-center">
            <h1 className="font-serif text-2xl font-semibold text-ink">Worker Pay</h1>
            <p className="mt-1 text-sm text-ink-muted">
              {mode === "login" ? "Admin sign in" : "Reset password"}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-400">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
              {message}
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full rounded-lg border border-border-subtle bg-deep px-3 py-2.5 text-sm text-ink outline-none transition focus:border-amber/50 focus:ring-1 focus:ring-amber/30"
                  autoFocus
                  required
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-amber px-3 py-2.5 text-sm font-semibold text-deep transition hover:bg-amber/90 disabled:opacity-50"
              >
                {busy ? "Signing in..." : "Sign In"}
              </button>
              <button
                type="button"
                onClick={() => { setMode("forgot"); setError(""); setMessage(""); }}
                className="w-full text-center text-xs text-ink-muted underline underline-offset-2 hover:text-amber transition"
              >
                Forgot password?
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">Admin Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0795351158"
                  className="w-full rounded-lg border border-border-subtle bg-deep px-3 py-2.5 text-sm text-ink outline-none transition focus:border-amber/50 focus:ring-1 focus:ring-amber/30"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 4 characters"
                  className="w-full rounded-lg border border-border-subtle bg-deep px-3 py-2.5 text-sm text-ink outline-none transition focus:border-amber/50 focus:ring-1 focus:ring-amber/30"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-amber px-3 py-2.5 text-sm font-semibold text-deep transition hover:bg-amber/90 disabled:opacity-50"
              >
                {busy ? "Resetting..." : "Reset Password"}
              </button>
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); setMessage(""); }}
                className="w-full text-center text-xs text-ink-muted underline underline-offset-2 hover:text-amber transition"
              >
                Back to sign in
              </button>
            </form>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-ink-muted">
          Worker Pay &mdash; Project Management
        </p>
      </div>
    </div>
  );
}
