import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.enum(["new", "contacted", "quoted", "won", "archived"]).optional(),
  internalNotes: z.string().trim().max(2000).optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const d = parsed.data;

  const data: Record<string, unknown> = {};
  if (d.status !== undefined) data.status = d.status;
  if (d.internalNotes !== undefined) data.internalNotes = d.internalNotes;

  try {
    const enquiry = await db.enquiry.update({
      where: { id },
      data,
      include: { items: true },
    });
    return NextResponse.json({
      ...enquiry,
      createdAt: enquiry.createdAt.toISOString(),
      updatedAt: enquiry.updatedAt.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await db.enquiry.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
  }
}
