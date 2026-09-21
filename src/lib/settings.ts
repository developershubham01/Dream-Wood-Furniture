import { db } from "./db";
import type { SiteSettings } from "./types";

export const SETTINGS_KEY = "site";

export const DEFAULT_SETTINGS: SiteSettings = {
  announcement: {
    enabled: true,
    text: "Crafting Beautiful Spaces, One Piece at a Time.",
  },
  hero: {
    eyebrow: "Seawoods · Navi Mumbai",
    heading: "Furniture That Makes Your Space Feel Like Home.",
    subheading:
      "Discover thoughtfully designed furniture that brings comfort, character, and timeless beauty to every room.",
    image: "/images/hero.png",
    primaryCta: "Explore Collection",
    secondaryCta: "Visit Our Showroom",
  },
  custom: {
    heading: "Your Vision. Our Craftsmanship.",
    description:
      "Have a unique idea for your space? Talk to us about furniture designed around your needs — made to measure, made to last.",
    image: "/images/custom-banner.png",
    ctaLabel: "Request Custom Furniture",
  },
  contact: {
    phone: "097025 33626",
    phoneDisplay: "097025 33626",
    whatsapp: "919702533626",
    email: "",
    addressLine1: "Shop No. 9/10, Balaji Tower",
    addressLine2: "Seawoods West, Sector 42, Seawoods",
    addressLine3: "Navi Mumbai, Maharashtra – 400706",
    hours: "Open Daily · Closes 10 PM",
    openTime: "10:30",
    closeTime: "22:00",
    mapsQuery: "Dream Wood Furniture Balaji Tower Seawoods West Navi Mumbai",
  },
  rating: { value: 4.8, count: 204, label: "Google Rating" },
  social: { instagram: "", facebook: "", justdial: "" },
  cta: {
    heading: "Let's Create Your Dream Space.",
    description:
      "Walk into our Seawoods showroom, or send us an enquiry — our team will help you find (or craft) furniture that feels like it was made for your home.",
  },
  about: {
    storyTitle: "A neighbourhood showroom with a craftsman's heart",
    storyText:
      "Dream Wood Furniture began with a simple belief — good furniture should feel personal. From our showroom in Seawoods, Navi Mumbai, we bring together thoughtfully designed pieces, honest materials, and the option to customise every detail to your space. Whether you're furnishing a new home or reimagining a single room, our team is here to help you do it beautifully.",
    image: "/images/about-story.png",
    showroomImage: "/images/showroom.png",
  },
  seo: {
    title: "Dream Wood Furniture | Premium Furniture Showroom in Seawoods, Navi Mumbai",
    description:
      "Thoughtfully designed sofas, beds, wardrobes, dining sets and custom furniture. Showroom at Balaji Tower, Seawoods West, Navi Mumbai. Rated 4.8/5.",
  },
};

function deepMerge<T>(base: T, patch: unknown): T {
  if (patch === null || patch === undefined) return base;
  if (typeof base !== "object" || Array.isArray(base) || typeof patch !== "object" || Array.isArray(patch)) {
    return patch as T;
  }
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(patch as Record<string, unknown>)) {
    const baseVal = (base as Record<string, unknown>)[key];
    const patchVal = (patch as Record<string, unknown>)[key];
    if (baseVal && typeof baseVal === "object" && !Array.isArray(baseVal) && patchVal && typeof patchVal === "object" && !Array.isArray(patchVal)) {
      out[key] = deepMerge(baseVal, patchVal);
    } else {
      out[key] = patchVal;
    }
  }
  return out as T;
}

export async function getSettings(): Promise<SiteSettings> {
  const row = await db.siteSetting.findUnique({ where: { key: SETTINGS_KEY } });
  if (!row) return DEFAULT_SETTINGS;
  try {
    return deepMerge(DEFAULT_SETTINGS, JSON.parse(row.value));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSettings();
  const next = deepMerge(current, patch);
  await db.siteSetting.upsert({
    where: { key: SETTINGS_KEY },
    update: { value: JSON.stringify(next) },
    create: { key: SETTINGS_KEY, value: JSON.stringify(next) },
  });
  return next;
}
