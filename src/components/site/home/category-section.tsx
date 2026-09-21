"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useSiteData } from "@/lib/site-data";
import { useSiteStore } from "@/lib/store";
import { SectionHeading } from "../section-heading";

export function CategorySection() {
  const { data } = useSiteData();
  const navigate = useSiteStore((s) => s.navigate);
  const categories = data.categories;

  return (
    <section id="categories" className="py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Browse by Room"
          title="Shop by Category"
          description="From statement sofas to made-to-measure wardrobes — explore furniture for every corner of your home."
        />

        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: Math.min(i * 0.05, 0.35), ease: [0.22, 1, 0.36, 1] }}
              onClick={() => navigate({ name: "shop", category: cat.slug })}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 ring-1 ring-inset ring-white/10 transition-shadow duration-500 hover:ring-gold/50"
              aria-label={`Explore ${cat.name} furniture`}
            >
              { }
              <img
                src={cat.image || "/images/cat-living.png"}
                alt={`${cat.name} furniture category`}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/20 to-transparent transition-opacity duration-500 group-hover:from-espresso/95" />

              {cat.slug === "custom-furniture" && (
                <span className="absolute top-3 right-3 bg-gold text-espresso text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  Made to Order
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <p className="font-display text-lg sm:text-xl text-ivory leading-tight">{cat.name}</p>
                {cat.nameHi && (
                  <p className="text-xs text-ivory/70 mt-0.5 tracking-wide">{cat.nameHi}</p>
                )}
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-gold-light tracking-wide uppercase opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  Explore
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </motion.button>
          ))}

          {/* Empty state */}
          {categories.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12">
              Categories are being curated — please check back soon.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
