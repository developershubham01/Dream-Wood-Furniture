"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  MessageSquareQuote,
  Pencil,
  Plus,
  Search,
  SearchX,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader } from "./admin-shared";
import { useSiteData } from "@/lib/site-data";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AdminTestimonial {
  id: string;
  name: string;
  location: string | null;
  rating: number;
  text: string;
  date: string | null;
  active: boolean;
  sortOrder: number;
}

type TestimonialFilter = "all" | "visible" | "hidden" | "five" | "four-below";
type BulkAction = "show" | "hide" | "delete";

const FILTER_OPTIONS: { value: TestimonialFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "visible", label: "Visible" },
  { value: "hidden", label: "Hidden" },
  { value: "five", label: "5★" },
  { value: "four-below", label: "4★ & below" },
];

const BULK_DONE_NOTE: Record<Exclude<BulkAction, "delete">, string> = {
  show: "Now visible in the reviews carousel.",
  hide: "Hidden from the reviews carousel.",
};

export function AdminTestimonials() {
  const { refresh } = useSiteData();
  const [items, setItems] = useState<AdminTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TestimonialFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState<BulkAction | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTestimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminTestimonial | null>(null);

  const [form, setForm] = useState({
    name: "",
    location: "",
    rating: 5,
    text: "",
    date: "",
    active: true,
  });

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/testimonials", { cache: "no-store" });
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Escape clears the current selection (ignored while a dialog is open).
  useEffect(() => {
    if (selected.size === 0) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !dialogOpen && !deleteTarget && !bulkDeleteOpen) {
        setSelected(new Set());
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected, dialogOpen, deleteTarget, bulkDeleteOpen]);

  /* ── Filtering (all client-side) ───────────────────────────── */

  // Search scope: name, location, review text. Filter chips count within this scope.
  const scoped = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((t) =>
      [t.name, t.location ?? "", t.text].some((field) => field.toLowerCase().includes(q))
    );
  }, [items, search]);

  const counts = useMemo(
    () => ({
      all: scoped.length,
      visible: scoped.filter((t) => t.active).length,
      hidden: scoped.filter((t) => !t.active).length,
      five: scoped.filter((t) => t.rating === 5).length,
      "four-below": scoped.filter((t) => t.rating < 5).length,
    }),
    [scoped]
  );

  const filtered = useMemo(() => {
    switch (filter) {
      case "visible":
        return scoped.filter((t) => t.active);
      case "hidden":
        return scoped.filter((t) => !t.active);
      case "five":
        return scoped.filter((t) => t.rating === 5);
      case "four-below":
        return scoped.filter((t) => t.rating < 5);
      default:
        return scoped;
    }
  }, [scoped, filter]);

  const hasActiveFilters = search.trim() !== "" || filter !== "all";

  const clearFilters = () => {
    setSearch("");
    setFilter("all");
  };

  /* ── Stats ─────────────────────────────────────────────────── */

  const stats = useMemo(() => {
    const total = items.length;
    const avg = total === 0 ? null : items.reduce((sum, t) => sum + t.rating, 0) / total;
    return {
      total,
      visible: items.filter((t) => t.active).length,
      hidden: items.filter((t) => !t.active).length,
      avg: avg === null ? null : avg.toFixed(1),
    };
  }, [items]);

  /* ── Selection ─────────────────────────────────────────────── */

  const allFilteredSelected = filtered.length > 0 && filtered.every((t) => selected.has(t.id));
  const someFilteredSelected = filtered.some((t) => selected.has(t.id));
  let selectAllState: boolean | "indeterminate" = false;
  if (allFilteredSelected) selectAllState = true;
  else if (someFilteredSelected) selectAllState = "indeterminate";

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) filtered.forEach((t) => next.delete(t.id));
      else filtered.forEach((t) => next.add(t.id));
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  /* ── Create / edit / delete ────────────────────────────────── */

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", location: "", rating: 5, text: "", date: "", active: true });
    setDialogOpen(true);
  };

  const openEdit = (t: AdminTestimonial) => {
    setEditing(t);
    setForm({
      name: t.name,
      location: t.location ?? "",
      rating: t.rating,
      text: t.text,
      date: t.date ?? "",
      active: t.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (form.name.trim().length < 2 || form.text.trim().length < 10) {
      toast({ title: "Name and review text (10+ chars) are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        location: form.location.trim() || null,
        rating: form.rating,
        text: form.text.trim(),
        date: form.date.trim() || null,
        active: form.active,
      };
      const res = await fetch(
        editing ? `/api/admin/testimonials/${editing.id}` : "/api/admin/testimonials",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Save failed");
      toast({ title: editing ? "Testimonial updated" : "Testimonial added" });
      setDialogOpen(false);
      await load();
      await refresh();
    } catch {
      toast({ title: "Could not save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Testimonial deleted" });
      setItems((ts) => ts.filter((t) => t.id !== deleteTarget.id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      await refresh();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  /* ── Bulk operations (sequential, reload after) ────────────── */

  const runBulk = async (action: BulkAction) => {
    const ids = Array.from(selected);
    if (ids.length === 0 || bulkBusy) return;
    setBulkDeleteOpen(false);
    setBulkBusy(action);
    let ok = 0;
    let failed = 0;
    for (const id of ids) {
      try {
        const res =
          action === "delete"
            ? await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" })
            : await fetch(`/api/admin/testimonials/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ active: action === "show" }),
              });
        if (res.ok) ok += 1;
        else failed += 1;
      } catch {
        failed += 1;
      }
    }
    setBulkBusy(null);
    setSelected(new Set());
    await load();
    await refresh();
    const noun = ids.length === 1 ? "testimonial" : "testimonials";
    if (failed > 0) {
      toast({
        title: `${action === "delete" ? "Deleted" : "Updated"} ${ok} of ${ids.length} ${noun}`,
        description: `${failed} ${failed === 1 ? "request" : "requests"} failed — the list was reloaded from the server.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: action === "delete" ? `Deleted ${ok} ${noun}` : `Updated ${ok} ${noun}`,
        description: action === "delete" ? undefined : BULK_DONE_NOTE[action],
      });
    }
  };

  /* ── Render ────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Testimonials"
        description="Reviews shown in the homepage carousel."
        action={
          <Button onClick={openCreate} className="rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory">
            <Plus className="h-4 w-4 mr-2" /> Add Testimonial
          </Button>
        }
      />

      {/* Stats mini-row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" value={String(stats.total)} />
        <StatCard label="Visible" value={String(stats.visible)} />
        <StatCard
          label="Hidden"
          value={String(stats.hidden)}
          icon={<EyeOff className="h-3.5 w-3.5 text-gold" aria-hidden />}
        />
        <StatCard
          label="Average rating"
          value={stats.avg ?? "—"}
          icon={<Star className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden />}
        />
      </div>

      <div className="rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm text-gold-dark">
        <strong>Important:</strong> only publish reviews you have permission to show — e.g. copied from
        your public Google reviews with customer names as they appear there.
      </div>

      {/* Filters: search + chips + select all */}
      <div className="space-y-3">
        <div className="relative max-w-sm">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            aria-hidden
          />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, location or review…"
            aria-label="Search testimonials"
            className="h-10 rounded-full border-walnut-200 focus-visible:ring-gold pl-10 pr-9 [&::-webkit-search-cancel-button]:[appearance:none]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-walnut-800 cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter testimonials">
            {FILTER_OPTIONS.map((f) => (
              <FilterChip
                key={f.value}
                active={filter === f.value}
                onClick={() => setFilter(f.value)}
                count={counts[f.value]}
              >
                {f.label}
              </FilterChip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            {!loading && filtered.length > 0 && (
              <div className="flex h-9 items-center gap-2 rounded-full border border-walnut-200 bg-card px-3.5">
                <Checkbox
                  checked={selectAllState}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all filtered testimonials"
                  className="cursor-pointer border-walnut-300 data-[state=checked]:border-walnut-800 data-[state=checked]:bg-walnut-800 data-[state=indeterminate]:border-walnut-800 data-[state=indeterminate]:bg-walnut-800"
                />
                <span className="whitespace-nowrap text-xs text-muted-foreground">Select all (filtered)</span>
              </div>
            )}
            {!loading && (
              <p className="whitespace-nowrap text-xs text-muted-foreground" aria-live="polite">
                Showing {filtered.length} of {items.length}{" "}
                {items.length === 1 ? "testimonial" : "testimonials"}
              </p>
            )}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-walnut-900"
              >
                <X className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Clear filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sticky bulk-action bar */}
      {selected.size > 0 && (
        <div
          className="sticky top-16 z-20 flex items-center gap-2 overflow-x-auto rounded-full bg-walnut-800 p-2 text-ivory shadow-lg shadow-espresso/30 sm:gap-3 sm:p-3"
          role="status"
        >
          <span className="shrink-0 whitespace-nowrap pl-1.5 text-sm font-medium">
            {selected.size} {selected.size === 1 ? "testimonial" : "testimonials"} selected
          </span>
          <span className="hidden h-5 w-px shrink-0 bg-white/15 sm:block" aria-hidden />
          <div className="flex items-center gap-2">
            <BulkActionButton
              label="Show"
              icon={Eye}
              busy={bulkBusy === "show"}
              disabled={bulkBusy !== null}
              onClick={() => runBulk("show")}
            />
            <BulkActionButton
              label="Hide"
              icon={EyeOff}
              busy={bulkBusy === "hide"}
              disabled={bulkBusy !== null}
              onClick={() => runBulk("hide")}
            />
            <BulkActionButton
              label="Delete"
              icon={Trash2}
              destructive
              busy={bulkBusy === "delete"}
              disabled={bulkBusy !== null}
              onClick={() => setBulkDeleteOpen(true)}
            />
          </div>
          <button
            type="button"
            onClick={clearSelection}
            disabled={bulkBusy !== null}
            className="ml-auto flex h-8 shrink-0 cursor-pointer items-center rounded-full px-3 text-xs font-medium text-ivory/70 transition-colors hover:bg-white/10 hover:text-ivory disabled:cursor-not-allowed disabled:opacity-60"
          >
            Clear
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-walnut-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-walnut-200 p-14 text-center text-muted-foreground">
          <MessageSquareQuote className="h-10 w-10 mx-auto text-walnut-300 mb-3" aria-hidden />
          No testimonials yet.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-walnut-200 p-14 text-center">
          <SearchX className="h-10 w-10 mx-auto text-walnut-300 mb-3" aria-hidden />
          <p className="text-muted-foreground">No testimonials match your current filters.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="mt-4 rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-50"
          >
            <X className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Clear filters
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => {
            const isSelected = selected.has(t.id);
            return (
              <div
                key={t.id}
                className={cn(
                  "p-5 rounded-2xl border bg-card transition-colors",
                  isSelected ? "border-gold ring-1 ring-gold" : "border-walnut-100 hover:border-walnut-200"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(t.id)}
                      disabled={bulkBusy !== null}
                      aria-label={`Select testimonial from ${t.name}`}
                      className="mt-1 shrink-0 cursor-pointer border-walnut-300 data-[state=checked]:border-walnut-800 data-[state=checked]:bg-walnut-800"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span
                          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-gold-dark"
                          title={`${t.rating} out of 5 stars`}
                        >
                          <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden />
                          <span className="tabular-nums">{t.rating}</span>
                        </span>
                        <p className="font-medium text-walnut-900 text-sm">{t.name}</p>
                        {t.location && <span className="text-xs text-muted-foreground">· {t.location}</span>}
                        {t.date && <span className="text-xs text-muted-foreground">· {t.date}</span>}
                        {!t.active && (
                          <span className="text-[10px] uppercase tracking-wide bg-walnut-100 text-walnut-700 px-2 py-0.5 rounded-full font-semibold">
                            Hidden
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-start gap-2">
                        <MessageSquareQuote className="h-4 w-4 text-gold/60 shrink-0 mt-0.5" aria-hidden />
                        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">"{t.text}"</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-walnut-100 cursor-pointer" aria-label={`Edit ${t.name}`}>
                      <Pencil className="h-4 w-4 text-walnut-700" />
                    </button>
                    <button onClick={() => setDeleteTarget(t)} className="p-2 rounded-lg hover:bg-destructive/10 cursor-pointer" aria-label={`Delete ${t.name}`}>
                      <Trash2 className="h-4 w-4 text-destructive/70" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg bg-card border-walnut-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-walnut-900">
              {editing ? "Edit Testimonial" : "Add Testimonial"}
            </DialogTitle>
            <DialogDescription>Shown in the "What Our Customers Say" carousel.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-walnut-900">Customer Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1.5 h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-walnut-900">Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Nerul"
                  className="mt-1.5 h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-walnut-900">Rating</Label>
              <div className="flex items-center gap-1.5 mt-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, rating: r })}
                    aria-label={`${r} star${r > 1 ? "s" : ""}`}
                    className="p-1 cursor-pointer"
                  >
                    <Star className={cn("h-6 w-6 transition-transform hover:scale-110", r <= form.rating ? "fill-gold text-gold" : "text-walnut-200")} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-walnut-900">Review Text *</Label>
              <Textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                rows={4}
                placeholder="What the customer said…"
                className="mt-1.5 rounded-xl border-walnut-200 focus-visible:ring-gold resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                <Label className="text-sm font-medium text-walnut-900">Date Label</Label>
                <Input
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  placeholder='e.g. "Recent" or "Aug 2025"'
                  className="mt-1.5 h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
                />
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-walnut-100 bg-ivory/50">
                <Label className="text-sm font-medium text-walnut-900">Visible</Label>
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-full border-walnut-300 text-walnut-700">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory px-6">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm (single) */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-walnut-100 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg text-walnut-900">Delete this testimonial?</AlertDialogTitle>
            <AlertDialogDescription>It will be removed from the carousel.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-walnut-300">Keep</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-full bg-destructive hover:bg-destructive/90 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirm (bulk) */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={(o) => !o && setBulkDeleteOpen(false)}>
        <AlertDialogContent className="bg-card border-walnut-100 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg text-walnut-900">
              Delete {selected.size} {selected.size === 1 ? "testimonial" : "testimonials"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes {selected.size === 1 ? "this testimonial" : "these testimonials"} from
              the carousel. Consider hiding {selected.size === 1 ? "it" : "them"} instead if you may want{" "}
              {selected.size === 1 ? "it" : "them"} back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-walnut-300">Keep Testimonials</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => runBulk("delete")}
              className="rounded-full bg-destructive hover:bg-destructive/90 text-white"
            >
              {bulkBusy === "delete" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                `Delete ${selected.size} ${selected.size === 1 ? "testimonial" : "testimonials"}`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** Stats mini-card (matches the Enquiries tab pattern) */
function StatCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-walnut-100 bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p className="font-display text-2xl text-walnut-900 tabular-nums mt-1.5">{value}</p>
    </div>
  );
}

/** Filter chip (matches the Products/Enquiries tab pattern) */
function FilterChip({
  children,
  active,
  count,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-9 px-4 rounded-full text-xs font-medium border transition-all cursor-pointer flex items-center gap-2",
        active
          ? "bg-walnut-800 text-ivory border-walnut-800"
          : "bg-card text-muted-foreground border-walnut-200 hover:border-walnut-400 hover:text-foreground"
      )}
    >
      {children}
      <span className={cn("text-[10px] rounded-full px-1.5 py-0.5 tabular-nums", active ? "bg-white/20" : "bg-walnut-100 text-walnut-700")}>
        {count}
      </span>
    </button>
  );
}

/** Small pill button used inside the dark bulk-action bar */
function BulkActionButton({
  label,
  icon: Icon,
  busy,
  disabled,
  destructive = false,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  busy?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        destructive
          ? "border-transparent bg-destructive text-white hover:bg-destructive/90"
          : "border-white/15 text-ivory/85 hover:bg-white/10 hover:text-ivory"
      )}
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : (
        <Icon className="h-3.5 w-3.5" aria-hidden />
      )}
      {label}
    </button>
  );
}
