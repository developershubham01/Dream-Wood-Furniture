import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";

export const dynamic = "force-dynamic";

const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(500).optional().nullable(),
  image: z.string().trim().max(400).optional().nullable(),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(
    categories.map((c) => ({ ...c, productCount: c._count.products }))
  );
}

export async function POST(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = categorySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const d = parsed.data;

  let slug = slugify(d.name) || `category-${Date.now()}`;
  const exists = await db.category.findUnique({ where: { slug } });
  if (exists) slug = `${slug}-${Date.now().toString(36)}`;

  const category = await db.category.create({
    data: {
      name: d.name,
      description: d.description ?? null,
      image: d.image ?? null,
      slug,
      sortOrder: d.sortOrder,
      active: d.active,
    },
  });
  return NextResponse.json(category, { status: 201 });
}
