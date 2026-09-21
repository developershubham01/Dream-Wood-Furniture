"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Copy,
  Eye,
  EyeOff,
  Loader2,
  PackageSearch,
  Pencil,
  Plus,
  Search,
  Star,
  StarOff,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { AdminPageHeader, ImagesField } from "./admin-shared";
import { useSiteData } from "@/lib/site-data";
import { formatINR, parseImages } from "@/lib/format";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  categoryId: string | null;
  description: string | null;
  images: string;
  materials: string | null;
  dimensions: string | null;
  colors: string | null;
  price: number | null;
  badge: string | null;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  category?: { name: string; slug: string } | null;
  /** Returned by the API; optional so the row degrades gracefully if absent. */
  updatedAt?: string;
}

interface ProductForm {
  name: string;
  categoryId: string;
  description: string;
  images: string[];
  materials: string;
  dimensions: string;
  colors: string;
  priceMode: "priced" | "quote";
  price: string;
  badge: string;
  featured: boolean;
  active: boolean;
}

type StatusFilter = "all" | "featured" | "visible" | "hidden";
type SortKey = "newest" | "name-asc" | "price-desc" | "price-asc";
type BulkAction = "show" | "hide" | "feature" | "unfeature" | "delete";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "featured", label: "Featured" },
  { value: "visible", label: "Visible" },
  { value: "hidden", label: "Hidden" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "price-asc", label: "Price: low to high" },
];

const BULK_DONE_NOTE: Record<Exclude<BulkAction, "delete">, string> = {
  show: "Now visible on the storefront.",
  hide: "Hidden from the storefront.",
  feature: "Marked as featured on the homepage.",
  unfeature: "Removed from featured.",
};

const emptyForm: ProductForm = {
  name: "",
  categoryId: "",
  description: "",
  images: [],
  materials: "",
  dimensions: "",
  colors: "",
  priceMode: "priced",
  price: "",
  badge: "",
  featured: false,
  active: true,
};

export function AdminProducts() {
  const { data, refresh } = useSiteData();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState<BulkAction | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);

  const categories: Category[] = data.categories;

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      if (res.ok) setProducts(await res.json());
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

  // Scope = search + category filter. Status chips count within this scope.
  const scoped = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter && p.categoryId !== categoryFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.category?.name ?? "").toLowerCase().includes(q) ||
        p.slug.includes(q)
      );
    });
  }, [products, search, categoryFilter]);

  const statusCounts: Record<StatusFilter, number> = useMemo(
    () => ({
      all: scoped.length,
      featured: scoped.filter((p) => p.featured).length,
      visible: scoped.filter((p) => p.active).length,
      hidden: scoped.filter((p) => !p.active).length,
    }),
    [scoped]
  );

  const filtered = useMemo(() => {
    const byStatus =
      statusFilter === "all"
        ? scoped
        : scoped.filter((p) =>
            statusFilter === "featured" ? p.featured : statusFilter === "visible" ? p.active : !p.active
          );

    // "Newest first" (default) keeps the API order (sortOrder asc, then newest).
    switch (sortKey) {
      case "name-asc":
        return [...byStatus].sort((a, b) => a.name.localeCompare(b.name));
      case "price-desc":
        // Quote-mode products (price == null) sort last.
        return [...byStatus].sort((a, b) => {
          if (a.price == null) return 1;
          if (b.price == null) return -1;
          return b.price - a.price;
        });
      case "price-asc":
        return [...byStatus].sort((a, b) => {
          if (a.price == null) return 1;
          if (b.price == null) return -1;
          return a.price - b.price;
        });
      default:
        return byStatus;
    }
  }, [scoped, statusFilter, sortKey]);

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "all" || categoryFilter !== "";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("");
    setSortKey("newest");
  };

  /* ── Selection ─────────────────────────────────────────────── */

  const allFilteredSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));
  const someFilteredSelected = filtered.some((p) => selected.has(p.id));
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
      if (allFilteredSelected) filtered.forEach((p) => next.delete(p.id));
      else filtered.forEach((p) => next.add(p.id));
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  /* ── Create / edit / delete ────────────────────────────────── */

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id ?? "" });
    setDialogOpen(true);
  };

  const openEdit = (p: AdminProduct) => {
    setEditing(p);
    setForm({
      name: p.name,
      categoryId: p.categoryId ?? "",
      description: p.description ?? "",
      images: parseImages(p.images),
      materials: p.materials ?? "",
      dimensions: p.dimensions ?? "",
      colors: p.colors ?? "",
      priceMode: p.price != null ? "priced" : "quote",
      price: p.price != null ? String(p.price) : "",
      badge: p.badge ?? "",
      featured: p.featured,
      active: p.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (form.name.trim().length < 2) {
      toast({ title: "Product name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const price =
        form.priceMode === "quote"
          ? null
          : form.price.trim()
            ? Math.max(0, parseInt(form.price.replace(/[^0-9]/g, ""), 10) || 0)
            : null;

      const payload = {
        name: form.name.trim(),
        categoryId: form.categoryId || null,
        description: form.description.trim() || null,
        images: form.images,
        materials: form.materials.trim() || null,
        dimensions: form.dimensions.trim() || null,
        colors: form.colors.trim() || null,
        price,
        badge: form.badge.trim() || null,
        featured: form.featured,
        active: form.active,
      };

      const res = await fetch(
        editing ? `/api/admin/products/${editing.id}` : "/api/admin/products",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Save failed");
      }
      toast({ title: editing ? "Product updated" : "Product created", description: form.name });
      setDialogOpen(false);
      await load();
      await refresh();
    } catch (e) {
      toast({
        title: "Could not save product",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Product deleted", description: deleteTarget.name });
      setProducts((ps) => ps.filter((p) => p.id !== deleteTarget.id));
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

  const quickToggle = async (p: AdminProduct, field: "featured" | "active") => {
    const newValue = !p[field];
    setProducts((ps) => ps.map((x) => (x.id === p.id ? { ...x, [field]: newValue } : x)));
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
      });
      if (!res.ok) throw new Error();
      await refresh();
    } catch {
      setProducts((ps) => ps.map((x) => (x.id === p.id ? { ...x, [field]: !newValue } : x)));
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  /* ── Duplicate ─────────────────────────────────────────────── */

  const duplicate = async (p: AdminProduct) => {
    if (duplicatingId) return;
    setDuplicatingId(p.id);
    try {
      const payload = {
        name: `${p.name} (Copy)`.slice(0, 120),
        categoryId: p.categoryId,
        description: p.description,
        images: parseImages(p.images),
        materials: p.materials,
        dimensions: p.dimensions,
        colors: p.colors,
        price: p.price,
        badge: p.badge,
        featured: p.featured,
        active: p.active,
      };
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Duplicate failed");
      }
      toast({ title: "Product duplicated", description: `${p.name} (Copy)` });
      await load();
      await refresh();
    } catch (e) {
      toast({
        title: "Could not duplicate product",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDuplicatingId(null);
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
        let res: Response;
        if (action === "delete") {
          res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
        } else {
          const patch: { active?: boolean; featured?: boolean } = {};
          if (action === "show") patch.active = true;
          else if (action === "hide") patch.active = false;
          else if (action === "feature") patch.featured = true;
          else patch.featured = false;
          res = await fetch(`/api/admin/products/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
          });
        }
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
    const noun = ids.length === 1 ? "product" : "products";
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
        title="Products"
        description="Manage your catalogue — add pieces, edit details, set prices or quote mode."
        action={
          <Button onClick={openCreate} className="rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory">
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        }
      />

      {/* Filter bar: search + category + sort */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="h-10 rounded-full border-walnut-200 bg-card pl-10 focus-visible:ring-gold"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={categoryFilter || "all"}
              onValueChange={(v) => setCategoryFilter(v === "all" ? "" : v)}
            >
              <SelectTrigger
                aria-label="Filter by category"
                className="h-10 w-40 cursor-pointer rounded-xl border-walnut-200 bg-card sm:w-44"
              >
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
              <SelectTrigger
                aria-label="Sort products"
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

        {/* Status chips + result count + clear filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter products by status">
            {STATUS_FILTERS.map((f) => (
              <FilterChip
                key={f.value}
                active={statusFilter === f.value}
                onClick={() => setStatusFilter(f.value)}
                count={statusCounts[f.value]}
              >
                {f.label}
              </FilterChip>
            ))}
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            {!loading && (
              <p className="whitespace-nowrap text-xs text-muted-foreground" aria-live="polite">
                Showing {filtered.length} of {products.length}{" "}
                {products.length === 1 ? "product" : "products"}
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
          className="sticky top-16 z-20 flex items-center gap-2 overflow-x-auto rounded-2xl bg-walnut-900 p-3 text-ivory shadow-lg shadow-espresso/30 sm:gap-3"
          role="status"
        >
          <span className="shrink-0 whitespace-nowrap text-sm font-medium">
            {selected.size} {selected.size === 1 ? "product" : "products"} selected
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
              label="Feature"
              icon={Star}
              busy={bulkBusy === "feature"}
              disabled={bulkBusy !== null}
              onClick={() => runBulk("feature")}
            />
            <BulkActionButton
              label="Unfeature"
              icon={StarOff}
              busy={bulkBusy === "unfeature"}
              disabled={bulkBusy !== null}
              onClick={() => runBulk("unfeature")}
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
            Clear selection
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl bg-walnut-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-walnut-200 p-14 text-center">
          <PackageSearch className="h-10 w-10 mx-auto text-walnut-300 mb-3" aria-hidden />
          {products.length === 0 ? (
            <p className="text-muted-foreground">No products yet — add your first piece.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground">No products match your current filters.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-50"
              >
                <X className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Clear filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-walnut-100 bg-card">
          {/* Select all (filtered) */}
          <div className="flex items-center gap-3 border-b border-walnut-100 bg-walnut-50/70 px-4 py-2.5">
            <Checkbox
              checked={selectAllState}
              onCheckedChange={toggleSelectAll}
              aria-label="Select all filtered products"
              className="cursor-pointer border-walnut-300 data-[state=checked]:border-walnut-800 data-[state=checked]:bg-walnut-800 data-[state=indeterminate]:border-walnut-800 data-[state=indeterminate]:bg-walnut-800"
            />
            <span className="text-xs text-muted-foreground">Select all (filtered)</span>
          </div>

          <div className="divide-y divide-walnut-100">
            {filtered.map((p) => {
              const imgs = parseImages(p.images);
              const isSelected = selected.has(p.id);
              const updated = p.updatedAt ? timeAgo(p.updatedAt) : "";
              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-3 p-4 transition-colors",
                    isSelected ? "bg-walnut-50" : "hover:bg-walnut-50/50"
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelect(p.id)}
                    aria-label={`Select ${p.name}`}
                    className="shrink-0 cursor-pointer border-walnut-300 data-[state=checked]:border-walnut-800 data-[state=checked]:bg-walnut-800"
                  />
                  <img
                    src={imgs[0] || "/images/cat-living.png"}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-xl border border-walnut-100 object-cover sm:h-16 sm:w-16"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-walnut-900">{p.name}</p>
                      {p.badge && (
                        <Badge variant="outline" className="rounded-full border-gold/40 text-[10px] text-gold-dark">
                          {p.badge}
                        </Badge>
                      )}
                      {!p.active && (
                        <Badge variant="outline" className="rounded-full bg-walnut-100 text-[10px]">
                          Hidden
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {p.category?.name ?? "Uncategorised"} · {p.price != null ? formatINR(p.price) : "Quote mode"}
                      {imgs.length > 0 && (
                        <span className="ml-1.5 inline-flex items-center rounded-full bg-walnut-100 px-1.5 py-0.5 align-middle text-[10px] font-medium text-walnut-700">
                          {imgs.length} {imgs.length === 1 ? "img" : "imgs"}
                        </span>
                      )}
                      {updated && (
                        <span className="ml-1.5 text-[10px] text-muted-foreground/80">Updated {updated}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex max-w-[132px] flex-wrap items-center justify-end gap-1 sm:max-w-none">
                    <button
                      onClick={() => quickToggle(p, "featured")}
                      className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-gold/10 sm:p-2"
                      aria-label={p.featured ? "Remove from featured" : "Mark as featured"}
                      title={p.featured ? "Featured" : "Not featured"}
                    >
                      <Star className={p.featured ? "h-4 w-4 fill-gold text-gold" : "h-4 w-4 text-walnut-300"} />
                    </button>
                    <button
                      onClick={() => quickToggle(p, "active")}
                      className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-walnut-100 sm:p-2"
                      aria-label={p.active ? "Hide product" : "Show product"}
                      title={p.active ? "Visible" : "Hidden"}
                    >
                      <EyeOff className={p.active ? "h-4 w-4 text-walnut-300" : "h-4 w-4 text-gold-dark"} />
                    </button>
                    <button
                      onClick={() => duplicate(p)}
                      disabled={duplicatingId === p.id}
                      className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-walnut-100 disabled:cursor-wait disabled:opacity-60 sm:p-2"
                      aria-label={`Duplicate ${p.name}`}
                      title="Duplicate"
                    >
                      {duplicatingId === p.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-walnut-700" aria-hidden />
                      ) : (
                        <Copy className="h-4 w-4 text-walnut-700" aria-hidden />
                      )}
                    </button>
                    <button
                      onClick={() => openEdit(p)}
                      className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-walnut-100 sm:p-2"
                      aria-label={`Edit ${p.name}`}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4 text-walnut-700" aria-hidden />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-destructive/10 sm:p-2"
                      aria-label={`Delete ${p.name}`}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive/70" aria-hidden />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-walnut-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-walnut-900">
              {editing ? `Edit: ${editing.name}` : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {editing ? "Update the details and save." : "Fill in the details — only the name is required."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid sm:grid-cols-2 gap-4 py-2">
            <div className="sm:col-span-3">
              <Label className="text-sm font-medium text-walnut-900">Product Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder='e.g. "Aarav 3-Seater Sofa"'
                className="mt-1.5 h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-walnut-900">Category</Label>
              <Select value={form.categoryId || undefined} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                <SelectTrigger className="mt-1.5 h-10 rounded-xl border-walnut-200 w-full cursor-pointer">
                  <SelectValue placeholder="Choose category…" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Label className="text-sm font-medium text-walnut-900">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                placeholder="Materials, comfort, customisation options…"
                className="mt-1.5 rounded-xl border-walnut-200 focus-visible:ring-gold resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <ImagesField images={form.images} onChange={(images) => setForm({ ...form, images })} />
            </div>

            <div>
              <Label className="text-sm font-medium text-walnut-900">Pricing</Label>
              <Select
                value={form.priceMode}
                onValueChange={(v) => setForm({ ...form, priceMode: v as ProductForm["priceMode"] })}
              >
                <SelectTrigger className="mt-1.5 h-10 rounded-xl border-walnut-200 w-full cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priced">Show a price (₹)</SelectItem>
                  <SelectItem value="quote">"Request a Quote" mode</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              {form.priceMode === "priced" ? (
                <>
                  <Label className="text-sm font-medium text-walnut-900">Price in ₹ (integer)</Label>
                  <Input
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^0-9]/g, "") })}
                    inputMode="numeric"
                    placeholder="e.g. 58900"
                    className="mt-1.5 h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
                  />
                </>
              ) : (
                <>
                  <Label className="text-sm font-medium text-walnut-900">Badge (optional)</Label>
                  <Input
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder='e.g. "Made to Order"'
                    className="mt-1.5 h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
                  />
                </>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-walnut-900">Materials</Label>
              <Input
                value={form.materials}
                onChange={(e) => setForm({ ...form, materials: e.target.value })}
                placeholder="e.g. Solid Sheesham, premium fabric"
                className="mt-1.5 h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-walnut-900">Dimensions</Label>
              <Input
                value={form.dimensions}
                onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                placeholder='e.g. "L 198 × D 88 × H 84 cm"'
                className="mt-1.5 h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-sm font-medium text-walnut-900">Colours / Finishes</Label>
              <Input
                value={form.colors}
                onChange={(e) => setForm({ ...form, colors: e.target.value })}
                placeholder="e.g. Walnut, Beige, Charcoal"
                className="mt-1.5 h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-walnut-100 bg-ivory/50">
              <div>
                <Label className="text-sm font-medium text-walnut-900">Featured</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Shows on the homepage</p>
              </div>
              <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border border-walnut-100 bg-ivory/50">
              <div>
                <Label className="text-sm font-medium text-walnut-900">Visible on site</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Hide to archive</p>
              </div>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-full border-walnut-300 text-walnut-700">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory px-6">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm (single) */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-walnut-100 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg text-walnut-900">
              Delete "{deleteTarget?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the product from your catalogue. Consider hiding it instead
              (eye icon) if you may sell it again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-walnut-300">Keep Product</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-full bg-destructive hover:bg-destructive/90 text-white"
            >
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
              Delete {selected.size} {selected.size === 1 ? "product" : "products"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes {selected.size === 1 ? "this product" : "these products"} from your
              catalogue. Consider hiding {selected.size === 1 ? "it" : "them"} instead if you may sell{" "}
              {selected.size === 1 ? "it" : "them"} again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-walnut-300">Keep Products</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => runBulk("delete")}
              className="rounded-full bg-destructive hover:bg-destructive/90 text-white"
            >
              {bulkBusy === "delete" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                `Delete ${selected.size} ${selected.size === 1 ? "product" : "products"}`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** Status filter chip (matches the Enquiries tab pattern) */
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

/** Compact relative time, e.g. "2h ago" */
function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
