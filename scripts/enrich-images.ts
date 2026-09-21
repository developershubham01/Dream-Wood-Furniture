/* One-off: give each product a 2-3 image gallery using existing assets
   (own photo + category room shot + sibling product photo).
   Safe to re-run — skips products that already have 2+ images. */
import { db } from "@/lib/db";

async function main() {
  const products = await db.product.findMany({
    include: { category: { select: { image: true, slug: true } } },
    orderBy: { sortOrder: "asc" },
  });

  const byCategory = new Map<string, typeof products>();
  for (const p of products) {
    const key = p.categoryId ?? "none";
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(p);
  }

  let updated = 0;
  for (const p of products) {
    const current: string[] = JSON.parse(p.images || "[]");
    if (current.length >= 2) continue; // already has a gallery

    const gallery = [...current];
    // 2nd image: category room shot (different file than the cover)
    const catImg = p.category?.image;
    if (catImg && !gallery.includes(catImg)) gallery.push(catImg);
    // 3rd image: a sibling product photo from the same category
    const siblings = byCategory.get(p.categoryId ?? "none") ?? [];
    const sibling = siblings.find((s) => s.id !== p.id && s.slug !== p.slug);
    if (sibling) {
      const sImg = JSON.parse(sibling.images || "[]")[0];
      if (sImg && !gallery.includes(sImg)) gallery.push(sImg);
    }

    if (gallery.length > 1) {
      await db.product.update({
        where: { id: p.id },
        data: { images: JSON.stringify(gallery.slice(0, 3)) },
      });
      updated++;
      console.log(`${p.slug}: ${gallery.length} images`);
    }
  }
  console.log(`\nEnriched ${updated} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
