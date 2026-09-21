"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  PackageSearch,
  ArrowUpDown,
  LayoutGrid,
  List,
  Plus,
  ArrowRight,
  Layers,
  Ruler,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteData } from "@/lib/site-data";
import { useSiteStore } from "@/lib/store";
import { formatINR } from "@/lib/format";
import { ProductCard } from "../product-card";
import { cn } from "@/lib/utils";
import { CompareToggle } from "../compare-dialog";
import type { Product } from "@/lib/types";

const PAGE_SIZE = 12;
const VIEW_STORAGE_KEY = "dreamwood-shop-view";

type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "name";
type ShopViewMode = "grid" | "list";

export function ShopView({ initialCategory, initialQuery }: { initialCategory?: string; initialQuery?: string }) {
  const { data } = useSiteData();
  const navigate = useSiteStore((s) => s.navigate);

  const [category, setCategory] = useState<string>(initialCategory ?? "all");
  const [query, setQuery] = useState(initialQuery ?? "");
  const [sort, setSort] = useState<SortKey>("featured");
  const [priceMode, setPriceMode] = useState<"all" | "priced" | "quote">("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<ShopViewMode>("grid");

  // Hydration-safe view preference: first render is always "grid" (matching
  // SSR); after mount we sync the persisted choice from localStorage —
  // never read during render.
  useEffect(() => {
    const syncSavedView = () => {
      try {
        const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
        if (saved === "grid" || saved === "list") setView(saved);
      } catch {
        // localStorage unavailable (blocked/private mode) — keep default view
      }
    };
    syncSavedView();
  }, []);

  // View mode is pure UI state — filters, search, sort and pagination are kept intact.
  const changeView = (mode: ShopViewMode) => {
    setView(mode);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, mode);
    } catch {
      // ignore persistence failures
    }
  };

  const filtered = useMemo(() => {
    let list = [...data.products];
    if (category !== "all") {
      list = list.filter((p) => p.categorySlug === category);
    }
    if (priceMode === "priced") list = list.filter((p) => p.price != null);
    if (priceMode === "quote") list = list.filter((p) => p.price == null);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.categoryName ?? "").toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "newest":
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case "price-asc":
        list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
        break;
      case "price-desc":
        list.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder);
    }
    return list;
  }, [data.products, category, query, sort, priceMode]);

  const shown = filtered.slice(0, visible);
  const activeCategory = data.categories.find((c) => c.slug === category);

  return (
    <div className="bg-background">
      {/* Page header */}
      <div className="bg-walnut-900 relative overflow-hidden">
        <div className="absolute inset-0 wood-texture opacity-70" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-14 lg:py-20">
          <button
            onClick={() => navigate({ name: "home" })}
            className="text-xs uppercase tracking-[0.2em] text-gold-light hover:text-gold transition-colors cursor-pointer"
          >
            Home
          </button>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl text-ivory">
            {activeCategory ? activeCategory.name : "The Collection"}
          </h1>
          <p className="mt-3 text-ivory/70 max-w-xl text-sm sm:text-base leading-relaxed">
            {activeCategory?.description ??
              "Browse thoughtfully designed furniture for every room — request a quote or visit the showroom to experience the pieces in person."}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-16 lg:top-20 z-40 bg-cream/95 backdrop-blur-md border-b border-walnut-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="relative w-full sm:flex-1 sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search furniture…"
                className="pl-10 h-10 rounded-full bg-card border-walnut-200 focus-visible:ring-gold"
                aria-label="Search products"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-[150px] sm:w-[180px] h-10 rounded-full bg-card border-walnut-200 cursor-pointer" aria-label="Sort products">
                <div className="flex items-center gap-2 text-sm">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-walnut-100">
                <SelectItem value="featured">Featured first</SelectItem>
                <SelectItem value="newest">Newest arrivals</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
            <ViewToggle view={view} onChange={changeView} />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters((s) => !s)}
              aria-label="Toggle filters"
              aria-expanded={showFilters}
              className={cn(
                "h-10 w-10 rounded-full border-walnut-200 bg-card xl:hidden",
                showFilters && "bg-walnut-800 text-ivory border-walnut-800 hover:bg-walnut-700 hover:text-ivory"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Category pills */}
          <div className={cn("flex gap-2 overflow-x-auto pb-1 scrollbar-none", !showFilters && "hidden xl:flex")}>
            <CategoryPill
              active={category === "all"}
              onClick={() => {
                setCategory("all");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              All Products
            </CategoryPill>
            {data.categories.map((cat) => (
              <CategoryPill
                key={cat.id}
                active={category === cat.slug}
                onClick={() => {
                  setCategory(cat.slug);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                {cat.name}
              </CategoryPill>
            ))}
            <span className="w-px shrink-0 bg-walnut-200 mx-1" aria-hidden />
            {(
              [
                { key: "all", label: "Any price" },
                { key: "priced", label: "With price" },
                { key: "quote", label: "Quote only" },
              ] as const
            ).map((p) => (
              <button
                key={p.key}
                onClick={() => setPriceMode(p.key)}
                className={cn(
                  "shrink-0 h-8 px-4 rounded-full text-xs font-medium tracking-wide transition-all cursor-pointer border",
                  priceMode === p.key
                    ? "bg-gold/15 text-gold-dark border-gold/40"
                    : "bg-card text-muted-foreground border-walnut-200 hover:border-walnut-400 hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 lg:py-14">
        <p className="text-sm text-muted-foreground mb-6" aria-live="polite">
          Showing <span className="font-semibold text-foreground">{shown.length}</span> of{" "}
          <span className="font-semibold text-foreground">{filtered.length}</span> pieces
          {activeCategory && (
            <Badge variant="outline" className="ml-2 rounded-full border-gold/40 text-gold-dark bg-gold/10">
              {activeCategory.name}
            </Badge>
          )}
        </p>

        {shown.length > 0 ? (
          <>
            {view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {shown.map((product: Product, i: number) => (
                  <ProductCard key={product.id} product={product} index={i % PAGE_SIZE} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:gap-5">
                {shown.map((product: Product, i: number) => (
                  <ProductListItem key={product.id} product={product} index={i % PAGE_SIZE} />
                ))}
              </div>
            )}
            {visible < filtered.length && (
              <div className="mt-12 text-center">
                <Button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  variant="outline"
                  className="rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-800 hover:text-ivory hover:border-walnut-800 px-8 h-11"
                >
                  Load More ({filtered.length - visible} remaining)
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 border border-dashed border-walnut-200 rounded-3xl">
            <PackageSearch className="h-10 w-10 mx-auto text-walnut-300 mb-4" aria-hidden />
            <h3 className="font-display text-xl text-walnut-900">No pieces match your filters</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Try clearing the search or choosing a different category — or ask us about custom furniture made just for you.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                className="rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-50"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setPriceMode("all");
                }}
              >
                Clear all filters
              </Button>
              <Button
                className="rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory"
                onClick={() => navigate({ name: "custom" })}
              >
                Request Custom Furniture
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryPill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 h-8 px-4 rounded-full text-xs font-medium tracking-wide transition-all cursor-pointer border",
        active
          ? "bg-walnut-800 text-ivory border-walnut-800"
          : "bg-card text-muted-foreground border-walnut-200 hover:border-walnut-400 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: ShopViewMode;
  onChange: (view: ShopViewMode) => void;
}) {
  const options = [
    { key: "grid" as const, label: "Grid view", Icon: LayoutGrid },
    { key: "list" as const, label: "List view", Icon: List },
  ];
  return (
    <div
      role="group"
      aria-label="View mode"
      className="flex items-center gap-1 rounded-full border border-walnut-200 bg-card p-1"
    >
      {options.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-label={label}
          aria-pressed={view === key}
          title={label}
          className={cn(
            "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors",
            view === key
              ? "bg-walnut-800 text-ivory"
              : "text-walnut-600 hover:bg-walnut-50 hover:text-walnut-900"
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </button>
      ))}
    </div>
  );
}

function ProductListItem({ product, index }: { product: Product; index: number }) {
  const navigate = useSiteStore((s) => s.navigate);
  const addToEnquiry = useSiteStore((s) => s.addToEnquiry);
  const setEnquiryOpen = useSiteStore((s) => s.setEnquiryOpen);
  const inCompare = useSiteStore((s) => s.compare.includes(product.id));

  const cover = product.images[0] || "/images/cat-living.png";

  const open = () => navigate({ name: "product", slug: product.slug });

  const handleAddEnquiry = () => {
    addToEnquiry({
      productId: product.id,
      name: product.name,
      image: cover,
      price: product.price,
    });
    setEnquiryOpen(true);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.25), ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col sm:flex-row rounded-2xl border border-walnut-100 bg-card overflow-hidden hover:border-walnut-300 hover:shadow-lg hover:shadow-walnut-900/5 transition-all duration-300"
    >
      {/* Image — full-width banner on mobile, fixed square on sm+ */}
      <div
        className="relative img-zoom cursor-pointer bg-walnut-50 h-40 w-full shrink-0 sm:h-44 sm:w-44 sm:m-3 sm:rounded-xl"
        onClick={open}
        role="link"
        aria-label={`View ${product.name}`}
      >
        <img src={cover} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
        {product.badge && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-walnut-800/90 px-2.5 py-1 text-[10px] font-medium tracking-wide text-ivory">
            {product.badge}
          </span>
        )}
      </div>

      {/* Middle: name, category, description, specs */}
      <div className="min-w-0 flex-1 p-4 sm:p-5">
        <h3
          onClick={open}
          className="cursor-pointer font-display text-xl leading-snug text-walnut-900 transition-colors hover:text-walnut-600"
        >
          {product.name}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          {product.categoryName && (
            <span className="text-[11px] uppercase tracking-wider text-gold-dark">
              {product.categoryName}
            </span>
          )}
        </div>
        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground sm:max-w-2xl">
            {product.description}
          </p>
        )}
        {(product.materials || product.dimensions) && (
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            {product.materials && (
              <span className="flex min-w-0 items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 shrink-0 text-walnut-400" aria-hidden />
                <span className="truncate">{product.materials}</span>
              </span>
            )}
            {product.dimensions && (
              <span className="flex min-w-0 items-center gap-1.5">
                <Ruler className="h-3.5 w-3.5 shrink-0 text-walnut-400" aria-hidden />
                <span className="truncate">{product.dimensions}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right: price + actions (stacked full-width on mobile) */}
      <div className="flex w-full shrink-0 flex-col items-start gap-3 border-t border-walnut-100 p-4 pt-3 sm:w-60 sm:items-end sm:justify-between sm:border-t-0 sm:p-5">
        {product.price != null ? (
          <p className="flex items-baseline gap-1.5">
            <span className="text-xl font-semibold text-walnut-800 tabular-nums">{formatINR(product.price)}</span>
            <span className="text-xs text-muted-foreground">onwards</span>
          </p>
        ) : (
          <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium tracking-wide text-gold-dark">
            Request a Quote
          </span>
        )}
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Button
            onClick={handleAddEnquiry}
            variant="outline"
            size="sm"
            className="h-9 flex-1 rounded-full border-walnut-200 text-walnut-700 hover:border-walnut-400 hover:bg-walnut-50 hover:text-walnut-900 sm:flex-none"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Enquiry
          </Button>
          <Button
            onClick={open}
            variant="ghost"
            size="sm"
            className="h-9 flex-1 rounded-full font-medium text-gold-dark hover:bg-gold/10 hover:text-gold sm:flex-none"
          >
            Details
            <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <CompareToggle
            product={product}
            className={cn(
              "h-9 w-9 border",
              inCompare
                ? "border-gold bg-gold/10 text-gold-dark"
                : "border-walnut-200 text-walnut-500 hover:text-gold-dark hover:border-gold/50"
            )}
            iconClassName="h-4 w-4"
          />
        </div>
      </div>
    </motion.article>
  );
}

export function ShopSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[4/3] rounded-2xl bg-walnut-100" />
          <Skeleton className="h-5 w-3/4 bg-walnut-100" />
          <Skeleton className="h-4 w-1/3 bg-walnut-100" />
        </div>
      ))}
    </div>
  );
}
