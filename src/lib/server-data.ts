import { db } from "./db";
import { getSettings } from "./settings";
import { parseImages } from "./format";
import type { Category, Faq, GalleryImage, Product, SiteData, Testimonial } from "./types";

export function serializeProduct(
  p: {
    id: string; name: string; slug: string; categoryId: string | null;
    description: string | null; images: string; materials: string | null; dimensions: string | null;
    colors: string | null; price: number | null; badge: string | null; featured: boolean;
    active: boolean; sortOrder: number; createdAt: Date;
    category?: { name: string; slug: string } | null;
  }
): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryId: p.categoryId,
    categoryName: p.category?.name ?? null,
    categorySlug: p.category?.slug ?? null,
    description: p.description,
    images: parseImages(p.images),
    materials: p.materials,
    dimensions: p.dimensions,
    colors: p.colors,
    price: p.price,
    badge: p.badge,
    featured: p.featured,
    active: p.active,
    sortOrder: p.sortOrder,
    createdAt: p.createdAt.toISOString(),
  };
}

export function serializeCategory(c: {
  id: string; name: string; slug: string;
  description: string | null; image: string | null; sortOrder: number; active: boolean;
}): Category {
  return {
    id: c.id, name: c.name, slug: c.slug,
    description: c.description, image: c.image, sortOrder: c.sortOrder, active: c.active,
  };
}

export function serializeTestimonial(t: {
  id: string; name: string; location: string | null; rating: number;
  text: string; date: string | null; active: boolean; sortOrder: number;
}): Testimonial {
  return {
    id: t.id, name: t.name, location: t.location, rating: t.rating,
    text: t.text, date: t.date, active: t.active, sortOrder: t.sortOrder,
  };
}

export function serializeGallery(g: {
  id: string; title: string; url: string; category: string; sortOrder: number; active: boolean;
}): GalleryImage {
  return {
    id: g.id, title: g.title, url: g.url, category: g.category,
    sortOrder: g.sortOrder, active: g.active,
  };
}

export function serializeFaq(f: {
  id: string; question: string; answer: string; topic: string; sortOrder: number; active: boolean;
}): Faq {
  return {
    id: f.id, question: f.question, answer: f.answer, topic: f.topic,
    sortOrder: f.sortOrder, active: f.active,
  };
}

export async function getSiteData(): Promise<SiteData> {
  const [categories, products, testimonials, gallery, faqs, settings] = await Promise.all([
    db.category.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    db.product.findMany({
      where: { active: true },
      include: { category: { select: { name: true, slug: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    db.testimonial.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    db.galleryImage.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    db.faq.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    getSettings(),
  ]);

  return {
    settings,
    categories: categories.map(serializeCategory),
    products: products.map(serializeProduct),
    testimonials: testimonials.map(serializeTestimonial),
    gallery: gallery.map(serializeGallery),
    faqs: faqs.map(serializeFaq),
  };
}
