"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { useSiteData } from "@/lib/site-data";
import { useSiteStore } from "@/lib/store";

/**
 * Top announcement strip.
 * Dismissal is remembered for the current visit only (sessionStorage) —
 * the bar politely returns next time the customer opens the site.
 */
const DISMISS_KEY = "dw-announcement-dismissed";

export function AnnouncementBar() {
  const { data } = useSiteData();
  const goHome = useSiteStore((s) => s.goHome);
  const [dismissed, setDismissed] = useState(false);

  // Hydration-safe: sync the per-visit dismissal flag after mount
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") setDismissed(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // private-mode browsers may block storage — dismissal still works for this render
    }
  };

  if (!data.settings.announcement.enabled || dismissed) return null;

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key="announcement"
        initial={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden print:hidden"
        role="region"
        aria-label="Announcement"
      >
        <div className="bg-walnut-900 text-ivory relative z-[60]">
          {/* Gold hairline seam anchoring the strip to the navbar below */}
          <div
            className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
            aria-hidden
          />
          <div className="mx-auto max-w-7xl px-4 py-2.5 flex items-center justify-center gap-2.5 text-center">
            <Sparkles className="hidden sm:block h-3.5 w-3.5 text-gold shrink-0" aria-hidden />
            <p className="text-xs sm:text-[13px] tracking-[0.04em] font-medium text-ivory/95">
              {data.settings.announcement.text}
              <button
                onClick={() => goHome("showroom")}
                className="ml-2 text-gold-light font-semibold underline decoration-gold/50 underline-offset-4 hover:decoration-gold-light hover:text-gold transition-colors cursor-pointer"
              >
                Seawoods Showroom
              </button>
            </p>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss announcement"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-ivory/50 hover:text-ivory hover:bg-ivory/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
