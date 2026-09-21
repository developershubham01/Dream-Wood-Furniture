"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, GitCompareArrows, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSiteData } from "@/lib/site-data";
import { useSiteStore } from "@/lib/store";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";

const DIFF_ONLY_KEY = "dreamwood-compare-diff-only";

/** A single compare row definition — renders label + one cell per product */
interface CompareRow {
  key: string;
  label: string;
  value: (p: Product) => string | null;
  /** Render the primary value larger (name/price rows) */
  prominent?: boolean;
}

const COMPARE_ROWS: CompareRow[] = [
  { key: "category", label: "Category", value: (p) => p.categoryName },
  { key: "materials", label: "Materials", value: (p) => p.materials },
  { key: "dimensions", label: "Dimensions", value: (p) => p.dimensions },
  { key: "finishes", label: "Finishes", value: (p) => p.colors },
  { key: "badge", label: "Highlight", value: (p) => p.badge },
  { key: "description", label: "About", value: (p) => p.description },
];

export function CompareDialog() {
  const compare = useSiteStore((s) => s.compare);
  const compareOpen = useSiteStore((s) => s.compareOpen);
  const setCompareOpen = useSiteStore((s) => s.setCompareOpen);
  const removeFromCompare = useSiteStore((s) => s.removeFromCompare);
  const clearCompare = useSiteStore((s) => s.clearCompare);
  const addToEnquiry = useSiteStore((s) => s.addToEnquiry);
  const setEnquiryOpen = useSiteStore((s) => s.setEnquiryOpen);
  const navigate = useSiteStore((s) => s.navigate);
  const { data } = useSiteData();
  const [diffOnly, setDiffOnly] = useState(false);

  // Hydration-safe preference: first render is always "all rows" (matching
  // SSR); after mount we sync the persisted choice from localStorage.
  useEffect(() => {
    const syncSavedPref = () => {
      try {
        if (window.localStorage.getItem(DIFF_ONLY_KEY) === "1") setDiffOnly(true);
      } catch {
        // localStorage unavailable — keep default
      }
    };
    syncSavedPref();
  }, []);

  const toggleDiffOnly = () => {
    setDiffOnly((v) => {
      const next = !v;
      try {
        window.localStorage.setItem(DIFF_ONLY_KEY, next ? "1" : "0");
      } catch {
        // ignore persistence failures
      }
      return next;
    });
  };

  // Resolve ids → live products (guards against removed/inactive pieces)
  const products = useMemo(
    () => compare.map((id) => data.products.find((p) => p.id === id)).filter((p): p is Product => !!p),
    [compare, data.products]
  );

  // Pre-compute row values + difference detection (shared by toggle + render)
  const rowsWithMeta = useMemo(
    () =>
      COMPARE_ROWS.map((row) => {
        const values = products.map((p) => row.value(p) ?? "—");
        const allSame = new Set(values).size <= 1;
        return { row, values, allSame };
      }),
    [products]
  );
  const diffCount = rowsWithMeta.filter((r) => !r.allSame).length;
  const visibleRows = diffOnly && products.length >= 2 ? rowsWithMeta.filter((r) => !r.allSame) : rowsWithMeta;

  const open = compareOpen && products.length > 0;

  const handleAddEnquiry = (p: Product) => {
    addToEnquiry({
      productId: p.id,
      name: p.name,
      image: p.images[0] || "/images/cat-living.png",
      price: p.price,
    });
    setCompareOpen(false);
    setEnquiryOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setCompareOpen}>
      <DialogContent className="max-w-5xl w-[calc(100vw-2rem)] max-h-[92vh] bg-card border-walnut-200 rounded-3xl p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative bg-espresso overflow-hidden shrink-0">
          <div className="absolute inset-0 wood-texture opacity-60" aria-hidden />
          <div className="relative px-5 sm:px-7 py-5 flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="font-display text-xl sm:text-2xl text-ivory flex items-center gap-3">
                <GitCompareArrows className="h-6 w-6 text-gold" aria-hidden />
                Compare Pieces
              </DialogTitle>
              <DialogDescription className="text-ivory/60 text-xs sm:text-sm mt-1">
                {products.length < 2
                  ? "Add at least one more piece to see a side-by-side comparison."
                  : diffOnly
                    ? `Showing the ${diffCount} spec${diffCount === 1 ? "" : "s"} that differ — identical rows are hidden.`
                    : "Differences between pieces are highlighted in gold."}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-4 sm:gap-5 shrink-0 pt-1">
              {products.length >= 2 && (
                <button
                  onClick={toggleDiffOnly}
                  aria-pressed={diffOnly}
                  className="group flex items-center gap-2.5 cursor-pointer"
                >
                  <span
                    className={cn(
                      "text-[11px] uppercase tracking-[0.15em] transition-colors",
                      diffOnly ? "text-gold" : "text-ivory/60 group-hover:text-ivory"
                    )}
                  >
                    Only differences
                    <span className={cn("ml-1.5 tabular-nums", diffOnly ? "text-gold/80" : "text-ivory/40")}>
                      ({diffCount})
                    </span>
                  </span>
                  <span
                    className={cn(
                      "relative h-5 w-9 rounded-full transition-colors",
                      diffOnly ? "bg-gold" : "bg-ivory/20 group-hover:bg-ivory/30"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-4 w-4 rounded-full shadow transition-all duration-200",
                        diffOnly ? "left-[18px] bg-espresso" : "left-0.5 bg-ivory"
                      )}
                    />
                  </span>
                </button>
              )}
              {products.length > 0 && (
                <button
                  onClick={clearCompare}
                  className="text-[11px] uppercase tracking-[0.15em] text-gold-light/80 hover:text-gold transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Comparison grid */}
        <div className="overflow-auto compare-scroll flex-1">
          <div
            className="grid min-w-full w-max"
            style={{
              gridTemplateColumns: `104px repeat(${Math.max(products.length, 1)}, minmax(190px, 1fr))`,
            }}
          >
            {/* ── Product images ── */}
            <div className="sticky left-0 z-10 bg-card border-r border-walnut-100 flex items-end pb-3 pt-5 pl-4 sm:pl-5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-walnut-400">
                Piece
              </span>
            </div>
            {products.map((p, i) => (
              <div key={p.id} className="relative p-3 sm:p-4">
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-walnut-100 bg-walnut-50"
                >
                  <img
                    src={p.images[0] || "/images/cat-living.png"}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeFromCompare(p.id)}
                    aria-label={`Remove ${p.name} from compare`}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-espresso/70 backdrop-blur text-ivory hover:bg-espresso flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              </div>
            ))}

            {/* ── Name + price ── */}
            <div className="sticky left-0 z-10 bg-card border-r border-walnut-100" />
            {products.map((p) => (
              <div key={p.id} className="px-4 sm:px-5 pt-1 pb-4">
                <h3 className="font-display text-lg leading-snug text-walnut-900 line-clamp-2">
                  {p.name}
                </h3>

                <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                  {p.price != null ? (
                    <>
                      <span className="text-lg font-semibold text-walnut-800 tabular-nums">
                        {formatINR(p.price)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">onwards</span>
                    </>
                  ) : (
                    <span className="text-xs font-medium tracking-wide text-gold-dark bg-gold/10 border border-gold/30 rounded-full px-2.5 py-1">
                      Request a Quote
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* ── Spec rows ── */}
            {visibleRows.map(({ row, values, allSame }) => {
              return (
                <div key={row.key} className="contents">
                  <div
                    className={cn(
                      "sticky left-0 z-10 bg-card border-r border-walnut-100 border-t border-walnut-100 px-4 sm:px-5 py-3.5 flex items-center gap-1.5",
                      !allSame && "bg-gold/[0.06]"
                    )}
                  >
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-[0.16em]",
                        !allSame ? "text-gold-dark" : "text-walnut-400"
                      )}
                    >
                      {row.label}
                    </span>
                    {!allSame && (
                      <span
                        className="h-1.5 w-1.5 rotate-45 bg-gold shrink-0"
                        aria-label="differs"
                        title="Differs between pieces"
                      />
                    )}
                  </div>
                  {products.map((p, i) => {
                    const v = values[i];
                    const differs = !allSame && v !== values[0];
                    return (
                      <div
                        key={p.id}
                        className={cn(
                          "border-t border-walnut-100 px-4 sm:px-5 py-3.5 text-sm",
                          row.key === "description" && "leading-relaxed"
                        )}
                      >
                        {row.key === "description" ? (
                          <p className="text-sm leading-relaxed line-clamp-3 text-walnut-700">
                            {v === "—" ? <span className="text-walnut-300">—</span> : v}
                          </p>
                        ) : row.key === "badge" && v !== "—" ? (
                          <span className="inline-block text-[11px] font-medium tracking-wide bg-walnut-800 text-ivory rounded-full px-2.5 py-1">
                            {v}
                          </span>
                        ) : (
                          <span
                            className={cn(
                              v === "—" && "text-walnut-300",
                              differs && "font-medium text-walnut-900"
                            )}
                          >
                            {v}
                          </span>
                        )}
                        {differs && (
                          <span
                            className="ml-1.5 inline-block h-1.5 w-1.5 rotate-45 bg-gold align-middle"
                            aria-hidden
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* ── No differing rows when diffOnly is on ── */}
            {visibleRows.length === 0 && products.length >= 2 && (
              <div className="col-span-full px-6 py-10 text-center">
                <p className="text-sm text-walnut-600">These pieces share the same specifications.</p>
                <button
                  onClick={() => setDiffOnly(false)}
                  className="mt-2 text-xs font-medium text-gold-dark hover:text-gold-dark/80 underline underline-offset-4 cursor-pointer"
                >
                  Show all rows
                </button>
              </div>
            )}

            {/* ── Actions ── */}
            <div className="sticky left-0 z-10 bg-card border-r border-walnut-100" />
            {products.map((p) => (
              <div key={p.id} className="px-4 sm:px-5 py-4 flex flex-col gap-2 border-t border-walnut-100/60">
                <Button
                  onClick={() => {
                    setCompareOpen(false);
                    navigate({ name: "product", slug: p.slug });
                  }}
                  className="h-9 rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory text-xs font-semibold w-full"
                >
                  View Details
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
                <Button
                  onClick={() => handleAddEnquiry(p)}
                  variant="outline"
                  className="h-9 rounded-full border-walnut-300 text-walnut-800 hover:bg-walnut-50 text-xs w-full"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add to Enquiry
                </Button>
              </div>
            ))}
          </div>

          {/* Hint when fewer than 2 selected */}
          {products.length === 1 && (
            <button
              onClick={() => {
                setCompareOpen(false);
                navigate({ name: "shop" });
              }}
              className="mx-4 mb-6 mt-2 w-[calc(100%-2rem)] rounded-2xl border border-dashed border-walnut-300 hover:border-gold hover:bg-gold/5 transition-colors py-6 flex flex-col items-center gap-2 text-walnut-500 hover:text-gold-dark cursor-pointer group"
            >
              <span className="h-9 w-9 rounded-full border border-walnut-200 group-hover:border-gold/50 flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium">Add another piece to compare</span>
              <span className="text-xs text-muted-foreground">
                Use the compare icon on any product — up to 3 at a time
              </span>
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Shared compare toggle button with toast feedback (used on cards, quick view, product page) */
export function CompareToggle({
  product,
  className,
  label = false,
  iconClassName,
}: {
  product: Product;
  className?: string;
  /** Render with a visible text label (product page style) */
  label?: boolean;
  iconClassName?: string;
}) {
  const compare = useSiteStore((s) => s.compare);
  const toggleCompare = useSiteStore((s) => s.toggleCompare);
  const inCompare = compare.includes(product.id);

  const handle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { added, full } = toggleCompare(product.id);
    if (full) {
      toast({
        title: "Compare list is full",
        description: "Remove a piece from the compare bar first (max 3).",
      });
      return;
    }
    toast({
      title: added ? "Added to compare" : "Removed from compare",
      description: added
        ? `${product.name} — ${compare.length + 1}/3 selected. Open the compare bar to view them side by side.`
        : product.name,
    });
  };

  if (label) {
    return (
      <Button
        onClick={handle}
        variant="outline"
        aria-pressed={inCompare}
        className={cn(
          "h-11 rounded-full border-walnut-300 text-walnut-800 hover:bg-walnut-50 font-medium",
          inCompare && "border-gold bg-gold/10 text-gold-dark hover:bg-gold/15 hover:text-gold-dark",
          className
        )}
      >
        <GitCompareArrows className={cn("h-4 w-4", iconClassName)} />
        {inCompare ? "In Compare" : "Compare"}
        {inCompare && <Minus className="h-3.5 w-3.5 ml-1 text-gold-dark" aria-hidden />}
      </Button>
    );
  }

  return (
    <button
      onClick={handle}
      aria-label={inCompare ? `Remove ${product.name} from compare` : `Add ${product.name} to compare`}
      aria-pressed={inCompare}
      title={inCompare ? "Remove from compare" : "Add to compare"}
      className={cn(
        "rounded-full flex items-center justify-center backdrop-blur transition-all duration-300 cursor-pointer",
        inCompare
          ? "bg-gold text-espresso shadow-md"
          : "bg-white/70 text-walnut-700 hover:bg-white hover:text-gold-dark",
        className
      )}
    >
      <GitCompareArrows className={cn("h-4 w-4", iconClassName)} />
    </button>
  );
}
