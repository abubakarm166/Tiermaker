"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError, confirmPasswordReset } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!uid || !token) {
      setError("This reset link is missing parameters. Open the link from your email again.");
      return;
    }
    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await confirmPasswordReset({ uid, token, new_password: password });
      setMessage(res.detail);
      setTimeout(() => router.replace("/login"), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!uid || !token) {
    return (
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-xl font-semibold text-white mb-2">Invalid link</h1>
        <p className="text-sm text-muted mb-6">
          Use the reset link from your email, or request a new one.
        </p>
        <Link href="/forgot-password" className="btn-primary inline-block text-center w-full py-2.5">
          Request new link
        </Link>
        <p className="mt-4 text-center text-sm text-muted">
          <Link href="/login" className="link-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="card w-full max-w-sm p-8">
      <h1 className="text-2xl font-semibold text-white mb-2">Set new password</h1>
      <p className="text-sm text-muted mb-6">Choose a strong password for your account.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="rounded-xl error-box-alt text-sm px-4 py-2">{error}</div>}
        {message && (
          <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/30 text-sm px-4 py-2 text-emerald-100">
            {message}
            <span className="block mt-1 text-xs">Redirecting to sign in…</span>
          </div>
        )}
        <div>
          <label htmlFor="pw" className="block text-sm font-medium text-white mb-1">
            New password
          </label>
          <input
            id="pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="pw2" className="block text-sm font-medium text-white mb-1">
            Confirm password
          </label>
          <input
            id="pw2"
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className="input"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <button type="submit" className="btn-primary w-full py-2.5" disabled={loading || Boolean(message)}>
          {loading ? "Saving…" : "Update password"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="link-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black">
      <Suspense
        fallback={
          <div className="text-muted text-sm">Loading…</div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
