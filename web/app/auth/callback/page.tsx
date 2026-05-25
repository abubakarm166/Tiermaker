"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authStorage } from "@/lib/api";
import { safeReturnPath } from "@/components/RequireAuth";
import { useAuth } from "@/contexts/AuthContext";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      const msg = searchParams.get("message");
      if (error === "twitter_denied") {
        setMessage(msg ? `X sign-in cancelled: ${msg}` : "X sign-in was cancelled.");
      } else if (error === "account_banned") {
        setMessage("This account is banned.");
      } else if (error === "twitter_not_configured") {
        setMessage("X login is not configured on the server yet.");
      } else {
        setMessage(msg ? `Sign-in failed: ${msg}` : "X sign-in failed. Try again or use email.");
      }
      return;
    }

    const access = searchParams.get("access");
    const refresh = searchParams.get("refresh");
    if (!access || !refresh) {
      setMessage("Missing sign-in tokens. Try logging in again.");
      return;
    }

    authStorage.setTokens(access, refresh);
    const next = safeReturnPath(searchParams.get("next"));
    refreshUser()
      .then(() => {
        router.replace(next);
      })
      .catch(() => {
        setMessage("Signed in but could not load profile. Try opening the app.");
      });
  }, [searchParams, router, refreshUser]);

  const isError = Boolean(searchParams.get("error"));

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black">
      <div className="card w-full max-w-sm p-8 text-center">
        <p className={`text-sm ${isError ? "text-red-300" : "text-muted"}`}>{message}</p>
        {isError && (
          <Link href="/login" className="btn-primary inline-block mt-6 px-6 py-2.5">
            Back to sign in
          </Link>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black text-muted">
          Loading…
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
