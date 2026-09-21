import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(60),
  password: z.string().min(1).max(120),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }
    const admin = await db.adminUser.findUnique({ where: { username: parsed.data.username } });
    if (!admin || !verifyPassword(parsed.data.password, admin.passwordHash)) {
      return NextResponse.json({ error: "Incorrect username or password" }, { status: 401 });
    }
    await createSession(admin.id);
    return NextResponse.json({
      ok: true,
      admin: { username: admin.username, displayName: admin.displayName, role: admin.role },
    });
  } catch (e) {
    console.error("login error", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
