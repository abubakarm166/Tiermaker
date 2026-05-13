"use client";

import { useState } from "react";
import Link from "next/link";
import { ApiError, requestPasswordReset } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await requestPasswordReset(email.trim().toLowerCase());
      setMessage(res.detail);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black">
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-2xl font-semibold text-white mb-2">Forgot password</h1>
        <p className="text-sm text-muted mb-6">
          Enter your account email. If it exists, we will send a reset link (check spam too).
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl error-box-alt text-sm px-4 py-2">{error}</div>
          )}
          {message && (
            <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/30 text-sm px-4 py-2 text-emerald-100">
              {message}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/login" className="link-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
