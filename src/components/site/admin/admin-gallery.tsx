"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  ImageOff,
  Images,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { AdminPageHeader, ImageField } from "./admin-shared";
import { useSiteData } from "@/lib/site-data";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AdminGalleryImage {
  id: string;
  title: string;
  url: string;
  category: string;
  sortOrder: number;
  active: boolean;
  /** Returned by the API; optional so the row degrades gracefully if absent. */
  createdAt?: string;
}

type SortKey = "order" | "newest" | "title-asc";
type BulkAction = "show" | "hide" | "delete";

const GALLERY_CATEGORIES = ["Living Room", "Bedroom", "Dining", "Wardrobes", "Sofas", "Coffee Tables", "Showroom", "Custom"];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "order", label: "Order (default)" },
  { value: "newest", label: "Newest" },
  { value: "title-asc", label: "Title A–Z" },
];

const BULK_DONE_NOTE: Record<Exclude<BulkAction, "delete">, string> = {
  show: "Now visible on the storefront gallery.",
  hide: "Hidden from the storefront gallery.",
};

function timestampOf(iso?: string): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export function AdminGallery() {
  const { refresh } = useSiteData();
  const [images, setImages] = useState<AdminGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [albumFilter, setAlbumFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("order");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState<BulkAction | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminGalleryImage | null>(null);

  const [form, setForm] = useState({ title: "", url: "", category: "Showroom" });

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/gallery", { cache: "no-store" });
      if (res.ok) setImages(await res.json());
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

  /* ── Filtering & sorting (all client-side) ─────────────────── */

  // Search scope: title + album/category. Album chips count within this scope.
  const scoped = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return images;
    return images.filter(
      (img) => img.title.toLowerCase().includes(q) || img.category.toLowerCase().includes(q)
    );
  }, [images, search]);

  // Album list derived from all images — known categories first, then any custom ones.
  const albums = useMemo(() => {
    const names = new Set(images.map((i) => i.category));
    return [...names].sort((a, b) => {
      const ia = GALLERY_CATEGORIES.indexOf(a);
      const ib = GALLERY_CATEGORIES.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }, [images]);

  const albumCounts = useMemo(() => {
    const c: Record<string, number> = { "": scoped.length };
    for (const img of scoped) c[img.category] = (c[img.category] ?? 0) + 1;
    return c;
  }, [scoped]);

  const filtered = useMemo(() => {
    const byAlbum = albumFilter ? scoped.filter((img) => img.category === albumFilter) : scoped;
    switch (sortKey) {
      case "newest":
        return [...byAlbum].sort((a, b) => timestampOf(b.createdAt) - timestampOf(a.createdAt));
      case "title-asc":
        return [...byAlbum].sort((a, b) => a.title.localeCompare(b.title));
      default:
        // "Order (default)" keeps the API order (sortOrder asc, then newest).
        return byAlbum;
    }
  }, [scoped, albumFilter, sortKey]);

  const hasActiveFilters = search.trim() !== "" || albumFilter !== "";

  const clearFilters = () => {
    setSearch("");
    setAlbumFilter("");
    setSortKey("order");
  };

  /* ── Stats ─────────────────────────────────────────────────── */

  const stats = useMemo(
    () => ({
      total: images.length,
      visible: images.filter((i) => i.active).length,
      hidden: images.filter((i) => !i.active).length,
      albums: albums.length,
    }),
    [images, albums]
  );

  /* ── Selection ─────────────────────────────────────────────── */

  const allFilteredSelected = filtered.length > 0 && filtered.every((img) => selected.has(img.id));
  const someFilteredSelected = filtered.some((img) => selected.has(img.id));
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
      if (allFilteredSelected) filtered.forEach((img) => next.delete(img.id));
      else filtered.forEach((img) => next.add(img.id));
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  /* ── Add / hide / delete ───────────────────────────────────── */

  const handleSave = async () => {
    if (!form.title.trim() || !form.url.trim()) {
      toast({ title: "Title and image are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          url: form.url.trim(),
          category: form.category,
          active: true,
          sortOrder: 0,
        }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Image added to gallery" });
      setDialogOpen(false);
      setForm({ title: "", url: "", category: "Showroom" });
      await load();
      await refresh();
    } catch {
      toast({ title: "Could not add image", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (img: AdminGalleryImage) => {
    const newValue = !img.active;
    setImages((is) => is.map((x) => (x.id === img.id ? { ...x, active: newValue } : x)));
    try {
      const res = await fetch(`/api/admin/gallery/${img.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newValue }),
      });
      if (!res.ok) throw new Error();
      await refresh();
    } catch {
      setImages((is) => is.map((x) => (x.id === img.id ? { ...x, active: !newValue } : x)));
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/gallery/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Image removed" });
      setImages((is) => is.filter((x) => x.id !== deleteTarget.id));
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
            ? await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" })
            : await fetch(`/api/admin/gallery/${id}`, {
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
    const noun = ids.length === 1 ? "image" : "images";
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
        title="Gallery"
        description={
          loading
            ? "The showroom photo wall on the homepage — upload interiors, product styling and showroom photos."
            : `${stats.total} ${stats.total === 1 ? "photo" : "photos"} across ${stats.albums} ${stats.albums === 1 ? "album" : "albums"} — upload interiors, product styling and showroom photos.`
        }
        action={
          <Button onClick={() => setDialogOpen(true)} className="rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory">
            <Plus className="h-4 w-4 mr-2" /> Add Image
          </Button>
        }
      />

      {/* Stats mini-row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total images" value={String(stats.total)} />
        <StatCard label="Visible" value={String(stats.visible)} />
        <StatCard
          label="Hidden"
          value={String(stats.hidden)}
          icon={<EyeOff className="h-3.5 w-3.5 text-gold" aria-hidden />}
        />
        <StatCard
          label="Albums"
          value={String(stats.albums)}
          icon={<Images className="h-3.5 w-3.5 text-gold" aria-hidden />}
        />
      </div>

      {/* Filter bar: search + sort */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gallery…"
              aria-label="Search gallery"
              className="h-10 rounded-full border-walnut-200 bg-card pl-10 focus-visible:ring-gold"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
              <SelectTrigger
                aria-label="Sort gallery"
                className="h-10 w-40 cursor-pointer rounded-xl border-walnut-200 bg-card sm:w-44"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Album chips + select all + result count + clear filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter gallery by album">
            <FilterChip active={albumFilter === ""} onClick={() => setAlbumFilter("")} count={albumCounts[""] ?? 0}>
              All
            </FilterChip>
            {albums.map((album) => (
              <FilterChip
                key={album}
                active={albumFilter === album}
                onClick={() => setAlbumFilter(album)}
                count={albumCounts[album] ?? 0}
              >
                {album}
              </FilterChip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            {!loading && filtered.length > 0 && (
              <div className="flex h-9 items-center gap-2 rounded-full border border-walnut-200 bg-card px-3.5">
                <Checkbox
                  checked={selectAllState}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all filtered images"
                  className="cursor-pointer border-walnut-300 data-[state=checked]:border-walnut-800 data-[state=checked]:bg-walnut-800 data-[state=indeterminate]:border-walnut-800 data-[state=indeterminate]:bg-walnut-800"
                />
                <span className="whitespace-nowrap text-xs text-muted-foreground">Select all (filtered)</span>
              </div>
            )}
            {!loading && (
              <p className="whitespace-nowrap text-xs text-muted-foreground" aria-live="polite">
                Showing {filtered.length} of {images.length} {images.length === 1 ? "image" : "images"}
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
            {selected.size} {selected.size === 1 ? "image" : "images"} selected
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl bg-walnut-100" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-walnut-200 p-14 text-center text-muted-foreground">
          <Images className="h-10 w-10 mx-auto text-walnut-300 mb-3" aria-hidden />
          No gallery images yet.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-walnut-200 p-14 text-center">
          <ImageOff className="h-10 w-10 mx-auto text-walnut-300 mb-3" aria-hidden />
          <p className="text-muted-foreground">No images match your current filters.</p>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((img) => {
            const isSelected = selected.has(img.id);
            return (
              <div
                key={img.id}
                className={cn(
                  "group relative rounded-2xl overflow-hidden border bg-card transition-all hover:shadow-md hover:shadow-espresso/10",
                  isSelected
                    ? "border-gold ring-1 ring-gold"
                    : img.active
                      ? "border-walnut-100 hover:border-walnut-300"
                      : "border-walnut-200 opacity-60"
                )}
              >
                <div className="img-zoom aspect-square w-full bg-walnut-50">
                  <img src={img.url} alt={img.title} className="h-full w-full object-cover" />
                </div>

                {/* Selection checkbox (always visible) */}
                <div className="absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-ivory/90 shadow backdrop-blur-sm">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelect(img.id)}
                    disabled={bulkBusy !== null}
                    aria-label={`Select ${img.title}`}
                    className="h-4 w-4 cursor-pointer border-walnut-400 data-[state=checked]:border-walnut-800 data-[state=checked]:bg-walnut-800"
                  />
                </div>

                {/* Per-card actions */}
                <div className="absolute top-2 right-2 z-10 flex gap-1.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                  <button
                    onClick={() => toggleActive(img)}
                    className="h-8 w-8 rounded-full bg-card shadow flex items-center justify-center hover:bg-walnut-100 cursor-pointer"
                    aria-label={img.active ? "Hide image" : "Show image"}
                    title={img.active ? "Hide image" : "Show image"}
                  >
                    {img.active ? (
                      <EyeOff className="h-4 w-4 text-walnut-700" aria-hidden />
                    ) : (
                      <Eye className="h-4 w-4 text-gold-dark" aria-hidden />
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(img)}
                    className="h-8 w-8 rounded-full bg-card shadow flex items-center justify-center hover:bg-destructive/10 cursor-pointer"
                    aria-label="Delete image"
                    title="Delete image"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" aria-hidden />
                  </button>
                </div>

                {!img.active && (
                  <span className="absolute bottom-2 left-2 z-10 text-[10px] uppercase tracking-wide bg-walnut-800 text-ivory px-2 py-0.5 rounded-full font-semibold">
                    Hidden
                  </span>
                )}

                <div className="p-3">
                  <p className="text-sm font-medium text-walnut-900 truncate">{img.title}</p>
                  <span className="mt-1 inline-flex items-center rounded-full bg-walnut-100 px-2 py-0.5 text-[10px] font-medium text-walnut-700">
                    {img.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-card border-walnut-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-walnut-900">Add Gallery Image</DialogTitle>
            <DialogDescription>Shown in the homepage gallery grid.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div>
              <Label className="text-sm font-medium text-walnut-900">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder='e.g. "Walnut bedroom set"'
                className="mt-1.5 h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </div>
            <ImageField value={form.url} onChange={(url) => setForm({ ...form, url })} label="Photo *" />
            <div>
              <Label className="text-sm font-medium text-walnut-900">Album</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {GALLERY_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, category: c })}
                    className={cn(
                      "h-8 px-3.5 rounded-full text-xs font-medium border transition-all cursor-pointer",
                      form.category === c
                        ? "bg-walnut-800 text-ivory border-walnut-800"
                        : "border-walnut-200 text-muted-foreground hover:border-walnut-400"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-full border-walnut-300 text-walnut-700">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory px-6">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add to Gallery"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm (single) */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-walnut-100 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg text-walnut-900">
              Remove "{deleteTarget?.title}"?
            </AlertDialogTitle>
            <AlertDialogDescription>The image will be removed from the gallery.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-walnut-300">Keep</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-full bg-destructive hover:bg-destructive/90 text-white">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirm (bulk) */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={(o) => !o && setBulkDeleteOpen(false)}>
        <AlertDialogContent className="bg-card border-walnut-100 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg text-walnut-900">
              Delete {selected.size} {selected.size === 1 ? "image" : "images"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes {selected.size === 1 ? "this image" : "these images"} from the gallery.
              Consider hiding {selected.size === 1 ? "it" : "them"} instead if you may want{" "}
              {selected.size === 1 ? "it" : "them"} back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-walnut-300">Keep Images</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => runBulk("delete")}
              className="rounded-full bg-destructive hover:bg-destructive/90 text-white"
            >
              {bulkBusy === "delete" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                `Delete ${selected.size} ${selected.size === 1 ? "image" : "images"}`
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

/** Album filter chip (matches the Products/Enquiries tab pattern) */
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
