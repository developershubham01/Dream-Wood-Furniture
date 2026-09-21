import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const faqSchema = z.object({
  question: z.string().trim().min(6).max(200),
  answer: z.string().trim().min(10).max(2000),
  topic: z.string().trim().max(40).default("General"),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const faqs = await db.faq.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(faqs);
}

export async function POST(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = faqSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const d = parsed.data;
  const maxOrder = await db.faq.aggregate({ _max: { sortOrder: true } });

  const faq = await db.faq.create({
    data: { ...d, sortOrder: d.sortOrder || (maxOrder._max.sortOrder ?? 0) + 1 },
  });
  return NextResponse.json(faq, { status: 201 });
}
