"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, PackageSearch, ArrowRight, History, X } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSiteStore } from "@/lib/store";
import { useSiteData } from "@/lib/site-data";
import { formatINR } from "@/lib/format";

const RECENT_KEY = "dw-recent-searches";
const RECENT_MAX = 6;

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string").slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

/** True when the keyboard event originated inside a field the visitor is typing in */
function isTypingTarget(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  return (
    t.tagName === "INPUT" ||
    t.tagName === "TEXTAREA" ||
    t.tagName === "SELECT" ||
    t.isContentEditable
  );
}

export function SearchDialog() {
  const searchOpen = useSiteStore((s) => s.searchOpen);
  const setSearchOpen = useSiteStore((s) => s.setSearchOpen);
  const navigate = useSiteStore((s) => s.navigate);
  const goHome = useSiteStore((s) => s.goHome);
  const { data } = useSiteData();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const router = useRouter();

  // Load saved searches whenever the dialog opens (fresh from localStorage).
  // Wrapper-call pattern per codebase convention for the lint rule.
  useEffect(() => {
    const syncSavedSearches = () => {
      if (searchOpen) setRecent(loadRecent());
    };
    syncSavedSearches();
  }, [searchOpen]);

  const recordSearch = useCallback((q: string) => {
    const term = q.trim();
    if (!term) return;
    setRecent((prev) => {
      const next = [term, ...prev.filter((r) => r.toLowerCase() !== term.toLowerCase())].slice(0, RECENT_MAX);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        // storage unavailable — in-memory list still works this visit
      }
      return next;
    });
  }, []);

  const clearRecent = () => {
    setRecent([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {
      // ignore
    }
  };

  // Cmd+K shortcut + "/" to open search (Gmail-style, skipped while typing)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(!searchOpen);
        return;
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !isTypingTarget(e)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [searchOpen, setSearchOpen]);

  const q = query.trim().toLowerCase();
  const results = q
    ? data.products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.nameHi ?? "").includes(q) ||
            (p.categoryName ?? "").toLowerCase().includes(q)
        )
        .slice(0, 8)
    : [];

  const categoryResults = q
    ? data.categories.filter(
        (c) => c.name.toLowerCase().includes(q) || (c.nameHi ?? "").includes(q)
      )
    : [];

  const go = (fn: () => void, term?: string) => {
    if (term) recordSearch(term);
    setSearchOpen(false);
    setQuery("");
    fn();
    router.refresh();
  };

  return (
    <CommandDialog
      open={searchOpen}
      onOpenChange={(o) => {
        setSearchOpen(o);
        if (!o) setQuery("");
      }}
      className="rounded-2xl border-walnut-100"
    >
      <CommandInput
        placeholder="Search sofas, beds, wardrobes…"
        value={query}
        onValueChange={setQuery}
        className="border-walnut-100"
      />
      <CommandList className="bg-card">
        <CommandEmpty>
          <div className="py-8 text-center">
            <PackageSearch className="h-8 w-8 mx-auto text-walnut-300 mb-3" aria-hidden />
            <p className="text-sm text-muted-foreground">
              No pieces match "{query}" — try a category like "sofa" or "wardrobe".
            </p>
          </div>
        </CommandEmpty>

        {categoryResults.length > 0 && (
          <CommandGroup heading="Categories">
            {categoryResults.map((c) => (
              <CommandItem
                key={c.id}
                onSelect={() => go(() => navigate({ name: "shop", category: c.slug }), query.trim())}
                className="cursor-pointer"
              >
                <Search className="mr-2.5 h-4 w-4 text-gold-dark" aria-hidden />
                <span className="font-medium">{c.name}</span>
                {c.nameHi && <span className="ml-2 text-xs text-muted-foreground">{c.nameHi}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.length > 0 && (
          <CommandGroup heading="Products">
            {results.map((p) => (
              <CommandItem
                key={p.id}
                onSelect={() => go(() => navigate({ name: "product", slug: p.slug }), query.trim())}
                className="cursor-pointer gap-3"
              >
                <img
                  src={p.images[0] || "/images/cat-living.png"}
                  alt=""
                  className="h-10 w-10 rounded-lg object-cover border border-walnut-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {p.categoryName}
                    {p.price != null ? ` · ${formatINR(p.price)}` : " · Quote on request"}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!q && recent.length > 0 && (
          <CommandGroup heading="Recent searches">
            <div className="flex flex-wrap items-center gap-2 px-2 pb-2 pt-1">
              {recent.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  aria-label={`Search again for ${term}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-walnut-200 bg-walnut-50/60 px-3 py-1.5 text-xs font-medium text-walnut-700 hover:border-gold/60 hover:bg-gold/10 hover:text-walnut-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 transition-colors cursor-pointer"
                >
                  <History className="h-3 w-3 text-gold-dark" aria-hidden />
                  {term}
                </button>
              ))}
              <button
                onClick={clearRecent}
                aria-label="Clear recent searches"
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" aria-hidden />
                Clear
              </button>
            </div>
          </CommandGroup>
        )}

        {!q && (
          <CommandGroup heading="Quick actions">
            <CommandItem onSelect={() => go(() => navigate({ name: "shop" }))} className="cursor-pointer">
              <Search className="mr-2.5 h-4 w-4 text-gold-dark" aria-hidden />
              Browse the full collection
            </CommandItem>
            <CommandItem onSelect={() => go(() => navigate({ name: "custom" }))} className="cursor-pointer">
              <Search className="mr-2.5 h-4 w-4 text-gold-dark" aria-hidden />
              Request custom furniture
            </CommandItem>
            <CommandItem onSelect={() => go(() => goHome("faq"))} className="cursor-pointer">
              <Search className="mr-2.5 h-4 w-4 text-gold-dark" aria-hidden />
              Read FAQs — delivery, warranty, customisation
            </CommandItem>
            <CommandItem onSelect={() => go(() => navigate({ name: "contact" }))} className="cursor-pointer">
              <Search className="mr-2.5 h-4 w-4 text-gold-dark" aria-hidden />
              Contact the showroom
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>

      {/* Keyboard-hint footer — premium detail that teaches the shortcuts */}
      <div className="flex items-center justify-between gap-3 border-t border-walnut-100 px-4 py-2.5 text-[11px] text-muted-foreground select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd>
            open
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Kbd>esc</Kbd>
            close
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5">
            <Kbd>/</Kbd>
            search
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
            anywhere
          </span>
        </div>
      </div>
    </CommandDialog>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-walnut-200 bg-ivory px-1.5 font-sans text-[10px] font-semibold text-walnut-600 shadow-[inset_0_-1px_0_var(--color-walnut-100)]">
      {children}
    </kbd>
  );
}
