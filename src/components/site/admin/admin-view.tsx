"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Lock, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSiteStore } from "@/lib/store";
import { AdminShell } from "./admin-shell";
import { toast } from "@/hooks/use-toast";

interface AdminInfo {
  username: string;
  displayName: string;
  role: string;
}

export function AdminView() {
  const goHome = useSiteStore((s) => s.goHome);
  const [admin, setAdmin] = useState<AdminInfo | null | "loading">("loading");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/me", { cache: "no-store" });
      const json = await res.json();
      setAdmin(json.admin ?? null);
    } catch {
      setAdmin(null);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Login failed");
        return;
      }
      setAdmin(json.admin);
      toast({ title: "Welcome back!", description: `Logged in as ${json.admin.displayName}` });
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  if (admin === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-espresso">
        <Loader2 className="h-8 w-8 text-gold animate-spin" aria-label="Loading" />
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-espresso px-4 relative overflow-hidden">
        <div className="absolute inset-0 wood-texture opacity-60" aria-hidden />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" aria-hidden />

        <button
          onClick={() => goHome()}
          className="absolute top-6 left-6 text-ivory/50 hover:text-ivory transition-colors flex items-center gap-2 text-sm cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to site
        </button>

        { }
        <img src="/logo-white.svg" alt="Dream Wood Furniture" className="relative h-12 w-auto mb-8" />

        <form
          onSubmit={handleLogin}
          className="relative w-full max-w-sm rounded-3xl bg-card p-8 shadow-2xl shadow-black/40 border border-walnut-100"
        >
          <div className="text-center">
            <span className="mx-auto h-12 w-12 rounded-2xl bg-walnut-800 flex items-center justify-center">
              <Lock className="h-5 w-5 text-gold" aria-hidden />
            </span>
            <h1 className="mt-5 font-display text-2xl text-walnut-900">Staff Login</h1>
            <p className="text-xs text-muted-foreground mt-1.5">
              Dream Wood Furniture management console
            </p>
          </div>

          <div className="mt-7 space-y-4">
            <div>
              <Label htmlFor="admin-username" className="text-sm font-medium text-walnut-900">
                Username
              </Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
                <Input
                  id="admin-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  className="h-11 pl-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="admin-password" className="text-sm font-medium text-walnut-900">
                Password
              </Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="h-11 pl-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
                />
              </div>
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-4 text-sm text-destructive font-medium text-center bg-destructive/10 rounded-lg py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full h-11 rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory font-semibold"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
          </Button>

          <p className="mt-5 text-center text-[11px] text-muted-foreground leading-relaxed">
            Demo access — username: <code className="bg-walnut-100 px-1.5 py-0.5 rounded text-walnut-800">admin</code>{" "}
            · password: <code className="bg-walnut-100 px-1.5 py-0.5 rounded text-walnut-800">dreamwood2025</code>
            <br />
            Change the password from Admin → Security after first login.
          </p>
        </form>
      </div>
    );
  }

  return <AdminShell admin={admin} onLogout={() => setAdmin(null)} />;
}
