"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlameDroplet } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      router.push(data.redirectTo ?? "/");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Ambient brand glow — depth, not flat */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 right-10 h-80 w-80 rounded-full bg-accent/15 blur-3xl"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <FlameDroplet className="mx-auto mb-3 h-16 w-16 drop-shadow-sm" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            <span className="text-foreground">Kargil</span> <span className="text-primary">Gas</span> Agencies
          </h1>
          <p className="text-sm text-muted">Operations &amp; Reporting</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-lg)]"
        >
          <div className="mb-4">
            <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-foreground">
              Username
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="admin / user1 / user2 / ceo"
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          {error && (
            <div role="alert" className="mb-4 rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-sm)] transition hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted">
          Mock accounts · admin/admin123 · user1/user123 · user2/user123 · ceo/ceo123
        </p>
      </div>
    </main>
  );
}
