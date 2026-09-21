"use client";

import { AnimatePresence, motion } from "framer-motion";
import { GitCompareArrows, Plus, X } from "lucide-react";
import { useSiteData } from "@/lib/site-data";
import { useSiteStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Floating tray shown whenever pieces are selected for comparison.
 * Sits bottom-center; BackToTop shifts up while this is visible.
 */
export function CompareBar() {
  const compare = useSiteStore((s) => s.compare);
  const removeFromCompare = useSiteStore((s) => s.removeFromCompare);
  const clearCompare = useSiteStore((s) => s.clearCompare);
  const setCompareOpen = useSiteStore((s) => s.setCompareOpen);
  const { data } = useSiteData();

  const items = compare
    .map((id) => data.products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p);

  const slots = 3 - items.length;

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 48 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-2rem)] sm:w-auto print:hidden"
          role="region"
          aria-label="Compare tray"
        >
          <div className="relative rounded-3xl bg-espresso/95 backdrop-blur-md shadow-2xl shadow-espresso/40 border border-white/10 overflow-hidden">
            <div className="absolute inset-0 wood-texture opacity-50 rounded-3xl" aria-hidden />
            <div className="relative flex items-center gap-3 sm:gap-4 p-3 sm:pl-5 sm:pr-3">
              {/* Label */}
              <div className="hidden sm:flex flex-col shrink-0 pr-2 border-r border-white/10">
                <GitCompareArrows className="h-5 w-5 text-gold" aria-hidden />
                <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ivory/50 mt-1">
                  Compare
                </span>
              </div>

              {/* Selected thumbs */}
              <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto flex-1 min-w-0 py-0.5">
                {items.map((p) => (
                  <div
                    key={p.id}
                    className="relative shrink-0 group/thumb"
                    title={p.name}
                  >
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl overflow-hidden border border-white/15 bg-walnut-800">
                      <img
                        src={p.images[0] || "/images/cat-living.png"}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 max-w-[72px] w-max bg-walnut-900/90 text-ivory text-[9px] leading-none px-1.5 py-1 rounded-full truncate opacity-0 group-hover/thumb:opacity-100 transition-opacity pointer-events-none">
                      {p.name}
                    </span>
                    <button
                      onClick={() => removeFromCompare(p.id)}
                      aria-label={`Remove ${p.name} from compare`}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-espresso hover:bg-gold hover:text-espresso shadow-md flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {/* Empty slots */}
                {Array.from({ length: slots }).map((_, i) => (
                  <div
                    key={i}
                    aria-hidden
                    className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-xl border border-dashed border-white/25 flex items-center justify-center text-ivory/30"
                  >
                    <Plus className="h-4 w-4" />
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={clearCompare}
                  className="text-[11px] uppercase tracking-[0.15em] text-ivory/60 hover:text-ivory transition-colors cursor-pointer px-1 inline-flex"
                >
                  Clear
                </button>
                <button
                  onClick={() => setCompareOpen(true)}
                  disabled={items.length < 2}
                  className={cn(
                    "h-10 sm:h-11 px-4 sm:px-6 rounded-full text-sm font-semibold transition-all cursor-pointer flex items-center gap-2",
                    items.length >= 2
                      ? "bg-gold text-espresso hover:bg-gold-light shadow-lg shadow-gold/25"
                      : "bg-white/10 text-ivory/40 cursor-not-allowed"
                  )}
                  aria-label={
                    items.length >= 2
                      ? `Compare ${items.length} pieces`
                      : "Select at least 2 pieces to compare"
                  }
                >
                  <GitCompareArrows className="h-4 w-4" aria-hidden />
                  Compare
                  <span
                    className={cn(
                      "min-w-[20px] h-5 px-1 rounded-full text-[11px] font-bold tabular-nums flex items-center justify-center",
                      items.length >= 2 ? "bg-espresso/15 text-espresso" : "bg-white/10 text-ivory/50"
                    )}
                  >
                    {items.length}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
