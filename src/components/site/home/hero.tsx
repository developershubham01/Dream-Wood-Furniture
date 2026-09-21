"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteStore } from "@/lib/store";
import { useSiteData } from "@/lib/site-data";
import { StarRating } from "../star-rating";

export function Hero() {
  const { data } = useSiteData();
  const navigate = useSiteStore((s) => s.navigate);
  const goHome = useSiteStore((s) => s.goHome);
  const hero = data.settings.hero;

  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.7], [0, -60]);

  return (
    <section ref={ref} className="relative min-h-[88vh] flex items-center overflow-hidden bg-espresso">
      {/* Parallax background */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 scale-110">
        { }
        <img
          src={hero.image}
          alt="Premium furniture living room by Dream Wood Furniture"
          className="w-full h-full object-cover"
        />
      </motion.div>
      {/* Warm cinematic overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-espresso/80 via-espresso/45 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-transparent to-espresso/20" />
      {/* Subtle wood texture glow */}
      <div className="absolute inset-0 wood-texture opacity-60 mix-blend-soft-light" />

      {/* Content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 w-full py-24 lg:py-32"
      >
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex flex-wrap items-center gap-3 mb-6"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-gold-light">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {hero.eyebrow}
            </span>
            <span className="hidden sm:block h-1 w-1 rounded-full bg-gold/60" aria-hidden />
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-3 py-1.5">
              <StarRating rating={data.settings.rating.value} size={13} />
              <span className="text-xs text-ivory/90 font-medium">
                {data.settings.rating.value}/5 · {data.settings.rating.count} Google reviews
              </span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl sm:text-5xl lg:text-[3.6rem] leading-[1.08] text-ivory text-balance"
          >
            {hero.heading}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 text-base sm:text-lg text-ivory/80 leading-relaxed max-w-xl"
          >
            {hero.subheading}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="mt-9 flex flex-col sm:flex-row gap-3"
          >
            <Button
              onClick={() => navigate({ name: "shop" })}
              size="lg"
              className="h-13 px-8 rounded-full bg-gold hover:bg-gold-light text-espresso font-semibold text-base shadow-lg shadow-black/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              {hero.primaryCta}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button
              onClick={() => goHome("showroom")}
              size="lg"
              variant="outline"
              className="h-13 px-8 rounded-full border-ivory/60 bg-ivory/5 text-ivory hover:bg-ivory/15 hover:border-ivory font-medium text-base backdrop-blur-md transition-all hover:-translate-y-0.5"
            >
              <MapPin className="h-5 w-5 mr-2" />
              {hero.secondaryCta}
            </Button>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.85 }}
            className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-ivory/70"
          >
            {["Solid Wood Craftsmanship", "Customisation Options", "Delivery Assistance"].map((t) => (
              <span key={t} className="flex items-center gap-2 text-sm tracking-wide">
                <span className="h-1 w-1 rotate-45 bg-gold" aria-hidden />
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.button
        onClick={() => goHome("categories")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-ivory/60 hover:text-ivory transition-colors cursor-pointer"
        aria-label="Scroll to categories"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Explore</span>
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.button>
    </section>
  );
}
