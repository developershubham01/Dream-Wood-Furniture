import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const productPatchSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  nameHi: z.string().trim().max(120).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  description: z.string().trim().max(4000).optional().nullable(),
  images: z.array(z.string()).optional(),
  materials: z.string().trim().max(200).optional().nullable(),
  dimensions: z.string().trim().max(200).optional().nullable(),
  colors: z.string().trim().max(200).optional().nullable(),
  price: z.number().int().min(0).nullable().optional(),
  badge: z.string().trim().max(40).optional().nullable(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = productPatchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const d = parsed.data;

  const data: Record<string, unknown> = {};
  if (d.name !== undefined) data.name = d.name;
  if (d.nameHi !== undefined) data.nameHi = d.nameHi;
  if (d.categoryId !== undefined) data.categoryId = d.categoryId || null;
  if (d.description !== undefined) data.description = d.description;
  if (d.images !== undefined) data.images = JSON.stringify(d.images);
  if (d.materials !== undefined) data.materials = d.materials;
  if (d.dimensions !== undefined) data.dimensions = d.dimensions;
  if (d.colors !== undefined) data.colors = d.colors;
  if (d.price !== undefined) data.price = d.price;
  if (d.badge !== undefined) data.badge = d.badge;
  if (d.featured !== undefined) data.featured = d.featured;
  if (d.active !== undefined) data.active = d.active;
  if (d.sortOrder !== undefined) data.sortOrder = d.sortOrder;

  try {
    const product = await db.product.update({ where: { id }, data });
    return NextResponse.json({ ...product, createdAt: product.createdAt.toISOString() });
  } catch {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await db.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
}
