"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteData } from "@/lib/site-data";
import { useSiteStore } from "@/lib/store";
import { whatsappLink } from "@/lib/format";

export function CtaSection() {
  const { data } = useSiteData();
  const navigate = useSiteStore((s) => s.navigate);
  const cta = data.settings.cta;
  const contact = data.settings.contact;

  return (
    <section id="cta" className="relative py-20 lg:py-28 bg-walnut-900 overflow-hidden">
      {/* Gold hairline seam bridging the light→dark transition */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
        aria-hidden
      />
      {/* Ambient decoration */}
      <div className="absolute inset-0 wood-texture opacity-80" aria-hidden />
      <motion.div
        aria-hidden
        className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 9, repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-walnut-400/10 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 11, repeat: Infinity }}
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xs font-semibold tracking-[0.3em] uppercase text-gold"
        >
          Dream Wood Furniture · Seawoods, Navi Mumbai
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-5 font-display text-3xl sm:text-4xl lg:text-5xl text-ivory leading-tight text-balance"
        >
          {cta.heading}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-5 text-ivory/70 leading-relaxed max-w-2xl mx-auto"
        >
          {cta.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-3"
        >
          <Button
            onClick={() => navigate({ name: "contact" })}
            size="lg"
            className="h-13 px-8 rounded-full bg-gold hover:bg-gold-light text-espresso font-semibold text-base shadow-lg shadow-black/25 transition-all hover:-translate-y-0.5"
          >
            <Phone className="h-5 w-5 mr-2" />
            Contact Us
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-13 px-8 rounded-full border-ivory/40 text-ivory hover:bg-ivory/10 hover:border-ivory font-medium text-base transition-all hover:-translate-y-0.5"
          >
            <a
              href={whatsappLink(
                contact.whatsapp,
                "Hi Dream Wood Furniture! I'd like help with furniture for my home."
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              WhatsApp Us
              <ArrowRight className="h-4 w-4 ml-1" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
