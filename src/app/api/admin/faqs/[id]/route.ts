import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  question: z.string().trim().min(6).max(200).optional(),
  answer: z.string().trim().min(10).max(2000).optional(),
  topic: z.string().trim().max(40).optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  try {
    const faq = await db.faq.update({ where: { id }, data: parsed.data });
    return NextResponse.json(faq);
  } catch {
    return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await db.faq.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
  }
}
