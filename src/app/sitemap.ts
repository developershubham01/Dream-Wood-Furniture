import type { MetadataRoute } from "next";

/**
 * Single-page storefront — hash routes (#shop, #product/… ) are client-side
 * views, so crawlers only ever see one real URL. Keep the sitemap minimal and
 * accurate; set NEXT_PUBLIC_SITE_URL at deploy time to the production domain.
 */
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
