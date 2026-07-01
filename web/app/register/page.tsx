"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";
import TwitterLoginButton from "@/components/TwitterLoginButton";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
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
      await register(email, password, username.trim() || undefined);
      router.replace("/account");
    } catch (err) {
      let msg = "Registration failed";
      if (err instanceof ApiError && typeof err.body === "object" && err.body !== null) {
        const body = err.body as Record<string, string[] | string>;
        msg =
          body.email?.[0] ??
          body.username?.[0] ??
          (typeof body.detail === "string" ? body.detail : err.message);
      } else if (err instanceof ApiError) {
        msg = err.message;
      }
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
                Join Thetiermaker
              </p>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-white mt-1">Create account</h1>
          <p className="mt-1 text-sm text-muted-strong">
            Your email stays private. Pick a username for how you appear publicly, or we&apos;ll assign one for you.
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
            <label htmlFor="username" className="block text-sm font-medium text-white mb-1">
              Username <span className="text-muted-strong font-normal">(optional)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-muted-strong text-sm">@</span>
              <input
                id="username"
                type="text"
                value={username.replace(/^@+/, "")}
                onChange={(e) => setUsername(e.target.value.replace(/^@+/, ""))}
                className="input flex-1"
                autoComplete="username"
                minLength={3}
                maxLength={30}
                placeholder="yourname"
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-strong">
              Leave blank for a random username. You can change it anytime in Account settings.
            </p>
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

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#333]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#101010] px-2 text-muted">or</span>
          </div>
        </div>
        <Suspense fallback={<div className="h-10 animate-pulse rounded-xl bg-white/5" />}>
          <TwitterLoginButton label="Sign up with X" />
        </Suspense>

        <p className="mt-4 text-[11px] text-muted-strong text-center">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
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
