"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password);
      router.replace("/app");
    } catch (err) {
      const msg =
        err instanceof ApiError &&
        typeof err.body === "object" &&
        err.body !== null &&
        "email" in (err.body as object)
          ? (err.body as { email?: string[] }).email?.[0] ?? err.message
          : err instanceof ApiError
            ? err.message
            : "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black relative overflow-hidden">
      {/* subtle radial glow behind the card */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#FF9F1C33] blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-[#FF9F1C] via-[#ffcc80] to-transparent opacity-60" />
        <div className="relative card w-full rounded-3xl bg-[#101010]/95 border border-[#202020] px-8 py-7 shadow-[0_18px_60px_rgba(0,0,0,0.85)] backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="inline-flex items-center rounded-full bg-[#1a1a1a] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-strong">
                Join TierListMaker
              </p>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-white mt-1">Create account</h1>
          <p className="mt-1 text-sm text-muted-strong">
            Start building and sharing tier lists with your community in seconds.
          </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-xl error-box-alt text-sm px-4 py-2">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">Email</label>
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
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-1">Password (min 8)</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              minLength={8}
              required
              autoComplete="new-password"
            />
            <p className="mt-1 text-[11px] text-muted-strong">
              Use at least 8 characters with a mix of letters and numbers.
            </p>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-2.5 text-sm font-semibold tracking-wide shadow-[0_10px_30px_rgba(255,159,28,0.45)]"
            disabled={loading}
          >
            {loading ? "Creating…" : "Sign up"}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-muted-strong text-center">
          By continuing, you agree to our{" "}
          <span className="text-primary">Terms</span> and{" "}
          <span className="text-primary">Privacy Policy</span>.
        </p>

        <p className="mt-5 text-center text-muted text-sm">
          Already have an account?{" "}
          <Link href="/login" className="link-primary hover:underline">
            Sign in
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
