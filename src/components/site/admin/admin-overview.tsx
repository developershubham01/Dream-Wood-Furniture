"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Sofa,
  LayoutGrid,
  Inbox,
  Images,
  MessageSquareQuote,
  ArrowRight,
  Phone,
  Trophy,
  Clock,
  Plus,
  PenTool,
  ClipboardList,
  Mail,
  Sparkles,
  TrendingUp,
  Sun,
  Sunset,
  Moon,
  FileText,
  CircleHelp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { AdminPageHeader, STATUS_OPTIONS } from "./admin-shared";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export type NavTab = "products" | "enquiries" | "categories" | "gallery" | "testimonials" | "content" | "faqs";

interface ContentCounts {
  total: number;
  active: number;
}

interface Stats {
  totalProducts: number;
  activeProducts: number;
  featuredProducts?: number;
  totalCategories: number;
  newEnquiries: number;
  pendingEnquiries: number;
  totalEnquiries: number;
  galleryImages: number;
  testimonials: number;
  content?: {
    products: ContentCounts;
    categories: ContentCounts;
    gallery: ContentCounts;
    testimonials: ContentCounts;
    faqs: ContentCounts;
  };
  analytics?: {
    trend: { date: string; count: number }[];
    statusMap: Record<string, number>;
    sourceMap: Record<string, number>;
    wonCount: number;
    last24h: number;
    thisWeekCount: number;
    thisMonthCount: number;
    wonRate: number;
    topCategories: { name: string; count: number }[];
  };
  recentEnquiries: {
    id: string;
    name: string;
    phone: string;
    furnitureType: string | null;
    status: string;
    source: string;
    createdAt: string;
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  new: "#b08d57",
  contacted: "#d97706",
  quoted: "#8b5cf6",
  won: "#059669",
  archived: "#cdb394",
};

const SOURCE_META: Record<string, { label: string; icon: React.ElementType }> = {
  "custom-form": { label: "Custom form", icon: PenTool },
  "product-quote": { label: "Product quote", icon: ClipboardList },
  "contact-page": { label: "Contact page", icon: Mail },
};

const CONTENT_SECTIONS: { key: keyof NonNullable<Stats["content"]>; label: string; icon: React.ElementType; tab: NavTab }[] = [
  { key: "products", label: "Products", icon: Sofa, tab: "products" },
  { key: "categories", label: "Categories", icon: LayoutGrid, tab: "categories" },
  { key: "gallery", label: "Gallery", icon: Images, tab: "gallery" },
  { key: "testimonials", label: "Testimonials", icon: MessageSquareQuote, tab: "testimonials" },
  { key: "faqs", label: "FAQs", icon: CircleHelp, tab: "faqs" },
];

function greetingFor(hour: number): { text: string; icon: React.ElementType } {
  if (hour >= 5 && hour < 12) return { text: "Good morning", icon: Sun };
  if (hour >= 12 && hour < 17) return { text: "Good afternoon", icon: Sparkles };
  if (hour >= 17 && hour < 21) return { text: "Good evening", icon: Sunset };
  return { text: "Good night", icon: Moon };
}

export function AdminOverview({ onNavigate, adminName }: { onNavigate: (tab: NavTab) => void; adminName?: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const load = async () => {
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        if (res.ok) setStats(await res.json());
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const a = stats?.analytics;

  const trendData = useMemo(() => {
    if (!a?.trend) return [];
    return a.trend.map((t) => ({
      ...t,
      label: new Date(t.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    }));
  }, [a?.trend]);

  const statusData = useMemo(() => {
    if (!a?.statusMap) return [];
    return STATUS_OPTIONS.filter((s) => (a.statusMap[s.value] ?? 0) > 0).map((s) => ({
      status: s.value,
      label: s.label,
      count: a.statusMap[s.value] ?? 0,
    }));
  }, [a?.statusMap]);

  const sourceData = useMemo(() => {
    if (!a?.sourceMap) return [];
    return Object.entries(a.sourceMap).map(([key, count]) => ({
      key,
      count,
      meta: SOURCE_META[key] ?? { label: key, icon: Inbox },
    }));
  }, [a?.sourceMap]);

  const maxCatCount = useMemo(
    () => Math.max(1, ...(a?.topCategories ?? []).map((c) => c.count)),
    [a?.topCategories]
  );

  const trendConfig = {
    count: { label: "Enquiries", color: "var(--color-walnut-600, #96744a)" },
  } satisfies ChartConfig;

  const statusConfig = useMemo(() => {
    const cfg: ChartConfig = {};
    for (const s of statusData) {
      cfg[s.status] = { label: s.label, color: STATUS_COLORS[s.status] };
    }
    return cfg;
  }, [statusData]);

  const hello = now ? greetingFor(now.getHours()) : { text: "Welcome", icon: Sparkles };
  const cards = stats
    ? [
        {
          label: "Total Products",
          value: stats.totalProducts,
          sub: `${stats.activeProducts} active${stats.featuredProducts != null ? ` · ${stats.featuredProducts} featured` : ""}`,
          icon: Sofa,
          tab: "products" as const,
        },
        {
          label: "Categories",
          value: stats.totalCategories,
          sub: "shop sections",
          icon: LayoutGrid,
          tab: "categories" as const,
        },
        {
          label: "New Enquiries",
          value: stats.newEnquiries,
          sub: a ? `${a.last24h} in last 24h` : "need attention",
          icon: Inbox,
          tab: "enquiries" as const,
          highlight: stats.newEnquiries > 0,
        },
        {
          label: "Pending",
          value: stats.pendingEnquiries,
          sub: `of ${stats.totalEnquiries} total`,
          icon: Clock,
          tab: "enquiries" as const,
        },
        {
          label: "Won Rate",
          value: a ? `${a.wonRate}%` : "—",
          sub: a ? `${a.wonCount} won enquiries` : "closed deals",
          icon: Trophy,
          tab: "enquiries" as const,
        },
        {
          label: "Gallery & Reviews",
          value: stats.galleryImages,
          sub: `${stats.testimonials} testimonials`,
          icon: Images,
          tab: "gallery" as const,
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard Overview"
        description="A snapshot of your website — catalogue, enquiries and content."
      />

      {/* Greeting banner */}
      <div className="relative overflow-hidden rounded-3xl bg-espresso p-6 sm:p-8">
        <div className="absolute inset-0 wood-texture opacity-50" aria-hidden />
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gold/15 blur-3xl" aria-hidden />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <hello.icon className="h-4 w-4 text-gold" aria-hidden />
              <p className="text-[11px] uppercase tracking-[0.25em] text-gold font-semibold">
                {hello.text}
                {adminName ? `, ${adminName.split(" ")[0]}` : ""}
              </p>
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl text-ivory leading-tight">
              Here&rsquo;s how your showroom is doing
              {now && <span className="text-ivory/50 text-lg sm:text-xl font-normal"> · {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</span>}
            </h2>
            {a && (
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                <span className="text-sm text-ivory/70">
                  <strong className="text-ivory tabular-nums">{a.thisWeekCount}</strong> this week
                </span>
                <span className="text-sm text-ivory/70">
                  <strong className="text-ivory tabular-nums">{a.thisMonthCount}</strong> this month
                </span>
                <span className="text-sm text-ivory/70">
                  <strong className="text-ivory tabular-nums">{a.last24h}</strong> in last 24h
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5 lg:justify-end">
            <button
              onClick={() => onNavigate("products")}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-gold text-espresso text-sm font-semibold hover:bg-gold-light transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" aria-hidden /> Add Product
            </button>
            <button
              onClick={() => onNavigate("enquiries")}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-white/20 text-ivory text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Inbox className="h-4 w-4" aria-hidden /> Review Enquiries
            </button>
            <button
              onClick={() => onNavigate("content")}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-white/20 text-ivory text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer"
            >
              <FileText className="h-4 w-4" aria-hidden /> Site Content
            </button>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm text-gold-dark flex items-start gap-3">
        <span className="font-semibold shrink-0">Demo catalogue:</span>
        <p className="flex-1">
          Products, prices and testimonials are sample placeholders — replace them with your actual
          inventory and verified customer reviews from the Products &amp; Testimonials tabs.
        </p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl bg-walnut-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <Card
              key={c.label}
              className={cn(
                "rounded-2xl border-walnut-100 bg-card hover:shadow-lg hover:shadow-walnut-900/5 transition-all cursor-pointer",
                c.highlight && "border-gold/50 ring-1 ring-gold/30"
              )}
              onClick={() => onNavigate(c.tab)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center",
                      c.highlight ? "bg-gold/20 text-gold-dark" : "bg-walnut-100 text-walnut-700"
                    )}
                  >
                    <c.icon className="h-5 w-5" aria-hidden />
                  </div>
                  {c.highlight && (
                    <Badge className="bg-gold text-espresso border-0 text-[10px]">Action needed</Badge>
                  )}
                </div>
                <p className="mt-4 font-display text-3xl text-walnut-900 tabular-nums">{c.value}</p>
                <p className="text-sm font-medium text-walnut-800 mt-0.5">{c.label}</p>
                <p className="text-xs text-muted-foreground">{c.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts row */}
      {loading ? (
        <div className="grid lg:grid-cols-3 gap-4">
          <Skeleton className="h-72 rounded-2xl bg-walnut-100 lg:col-span-2" />
          <Skeleton className="h-72 rounded-2xl bg-walnut-100" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Trend chart */}
          <Card className="rounded-2xl border-walnut-100 bg-card lg:col-span-2">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="font-display text-lg text-walnut-900">Enquiries — last 30 days</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">All customer enquiries, by day</p>
                </div>
                {a && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                    <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                    {a.thisWeekCount} this week
                  </span>
                )}
              </div>
              {trendData.length > 0 ? (
                <ChartContainer config={trendConfig} className="h-[220px] w-full aspect-auto">
                  <AreaChart data={trendData} margin={{ top: 12, right: 6, bottom: 0, left: -18 }}>
                    <defs>
                      <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#96744a" stopOpacity={0.32} />
                        <stop offset="100%" stopColor="#96744a" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2d2bd" />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      interval={4}
                      tick={{ fontSize: 11, fill: "#7d5c3a" }}
                    />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#7d5c3a" }} />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                    <Area
                      dataKey="count"
                      name="Enquiries"
                      type="monotone"
                      stroke="#96744a"
                      strokeWidth={2.5}
                      fill="url(#trendFill)"
                      activeDot={{ r: 4, fill: "#b08d57", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                  No enquiry data yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status donut */}
          <Card className="rounded-2xl border-walnut-100 bg-card">
            <CardContent className="p-5 sm:p-6">
              <h3 className="font-display text-lg text-walnut-900">Enquiry pipeline</h3>
              <p className="text-xs text-muted-foreground mt-0.5 mb-2">Current status of all enquiries</p>
              {statusData.length > 0 ? (
                <>
                  <div className="relative">
                    <ChartContainer config={statusConfig} className="h-[170px] w-full aspect-auto">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie
                          data={statusData}
                          dataKey="count"
                          nameKey="status"
                          innerRadius={52}
                          outerRadius={72}
                          paddingAngle={3}
                          strokeWidth={0}
                        >
                          {statusData.map((s) => (
                            <Cell key={s.status} fill={STATUS_COLORS[s.status] ?? "#cdb394"} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="font-display text-2xl text-walnut-900 tabular-nums leading-none">
                        {stats?.totalEnquiries ?? 0}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">total</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {statusData.map((s) => (
                      <li key={s.status} className="flex items-center gap-2.5 text-sm">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: STATUS_COLORS[s.status] }}
                          aria-hidden
                        />
                        <span className="text-walnut-800 flex-1">{s.label}</span>
                        <span className="tabular-nums text-xs font-semibold text-walnut-900">{s.count}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                  No enquiries yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content overview */}
      <div>
        <div className="mb-4">
          <h2 className="font-display text-xl text-walnut-900">Content overview</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Everything live on your storefront</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl bg-walnut-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CONTENT_SECTIONS.map((s) => {
              const item = stats?.content?.[s.key];
              const total = item?.total ?? 0;
              const active = item?.active ?? 0;
              const hidden = Math.max(0, total - active);
              return (
                <button
                  key={s.key}
                  onClick={() => onNavigate(s.tab)}
                  className="rounded-2xl border border-walnut-100 bg-card p-5 text-left transition-all hover:border-walnut-200 hover:shadow-lg hover:shadow-walnut-900/5 cursor-pointer"
                >
                  <span className="h-10 w-10 rounded-xl bg-gold/15 border border-gold/25 text-gold-dark flex items-center justify-center">
                    <s.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="mt-4 font-display text-3xl text-walnut-900 tabular-nums">{active}</p>
                  <p className="text-sm font-medium text-walnut-800 mt-0.5">{s.label}</p>
                  {hidden > 0 ? (
                    <p className="text-xs text-amber-700 mt-0.5 tabular-nums">
                      {hidden} hidden
                    </p>
                  ) : (
                    <p className="text-xs text-emerald-700 mt-0.5">All live</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom row: top categories + sources */}
      {!loading && a && (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Top categories */}
          <Card className="rounded-2xl border-walnut-100 bg-card lg:col-span-2">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-lg text-walnut-900">Catalogue by category</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Active products per section</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("categories")}
                  className="text-gold-dark hover:text-gold hover:bg-gold/10 rounded-full"
                >
                  Manage
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              {a.topCategories.length > 0 ? (
                <div className="space-y-3.5">
                  {a.topCategories.map((c) => (
                    <div key={c.name} className="group">
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-walnut-800 font-medium group-hover:text-walnut-900">{c.name}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {c.count} product{c.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-walnut-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-walnut-600 to-gold transition-all duration-500"
                          style={{ width: `${Math.max(6, (c.count / maxCatCount) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-6 text-center">No categories with products yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Sources */}
          <Card className="rounded-2xl border-walnut-100 bg-card">
            <CardContent className="p-5 sm:p-6">
              <h3 className="font-display text-lg text-walnut-900">Where enquiries come from</h3>
              <p className="text-xs text-muted-foreground mt-0.5 mb-4">Submission source, all time</p>
              {sourceData.length > 0 ? (
                <ul className="space-y-3">
                  {sourceData
                    .slice()
                    .sort((x, y) => y.count - x.count)
                    .map((s) => {
                      const pct = stats && stats.totalEnquiries > 0 ? Math.round((s.count / stats.totalEnquiries) * 100) : 0;
                      return (
                        <li
                          key={s.key}
                          className="flex items-center gap-3 p-3 rounded-xl border border-walnut-100 bg-ivory/40"
                        >
                          <span className="h-9 w-9 rounded-lg bg-walnut-100 text-walnut-700 flex items-center justify-center shrink-0">
                            <s.meta.icon className="h-4 w-4" aria-hidden />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-walnut-900 truncate">{s.meta.label}</p>
                            <div className="mt-1 h-1.5 rounded-full bg-walnut-100 overflow-hidden">
                              <div className="h-full rounded-full bg-gold" style={{ width: `${Math.max(6, pct)}%` }} />
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-walnut-900 tabular-nums leading-none">{s.count}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">{pct}%</p>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground py-6 text-center">No enquiries yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent enquiries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-walnut-900">Recent Enquiries</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("enquiries")}
            className="text-gold-dark hover:text-gold hover:bg-gold/10 rounded-full"
          >
            View all
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        {loading ? (
          <Skeleton className="h-48 rounded-2xl bg-walnut-100" />
        ) : stats && stats.recentEnquiries.length > 0 ? (
          <div className="rounded-2xl border border-walnut-100 bg-card overflow-hidden">
            <div className="divide-y divide-walnut-100">
              {stats.recentEnquiries.map((e) => {
                const status = STATUS_OPTIONS.find((s) => s.value === e.status);
                const src = SOURCE_META[e.source] ?? { label: e.source, icon: Inbox };
                return (
                  <button
                    key={e.id}
                    onClick={() => onNavigate("enquiries")}
                    className="w-full flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 py-4 hover:bg-walnut-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <p className="font-medium text-walnut-900 text-sm">{e.name}</p>
                        {status && (
                          <span className={cn("text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full", status.color)}>
                            {status.label}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                          <src.icon className="h-3 w-3" aria-hidden /> {src.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {e.furnitureType || "General enquiry"} · {formatDate(e.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:justify-end">
                      <a
                        href={`tel:${e.phone}`}
                        onClick={(ev) => ev.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-walnut-700 hover:text-gold-dark transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5" /> {e.phone}
                      </a>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-walnut-200 p-10 text-center text-muted-foreground text-sm">
            <Inbox className="h-8 w-8 mx-auto text-walnut-300 mb-3" aria-hidden />
            No enquiries yet — they&rsquo;ll appear here when customers submit forms.
          </div>
        )}
      </div>
    </div>
  );
}
