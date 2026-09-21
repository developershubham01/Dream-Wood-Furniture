"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSiteData } from "@/lib/site-data";
import { useSiteStore } from "@/lib/store";
import { whatsappLink } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Floating WhatsApp action button — the primary quick-contact channel for
 * Indian shoppers. Sits bottom-left (mirroring BackToTop on the right),
 * lifts above the compare tray, and opens a context-aware chat message
 * (mentions the product when opened from a product page).
 *
 * The pill expansion is state-driven (mouse + keyboard focus) rather than
 * pure CSS :hover so it also works for keyboard users.
 */
export function WhatsappFab() {
  const { data } = useSiteData();
  const view = useSiteStore((s) => s.view);
  const compareCount = useSiteStore((s) => s.compare.length);
  const [expanded, setExpanded] = useState(false);

  // Delayed entrance so the FAB never competes with the hero load
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setShown(true), 1200);
    return () => window.clearTimeout(t);
  }, []);

  // Context-aware greeting: mention the piece when browsing a product page
  const product =
    view.name === "product" ? data.products.find((p) => p.slug === view.slug) : undefined;
  const message = product
    ? `Hi Dream Wood Furniture! I'm interested in the ${product.name}. Could you share more details?`
    : "Hi Dream Wood Furniture! I have a question about your furniture.";

  const href = whatsappLink(data.settings.contact.whatsapp, message);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={() => setExpanded(false)}
      initial={false}
      animate={shown ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.85 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={cn(
        "group fixed left-6 z-50 flex items-center h-13 rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/40 hover:bg-[#1fbe5b] transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#25D366]/50 cursor-pointer print:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]",
        compareCount > 0 ? "bottom-28 sm:bottom-32" : "bottom-6"
      )}
    >
      {/* Attention ping — plays twice on entry, then rests */}
      <span className="relative flex h-13 w-13 items-center justify-center" aria-hidden>
        <motion.span
          className="absolute inset-0 rounded-full bg-[#25D366]"
          initial={{ opacity: 0.6, scale: 1 }}
          animate={shown ? { opacity: [0.5, 0], scale: [1, 1.5] } : {}}
          transition={{ duration: 1.6, repeat: shown ? 2 : 0, ease: "easeOut", delay: 0.4 }}
        />
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current relative" aria-hidden>
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.03c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" />
        </svg>
      </span>

      {/* Label — expands on hover/focus; the state-driven max-width change
          transitions smoothly, and the fixed-position anchor shrink-wraps */}
      <span
        className={cn(
          "overflow-hidden whitespace-nowrap text-sm font-semibold tracking-wide transition-[max-width] duration-300 ease-out",
          expanded ? "max-w-[7rem]" : "max-w-0"
        )}
        aria-hidden
      >
        <span className="pl-1.5 pr-4">Chat with us</span>
      </span>
    </motion.a>
  );
}
