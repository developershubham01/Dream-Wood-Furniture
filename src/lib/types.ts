// ─── Dream Wood Furniture — shared types ──────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  description: string | null;
  images: string[];
  materials: string | null;
  dimensions: string | null;
  colors: string | null;
  price: number | null;
  badge: string | null;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  rating: number;
  text: string;
  date: string | null;
  active: boolean;
  sortOrder: number;
}

export interface GalleryImage {
  id: string;
  title: string;
  url: string;
  category: string;
  sortOrder: number;
  active: boolean;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  topic: string;
  sortOrder: number;
  active: boolean;
}

export type EnquiryStatus = "new" | "contacted" | "quoted" | "won" | "archived";

export interface EnquiryItem {
  id?: string;
  productId: string | null;
  productName: string | null;
  quantity: number;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  furnitureType: string | null;
  material: string | null;
  size: string | null;
  budget: string | null;
  description: string | null;
  referenceNote: string | null;
  contactMethod: string;
  source: string;
  status: EnquiryStatus;
  internalNotes: string | null;
  createdAt: string;
  items: EnquiryItem[];
}

export interface SiteSettings {
  announcement: { enabled: boolean; text: string };
  hero: {
    eyebrow: string;
    heading: string;
    subheading: string;
    image: string;
    primaryCta: string;
    secondaryCta: string;
  };
  custom: {
    heading: string;
    description: string;
    image: string;
    ctaLabel: string;
  };
  contact: {
    phone: string;
    phoneDisplay: string;
    whatsapp: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    hours: string;
    /** 24h "HH:MM" local showroom opening time (drives the live Open Now badge) */
    openTime: string;
    /** 24h "HH:MM" local showroom closing time */
    closeTime: string;
    mapsQuery: string;
  };
  rating: { value: number; count: number; label: string };
  cta: { heading: string; description: string };
  social: { instagram: string; facebook: string; justdial: string };
  about: {
    storyTitle: string;
    storyText: string;
    image: string;
    showroomImage: string;
  };
  seo: { title: string; description: string };
}

export interface SiteData {
  settings: SiteSettings;
  categories: Category[];
  products: Product[];
  testimonials: Testimonial[];
  gallery: GalleryImage[];
  faqs: Faq[];
}

// Client-side view routing (single-page experience)
export type View =
  | { name: "home" }
  | { name: "shop"; category?: string; query?: string }
  | { name: "product"; slug: string }
  | { name: "custom" }
  | { name: "about" }
  | { name: "contact" }
  | { name: "wishlist" }
  | { name: "admin" };
