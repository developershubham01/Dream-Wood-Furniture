import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const testimonialSchema = z.object({
  name: z.string().trim().min(2).max(80),
  location: z.string().trim().max(80).optional().nullable(),
  rating: z.number().int().min(1).max(5).default(5),
  text: z.string().trim().min(10).max(1000),
  date: z.string().trim().max(40).optional().nullable(),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const testimonials = await db.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(testimonials);
}

export async function POST(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = testimonialSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const d = parsed.data;
  const maxOrder = await db.testimonial.aggregate({ _max: { sortOrder: true } });

  const testimonial = await db.testimonial.create({
    data: { ...d, location: d.location ?? null, date: d.date ?? null, sortOrder: (maxOrder._max.sortOrder ?? 0) + 1 },
  });
  return NextResponse.json(testimonial, { status: 201 });
}
