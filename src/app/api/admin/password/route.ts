import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdmin, hashPassword, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

const changeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = changeSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  if (!verifyPassword(parsed.data.currentPassword, admin.passwordHash)) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }
  await db.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash: hashPassword(parsed.data.newPassword) },
  });
  return NextResponse.json({ ok: true });
}
