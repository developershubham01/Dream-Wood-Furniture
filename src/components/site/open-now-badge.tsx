"use client";

import { useEffect, useState } from "react";
import { openStatus, type OpenStatus } from "@/lib/hours";
import { cn } from "@/lib/utils";

/**
 * Live open/closed status, re-checked every 30s so the badge flips
 * at opening/closing time while a customer browses.
 */
function useOpenStatus(openTime: string, closeTime: string): OpenStatus | null {
  const [status, setStatus] = useState<OpenStatus | null>(() => openStatus(openTime, closeTime));

  useEffect(() => {
    const syncStatus = () => setStatus(openStatus(openTime, closeTime));
    syncStatus();
    const id = setInterval(syncStatus, 30_000);
    return () => clearInterval(id);
  }, [openTime, closeTime]);

  return status;
}

/**
 * Pulsing "Open now / Closed" pill driven by the IST clock.
 * tone="dark" sits on the walnut-900 showroom card; tone="light" on ivory cards.
 */
export function OpenNowBadge({
  openTime,
  closeTime,
  tone = "light",
  className,
}: {
  openTime: string;
  closeTime: string;
  tone?: "dark" | "light";
  className?: string;
}) {
  const status = useOpenStatus(openTime, closeTime);
  if (!status) return null;

  return (
    <span
      role="status"
      aria-live="polite"
      title={status.label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap",
        status.open
          ? tone === "dark"
            ? "border-emerald-300/25 bg-emerald-400/15 text-emerald-200"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"
          : tone === "dark"
            ? "border-amber-300/25 bg-amber-400/15 text-amber-200"
            : "border-amber-200 bg-amber-50 text-amber-800",
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5" aria-hidden>
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
            status.open ? "bg-emerald-400" : "bg-amber-500"
          )}
        />
        <span
          className={cn(
            "relative inline-flex h-1.5 w-1.5 rounded-full",
            status.open ? "bg-emerald-400" : "bg-amber-500"
          )}
        />
      </span>
      {status.open ? "Open now" : "Closed"}
    </span>
  );
}
