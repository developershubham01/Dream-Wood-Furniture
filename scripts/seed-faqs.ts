/**
 * Seed FAQs (idempotent) — Run: bun run scripts/seed-faqs.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const FAQS: { question: string; answer: string; topic: string; sortOrder: number }[] = [
  {
    question: "Do you deliver furniture across Navi Mumbai and Mumbai?",
    answer:
      "Yes — we deliver across Navi Mumbai, Mumbai and most of the MMR region. Delivery within Seawoods, Nerul, Belapur and Vashi is typically free; farther locations are quoted at actuals before you confirm the order. Our team also carries the piece upstairs and places it in the room of your choice.",
    topic: "Delivery",
    sortOrder: 1,
  },
  {
    question: "How long does a custom furniture order take?",
    answer:
      "Made-to-order pieces usually take 3–5 weeks from design approval, depending on the complexity and upholstery choices. We share material samples and a drawing with you before work begins, and we send progress photos while your piece is on the shop floor.",
    topic: "Custom",
    sortOrder: 2,
  },
  {
    question: "What woods and materials do you work with?",
    answer:
      "Our frames and carcasses are built from solid hardwoods — Sheesham, teak and acacia — with premium HDHMR boards for wardrobe interiors. Upholstery ranges from stain-resistant weaves to premium leathers, and finishes can be matched to your existing furniture.",
    topic: "Materials",
    sortOrder: 3,
  },
  {
    question: "Can I customise a piece I saw on this website?",
    answer:
      "Absolutely — almost every piece can be resized, re-finished or re-upholstered. Send us an enquiry from the product page with your requirements and our team will confirm what's possible along with an indicative price and timeline.",
    topic: "Custom",
    sortOrder: 4,
  },
  {
    question: "What warranty do you offer?",
    answer:
      "Solid-wood construction carries a 5-year warranty against manufacturing defects, while upholstery and hardware carry a 1-year warranty. Warranty terms are printed on your invoice — keep it safe for any service visits.",
    topic: "Orders",
    sortOrder: 5,
  },
  {
    question: "How do I place an order — do I pay online?",
    answer:
      "Orders are confirmed at the showroom or over a call with a booking advance; we don't take full payment online. You can build an enquiry list on this website and we'll call you back with a formal quotation before anything is booked.",
    topic: "Orders",
    sortOrder: 6,
  },
  {
    question: "How do I care for solid wood furniture?",
    answer:
      "Dust with a dry or slightly damp cotton cloth, keep pieces out of direct afternoon sun, and wipe spills promptly. A wax polish every 6–12 months keeps the sheen alive — we can recommend one suited to your finish.",
    topic: "Care",
    sortOrder: 7,
  },
  {
    question: "Can I visit the showroom before deciding?",
    answer:
      "Please do! We're at Balaji Tower, Seawoods West — open all days. Seeing the wood grains, finishes and upholstery in person is the best way to decide, and our team will happily walk you through customisation options.",
    topic: "General",
    sortOrder: 8,
  },
];

async function main() {
  const existing = await db.faq.count();
  if (existing > 0) {
    console.log(`FAQs already seeded (${existing}) — skipping.`);
    return;
  }
  await db.faq.createMany({ data: FAQS });
  console.log(`Seeded ${FAQS.length} FAQs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
