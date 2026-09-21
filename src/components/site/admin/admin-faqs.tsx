"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CircleHelp,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Search,
  SearchX,
  Tags,
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

interface AdminFaq {
  id: string;
  question: string;
  answer: string;
  topic: string;
  sortOrder: number;
  active: boolean;
  /** Returned by the API; optional so the row degrades gracefully if absent. */
  createdAt?: string;
  updatedAt?: string;
}

type BulkAction = "show" | "hide" | "delete";

const SUGGESTED_TOPICS = ["Orders", "Delivery", "Custom", "Materials", "Care", "General"];

const BULK_DONE_NOTE: Record<Exclude<BulkAction, "delete">, string> = {
  show: "Now visible in the homepage FAQ accordion.",
  hide: "Hidden from the homepage FAQ accordion.",
};

export function AdminFaqs() {
  const { refresh } = useSiteData();
  const [faqs, setFaqs] = useState<AdminFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState<BulkAction | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminFaq | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminFaq | null>(null);

  const [form, setForm] = useState({
    question: "",
    answer: "",
    topic: "General",
    active: true,
  });

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/faqs", { cache: "no-store" });
      if (res.ok) setFaqs(await res.json());
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

  // Search scope: question + answer text. Topic chips count within this scope.
  const scoped = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
  }, [faqs, search]);

  // Topic list derived from all FAQs — suggested topics first, then any custom ones.
  const topics = useMemo(() => {
    const names = new Set(faqs.map((f) => f.topic).filter(Boolean));
    return [...names].sort((a, b) => {
      const ia = SUGGESTED_TOPICS.indexOf(a);
      const ib = SUGGESTED_TOPICS.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }, [faqs]);

  const topicCounts = useMemo(() => {
    const c: Record<string, number> = { "": scoped.length };
    for (const f of scoped) c[f.topic] = (c[f.topic] ?? 0) + 1;
    return c;
  }, [scoped]);

  const filtered = useMemo(
    () => (topicFilter ? scoped.filter((f) => f.topic === topicFilter) : scoped),
    [scoped, topicFilter]
  );

  const hasActiveFilters = search.trim() !== "" || topicFilter !== "";

  const clearFilters = () => {
    setSearch("");
    setTopicFilter("");
  };

  /* ── Stats ─────────────────────────────────────────────────── */

  const stats = useMemo(
    () => ({
      total: faqs.length,
      visible: faqs.filter((f) => f.active).length,
      hidden: faqs.filter((f) => !f.active).length,
      topics: topics.length,
    }),
    [faqs, topics]
  );

  /* ── Selection ─────────────────────────────────────────────── */

  const allFilteredSelected = filtered.length > 0 && filtered.every((f) => selected.has(f.id));
  const someFilteredSelected = filtered.some((f) => selected.has(f.id));
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
      if (allFilteredSelected) filtered.forEach((f) => next.delete(f.id));
      else filtered.forEach((f) => next.add(f.id));
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  /* ── Create / edit / hide / delete ─────────────────────────── */

  const openCreate = () => {
    setEditing(null);
    setForm({ question: "", answer: "", topic: "General", active: true });
    setDialogOpen(true);
  };

  const openEdit = (f: AdminFaq) => {
    setEditing(f);
    setForm({
      question: f.question,
      answer: f.answer,
      topic: f.topic,
      active: f.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const question = form.question.trim();
    const answer = form.answer.trim();
    const topic = form.topic.trim();
    if (question.length < 6 || question.length > 200) {
      toast({ title: "Question must be 6–200 characters", variant: "destructive" });
      return;
    }
    if (answer.length < 10 || answer.length > 2000) {
      toast({ title: "Answer must be 10–2000 characters", variant: "destructive" });
      return;
    }
    if (topic.length > 40) {
      toast({ title: "Topic must be 40 characters or fewer", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        question,
        answer,
        topic: topic || "General",
        active: form.active,
      };
      const res = await fetch(editing ? `/api/admin/faqs/${editing.id}` : "/api/admin/faqs", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      toast({ title: editing ? "FAQ updated" : "FAQ added" });
      setDialogOpen(false);
      await load();
      await refresh();
    } catch {
      toast({ title: "Could not save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (faq: AdminFaq) => {
    const newValue = !faq.active;
    setFaqs((fs) => fs.map((x) => (x.id === faq.id ? { ...x, active: newValue } : x)));
    try {
      const res = await fetch(`/api/admin/faqs/${faq.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newValue }),
      });
      if (!res.ok) throw new Error();
      await refresh();
    } catch {
      setFaqs((fs) => fs.map((x) => (x.id === faq.id ? { ...x, active: !newValue } : x)));
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/faqs/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "FAQ deleted" });
      setFaqs((fs) => fs.filter((x) => x.id !== deleteTarget.id));
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
            ? await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" })
            : await fetch(`/api/admin/faqs/${id}`, {
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
    const noun = ids.length === 1 ? "FAQ" : "FAQs";
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

  /* ── Topic chips for the dialog picker ─────────────────────── */

  // Suggested list first, then any custom topics already in the data (or the current form value).
  const topicOptions = useMemo(() => {
    const names = new Set<string>(SUGGESTED_TOPICS);
    topics.forEach((t) => names.add(t));
    if (form.topic.trim()) names.add(form.topic.trim());
    return [...names].sort((a, b) => {
      const ia = SUGGESTED_TOPICS.indexOf(a);
      const ib = SUGGESTED_TOPICS.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }, [topics, form.topic]);

  /* ── Render ────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="FAQs"
        description={
          loading
            ? "Questions shown in the homepage FAQ accordion — clear answers here also feed Google FAQ rich results."
            : `${stats.total} ${stats.total === 1 ? "question" : "questions"} across ${stats.topics} ${stats.topics === 1 ? "topic" : "topics"} — shown in the homepage FAQ accordion and eligible for Google FAQ rich results.`
        }
        action={
          <Button onClick={openCreate} className="rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory">
            <Plus className="h-4 w-4 mr-2" /> Add FAQ
          </Button>
        }
      />

      {/* Stats mini-row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total FAQs" value={String(stats.total)} />
        <StatCard label="Visible" value={String(stats.visible)} />
        <StatCard
          label="Hidden"
          value={String(stats.hidden)}
          icon={<EyeOff className="h-3.5 w-3.5 text-gold" aria-hidden />}
        />
        <StatCard
          label="Topics"
          value={String(stats.topics)}
          icon={<Tags className="h-3.5 w-3.5 text-gold" aria-hidden />}
        />
      </div>

      {/* Filters: search + topic chips + select all */}
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
            placeholder="Search FAQs…"
            aria-label="Search FAQs"
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
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter FAQs by topic">
            <FilterChip active={topicFilter === ""} onClick={() => setTopicFilter("")} count={topicCounts[""] ?? 0}>
              All
            </FilterChip>
            {topics.map((topic) => (
              <FilterChip
                key={topic}
                active={topicFilter === topic}
                onClick={() => setTopicFilter(topic)}
                count={topicCounts[topic] ?? 0}
              >
                {topic}
              </FilterChip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            {!loading && filtered.length > 0 && (
              <div className="flex h-9 items-center gap-2 rounded-full border border-walnut-200 bg-card px-3.5">
                <Checkbox
                  checked={selectAllState}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all filtered FAQs"
                  className="cursor-pointer border-walnut-300 data-[state=checked]:border-walnut-800 data-[state=checked]:bg-walnut-800 data-[state=indeterminate]:border-walnut-800 data-[state=indeterminate]:bg-walnut-800"
                />
                <span className="whitespace-nowrap text-xs text-muted-foreground">Select all (filtered)</span>
              </div>
            )}
            {!loading && (
              <p className="whitespace-nowrap text-xs text-muted-foreground" aria-live="polite">
                Showing {filtered.length} of {faqs.length} {faqs.length === 1 ? "FAQ" : "FAQs"}
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
            {selected.size} {selected.size === 1 ? "FAQ" : "FAQs"} selected
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
      ) : faqs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-walnut-200 p-14 text-center text-muted-foreground">
          <CircleHelp className="h-10 w-10 mx-auto text-walnut-300 mb-3" aria-hidden />
          No FAQs yet.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-walnut-200 p-14 text-center">
          <SearchX className="h-10 w-10 mx-auto text-walnut-300 mb-3" aria-hidden />
          <p className="text-muted-foreground">No FAQs match your current filters.</p>
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
          {filtered.map((f) => {
            const isSelected = selected.has(f.id);
            return (
              <div
                key={f.id}
                className={cn(
                  "p-5 rounded-2xl border bg-card transition-colors",
                  isSelected
                    ? "border-gold ring-1 ring-gold"
                    : f.active
                      ? "border-walnut-100 hover:border-walnut-200"
                      : "border-walnut-200 opacity-70"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(f.id)}
                      disabled={bulkBusy !== null}
                      aria-label={`Select FAQ "${f.question}"`}
                      className="mt-1 shrink-0 cursor-pointer border-walnut-300 data-[state=checked]:border-walnut-800 data-[state=checked]:bg-walnut-800"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-walnut-900 text-sm">{f.question}</p>
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center rounded-full bg-walnut-100 px-2 py-0.5 text-[10px] font-medium text-walnut-700">
                          {f.topic}
                        </span>
                        {!f.active && (
                          <span className="text-[10px] uppercase tracking-wide bg-walnut-100 text-walnut-700 px-2 py-0.5 rounded-full font-semibold">
                            Hidden
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-start gap-2">
                        <CircleHelp className="h-4 w-4 text-gold/60 shrink-0 mt-0.5" aria-hidden />
                        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">{f.answer}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(f)}
                      className="p-2 rounded-lg hover:bg-walnut-100 cursor-pointer"
                      aria-label={`Edit FAQ "${f.question}"`}
                    >
                      <Pencil className="h-4 w-4 text-walnut-700" />
                    </button>
                    <button
                      onClick={() => toggleActive(f)}
                      className="p-2 rounded-lg hover:bg-walnut-100 cursor-pointer"
                      aria-label={f.active ? "Hide FAQ" : "Show FAQ"}
                      title={f.active ? "Hide FAQ" : "Show FAQ"}
                    >
                      {f.active ? (
                        <EyeOff className="h-4 w-4 text-walnut-700" />
                      ) : (
                        <Eye className="h-4 w-4 text-gold-dark" />
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(f)}
                      className="p-2 rounded-lg hover:bg-destructive/10 cursor-pointer"
                      aria-label={`Delete FAQ "${f.question}"`}
                    >
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
              {editing ? "Edit FAQ" : "Add FAQ"}
            </DialogTitle>
            <DialogDescription>Shown in the homepage FAQ accordion.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div>
              <Label className="text-sm font-medium text-walnut-900">Question *</Label>
              <Input
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder='e.g. "Do you deliver across Navi Mumbai?"'
                className="mt-1.5 h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-walnut-900">Answer *</Label>
              <Textarea
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                rows={6}
                placeholder="The answer customers see when they expand the question…"
                className="mt-1.5 rounded-xl border-walnut-200 focus-visible:ring-gold resize-none"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-walnut-900">Topic</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {topicOptions.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, topic: t })}
                    className={cn(
                      "h-8 px-3.5 rounded-full text-xs font-medium border transition-all cursor-pointer",
                      form.topic === t
                        ? "bg-walnut-800 text-ivory border-walnut-800"
                        : "border-walnut-200 text-muted-foreground hover:border-walnut-400"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-walnut-100 bg-ivory/50">
              <div>
                <Label className="text-sm font-medium text-walnut-900">Visible</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Hidden FAQs stay here but leave the homepage.</p>
              </div>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
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
            <AlertDialogTitle className="font-display text-lg text-walnut-900">
              Delete &quot;{deleteTarget?.question}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>This FAQ will be removed from the homepage accordion.</AlertDialogDescription>
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
              Delete {selected.size} {selected.size === 1 ? "FAQ" : "FAQs"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes {selected.size === 1 ? "this FAQ" : "these FAQs"} from the homepage accordion.
              Consider hiding {selected.size === 1 ? "it" : "them"} instead if you may want{" "}
              {selected.size === 1 ? "it" : "them"} back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-walnut-300">Keep FAQs</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => runBulk("delete")}
              className="rounded-full bg-destructive hover:bg-destructive/90 text-white"
            >
              {bulkBusy === "delete" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                `Delete ${selected.size} ${selected.size === 1 ? "FAQ" : "FAQs"}`
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

/** Topic filter chip (matches the Products/Enquiries tab pattern) */
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
