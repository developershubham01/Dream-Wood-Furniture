"use client";

import { useState } from "react";
import { Loader2, KeyRound, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageHeader } from "./admin-shared";
import { toast } from "@/hooks/use-toast";

export function AdminSecurity() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(false);

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setChanged(false);
    if (newPassword.length < 8) {
      toast({ title: "New password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "New password and confirmation differ.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setChanged(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Password changed", description: "Use the new password at next login." });
    } catch (err) {
      toast({ title: "Could not change password", description: err instanceof Error ? err.message : "", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <AdminPageHeader
        title="Security"
        description="Change the admin password — do this after first login."
      />

      <div className="rounded-2xl border border-walnut-100 bg-card p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="h-11 w-11 rounded-xl bg-walnut-800 flex items-center justify-center">
            <KeyRound className="h-5 w-5 text-gold" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-lg text-walnut-900">Change Password</h2>
            <p className="text-xs text-muted-foreground">Sessions expire after 7 days</p>
          </div>
        </div>

        <form onSubmit={handleChange} className="space-y-4">
          <div>
            <Label htmlFor="cur-pw" className="text-sm font-medium text-walnut-900">Current password</Label>
            <Input
              id="cur-pw"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1.5 h-11 rounded-xl border-walnut-200 focus-visible:ring-gold"
            />
          </div>
          <div>
            <Label htmlFor="new-pw" className="text-sm font-medium text-walnut-900">New password (8+ characters)</Label>
            <Input
              id="new-pw"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="mt-1.5 h-11 rounded-xl border-walnut-200 focus-visible:ring-gold"
            />
          </div>
          <div>
            <Label htmlFor="conf-pw" className="text-sm font-medium text-walnut-900">Confirm new password</Label>
            <Input
              id="conf-pw"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="mt-1.5 h-11 rounded-xl border-walnut-200 focus-visible:ring-gold"
            />
          </div>

          {changed && (
            <p className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-xl p-3">
              <CheckCircle2 className="h-4 w-4" aria-hidden /> Password updated successfully.
            </p>
          )}

          <Button
            type="submit"
            disabled={saving || !currentPassword || !newPassword || !confirmPassword}
            className="w-full h-11 rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory font-medium"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
          </Button>
        </form>
      </div>

      <div className="rounded-2xl border border-walnut-100 bg-ivory/50 p-6 space-y-3">
        <div className="flex items-center gap-2.5 text-sm font-medium text-walnut-900">
          <ShieldCheck className="h-[18px] w-[18px] text-gold-dark" aria-hidden />
          Security practices in place
        </div>
        <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-5">
          <li>Passwords stored as salted scrypt hashes — never in plain text</li>
          <li>Admin sessions use httpOnly cookies (not readable by scripts)</li>
          <li>All admin APIs verify the session on every request</li>
          <li>Image uploads validated for type and size (3MB limit)</li>
          <li>Admin access link is hidden from public navigation</li>
        </ul>
      </div>
    </div>
  );
}
