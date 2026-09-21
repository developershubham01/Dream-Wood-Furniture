import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    totalProducts,
    activeProducts,
    featuredProducts,
    totalCategories,
    newEnquiries,
    pendingEnquiries,
    totalEnquiries,
    galleryImages,
    testimonials,
    allCategories,
    activeGalleryImages,
    activeTestimonials,
    totalFaqs,
    activeFaqs,
  ] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { active: true } }),
    db.product.count({ where: { featured: true, active: true } }),
    db.category.count({ where: { active: true } }),
    db.enquiry.count({ where: { status: "new" } }),
    db.enquiry.count({ where: { status: { in: ["new", "contacted"] } } }),
    db.enquiry.count(),
    db.galleryImage.count(),
    db.testimonial.count(),
    db.category.count(),
    db.galleryImage.count({ where: { active: true } }),
    db.testimonial.count({ where: { active: true } }),
    db.faq.count(),
    db.faq.count({ where: { active: true } }),
  ]);

  const since30 = new Date();
  since30.setDate(since30.getDate() - 29);
  since30.setHours(0, 0, 0, 0);
  const since7 = new Date();
  since7.setDate(since7.getDate() - 6);
  since7.setHours(0, 0, 0, 0);
  const since24h = new Date();
  since24h.setDate(since24h.getDate() - 1);

  const [recentEnquiries, enquiries30, statusGroups, sourceGroups, wonCount, last24h, thisWeekCount, thisMonthCount, categoryCounts] =
    await Promise.all([
      db.enquiry.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      db.enquiry.findMany({
        where: { createdAt: { gte: since30 } },
        select: { createdAt: true },
      }),
      db.enquiry.groupBy({ by: ["status"], _count: { _all: true } }),
      db.enquiry.groupBy({ by: ["source"], _count: { _all: true } }),
      db.enquiry.count({ where: { status: "won" } }),
      db.enquiry.count({ where: { createdAt: { gte: since24h } } }),
      db.enquiry.count({ where: { createdAt: { gte: since7 } } }),
      db.enquiry.count({ where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
      db.category.findMany({
        where: { active: true },
        select: { name: true, _count: { select: { products: { where: { active: true } } } } },
        orderBy: { products: { _count: "desc" } },
        take: 5,
      }),
    ]);

  // Build 30-day trend series (fill gaps with 0)
  const countsByDay = new Map<string, number>();
  for (const e of enquiries30) {
    const k = dayKey(e.createdAt);
    countsByDay.set(k, (countsByDay.get(k) ?? 0) + 1);
  }
  const trend: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    trend.push({ date: k, count: countsByDay.get(k) ?? 0 });
  }

  const statusMap: Record<string, number> = {};
  for (const g of statusGroups) statusMap[g.status] = g._count._all;
  const sourceMap: Record<string, number> = {};
  for (const g of sourceGroups) sourceMap[g.source] = g._count._all;

  return NextResponse.json({
    totalProducts,
    activeProducts,
    featuredProducts,
    totalCategories,
    newEnquiries,
    pendingEnquiries,
    totalEnquiries,
    galleryImages,
    testimonials,
    // Note: top-level totalCategories counts ACTIVE categories only (legacy field)
    content: {
      products: { total: totalProducts, active: activeProducts },
      categories: { total: allCategories, active: totalCategories },
      gallery: { total: galleryImages, active: activeGalleryImages },
      testimonials: { total: testimonials, active: activeTestimonials },
      faqs: { total: totalFaqs, active: activeFaqs },
    },
    analytics: {
      trend,
      statusMap,
      sourceMap,
      wonCount,
      last24h,
      thisWeekCount,
      thisMonthCount,
      wonRate: totalEnquiries > 0 ? Math.round((wonCount / totalEnquiries) * 100) : 0,
      topCategories: categoryCounts.map((c) => ({
        name: c.name,
        count: c._count.products,
      })),
    },
    recentEnquiries: recentEnquiries.map((e) => ({
      id: e.id,
      name: e.name,
      phone: e.phone,
      furnitureType: e.furnitureType,
      status: e.status,
      source: e.source,
      createdAt: e.createdAt.toISOString(),
    })),
  });
}
