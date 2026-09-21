import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91[-\s]?)?[0]?[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  email: z.string().trim().email("Please enter a valid email").max(120).optional().or(z.literal("")),
  furnitureType: z.string().trim().max(80).optional().or(z.literal("")),
  material: z.string().trim().max(80).optional().or(z.literal("")),
  size: z.string().trim().max(120).optional().or(z.literal("")),
  budget: z.string().trim().max(80).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  referenceNote: z.string().trim().max(500).optional().or(z.literal("")),
  contactMethod: z.enum(["phone", "whatsapp", "email"]).default("phone"),
  source: z.enum(["custom-form", "product-quote", "general"]).default("custom-form"),
  items: z
    .array(
      z.object({
        productId: z.string().optional().nullable(),
        productName: z.string().optional().nullable(),
        quantity: z.number().int().min(1).max(20).default(1),
      })
    )
    .default([]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = enquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const d = parsed.data;

    const enquiry = await db.enquiry.create({
      data: {
        name: d.name,
        phone: d.phone,
        email: d.email || null,
        furnitureType: d.furnitureType || null,
        material: d.material || null,
        size: d.size || null,
        budget: d.budget || null,
        description: d.description || null,
        referenceNote: d.referenceNote || null,
        contactMethod: d.contactMethod,
        source: d.source,
        items: {
          create: d.items
            .filter((i) => i.productName || i.productId)
            .map((i) => ({
              productId: i.productId ?? null,
              productName: i.productName ?? null,
              quantity: i.quantity,
            })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ ok: true, id: enquiry.id }, { status: 201 });
  } catch (e) {
    console.error("enquiry error", e);
    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 });
  }
}
