import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";

export const dynamic = "force-dynamic";

const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  nameHi: z.string().trim().max(120).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  description: z.string().trim().max(4000).optional().nullable(),
  images: z.array(z.string()).default([]),
  materials: z.string().trim().max(200).optional().nullable(),
  dimensions: z.string().trim().max(200).optional().nullable(),
  colors: z.string().trim().max(200).optional().nullable(),
  price: z.number().int().min(0).nullable().optional(),
  badge: z.string().trim().max(40).optional().nullable(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await db.product.findMany({
    include: { category: { select: { name: true, slug: true } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(
    products.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = productSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  let slug = slugify(d.name) || `product-${Date.now()}`;
  const exists = await db.product.findUnique({ where: { slug } });
  if (exists) slug = `${slug}-${Date.now().toString(36)}`;

  const maxOrder = await db.product.aggregate({ _max: { sortOrder: true } });

  const product = await db.product.create({
    data: {
      name: d.name,
      nameHi: d.nameHi ?? null,
      slug,
      categoryId: d.categoryId || null,
      description: d.description ?? null,
      images: JSON.stringify(d.images),
      materials: d.materials ?? null,
      dimensions: d.dimensions ?? null,
      colors: d.colors ?? null,
      price: d.price ?? null,
      badge: d.badge ?? null,
      featured: d.featured,
      active: d.active,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json({ ...product, createdAt: product.createdAt.toISOString() }, { status: 201 });
}
