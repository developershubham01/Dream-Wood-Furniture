"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Sofa,
  LayoutGrid,
  Inbox,
  MessageSquareQuote,
  Images,
  CircleHelp,
  FileText,
  ShieldCheck,
  LogOut,
  Home,
  Menu,
  X,
  RefreshCw,
  ExternalLink,
  Keyboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useSiteStore } from "@/lib/store";
import { useSiteData } from "@/lib/site-data";
import { AdminOverview } from "./admin-overview";
import { AdminProducts } from "./admin-products";
import { AdminCategories } from "./admin-categories";
import { AdminEnquiries } from "./admin-enquiries";
import { AdminTestimonials } from "./admin-testimonials";
import { AdminGallery } from "./admin-gallery";
import { AdminFaqs } from "./admin-faqs";
import { AdminContent } from "./admin-content";
import { AdminSecurity } from "./admin-security";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type Tab =
  | "overview"
  | "products"
  | "categories"
  | "enquiries"
  | "testimonials"
  | "gallery"
  | "content"
  | "faqs"
  | "security";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Sofa },
  { id: "categories", label: "Categories", icon: LayoutGrid },
  { id: "enquiries", label: "Enquiries", icon: Inbox },
  { id: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { id: "gallery", label: "Gallery", icon: Images },
  { id: "content", label: "Site Content", icon: FileText },
  { id: "faqs", label: "FAQs", icon: CircleHelp },
  { id: "security", label: "Security", icon: ShieldCheck },
];

const NAV_GROUPS: { label: string; tabs: Tab[] }[] = [
  { label: "Dashboard", tabs: ["overview"] },
  { label: "Catalogue", tabs: ["products", "categories", "gallery"] },
  { label: "Inbox", tabs: ["enquiries", "testimonials"] },
  { label: "Settings", tabs: ["content", "faqs", "security"] },
];

/** Gmail-style "g" chord: press "g", then a section key within 900ms */
const CHORD_WINDOW_MS = 900;
const CHORD_TARGETS: Record<string, Tab> = {
  o: "overview",
  p: "products",
  e: "enquiries",
  g: "gallery",
  t: "testimonials",
  f: "faqs",
  c: "content",
  s: "security",
};

/** Rows rendered in the "?" help dialog */
const SHORTCUT_ROWS: { label: string; keys: string[] }[] = [
  { label: "Overview", keys: ["g", "o"] },
  { label: "Products", keys: ["g", "p"] },
  { label: "Enquiries", keys: ["g", "e"] },
  { label: "Gallery", keys: ["g", "g"] },
  { label: "Testimonials", keys: ["g", "t"] },
  { label: "FAQs", keys: ["g", "f"] },
  { label: "Site Content", keys: ["g", "c"] },
  { label: "Security", keys: ["g", "s"] },
  { label: "This shortcut help", keys: ["?"] },
  { label: "Close dialog / clear selection", keys: ["Esc"] },
];

export function AdminShell({
  admin,
  onLogout,
}: {
  admin: { username: string; displayName: string; role: string };
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [enquiriesSignal, setEnquiriesSignal] = useState(0);
  // null = first poll hasn't run yet (baseline not established)
  const prevCountRef = useRef<number | null>(null);
  const tabRef = useRef<Tab>("overview");
  tabRef.current = tab;
  const goHome = useSiteStore((s) => s.goHome);
  const { refresh } = useSiteData();

  /** Poll new-enquiry count for the sidebar badge */
  const pollNew = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { newEnquiries?: number };
      const next = json.newEnquiries ?? 0;
      // Notify only on an increase AFTER the first poll established a baseline
      // (so 0 → 1 also notifies, but pre-existing new enquiries never toast).
      if (prevCountRef.current !== null && next > prevCountRef.current) {
        const onEnquiries = tabRef.current === "enquiries";
        if (onEnquiries) {
          // Already viewing the inbox — refresh the list in place
          setEnquiriesSignal((s) => s + 1);
          toast({
            title: "New enquiry received",
            description: `${next - prevCountRef.current} new — list refreshed`,
          });
        } else {
          toast({
            title: "New enquiry received",
            description: `${next - prevCountRef.current} new since you last checked`,
            action: (
              <button
                onClick={() => {
                  setTab("enquiries");
                  setSidebarOpen(false);
                  toast({ title: "Opening enquiries…" });
                }}
                className="shrink-0 rounded-full bg-gold/15 border border-gold/40 px-3.5 py-1.5 text-xs font-semibold text-gold-dark hover:bg-gold/25 transition-colors cursor-pointer"
              >
                View
              </button>
            ),
          });
        }
      }
      prevCountRef.current = next;
      setNewCount(next);
    } catch {
      // silent — badge is non-critical
    }
  }, []);

  useEffect(() => {
    pollNew();
    const t = setInterval(pollNew, 60_000);
    return () => clearInterval(t);
  }, [pollNew]);

  /** "?" help dialog + "g" chord state */
  const [helpOpen, setHelpOpen] = useState(false);
  const [chordArmed, setChordArmed] = useState(false);
  const helpOpenRef = useRef(false);
  const chordArmedRef = useRef(false);
  const chordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleHelp = useCallback((open: boolean) => {
    helpOpenRef.current = open;
    setHelpOpen(open);
  }, []);

  /** Cancel a pending "g" chord (resolved by a second key, or the 900ms window lapsed) */
  const disarmChord = useCallback(() => {
    if (chordTimerRef.current !== null) {
      clearTimeout(chordTimerRef.current);
      chordTimerRef.current = null;
    }
    chordArmedRef.current = false;
    setChordArmed(false);
  }, []);

  // Keyboard shortcuts — the listener is attached only while the logged-in
  // admin shell is mounted, so nothing leaks to the public storefront.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Never hijack typing — admins type "?" and "g" in search boxes all the time
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      // Another modal (add/edit form, confirm dialog…) is open — stay out of its way.
      // Our own help dialog is exempt so "?" can still toggle it closed.
      if (
        !helpOpenRef.current &&
        document.querySelector('[role="dialog"], [role="alertdialog"]')
      ) {
        return;
      }

      // Don't fight browser/OS combos (⌘G, Ctrl+G…)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        if (chordArmedRef.current) disarmChord();
        return;
      }

      // "?" toggles the shortcut help dialog (open → closes, closed → opens)
      if (e.key === "?") {
        e.preventDefault();
        disarmChord();
        toggleHelp(!helpOpenRef.current);
        return;
      }

      // Second key of a "g" chord: navigate, or cancel and let the key through untouched
      if (chordArmedRef.current) {
        const nextTab = CHORD_TARGETS[e.key.toLowerCase()];
        disarmChord();
        if (nextTab) {
          e.preventDefault();
          setTab(nextTab);
          setSidebarOpen(false);
          toggleHelp(false); // jumping to a tab should never leave the modal blocking it
        }
        return;
      }

      // A lone "g" arms the chord
      if (e.key.toLowerCase() === "g") {
        chordArmedRef.current = true;
        setChordArmed(true);
        chordTimerRef.current = setTimeout(() => {
          chordTimerRef.current = null;
          chordArmedRef.current = false;
          setChordArmed(false);
        }, CHORD_WINDOW_MS);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (chordTimerRef.current !== null) {
        clearTimeout(chordTimerRef.current);
        chordTimerRef.current = null;
      }
    };
  }, [disarmChord, setTab, setSidebarOpen, toggleHelp]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // ignore
    }
    onLogout();
    goHome();
    toast({ title: "Signed out" });
  };

  const handleSiteRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
      toast({ title: "Storefront data refreshed" });
    } finally {
      setRefreshing(false);
    }
  };

  const groupedTabs = NAV_GROUPS.map((g) => ({
    label: g.label,
    items: g.tabs.map((id) => TABS.find((t) => t.id === id)!).filter(Boolean),
  }));

  return (
    <div className="min-h-screen bg-ivory/50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 z-50 h-screen w-[260px] shrink-0 bg-espresso text-ivory flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )} >
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <img src="/logo-white.svg" alt="Dream Wood Furniture admin" className="h-8 w-auto" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-ivory/60 hover:text-ivory cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-4" aria-label="Admin sections">
          {groupedTabs.map((group) => (
            <div key={group.label}>
              <p className="px-4 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory/40 select-none">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTab(t.id);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group",
                      tab === t.id
                        ? "bg-gold text-espresso shadow-lg shadow-black/20"
                        : "text-ivory/70 hover:text-ivory hover:bg-white/10"
                    )}
                    aria-current={tab === t.id ? "page" : undefined}
                  >
                    <t.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                    <span className="flex-1 text-left">{t.label}</span>
                    {t.id === "enquiries" && newCount > 0 && (
                      <span
                        className={cn(
                          "min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold tabular-nums flex items-center justify-center",
                          tab === "enquiries" ? "bg-espresso text-gold" : "bg-gold text-espresso"
                        )}
                        aria-label={`${newCount} new enquiries`}
                      >
                        {newCount > 99 ? "99+" : newCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <button
            onClick={() => goHome()}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-ivory/70 hover:text-ivory hover:bg-white/10 transition-all cursor-pointer"
          >
            <Home className="h-[18px] w-[18px]" aria-hidden />
            View Website
            <ExternalLink className="h-3.5 w-3.5 ml-auto opacity-40" aria-hidden />
          </button>
          <div className="flex items-center gap-3 px-4 py-2.5">
            <div className="h-8 w-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold text-xs font-bold">
              {admin.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{admin.displayName}</p>
              <p className="text-[11px] text-ivory/50 capitalize">{admin.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-ivory/50 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur border-b border-walnut-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-walnut-800 hover:bg-walnut-100 cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">
                <span>Admin</span>
                <span aria-hidden className="text-walnut-300">/</span>
                <span className="truncate">{TABS.find((t) => t.id === tab)?.label}</span>
              </nav>
              <p className="text-sm font-medium text-walnut-900 truncate">
                {TABS.find((t) => t.id === tab)?.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {newCount > 0 && tab !== "enquiries" && (
              <button
                onClick={() => setTab("enquiries")}
                className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-gold/15 border border-gold/40 text-gold-dark text-xs font-semibold hover:bg-gold/25 transition-colors cursor-pointer"
              >
                <Inbox className="h-3.5 w-3.5" aria-hidden />
                {newCount} new {newCount === 1 ? "enquiry" : "enquiries"}
              </button>
            )}
            <Button
              onClick={() => toggleHelp(true)}
              variant="outline"
              size="icon"
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (?)"
              className="h-8 w-8 rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-50"
            >
              <Keyboard aria-hidden />
            </Button>
            <Button
              onClick={handleSiteRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-50 text-xs"
            >
              {refreshing ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" aria-hidden /> Refreshing…
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Refresh storefront
                </>
              )}
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {tab === "overview" && <AdminOverview onNavigate={setTab} adminName={admin.displayName} />}
          {tab === "products" && <AdminProducts />}
          {tab === "categories" && <AdminCategories />}
          {tab === "enquiries" && <AdminEnquiries signal={enquiriesSignal} />}
          {tab === "testimonials" && <AdminTestimonials />}
          {tab === "gallery" && <AdminGallery />}
          {tab === "content" && <AdminContent />}
          {tab === "faqs" && <AdminFaqs />}
          {tab === "security" && <AdminSecurity />}
        </main>
      </div>

      {/* "g" chord armed — transient bottom hint (decorative feedback) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
      >
        <AnimatePresence>
          {chordArmed && (
            <motion.div
              key="chord-hint"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="flex select-none items-center gap-2.5 rounded-full border border-gold/30 bg-walnut-900/95 py-2 pl-4 pr-3 shadow-lg shadow-walnut-900/25 backdrop-blur-sm"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
                Navigate
              </span>
              <span className="flex items-center gap-1">
                {Object.keys(CHORD_TARGETS).map((k) => (
                  <span
                    key={k}
                    className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-gold/40 bg-gold/15 px-1.5 font-sans text-[10px] font-semibold text-gold"
                  >
                    {k}
                  </span>
                ))}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* "?" — keyboard shortcuts help dialog */}
      <Dialog open={helpOpen} onOpenChange={toggleHelp}>
        <DialogContent className="bg-card border-walnut-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-walnut-900">
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Zip between sections without reaching for the mouse — press{" "}
              <Kbd>g</Kbd>, then a section key.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-x-10 sm:grid-cols-2">
            {SHORTCUT_ROWS.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 border-b border-walnut-100 py-2.5"
              >
                <span className="text-sm text-walnut-700">{row.label}</span>
                <span className="flex shrink-0 items-center gap-1">
                  {row.keys.map((k, i) => (
                    <Kbd key={`${k}-${i}`}>{k}</Kbd>
                  ))}
                </span>
              </div>
            ))}
          </div>

          <p className="flex items-start gap-2 rounded-xl border border-walnut-100 bg-walnut-50 px-3.5 py-2.5 text-xs leading-relaxed text-walnut-600">
            <Keyboard className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-dark" aria-hidden />
            Shortcuts work everywhere in the admin console — except while typing in a field.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Premium keycap chip — mirrors the storefront search-dialog footer styling */
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-walnut-200 bg-ivory px-1.5 font-sans text-[10px] font-semibold text-walnut-600 shadow-[inset_0_-1px_0_var(--color-walnut-100)]">
      {children}
    </kbd>
  );
}
