"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ClipboardList,
  Download,
  Inbox,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Search,
  SearchX,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import {
  format,
  formatDistanceToNowStrict,
  isThisMonth,
  isThisWeek,
  isToday,
  parseISO,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
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
import { AdminPageHeader, STATUS_OPTIONS } from "./admin-shared";
import { whatsappLink, formatDate } from "@/lib/format";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Enquiry, EnquiryStatus } from "@/lib/types";

const SOURCE_LABELS: Record<string, string> = {
  "custom-form": "Custom form",
  "product-quote": "Product quote",
  "contact-page": "Contact page",
};

const BULK_STATUSES = ["contacted", "quoted", "won", "archived"] as const;

function sourceLabel(source: string): string {
  return SOURCE_LABELS[source] ?? source;
}

function statusLabel(status: string): string {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
}

/** "2 hours ago"-style suffix; safe against invalid dates. */
function relativeTime(iso: string): string {
  try {
    return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

function isWithin24h(iso: string): boolean {
  const t = new Date(iso).getTime();
  return !Number.isNaN(t) && Date.now() - t < 24 * 60 * 60 * 1000;
}

function timestampOf(iso: string): number {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** CSV cell escaping: wrap fields with commas/quotes/newlines in double quotes, doubling inner quotes. */
function csvCell(value: string | null | undefined): string {
  const v = value ?? "";
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function AdminEnquiries({ signal = 0 }: { signal?: number }) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Enquiry | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/enquiries", { cache: "no-store" });
      if (res.ok) setEnquiries(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Live refresh — the shell bumps `signal` when a new enquiry arrives while
  // this tab is already open (initial mount uses signal 0, handled above).
  useEffect(() => {
    if (signal > 0) load();
  }, [signal, load]);

  // Newest first (createdAt desc)
  const sorted = useMemo(
    () => [...enquiries].sort((a, b) => timestampOf(b.createdAt) - timestampOf(a.createdAt)),
    [enquiries]
  );

  const searchTrimmed = search.trim().toLowerCase();

  // Status filter + search combined (name, phone, furniture type, email)
  const filtered = useMemo(() => {
    const byStatus =
      statusFilter === "all" ? sorted : sorted.filter((e) => e.status === statusFilter);
    if (!searchTrimmed) return byStatus;
    return byStatus.filter((e) =>
      [e.name, e.phone, e.furnitureType ?? "", e.email ?? ""].some((field) =>
        field.toLowerCase().includes(searchTrimmed)
      )
    );
  }, [sorted, statusFilter, searchTrimmed]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: enquiries.length };
    for (const e of enquiries) c[e.status] = (c[e.status] ?? 0) + 1;
    return c;
  }, [enquiries]);

  // Only ids that still exist in the loaded list
  const selectedIds = useMemo(
    () => [...selected].filter((id) => enquiries.some((e) => e.id === id)),
    [selected, enquiries]
  );

  // Client-side stats from loaded enquiries
  const stats = useMemo(() => {
    let today = 0;
    let week = 0;
    let month = 0;
    let won = 0;
    for (const e of enquiries) {
      let d: Date;
      try {
        d = parseISO(e.createdAt);
      } catch {
        continue;
      }
      if (Number.isNaN(d.getTime())) continue;
      if (isToday(d)) today++;
      if (isThisWeek(d)) week++;
      if (isThisMonth(d)) month++;
      if (e.status === "won") won++;
    }
    const total = enquiries.length;
    return { today, week, month, wonRate: total === 0 ? null : Math.round((won / total) * 100) };
  }, [enquiries]);

  const updateStatus = async (id: string, status: string) => {
    setEnquiries((es) =>
      es.map((e) => (e.id === id ? { ...e, status: status as EnquiryStatus } : e))
    );
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast({ title: "Status update failed", variant: "destructive" });
      load();
    }
  };

  const saveNotes = async (id: string) => {
    const notes = notesDraft[id];
    if (notes === undefined) return;
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalNotes: notes }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Notes saved" });
    } catch {
      toast({ title: "Could not save notes", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/enquiries/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Enquiry deleted" });
      setEnquiries((es) => es.filter((e) => e.id !== deleteTarget.id));
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // Sequential PATCH for every selected enquiry, then reload
  const bulkUpdate = async (status: string) => {
    if (selectedIds.length === 0 || bulkBusy) return;
    setBulkBusy(true);
    let updated = 0;
    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/admin/enquiries/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (res.ok) updated++;
      } catch {
        // individual failure — keep going with the rest
      }
    }
    setBulkBusy(false);
    setSelected(new Set());
    if (updated === selectedIds.length) {
      toast({
        title: `Updated ${updated} ${updated === 1 ? "enquiry" : "enquiries"}`,
      });
    } else if (updated > 0) {
      toast({
        title: `Updated ${updated} of ${selectedIds.length} enquiries`,
        description: "Some updates failed — the list will refresh.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Bulk update failed", variant: "destructive" });
    }
    load();
  };

  // Export the currently filtered list (status + search) as CSV
  const exportCsv = () => {
    if (filtered.length === 0) {
      toast({
        title: "Nothing to export",
        description: "No enquiries match the current filters.",
        variant: "destructive",
      });
      return;
    }
    const header = [
      "Date",
      "Name",
      "Phone",
      "Email",
      "Source",
      "Status",
      "Furniture Type",
      "Material",
      "Size",
      "Budget",
      "Items",
      "Description",
    ];
    const rows = filtered.map((e) => [
      formatDate(e.createdAt),
      e.name,
      e.phone,
      e.email ?? "",
      sourceLabel(e.source),
      statusLabel(e.status),
      e.furnitureType ?? "",
      e.material ?? "",
      e.size ?? "",
      e.budget ?? "",
      e.items.map((i) => `${i.productName ?? "Product"} x${i.quantity}`).join("; "),
      e.description ?? "",
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dream-wood-enquiries-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast({
      title: "CSV exported",
      description: `${filtered.length} ${filtered.length === 1 ? "enquiry" : "enquiries"} downloaded.`,
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Enquiries"
        description="Customer enquiries from the custom furniture form, product quote lists and contact page."
        action={
          <Button
            variant="outline"
            onClick={exportCsv}
            className="rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-50"
          >
            <Download className="h-4 w-4" aria-hidden /> Export CSV
          </Button>
        }
      />

      {/* Stats mini-row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Today" value={String(stats.today)} />
        <StatCard
          label="This week"
          value={String(stats.week)}
          icon={<TrendingUp className="h-3.5 w-3.5 text-gold" aria-hidden />}
        />
        <StatCard label="This month" value={String(stats.month)} />
        <StatCard label="Won rate" value={stats.wonRate === null ? "—" : `${stats.wonRate}%`} />
      </div>

      {/* Filters: search + status chips */}
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
            placeholder="Search name, phone or type…"
            aria-label="Search enquiries"
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
        <div className="flex flex-wrap gap-2">
          <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")} count={counts.all ?? 0}>
            All
          </FilterChip>
          {STATUS_OPTIONS.map((s) => (
            <FilterChip
              key={s.value}
              active={statusFilter === s.value}
              onClick={() => setStatusFilter(s.value)}
              count={counts[s.value] ?? 0}
            >
              {s.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <div
          className="rounded-2xl bg-walnut-900 text-ivory p-3 flex items-center gap-3 flex-wrap"
          role="toolbar"
          aria-label="Bulk enquiry actions"
        >
          <p className="text-sm font-medium flex items-center gap-2 px-1.5">
            {bulkBusy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            <span className="tabular-nums">{selectedIds.length}</span> selected
          </p>
          <span className="h-4 w-px bg-white/20" aria-hidden />
          {BULK_STATUSES.map((status) => (
            <Button
              key={status}
              variant="ghost"
              size="sm"
              disabled={bulkBusy}
              onClick={() => bulkUpdate(status)}
              className="h-8 px-3 rounded-full text-xs text-ivory hover:bg-white/10 hover:text-ivory"
            >
              Mark {statusLabel(status).toLowerCase()}
            </Button>
          ))}
          <span className="h-4 w-px bg-white/20" aria-hidden />
          <Button
            variant="ghost"
            size="sm"
            disabled={bulkBusy}
            onClick={() => setSelected(new Set())}
            className="h-8 px-3 rounded-full text-xs text-ivory/80 hover:text-ivory hover:bg-white/10 ml-auto"
          >
            <X className="h-3.5 w-3.5" aria-hidden /> Clear
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-walnut-100" />
          ))}
        </div>
      ) : enquiries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-walnut-200 p-14 text-center">
          <Inbox className="h-10 w-10 mx-auto text-walnut-300 mb-3" aria-hidden />
          <p className="font-display text-lg text-walnut-900">No enquiries yet</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Submissions from the custom furniture form, product quote lists and the contact page
            will appear here.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-walnut-200 p-14 text-center">
          {searchTrimmed ? (
            <>
              <SearchX className="h-10 w-10 mx-auto text-walnut-300 mb-3" aria-hidden />
              <p className="font-display text-lg text-walnut-900">No matches</p>
              <p className="text-sm text-muted-foreground mt-1">
                No enquiries matching “{search}”{statusFilter !== "all" ? " in this status view" : ""}.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearch("")}
                className="mt-4 rounded-full border-walnut-300 text-walnut-700 h-8 text-xs px-4"
              >
                Clear search
              </Button>
            </>
          ) : (
            <>
              <Inbox className="h-10 w-10 mx-auto text-walnut-300 mb-3" aria-hidden />
              <p className="text-sm text-muted-foreground">No enquiries in this view.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => {
            const status = STATUS_OPTIONS.find((s) => s.value === e.status);
            const isOpen = expanded === e.id;
            const rel = relativeTime(e.createdAt);
            const isNew = isWithin24h(e.createdAt);
            const isSelected = selected.has(e.id);
            return (
              <div
                key={e.id}
                className={cn(
                  "rounded-2xl border bg-card overflow-hidden transition-colors",
                  isSelected ? "border-gold" : "border-walnut-100"
                )}
              >
                {/* Selection checkbox column (separate from the expand toggle) */}
                <div className="flex items-center">
                  <div className="flex items-center pl-4 sm:pl-5 pr-3 shrink-0">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(c) => toggleSelect(e.id, c === true)}
                      disabled={bulkBusy}
                      aria-label={`Select enquiry from ${e.name}`}
                      className="border-walnut-300 data-[state=checked]:bg-walnut-800 data-[state=checked]:border-walnut-800 data-[state=checked]:text-ivory"
                    />
                  </div>

                  {/* Row header */}
                  <button
                    onClick={() => {
                      setExpanded(isOpen ? null : e.id);
                      if (!isOpen && notesDraft[e.id] === undefined) {
                        setNotesDraft((n) => ({ ...n, [e.id]: e.internalNotes ?? "" }));
                      }
                    }}
                    className="flex-1 min-w-0 flex items-center gap-4 py-4 pr-4 sm:py-5 sm:pr-5 text-left hover:bg-walnut-50/50 transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <p className="font-medium text-walnut-900">{e.name}</p>
                        {isNew && (
                          <span
                            className="h-2 w-2 rounded-full bg-gold animate-pulse shrink-0"
                            title="New — received in the last 24 hours"
                            aria-hidden
                          />
                        )}
                        {status && (
                          <span className={cn("text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full", status.color)}>
                            {status.label}
                          </span>
                        )}
                        <Badge variant="outline" className="text-[10px] rounded-full text-muted-foreground">
                          {sourceLabel(e.source)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {e.phone} · {e.furnitureType || "General enquiry"} · {formatDate(e.createdAt)}
                        {rel && ` · ${rel}`}
                        {e.items.length > 0 && ` · ${e.items.length} item${e.items.length > 1 ? "s" : ""}`}
                      </p>
                    </div>
                    <ChevronDown
                      className={cn("h-5 w-5 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")}
                      aria-hidden
                    />
                  </button>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-walnut-100 p-5 sm:p-6 space-y-5 bg-ivory/40">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                          Contact
                        </p>
                        <div className="space-y-2 text-sm">
                          <p className="flex items-center gap-2.5">
                            <Phone className="h-4 w-4 text-gold-dark" aria-hidden />
                            <a href={`tel:${e.phone}`} className="text-walnut-800 hover:text-gold-dark font-medium">
                              {e.phone}
                            </a>
                          </p>
                          <p className="flex gap-2.5">
                            <MessageCircle className="h-4 w-4 text-gold-dark shrink-0 mt-0.5" aria-hidden />
                            <a
                              href={whatsappLink(
                                e.phone.replace(/^0/, "").length === 10 ? `91${e.phone.replace(/\D/g, "").replace(/^0/, "")}` : e.phone,
                                `Hi ${e.name}, this is Dream Wood Furniture regarding your enquiry.`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-walnut-800 hover:text-gold-dark"
                            >
                              WhatsApp {e.name.split(" ")[0]}
                            </a>
                          </p>
                          {e.email && (
                            <p className="flex items-center gap-2.5">
                              <Mail className="h-4 w-4 text-gold-dark" aria-hidden />
                              <a href={`mailto:${e.email}`} className="text-walnut-800 hover:text-gold-dark break-all">
                                {e.email}
                              </a>
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground pt-1">
                            Prefers to be reached via <span className="font-medium capitalize">{e.contactMethod}</span>
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                          Enquiry Details
                        </p>
                        <dl className="text-sm space-y-1.5">
                          {e.furnitureType && <Detail label="Type" value={e.furnitureType} />}
                          {e.material && <Detail label="Material" value={e.material} />}
                          {e.size && <Detail label="Size" value={e.size} />}
                          {e.budget && <Detail label="Budget" value={e.budget} />}
                          {e.referenceNote && <Detail label="Reference" value={e.referenceNote} />}
                        </dl>
                      </div>
                    </div>

                    {e.description && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Requirements
                        </p>
                        <p className="text-sm text-foreground/85 leading-relaxed bg-card rounded-xl p-4 border border-walnut-100">
                          {e.description}
                        </p>
                      </div>
                    )}

                    {e.items.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Requested Pieces
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {e.items.map((item) => (
                            <span
                              key={item.id ?? item.productName}
                              className="inline-flex items-center gap-2 text-xs bg-card border border-walnut-100 rounded-full px-3 py-1.5 text-walnut-800"
                            >
                              <ClipboardList className="h-3 w-3 text-gold-dark" aria-hidden />
                              {item.productName ?? "Product"} × {item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status + notes */}
                    <div className="grid sm:grid-cols-[200px_1fr] gap-4 items-start">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Status
                        </p>
                        <Select value={e.status} onValueChange={(v) => updateStatus(e.id, v)}>
                          <SelectTrigger className="h-10 rounded-xl border-walnut-200 bg-card w-full cursor-pointer">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(e)}
                          className="mt-2.5 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full text-xs px-3"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete enquiry
                        </Button>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Internal Notes (not visible to customers)
                        </p>
                        <Textarea
                          value={notesDraft[e.id] ?? e.internalNotes ?? ""}
                          onChange={(ev) =>
                            setNotesDraft((n) => ({ ...n, [e.id]: ev.target.value }))
                          }
                          rows={3}
                          placeholder="Follow-up notes, quoted amount, visit scheduled…"
                          className="rounded-xl border-walnut-200 bg-card focus-visible:ring-gold resize-none text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => saveNotes(e.id)}
                          className="mt-2 rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory text-xs h-8 px-4"
                        >
                          Save Notes
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-walnut-100 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg text-walnut-900">
              Delete enquiry from {deleteTarget?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the enquiry and its notes. Consider archiving instead to keep the record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-walnut-300">Keep</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-full bg-destructive hover:bg-destructive/90 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="text-xs text-muted-foreground w-20 shrink-0 pt-0.5">{label}</dt>
      <dd className="text-walnut-800">{value}</dd>
    </div>
  );
}

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
