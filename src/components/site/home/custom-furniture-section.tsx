"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Ruler, Palette, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteData } from "@/lib/site-data";
import { useSiteStore } from "@/lib/store";

const STEPS = [
  { icon: MessageCircle, label: "Tell us your idea" },
  { icon: Ruler, label: "We measure & propose" },
  { icon: Palette, label: "Choose materials together" },
  { icon: PackageCheck, label: "Crafted & delivered" },
];

export function CustomFurnitureSection() {
  const { data } = useSiteData();
  const navigate = useSiteStore((s) => s.navigate);
  const custom = data.settings.custom;

  return (
    <section id="custom" className="relative py-0 overflow-hidden">
      <div className="grid lg:grid-cols-2 min-h-[560px]">
        {/* Image side */}
        <div className="relative min-h-[320px] lg:min-h-full img-zoom">
          { }
          <img
            src={custom.image}
            alt="Craftsman building custom wood furniture at Dream Wood Furniture"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-walnut-900/20 lg:bg-gradient-to-r lg:from-transparent lg:to-walnut-900/30" />
        </div>

        {/* Content side */}
        <div className="relative bg-walnut-900 text-ivory px-6 sm:px-12 lg:px-16 py-16 lg:py-24 flex items-center wood-texture">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold mb-4">
              Bespoke Furniture
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight text-balance">
              {custom.heading}
            </h2>
            <p className="mt-5 text-ivory/75 leading-relaxed">
              {custom.description}
            </p>

            {/* Process */}
            <ol className="mt-9 grid grid-cols-2 gap-3">
              {STEPS.map((step, i) => (
                <li
                  key={step.label}
                  className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur-sm"
                >
                  <step.icon className="h-[18px] w-[18px] text-gold shrink-0" aria-hidden />
                  <span className="text-[13px] text-ivory/85 leading-snug min-w-0 break-words">
                    <span className="text-gold-light font-semibold mr-1.5">{i + 1}.</span>
                    {step.label}
                  </span>
                </li>
              ))}
            </ol>

            <Button
              onClick={() => navigate({ name: "custom" })}
              size="lg"
              className="mt-9 h-13 px-8 rounded-full bg-gold hover:bg-gold-light text-espresso font-semibold shadow-lg shadow-black/25 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              {custom.ctaLabel}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
