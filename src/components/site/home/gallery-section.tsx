"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Camera, Instagram } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSiteData } from "@/lib/site-data";
import { SectionHeading } from "../section-heading";

export function GallerySection() {
  const { data } = useSiteData();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const gallery = data.gallery;

  const next = useCallback(() => {
    setLightbox((cur) => (cur == null ? null : (cur + 1) % gallery.length));
  }, [gallery.length]);

  const prev = useCallback(() => {
    setLightbox((cur) => (cur == null ? null : (cur - 1 + gallery.length) % gallery.length));
  }, [gallery.length]);

  if (gallery.length === 0) return null;

  return (
    <section id="gallery" className="py-20 lg:py-28 bg-ivory/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="From Our Floor"
          title="The Dream Wood Gallery"
          description="Living rooms, bedrooms and pieces styled straight from our showroom — a peek at what's waiting for you."
        />

        <div className="mt-12 columns-2 md:columns-3 lg:columns-4 gap-4 sm:gap-5 [&>*]:mb-4 sm:[&>*]:mb-5">
          {gallery.map((img, i) => (
            <motion.button
              key={img.id}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: Math.min(i * 0.04, 0.3) }}
              onClick={() => setLightbox(i)}
              className="group relative w-full break-inside-avoid rounded-2xl overflow-hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-gold"
              aria-label={`Open image: ${img.title}`}
            >
              { }
              <img
                src={img.url}
                alt={`${img.title} — ${img.category} by Dream Wood Furniture`}
                loading="lazy"
                className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                  i % 5 === 0 ? "aspect-[3/4]" : i % 5 === 3 ? "aspect-square" : "aspect-[4/3]"
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 inset-x-0 p-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 text-left">
                <p className="text-sm font-medium text-ivory leading-tight">{img.title}</p>
                <p className="text-[11px] text-ivory/70 mt-0.5 uppercase tracking-wider">{img.category}</p>
              </div>
              <span className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Camera className="h-3.5 w-3.5 text-ivory" />
              </span>
            </motion.button>
          ))}
        </div>

        {data.settings.social.instagram && (
          <div className="mt-10 text-center">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-800 hover:text-ivory hover:border-walnut-800 px-6"
            >
              <a href={data.settings.social.instagram} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4 mr-2" />
                Follow us on Instagram
              </a>
            </Button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightbox != null} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-4xl bg-espresso/95 border-walnut-800 p-0 overflow-hidden rounded-2xl [&>button]:bg-white/10 [&>button]:text-ivory [&>button]:hover:bg-white/20">
          <DialogTitle className="sr-only">Gallery image viewer</DialogTitle>
          {lightbox != null && gallery[lightbox] && (
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={gallery[lightbox].id}
                  initial={{ opacity: 0.4, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.2, scale: 0.99 }}
                  transition={{ duration: 0.3 }}
                >
                  { }
                  <img
                    src={gallery[lightbox].url}
                    alt={gallery[lightbox].title}
                    className="w-full max-h-[78vh] object-contain bg-black/40"
                  />
                </motion.div>
              </AnimatePresence>

              <button
                onClick={prev}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/10 backdrop-blur border border-white/20 text-ivory hover:bg-white/25 flex items-center justify-center cursor-pointer transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/10 backdrop-blur border border-white/20 text-ivory hover:bg-white/25 flex items-center justify-center cursor-pointer transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-5 flex items-center justify-between">
                <div>
                  <p className="text-ivory font-medium">{gallery[lightbox].title}</p>
                  <p className="text-ivory/60 text-xs uppercase tracking-wider mt-0.5">
                    {gallery[lightbox].category}
                  </p>
                </div>
                <span className="text-ivory/60 text-sm tabular-nums">
                  {lightbox + 1} / {gallery.length}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
