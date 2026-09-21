"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Save, RotateCcw, Megaphone, Image, Sparkles, MapPin, Star, Heart, Info, Share2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader, ImageField } from "./admin-shared";
import { useSiteData } from "@/lib/site-data";
import { toast } from "@/hooks/use-toast";
import type { SiteSettings } from "@/lib/types";

const SECTIONS = [
  { id: "announcement", label: "Announcement Bar", icon: Megaphone },
  { id: "hero", label: "Hero Section", icon: Image },
  { id: "custom", label: "Custom Furniture Banner", icon: Sparkles },
  { id: "contact", label: "Contact & Showroom", icon: MapPin },
  { id: "rating", label: "Google Rating", icon: Star },
  { id: "cta", label: "Bottom CTA", icon: Heart },
  { id: "about", label: "About Page", icon: Info },
  { id: "social", label: "Social Links", icon: Share2 },
  { id: "seo", label: "SEO", icon: Search },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export function AdminContent() {
  const { refresh } = useSiteData();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState<SectionId>("announcement");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings", { cache: "no-store" });
      if (res.ok) setSettings(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = (partial: Partial<SiteSettings>) => {
    setSettings((s) => (s ? { ...s, ...partial } : s));
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Content saved", description: "The storefront has been updated." });
      await refresh();
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 rounded-2xl bg-walnut-100" />
        <Skeleton className="h-96 rounded-2xl bg-walnut-100" />
      </div>
    );
  }

  if (!settings) {
    return <p className="text-muted-foreground">Could not load settings.</p>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Site Content"
        description="Edit what customers see — headings, contact details, hours and more."
        action={
          <div className="flex gap-2">
            <Button
              onClick={load}
              variant="outline"
              className="rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" /> Reload
            </Button>
            <Button onClick={handleSave} disabled={saving} className="rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory px-6">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2 pb-2">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`h-9 px-4 rounded-full text-xs font-medium border transition-all cursor-pointer flex items-center gap-2 ${
              section === s.id
                ? "bg-walnut-800 text-ivory border-walnut-800"
                : "bg-card text-muted-foreground border-walnut-200 hover:border-walnut-400 hover:text-foreground"
            }`}
          >
            <s.icon className="h-3.5 w-3.5" aria-hidden />
            {s.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-walnut-100 bg-card p-6 sm:p-8">
        {section === "announcement" && (
          <div className="space-y-4 max-w-xl">
            <SectionTitle>Announcement Bar</SectionTitle>
            <div className="flex items-center justify-between p-4 rounded-xl border border-walnut-100 bg-ivory/50">
              <Label className="text-sm font-medium text-walnut-900">Show announcement bar</Label>
              <Switch
                checked={settings.announcement.enabled}
                onCheckedChange={(v) => patch({ announcement: { ...settings.announcement, enabled: v } })}
              />
            </div>
            <Field label="Announcement text">
              <Input
                value={settings.announcement.text}
                onChange={(e) => patch({ announcement: { ...settings.announcement, text: e.target.value } })}
                className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </Field>
          </div>
        )}

        {section === "hero" && (
          <div className="space-y-4 max-w-xl">
            <SectionTitle>Homepage Hero</SectionTitle>
            <Field label="Eyebrow / location tag">
              <Input
                value={settings.hero.eyebrow}
                onChange={(e) => patch({ hero: { ...settings.hero, eyebrow: e.target.value } })}
                className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </Field>
            <Field label="Headline">
              <Textarea
                value={settings.hero.heading}
                onChange={(e) => patch({ hero: { ...settings.hero, heading: e.target.value } })}
                rows={2}
                className="rounded-xl border-walnut-200 focus-visible:ring-gold resize-none"
              />
            </Field>
            <Field label="Subheading">
              <Textarea
                value={settings.hero.subheading}
                onChange={(e) => patch({ hero: { ...settings.hero, subheading: e.target.value } })}
                rows={3}
                className="rounded-xl border-walnut-200 focus-visible:ring-gold resize-none"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Primary button label">
                <Input
                  value={settings.hero.primaryCta}
                  onChange={(e) => patch({ hero: { ...settings.hero, primaryCta: e.target.value } })}
                  className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
                />
              </Field>
              <Field label="Secondary button label">
                <Input
                  value={settings.hero.secondaryCta}
                  onChange={(e) => patch({ hero: { ...settings.hero, secondaryCta: e.target.value } })}
                  className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
                />
              </Field>
            </div>
            <ImageField
              value={settings.hero.image}
              onChange={(image) => patch({ hero: { ...settings.hero, image } })}
              label="Hero background image"
              aspect="aspect-[2/1]"
            />
          </div>
        )}

        {section === "custom" && (
          <div className="space-y-4 max-w-xl">
            <SectionTitle>Custom Furniture Banner</SectionTitle>
            <Field label="Headline">
              <Input
                value={settings.custom.heading}
                onChange={(e) => patch({ custom: { ...settings.custom, heading: e.target.value } })}
                className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </Field>
            <Field label="Description">
              <Textarea
                value={settings.custom.description}
                onChange={(e) => patch({ custom: { ...settings.custom, description: e.target.value } })}
                rows={3}
                className="rounded-xl border-walnut-200 focus-visible:ring-gold resize-none"
              />
            </Field>
            <Field label="Button label">
              <Input
                value={settings.custom.ctaLabel}
                onChange={(e) => patch({ custom: { ...settings.custom, ctaLabel: e.target.value } })}
                className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </Field>
            <ImageField
              value={settings.custom.image}
              onChange={(image) => patch({ custom: { ...settings.custom, image } })}
              label="Banner image"
              aspect="aspect-[2/1]"
            />
          </div>
        )}

        {section === "contact" && (
          <div className="space-y-4 max-w-xl">
            <SectionTitle>Contact & Showroom Details</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone (dialable)">
                <Input
                  value={settings.contact.phone}
                  onChange={(e) => patch({ contact: { ...settings.contact, phone: e.target.value } })}
                  className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
                />
              </Field>
              <Field label="Phone (display)">
                <Input
                  value={settings.contact.phoneDisplay}
                  onChange={(e) => patch({ contact: { ...settings.contact, phoneDisplay: e.target.value } })}
                  className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
                />
              </Field>
            </div>
            <Field label="WhatsApp number (with 91, digits only)">
              <Input
                value={settings.contact.whatsapp}
                onChange={(e) => patch({ contact: { ...settings.contact, whatsapp: e.target.value.replace(/\D/g, "") } })}
                placeholder="919702533626"
                className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </Field>
            <Field label="Email (optional — hidden if empty)">
              <Input
                value={settings.contact.email}
                onChange={(e) => patch({ contact: { ...settings.contact, email: e.target.value } })}
                placeholder="hello@dreamwoodfurniture.in"
                className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </Field>
            <Field label="Address line 1">
              <Input
                value={settings.contact.addressLine1}
                onChange={(e) => patch({ contact: { ...settings.contact, addressLine1: e.target.value } })}
                className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </Field>
            <Field label="Address line 2">
              <Input
                value={settings.contact.addressLine2}
                onChange={(e) => patch({ contact: { ...settings.contact, addressLine2: e.target.value } })}
                className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </Field>
            <Field label="Address line 3">
              <Input
                value={settings.contact.addressLine3}
                onChange={(e) => patch({ contact: { ...settings.contact, addressLine3: e.target.value } })}
                className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </Field>
            <Field label="Business hours">
              <Input
                value={settings.contact.hours}
                onChange={(e) => patch({ contact: { ...settings.contact, hours: e.target.value } })}
                className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Opens at" hint="Powers the live “Open now” badge">
                <Input
                  type="time"
                  value={settings.contact.openTime}
                  onChange={(e) => patch({ contact: { ...settings.contact, openTime: e.target.value } })}
                  className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
                />
              </Field>
              <Field label="Closes at">
                <Input
                  type="time"
                  value={settings.contact.closeTime}
                  onChange={(e) => patch({ contact: { ...settings.contact, closeTime: e.target.value } })}
                  className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
                />
              </Field>
            </div>
            <Field label="Google Maps search query" hint="Used for the map embed and directions links">
              <Input
                value={settings.contact.mapsQuery}
                onChange={(e) => patch({ contact: { ...settings.contact, mapsQuery: e.target.value } })}
                className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </Field>
          </div>
        )}

        {section === "rating" && (
          <div className="space-y-4 max-w-md">
            <SectionTitle>Google Rating</SectionTitle>
            <p className="text-xs text-muted-foreground -mt-2">
              Keep this in sync with your actual Google Business Profile rating.
            </p>
            <Field label="Rating value (e.g. 4.8)">
              <Input
                value={String(settings.rating.value)}
                onChange={(e) =>
                  patch({ rating: { ...settings.rating, value: parseFloat(e.target.value) || 0 } })
                }
                inputMode="decimal"
                className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </Field>
            <Field label="Review count">
              <Input
                value={String(settings.rating.count)}
                onChange={(e) =>
                  patch({ rating: { ...settings.rating, count: parseInt(e.target.value.replace(/\D/g, "")) || 0 } })
                }
                inputMode="numeric"
                className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </Field>
          </div>
        )}

        {section === "cta" && (
          <div className="space-y-4 max-w-xl">
            <SectionTitle>Bottom CTA Section</SectionTitle>
            <Field label="Heading">
              <Input
                value={settings.cta.heading}
                onChange={(e) => patch({ cta: { ...settings.cta, heading: e.target.value } })}
                className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </Field>
            <Field label="Description">
              <Textarea
                value={settings.cta.description}
                onChange={(e) => patch({ cta: { ...settings.cta, description: e.target.value } })}
                rows={3}
                className="rounded-xl border-walnut-200 focus-visible:ring-gold resize-none"
              />
            </Field>
          </div>
        )}

        {section === "about" && (
          <div className="space-y-4 max-w-xl">
            <SectionTitle>About Page</SectionTitle>
            <Field label="Story title">
              <Input
                value={settings.about.storyTitle}
                onChange={(e) => patch({ about: { ...settings.about, storyTitle: e.target.value } })}
                className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </Field>
            <Field label="Story text">
              <Textarea
                value={settings.about.storyText}
                onChange={(e) => patch({ about: { ...settings.about, storyText: e.target.value } })}
                rows={6}
                className="rounded-xl border-walnut-200 focus-visible:ring-gold resize-none"
              />
            </Field>
            <ImageField
              value={settings.about.image}
              onChange={(image) => patch({ about: { ...settings.about, image } })}
              label="Story banner image"
              aspect="aspect-[2/1]"
            />
            <ImageField
              value={settings.about.showroomImage}
              onChange={(showroomImage) => patch({ about: { ...settings.about, showroomImage } })}
              label="Showroom image"
              aspect="aspect-[2/1]"
            />
          </div>
        )}

        {section === "social" && (
          <div className="space-y-4 max-w-xl">
            <SectionTitle>Social Links</SectionTitle>
            <Field label="Instagram URL" hint="Shown on the footer and gallery section when set">
              <Input
                value={settings.social.instagram}
                onChange={(e) => patch({ social: { ...settings.social, instagram: e.target.value } })}
                placeholder="https://instagram.com/…"
                className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </Field>
            <Field label="Facebook URL">
              <Input
                value={settings.social.facebook}
                onChange={(e) => patch({ social: { ...settings.social, facebook: e.target.value } })}
                placeholder="https://facebook.com/…"
                className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </Field>
            <Field label="Justdial / gallery URL" hint="Links to your business photo gallery">
              <Input
                value={settings.social.justdial}
                onChange={(e) => patch({ social: { ...settings.social, justdial: e.target.value } })}
                placeholder="https://justdial.com/…"
                className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </Field>
          </div>
        )}

        {section === "seo" && (
          <div className="space-y-4 max-w-xl">
            <SectionTitle>SEO Defaults</SectionTitle>
            <Field label="Page title">
              <Input
                value={settings.seo.title}
                onChange={(e) => patch({ seo: { ...settings.seo, title: e.target.value } })}
                className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold"
              />
            </Field>
            <Field label="Meta description">
              <Textarea
                value={settings.seo.description}
                onChange={(e) => patch({ seo: { ...settings.seo, description: e.target.value } })}
                rows={3}
                className="rounded-xl border-walnut-200 focus-visible:ring-gold resize-none"
              />
            </Field>
            <p className="text-xs text-muted-foreground">
              Full SEO metadata (Open Graph, sitemap, robots) is applied automatically site-wide.
            </p>
          </div>
        )}
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory shadow-xl shadow-walnut-900/30 px-8"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save All Changes
        </Button>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-xl text-walnut-900 pb-2 border-b border-walnut-100">{children}</h2>;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-sm font-medium text-walnut-900">{label}</Label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
