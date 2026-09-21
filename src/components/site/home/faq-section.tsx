"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSiteData } from "@/lib/site-data";
import { useSiteStore } from "@/lib/store";
import { whatsappLink } from "@/lib/format";
import { SectionHeading } from "../section-heading";
import { cn } from "@/lib/utils";

/** Customer-facing FAQ accordion with topic pills — feeds the FAQPage schema */
export function FaqSection() {
  const { data } = useSiteData();
  const navigate = useSiteStore((s) => s.navigate);
  const faqs = data.faqs;
  const [topic, setTopic] = useState<string>("All");

  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    faqs.forEach((f) => counts.set(f.topic, (counts.get(f.topic) ?? 0) + 1));
    return ["All", ...Array.from(counts.keys())];
  }, [faqs]);

  const shown = topic === "All" ? faqs : faqs.filter((f) => f.topic === topic);

  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="py-20 lg:py-28 bg-cream">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Good to Know"
          title="Frequently Asked Questions"
          description="Delivery timelines, customisation, materials and care — the questions our showroom team answers every day."
        />

        {/* Topic pills */}
        {topics.length > 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 flex flex-wrap justify-center gap-2"
            role="group"
            aria-label="Filter questions by topic"
          >
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                aria-pressed={topic === t}
                className={cn(
                  "h-9 px-4 rounded-full text-xs font-medium tracking-wide border transition-all cursor-pointer",
                  topic === t
                    ? "bg-walnut-800 text-ivory border-walnut-800 shadow-sm"
                    : "border-walnut-200 text-walnut-600 hover:border-walnut-400 hover:text-walnut-800 bg-card"
                )}
              >
                {t}
              </button>
            ))}
          </motion.div>
        )}

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-8"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {shown.map((f) => (
              <AccordionItem
                key={f.id}
                value={f.id}
                className="group rounded-2xl border border-walnut-100 bg-card px-5 shadow-none transition-shadow duration-300 data-[state=open]:border-gold/40 data-[state=open]:shadow-md data-[state=open]:shadow-walnut-900/5"
              >
                <AccordionTrigger className="py-4.5 hover:no-underline [&>svg]:hidden">
                  <span className="flex items-center gap-3 text-left">
                    <span
                      className="h-1.5 w-1.5 rotate-45 shrink-0 transition-colors"
                      aria-hidden
                      style={{ backgroundColor: "var(--color-gold)" }}
                    />
                    <span className="font-medium text-[15px] text-walnut-900 leading-snug">
                      {f.question}
                    </span>
                  </span>
                  {/* Custom chevron that rotates + changes color on open */}
                  <svg
                    className="h-4 w-4 shrink-0 text-walnut-400 transition-transform duration-300 group-data-[state=open]:rotate-180 group-data-[state=open]:text-gold-dark"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </AccordionTrigger>
                <AccordionContent className="pb-5 pt-0 pl-[30px] text-sm leading-[1.75] text-walnut-700/90">
                  {f.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Still-curious CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 rounded-2xl border border-dashed border-walnut-200 bg-card/60 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="text-center sm:text-left">
            <p className="font-medium text-walnut-900 text-sm">Still have a question?</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Our showroom team replies within a few hours during store hours.
            </p>
          </div>
          <div className="flex gap-2.5 shrink-0">
            <Button
              asChild
              size="sm"
              className="h-9 rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory text-xs font-medium"
            >
              <a
                href={whatsappLink(
                  data.settings.contact.whatsapp,
                  "Hi Dream Wood Furniture! I have a question about your furniture."
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                WhatsApp Us
              </a>
            </Button>
            <Button
              onClick={() => navigate({ name: "contact" })}
              size="sm"
              variant="outline"
              className="h-9 rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-50 text-xs font-medium"
            >
              <Phone className="h-3.5 w-3.5 mr-1.5" />
              Contact Page
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
