"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteData } from "@/lib/site-data";
import { useSiteStore } from "@/lib/store";
import { ProductCard } from "../product-card";
import { SectionHeading } from "../section-heading";

export function FeaturedSection() {
  const { data } = useSiteData();
  const navigate = useSiteStore((s) => s.navigate);
  const featured = data.products.filter((p) => p.featured).slice(0, 8);
  const fallback = featured.length > 0 ? featured : data.products.slice(0, 8);

  return (
    <section id="featured" className="py-20 lg:py-28 bg-ivory/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <SectionHeading
            align="left"
            eyebrow="Handpicked for You"
            title="The Featured Collection"
            description="Pieces our customers love most — chosen for their design, comfort and craftsmanship."
            className="md:max-w-xl"
          />
          <Button
            onClick={() => navigate({ name: "shop" })}
            variant="outline"
            className="self-start md:self-auto rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-800 hover:text-ivory hover:border-walnut-800 transition-all px-6"
          >
            View All Products
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {fallback.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {fallback.length === 0 && (
          <div className="mt-10 text-center py-16 border border-dashed border-walnut-200 rounded-2xl">
            <p className="text-muted-foreground">
              Our catalogue is being updated with beautiful pieces. Visit the showroom or send us an enquiry.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
