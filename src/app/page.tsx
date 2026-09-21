import { getSiteData } from "@/lib/server-data";
import { SiteApp } from "@/components/site/site-app";

export const dynamic = "force-dynamic";

export default async function Page() {
  let initialData;
  try {
    initialData = await getSiteData();
  } catch (e) {
    console.error("Failed to load site data", e);
    initialData = {
      settings: (await import("@/lib/settings")).DEFAULT_SETTINGS,
      categories: [],
      products: [],
      testimonials: [],
      gallery: [],
      faqs: [],
    };
  }

  const { settings } = initialData;

  // ── Structured data (SEO): store + website + product catalogue in one @graph ──
  const socialLinks = [settings.social.instagram, settings.social.facebook, settings.social.justdial]
    .map((u) => u.trim())
    .filter((u) => /^https?:\/\//.test(u));

  const productSchemas = initialData.products.map((p) => ({
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.images[0] ? [p.images[0]] : undefined,
    category: p.categoryName,
    brand: { "@type": "Brand", name: "Dream Wood Furniture" },
    // Only priced pieces get offers — custom-quote pieces stay quote-only
    ...(p.price != null
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: String(p.price),
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: "Dream Wood Furniture" },
          },
        }
      : {}),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FurnitureStore",
        "@id": "#store",
        name: "Dream Wood Furniture",
        alternateName: "ड्रीम वुड फर्निचर",
        description: settings.seo.description,
        telephone: "+91-" + settings.contact.phone.replace(/\D/g, "").replace(/^0/, ""),
        priceRange: "₹₹",
        ...(socialLinks.length > 0 ? { sameAs: socialLinks } : {}),
        address: {
          "@type": "PostalAddress",
          streetAddress: settings.contact.addressLine1,
          addressLocality: "Seawoods, Navi Mumbai",
          addressRegion: "Maharashtra",
          postalCode: "400706",
          addressCountry: "IN",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: settings.rating.value,
          reviewCount: settings.rating.count,
          bestRating: 5,
          worstRating: 1,
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          opens: settings.contact.openTime,
          closes: settings.contact.closeTime,
        },
        image: settings.hero.image,
      },
      {
        "@type": "WebSite",
        name: "Dream Wood Furniture",
        alternateName: "ड्रीम वुड फर्निचर",
        inLanguage: "en-IN",
        publisher: { "@id": "#store" },
      },
      ...(productSchemas.length > 0
        ? [
            {
              "@type": "ItemList",
              name: "Dream Wood Furniture Catalogue",
              numberOfItems: productSchemas.length,
              itemListElement: productSchemas.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: p,
              })),
            },
          ]
        : []),
      // FAQPage — only visible FAQs (matches the storefront accordion)
      ...(initialData.faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: initialData.faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: f.answer,
                },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteApp initialData={initialData} />
    </>
  );
}
