"use client";

import { motion } from "framer-motion";
import { PencilRuler, SlidersHorizontal, TreePine, HeartHandshake, Truck } from "lucide-react";
import { SectionHeading } from "../section-heading";

const HIGHLIGHTS = [
  {
    icon: PencilRuler,
    title: "Thoughtfully Designed Furniture",
    text: "Every piece in our showroom is selected for proportion, comfort and everyday livability — furniture that looks good and lives better.",
  },
  {
    icon: SlidersHorizontal,
    title: "Customisation Options",
    text: "Different fabric? A size that fits an odd wall? Talk to us — many pieces can be tailored to your space, finish and storage needs.",
  },
  {
    icon: TreePine,
    title: "Quality Craftsmanship",
    text: "We favour solid wood, honest joinery and finishes that age gracefully — come see and feel the difference at our showroom.",
  },
  {
    icon: HeartHandshake,
    title: "Personalised Customer Service",
    text: "A neighbourhood showroom experience — we listen first, then suggest. No pressure, no upselling, just honest guidance.",
  },
  {
    icon: Truck,
    title: "Delivery Assistance",
    text: "Once you've found your piece, we help get it home safely. Delivery assistance is available for your purchases.",
  },
];

export function WhyChooseSection() {
  return (
    <section id="why-choose" className="py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16 items-start">
        <div className="lg:sticky lg:top-32">
          <SectionHeading
            align="left"
            eyebrow="The Dream Wood Difference"
            title="Why Customers Choose Dream Wood"
            description="A 4.8★ rated showroom in Seawoods, built on word-of-mouth, repeat customers and furniture we're proud to put our name on."
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-8 p-6 rounded-2xl bg-walnut-900 text-ivory relative overflow-hidden"
          >
            <div className="absolute inset-0 wood-texture opacity-70" aria-hidden />
            <p className="relative font-display text-2xl leading-snug">
              "Good furniture should feel personal."
            </p>
            <p className="relative mt-3 text-sm text-ivory/70">
              — the belief our Seawoods showroom is built on
            </p>
          </motion.div>
        </div>

        <div className="space-y-2">
          {HIGHLIGHTS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: Math.min(i * 0.08, 0.4) }}
              className="group flex gap-5 p-5 sm:p-6 rounded-2xl border border-walnut-100 bg-card hover:border-walnut-300 hover:shadow-lg hover:shadow-walnut-900/5 transition-all duration-500"
            >
              <div className="shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-walnut-800 group-hover:bg-gold transition-colors duration-500 flex items-center justify-center">
                <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-ivory group-hover:text-espresso transition-colors duration-500" />
              </div>
              <div>
                <h3 className="font-display text-lg sm:text-xl text-walnut-900">{item.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
