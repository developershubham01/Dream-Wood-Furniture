"use client";

import { Clock3 } from "lucide-react";
import { useSiteStore } from "@/lib/store";
import { useSiteData } from "@/lib/site-data";
import { formatINR } from "@/lib/format";

/** Horizontal strip of recently viewed products (excludes the current product) */
export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const recentlyViewed = useSiteStore((s) => s.recentlyViewed);
  const navigate = useSiteStore((s) => s.navigate);
  const { data } = useSiteData();

  const items = recentlyViewed
    .filter((id) => id !== excludeId)
    .map((id) => data.products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 6);

  if (items.length === 0) return null;

  return (
    <section aria-label="Recently viewed products" className="mt-16 lg:mt-20 print:hidden">
      <div className="flex items-center gap-2.5 mb-5">
        <Clock3 className="h-4 w-4 text-gold-dark" aria-hidden />
        <h2 className="font-display text-xl text-walnut-900">Recently Viewed</h2>
        <span className="flex-1 h-px bg-walnut-100" aria-hidden />
      </div>
      <div
        className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 snap-x"
        role="list"
        style={{ scrollbarWidth: "thin" }}
      >
        {items.map((p) => (
          <button
            key={p.id}
            role="listitem"
            onClick={() => navigate({ name: "product", slug: p.slug })}
            aria-label={`View ${p.name}`}
            className="group snap-start shrink-0 w-[150px] sm:w-[170px] text-left rounded-2xl border border-walnut-100 bg-card overflow-hidden hover:border-walnut-300 hover:shadow-lg hover:shadow-walnut-900/10 transition-all duration-300 cursor-pointer"
          >
            <div className="aspect-square bg-walnut-50 img-zoom">
              <img
                src={p.images[0] || "/images/cat-living.png"}
                alt={p.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-walnut-900 line-clamp-1 group-hover:text-walnut-600 transition-colors">
                {p.name}
              </p>
              <p className="mt-1 text-xs font-semibold text-walnut-700">
                {p.price != null ? formatINR(p.price) : "Request a Quote"}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
