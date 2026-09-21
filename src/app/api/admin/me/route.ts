import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ admin: null }, { status: 200 });
  return NextResponse.json({
    admin: { username: admin.username, displayName: admin.displayName, role: admin.role },
  });
}
