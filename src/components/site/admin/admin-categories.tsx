"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, LayoutGrid, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { AdminPageHeader, ImageField } from "./admin-shared";
import { useSiteData } from "@/lib/site-data";
import { toast } from "@/hooks/use-toast";

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  active: boolean;
  productCount?: number;
}

export function AdminCategories() {
  const { refresh } = useSiteData();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    active: true,
    sortOrder: "0",
  });

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories", { cache: "no-store" });
      if (res.ok) setCategories(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", image: "", active: true, sortOrder: String(categories.length + 1) });
    setDialogOpen(true);
  };

  const openEdit = (c: AdminCategory) => {
    setEditing(c);
    setForm({
      name: c.name,
      description: c.description ?? "",
      image: c.image ?? "",
      active: c.active,
      sortOrder: String(c.sortOrder),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (form.name.trim().length < 2) {
      toast({ title: "Category name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        image: form.image.trim() || null,
        active: form.active,
        sortOrder: parseInt(form.sortOrder) || 0,
      };
      const res = await fetch(
        editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories",
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
      toast({ title: editing ? "Category updated" : "Category created", description: form.name });
      setDialogOpen(false);
      await load();
      await refresh();
    } catch (e) {
      toast({ title: "Could not save", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      toast({ title: "Category deleted", description: deleteTarget.name });
      await load();
      await refresh();
    } catch (e) {
      toast({ title: "Could not delete", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const move = async (c: AdminCategory, dir: -1 | 1) => {
    const newOrder = c.sortOrder + dir;
    try {
      await fetch(`/api/admin/categories/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: Math.max(0, newOrder) }),
      });
      await load();
      await refresh();
    } catch {
      toast({ title: "Reorder failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categories"
        description="The sections customers browse — reorder, rename, or add new ones."
        action={
          <Button onClick={openCreate} className="rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory">
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Button>
        }
      />

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl bg-walnut-100" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex gap-4 p-4 rounded-2xl border border-walnut-100 bg-card hover:shadow-md hover:shadow-walnut-900/5 transition-all"
            >
              { }
              <img
                src={c.image || "/images/cat-living.png"}
                alt=""
                className="h-20 w-20 rounded-xl object-cover border border-walnut-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-walnut-900 text-sm">{c.name}</p>
                  {!c.active && (
                    <span className="text-[10px] uppercase tracking-wide bg-walnut-100 text-walnut-700 px-2 py-0.5 rounded-full font-semibold">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {c.productCount ?? 0} product{(c.productCount ?? 0) !== 1 ? "s" : ""} · order {c.sortOrder}
                </p>
                <div className="mt-2.5 flex items-center gap-1">
                  <button onClick={() => move(c, -1)} className="p-1.5 rounded-lg hover:bg-walnut-100 cursor-pointer" aria-label="Move up" disabled={c.sortOrder <= 1}>
                    <ArrowUp className="h-3.5 w-3.5 text-walnut-600" />
                  </button>
                  <button onClick={() => move(c, 1)} className="p-1.5 rounded-lg hover:bg-walnut-100 cursor-pointer" aria-label="Move down">
                    <ArrowDown className="h-3.5 w-3.5 text-walnut-600" />
                  </button>
                  <span className="flex-1" />
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-walnut-100 cursor-pointer" aria-label={`Edit ${c.name}`}>
                    <Pencil className="h-3.5 w-3.5 text-walnut-700" />
                  </button>
                  <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg hover:bg-destructive/10 cursor-pointer" aria-label={`Delete ${c.name}`}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive/70" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="sm:col-span-2 rounded-2xl border border-dashed border-walnut-200 p-14 text-center text-muted-foreground">
              <LayoutGrid className="h-10 w-10 mx-auto text-walnut-300 mb-3" aria-hidden />
              No categories yet.
            </div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-walnut-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-walnut-900">
              {editing ? `Edit: ${editing.name}` : "Add Category"}
            </DialogTitle>
            <DialogDescription>Shown in navigation and the homepage category grid.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div>
              <Label className="text-sm font-medium text-walnut-900">Category Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder='e.g. "Recliners"'
                className="mt-1.5 h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-walnut-900">Short Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="One line about this category…"
                className="mt-1.5 rounded-xl border-walnut-200 focus-visible:ring-gold resize-none"
              />
            </div>
            <ImageField value={form.image} onChange={(image) => setForm({ ...form, image })} label="Category Image" aspect="aspect-[3/4]" />
            <div className="flex items-center justify-between p-4 rounded-xl border border-walnut-100 bg-ivory/50">
              <div>
                <Label className="text-sm font-medium text-walnut-900">Visible on site</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Hidden categories keep their products</p>
              </div>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-full border-walnut-300 text-walnut-700">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory px-6">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-walnut-100 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg text-walnut-900">
              Delete "{deleteTarget?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.productCount
                ? `This category still has ${deleteTarget.productCount} product(s). Move them to another category first.`
                : "This permanently removes the category from navigation."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-walnut-300">Keep Category</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-full bg-destructive hover:bg-destructive/90 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
