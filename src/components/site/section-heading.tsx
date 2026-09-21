"use client";

import { motion } from "framer-motion";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""} ${className}`}
    >
      {eyebrow && (
        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight text-walnut-900 text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-muted-foreground leading-relaxed text-balance">
          {description}
        </p>
      )}
      <div
        className={`mt-6 flex items-center gap-2 ${align === "center" ? "justify-center" : ""}`}
        aria-hidden="true"
      >
        <span className="h-px w-10 bg-walnut-200" />
        <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
        <span className="h-px w-10 bg-walnut-200" />
      </div>
    </motion.div>
  );
}
