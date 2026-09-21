import { NextResponse } from "next/server";
import { getSiteData } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getSiteData();
    return NextResponse.json(data);
  } catch (e) {
    console.error("site data error", e);
    return NextResponse.json({ error: "Failed to load site data" }, { status: 500 });
  }
}
