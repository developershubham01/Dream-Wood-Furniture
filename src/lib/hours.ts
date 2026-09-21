/**
 * Showroom opening-hours helpers (pure functions — safe on server and client).
 * The showroom operates on Indian Standard Time (Asia/Kolkata, UTC+5:30, no DST),
 * so "Open now" is computed against IST regardless of the visitor's timezone.
 */

/** Parse a 24h "HH:MM" string into minutes since midnight; null when invalid */
export function parseHM(value: string | undefined | null): number | null {
  if (!value) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 24 || min > 59) return null;
  return h * 60 + min;
}

/** Current wall-clock time in IST as minutes since midnight */
export function istMinutesNow(now: Date = new Date()): number {
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const ist = new Date(utcMs + 5.5 * 3_600_000);
  return ist.getHours() * 60 + ist.getMinutes();
}

/** Format "HH:MM" as "10:30 AM" / "10 PM" style for badges */
export function formatHM12(value: string): string {
  const mins = parseHM(value);
  if (mins == null) return value;
  const h24 = Math.floor(mins / 60);
  const min = mins % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return min === 0 ? `${h12} ${ampm}` : `${h12}:${String(min).padStart(2, "0")} ${ampm}`;
}

export interface OpenStatus {
  open: boolean;
  /** Human label, e.g. "Open now · closes 10 PM" or "Closed · opens 10:30 AM" */
  label: string;
}

/**
 * Whether the showroom is open right now (IST), plus a customer-facing label.
 * Returns null when the configured times are missing/invalid — callers hide the badge.
 */
export function openStatus(openTime: string, closeTime: string, now: Date = new Date()): OpenStatus | null {
  const open = parseHM(openTime);
  const close = parseHM(closeTime);
  if (open == null || close == null || close <= open) return null;

  const mins = istMinutesNow(now);
  if (mins >= open && mins < close) {
    return { open: true, label: `Open now · closes ${formatHM12(closeTime)}` };
  }
  const nextOpen = mins < open ? formatHM12(openTime) : `${formatHM12(openTime)} tomorrow`;
  return { open: false, label: `Closed · opens ${nextOpen}` };
}
