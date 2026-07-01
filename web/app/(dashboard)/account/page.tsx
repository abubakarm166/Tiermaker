"use client";

import { useEffect, useState } from "react";
import { ApiError, updateMe } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatUsername } from "@/lib/userDisplay";
import RequireAuth from "@/components/RequireAuth";

export default function AccountPage() {
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setUsername(user?.username ?? "");
  }, [user?.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const next = username.trim().replace(/^@+/, "");
    if (!next) {
      setError("Enter a username.");
      return;
    }
    setSaving(true);
    try {
      await updateMe({ username: next });
      await refreshUser();
      setSuccess("Username updated.");
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body;
        if (typeof body === "object" && body !== null && "username" in body) {
          const msgs = (body as { username?: string[] }).username;
          setError(msgs?.[0] ?? err.message);
        } else {
          setError(err.message);
        }
      } else {
        setError("Could not update username.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <RequireAuth>
      <div className="max-w-lg">
        <h1 className="font-display text-2xl font-semibold text-white mb-2">Account</h1>
        <p className="text-muted text-sm mb-6">
          Your email stays private. Other users only see your username on tier lists, memes, and live events.
        </p>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label htmlFor="account-email" className="block text-sm font-medium text-white mb-1">
              Email
            </label>
            <input
              id="account-email"
              type="email"
              value={user?.email ?? ""}
              readOnly
              className="input opacity-70 cursor-not-allowed"
            />
            <p className="mt-1 text-[11px] text-muted-strong">Only you can see this.</p>
          </div>

          <div>
            <label htmlFor="account-username" className="block text-sm font-medium text-white mb-1">
              Username
            </label>
            <div className="flex items-center gap-2">
              <span className="text-muted-strong text-sm">@</span>
              <input
                id="account-username"
                type="text"
                value={username.replace(/^@+/, "")}
                onChange={(e) => setUsername(e.target.value.replace(/^@+/, ""))}
                className="input flex-1"
                autoComplete="username"
                minLength={3}
                maxLength={30}
                pattern="[A-Za-z][A-Za-z0-9_]{2,29}"
                required
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-strong">
              3–30 characters. Letters, numbers, and underscores. Shown as {formatUsername(username || "yourname")}.
            </p>
          </div>

          {error && (
            <div className="rounded-lg error-box-alt text-sm px-4 py-2">{error}</div>
          )}
          {success && (
            <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/30 text-sm text-emerald-200 px-4 py-2">
              {success}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save username"}
          </button>
        </form>
      </div>
    </RequireAuth>
  );
}
