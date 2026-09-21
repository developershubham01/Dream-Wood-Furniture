/**
 * Dream Wood Furniture — database seeder (idempotent)
 * Run: bun run scripts/seed.ts
 */
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const db = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "dreamwood2025";

async function main() {
  // ── Admin user ──
  await db.adminUser.upsert({
    where: { username: ADMIN_USERNAME },
    update: {},
    create: {
      username: ADMIN_USERNAME,
      passwordHash: hashPassword(ADMIN_PASSWORD),
      displayName: "Dream Wood Admin",
      role: "admin",
    },
  });
  console.log("✔ admin user ready (admin / dreamwood2025)");

  // ── Categories ──
  const categories = [
    { name: "Living Room", nameHi: "लिविंग रूम", slug: "living-room", image: "/images/cat-living.png", sortOrder: 1, description: "Sofas, accent chairs and statement pieces that anchor your living space." },
    { name: "Sofas", nameHi: "सोफ़ा", slug: "sofas", image: "/images/cat-sofas.png", sortOrder: 2, description: "Fabric, leather and sectional sofas crafted for everyday comfort." },
    { name: "Beds", nameHi: "बेड", slug: "beds", image: "/images/cat-beds.png", sortOrder: 3, description: "Solid wood beds with upholstered and woven headboards." },
    { name: "Wardrobes", nameHi: "अलमारी", slug: "wardrobes", image: "/images/cat-wardrobes.png", sortOrder: 4, description: "Spacious wardrobes with mirror panels and smart storage." },
    { name: "Dining Room", nameHi: "डाइनिंग रूम", slug: "dining-room", image: "/images/cat-dining.png", sortOrder: 5, description: "Dining tables and chairs that bring people together." },
    { name: "TV Units", nameHi: "टीवी यूनिट", slug: "tv-units", image: "/images/cat-tv.png", sortOrder: 6, description: "Wall-mounted and console TV units for tidy media walls." },
    { name: "Coffee Tables", nameHi: "कॉफी टेबल", slug: "coffee-tables", image: "/images/cat-coffee.png", sortOrder: 7, description: "Sculptural centre tables in wood and stone." },
    { name: "Study Tables", nameHi: "स्टडी टेबल", slug: "study-tables", image: "/images/cat-study.png", sortOrder: 8, description: "Desks and work-from-home setups that stay organised." },
    { name: "Custom Furniture", nameHi: "कस्टम फर्निचर", slug: "custom-furniture", image: "/images/cat-custom.png", sortOrder: 9, description: "Made-to-measure furniture designed around your space." },
  ];

  for (const c of categories) {
    await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, nameHi: c.nameHi, image: c.image, description: c.description, sortOrder: c.sortOrder },
      create: { ...c, active: true },
    });
  }
  console.log(`✔ ${categories.length} categories`);

  const cat = (slug: string) => db.category.findUnique({ where: { slug } });

  // ── Products (demo catalogue — replace from admin) ──
  const products: Array<{
    name: string; nameHi?: string; slug: string; catSlug: string; image: string;
    price: number | null; badge?: string; featured?: boolean;
    materials: string; dimensions: string; colors: string; description: string;
  }> = [
    {
      name: "Aarav 3-Seater Sofa", nameHi: "आरव 3-सीटर सोफा", slug: "aarav-3-seater-sofa", catSlug: "sofas", image: "/images/p-sofa-1.png",
      price: 58900, badge: "Bestseller", featured: true,
      materials: "Solid Sheesham wood frame, premium linen upholstery",
      dimensions: "L 198 × D 88 × H 84 cm · Seat height 45 cm",
      colors: "Beige, Charcoal, Terracotta",
      description: "A generously proportioned three-seater with a solid wood frame and soft linen-look upholstery. Clean lines, tapered legs and deep cushions make it an easy anchor for family living rooms. Custom sizes and fabrics available on request.",
    },
    {
      name: "Regal Chesterfield 2-Seater", nameHi: "रीगल चेस्टरफील्ड 2-सीटर", slug: "regal-chesterfield-2-seater", catSlug: "sofas", image: "/images/p-sofa-2.png",
      price: 74500, badge: "Premium",
      materials: "Hardwood frame, top-grain leather upholstery",
      dimensions: "L 152 × D 86 × H 88 cm",
      colors: "Tan, Espresso, Black",
      description: "Deep button tufting and rolled arms give this two-seater its classic character, while compact proportions suit apartments. A quiet statement piece for reading corners and study rooms.",
    },
    {
      name: "Meridian L-Shaped Sectional", nameHi: "मेरिडियन एल-शेप्ड सोफा", slug: "meridian-l-shaped-sectional", catSlug: "sofas", image: "/images/p-sofa-3.png",
      price: 89900, featured: true,
      materials: "Solid wood frame, high-resilience foam, woven fabric",
      dimensions: "L 268 × W 168 × H 82 cm",
      colors: "Warm Grey, Oatmeal, Walnut",
      description: "A plush L-shaped sectional with a chaise for stretching out. Detachable covers and reversible chaise orientation can be configured at the showroom.",
    },
    {
      name: "Windsor King Bed", nameHi: "विंडसर किंग बेड", slug: "windsor-king-bed", catSlug: "beds", image: "/images/p-bed-1.png",
      price: 72000, badge: "Bestseller", featured: true,
      materials: "Solid walnut-finished wood, upholstered headboard",
      dimensions: "L 213 × W 195 × H 110 cm (King)",
      colors: "Walnut, Ivory headboard",
      description: "A calm, centred bedroom begins with a bed like Windsor — a tall cushioned headboard framed in solid wood, with a low platform base. Storage and hydraulic-lift options available on request.",
    },
    {
      name: "Rattan Queen Bed", nameHi: "रैटन क्वीन बेड", slug: "rattan-queen-bed", catSlug: "beds", image: "/images/p-bed-2.png",
      price: 52500,
      materials: "Solid wood with woven rattan headboard panel",
      dimensions: "L 208 × W 156 × H 105 cm (Queen)",
      colors: "Honey Walnut, Natural",
      description: "Light, airy and quietly tropical. The woven rattan headboard adds texture without weight — a favourite for guest rooms and sunlit bedrooms.",
    },
    {
      name: "Aster 3-Door Wardrobe", nameHi: "एस्टर 3-डोर अलमारी", slug: "aster-3-door-wardrobe", catSlug: "wardrobes", image: "/images/p-ward-1.png",
      price: 68000,
      materials: "Engineered wood core with premium laminate finish, mirror panel",
      dimensions: "W 180 × D 60 × H 210 cm",
      colors: "Walnut, Wenge",
      description: "Three doors, a full-height mirror and a mix of hanging, shelving and drawer storage. Interior layout can be customised to your wardrobe habits.",
    },
    {
      name: "Nova 2-Door Mirror Wardrobe", nameHi: "नोवा 2-डोर अलमारी", slug: "nova-2-door-mirror-wardrobe", catSlug: "wardrobes", image: "/images/p-ward-2.png",
      price: 45900, badge: "New",
      materials: "Pre-laminated board, full-length mirror, soft-close hinges",
      dimensions: "W 122 × D 58 × H 205 cm",
      colors: "Honey Oak, Walnut",
      description: "A compact two-door wardrobe with a full-length mirror front — ideal for bedrooms where space is at a premium. Soft-close hardware throughout.",
    },
    {
      name: "Harvest 6-Seater Dining Set", nameHi: "हार्वेस्ट 6-सीटर डाइनिंग सेट", slug: "harvest-6-seater-dining-set", catSlug: "dining-room", image: "/images/p-dine-1.png",
      price: 96500, featured: true,
      materials: "Solid Sheesham wood, upholstered chairs",
      dimensions: "Table: L 180 × W 90 × H 76 cm · 6 chairs",
      colors: "Walnut stain, Beige upholstery",
      description: "A warm, substantial dining table for long meals and longer conversations. The set includes six cushioned chairs; chair upholstery can be selected at the showroom.",
    },
    {
      name: "Circle 4-Seater Round Dining", nameHi: "सर्कल 4-सीटर राउंड डाइनिंग", slug: "circle-4-seater-round-dining", catSlug: "dining-room", image: "/images/p-dine-2.png",
      price: 54000,
      materials: "Solid wood top and legs",
      dimensions: "Table: Ø 110 × H 75 cm · 4 chairs",
      colors: "Warm Walnut",
      description: "A round table that keeps conversations circular. Perfect for compact dining areas and open-plan kitchens.",
    },
    {
      name: "Float Wall-Mounted TV Unit", nameHi: "फ्लोट वॉल-माउंटेड टीवी यूनिट", slug: "float-wall-mounted-tv-unit", catSlug: "tv-units", image: "/images/p-tv-1.png",
      price: 28900, badge: "Customisable",
      materials: "Premium laminate on engineered wood, fluted fronts",
      dimensions: "W 180 × D 35 × H 45 cm",
      colors: "Walnut, Charcoal",
      description: "A floating media console with fluted drawer fronts and open shelves for set-top boxes and soundbars. Made-to-size for your wall — share your TV size and wall dimensions with us.",
    },
    {
      name: "Console Low TV Unit", nameHi: "कंसोल लो टीवी यूनिट", slug: "console-low-tv-unit", catSlug: "tv-units", image: "/images/p-tv-2.png",
      price: 24500,
      materials: "Engineered wood with laminate finish, brass pulls",
      dimensions: "W 160 × D 40 × H 50 cm",
      colors: "Walnut",
      description: "Four deep drawers keep remotes, cables and game consoles out of sight. Brass pulls add a quiet touch of warmth.",
    },
    {
      name: "Westport Walnut Coffee Table", nameHi: "वेस्टपोर्ट कॉफी टेबल", slug: "westport-walnut-coffee-table", catSlug: "coffee-tables", image: "/images/p-coffee-1.png",
      price: 14900, featured: true,
      materials: "Solid walnut wood",
      dimensions: "L 120 × W 60 × H 42 cm",
      colors: "Natural Walnut",
      description: "Rounded edges, tapered mid-century legs and a warm walnut finish. A quiet centrepiece that lets your sofa do the talking.",
    },
    {
      name: "Halo Travertine Coffee Table", nameHi: "हेलो ट्रैवरटाइन टेबल", slug: "halo-travertine-coffee-table", catSlug: "coffee-tables", image: "/images/p-coffee-2.png",
      price: 21000, badge: "New",
      materials: "Travertine stone top, solid oak base",
      dimensions: "Ø 90 × H 40 cm",
      colors: "Ivory Stone, Oak",
      description: "A sculptural round table pairing a natural stone top with a solid oak base. Each stone top has unique veining.",
    },
    {
      name: "Scholar Study Desk", nameHi: "स्कॉलर स्टडी टेबल", slug: "scholar-study-desk", catSlug: "study-tables", image: "/images/p-study-1.png",
      price: 18500,
      materials: "Engineered wood with laminate, brass hardware",
      dimensions: "W 120 × D 60 × H 75 cm",
      colors: "Walnut",
      description: "Three smooth-glide drawers and an attached hutch keep books and files within reach. Cable ports keep work-from-home setups tidy.",
    },
    {
      name: "Terra Accent Armchair", nameHi: "टेरा एक्सेंट चेयर", slug: "terra-accent-armchair", catSlug: "living-room", image: "/images/p-chair-1.png",
      price: 16900, featured: true,
      materials: "Solid walnut frame, boucle upholstery",
      dimensions: "W 72 × D 78 × H 82 cm",
      colors: "Terracotta, Oatmeal, Forest",
      description: "A cosy reading chair with curved armrests and a soft boucle seat. Moves easily from living room to bedroom.",
    },
    {
      name: "Ladder 5-Shelf Bookcase", nameHi: "लैडर 5-शेल्फ बुककेस", slug: "ladder-5-shelf-bookcase", catSlug: "living-room", image: "/images/p-shelf-1.png",
      price: null,
      materials: "Solid wood framework",
      dimensions: "W 80 × D 34 × H 180 cm",
      colors: "Walnut, Natural",
      description: "Five open shelves for books, plants and objects collected over time. Request a quote for the finish and size that suits your wall.",
    },
    {
      name: "Bespoke Headboard & Bed Combo", nameHi: "कस्टम हेडबोर्ड और बेड", slug: "bespoke-headboard-bed-combo", catSlug: "custom-furniture", image: "/images/g-8.png",
      price: null, badge: "Made to Order",
      materials: "Configurable — solid wood, upholstery, cane",
      dimensions: "Made to measure",
      colors: "Your choice of finishes",
      description: "Designed around your bedroom's proportions, style and storage needs. Visit the showroom or send an enquiry — we'll walk you through material samples and create a piece that's exclusively yours.",
    },
  ];

  let order = 0;
  for (const p of products) {
    const category = await cat(p.catSlug);
    await db.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name, nameHi: p.nameHi ?? null, categoryId: category?.id ?? null,
        description: p.description, images: JSON.stringify([p.image]),
        materials: p.materials, dimensions: p.dimensions, colors: p.colors,
        price: p.price, badge: p.badge ?? null, featured: p.featured ?? false,
        sortOrder: order,
      },
      create: {
        name: p.name, nameHi: p.nameHi ?? null, slug: p.slug, categoryId: category?.id ?? null,
        description: p.description, images: JSON.stringify([p.image]),
        materials: p.materials, dimensions: p.dimensions, colors: p.colors,
        price: p.price, badge: p.badge ?? null, featured: p.featured ?? false,
        active: true, sortOrder: order,
      },
    });
    order++;
  }
  console.log(`✔ ${products.length} products`);

  // ── Testimonials (sample placeholders — replace with verified reviews from admin) ──
  const testimonials = [
    { name: "Priya Sharma", location: "Nerul", rating: 5, date: "Recent", text: "We bought a king bed and a study table from Dream Wood. The finish is lovely and the team helped us match the exact walnut shade to our existing furniture. Delivery was smooth." },
    { name: "Rahul Menon", location: "Seawoods", rating: 5, date: "Recent", text: "Excellent showroom experience. They patiently walked us through fabric options for our L-shaped sofa and never pushed anything beyond our budget. The custom piece fits our living room perfectly." },
    { name: "Anjali & Karan", location: "Kharghar", rating: 5, date: "Recent", text: "Good quality and honest pricing. Our dining set is the centrepiece of the house now. They even followed up after delivery to make sure everything was fine." },
    { name: "Suresh Nair", location: "Vashi", rating: 5, date: "Recent", text: "Got a made-to-size TV unit for an odd wall in my flat. Measurements, finish and installation were all handled professionally. Recommended for custom work." },
    { name: "Meera Iyer", location: "Belapur", rating: 5, date: "Recent", text: "A refreshing change from big-brand stores. Real wood, real people, and they remember you when you walk in a second time. My wardrobe's interior layout was customised exactly as asked." },
    { name: "Aditya Rane", location: "Panvel", rating: 5, date: "Recent", text: "Bought a sofa and coffee table. Solid construction and the cushions still feel new after months of daily use. Showroom is easy to reach in Seawoods." },
  ];

  const existingTestimonials = await db.testimonial.count();
  if (existingTestimonials === 0) {
    let tOrder = 0;
    for (const t of testimonials) {
      await db.testimonial.create({
        data: {
          name: t.name, location: t.location, rating: Math.round(t.rating), text: t.text,
          date: t.date, active: true, sortOrder: tOrder,
        },
      });
      tOrder++;
    }
    console.log(`✔ ${testimonials.length} testimonials`);
  } else {
    console.log("• testimonials already present, skipping");
  }

  // ── Gallery ──
  const gallery = [
    { title: "Warm living room styling", url: "/images/g-1.png", category: "Living Room" },
    { title: "Serene bedroom in walnut", url: "/images/g-2.png", category: "Bedroom" },
    { title: "Dining corner, set for dinner", url: "/images/g-3.png", category: "Dining" },
    { title: "Fluted wardrobe detail", url: "/images/g-4.png", category: "Wardrobes" },
    { title: "Fabric and wood, up close", url: "/images/g-5.png", category: "Sofas" },
    { title: "Inside our showroom", url: "/images/g-6.png", category: "Showroom" },
    { title: "Coffee table vignette", url: "/images/g-7.png", category: "Coffee Tables" },
    { title: "Custom headboard in progress", url: "/images/g-8.png", category: "Custom" },
  ];

  const existingGallery = await db.galleryImage.count();
  if (existingGallery === 0) {
    let gOrder = 0;
    for (const g of gallery) {
      await db.galleryImage.create({ data: { ...g, active: true, sortOrder: gOrder } });
      gOrder++;
    }
    console.log(`✔ ${gallery.length} gallery images`);
  } else {
    console.log("• gallery already present, skipping");
  }

  console.log("SEED COMPLETE");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
