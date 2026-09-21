import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getSettings, saveSettings, DEFAULT_SETTINGS } from "@/lib/settings";
import type { SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const patch = (await req.json()) as Partial<SiteSettings>;
    const settings = await saveSettings(patch);
    return NextResponse.json(settings);
  } catch (e) {
    console.error("settings save error", e);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}

export async function DELETE() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await saveSettings(DEFAULT_SETTINGS);
  return NextResponse.json({ ok: true, settings });
}
