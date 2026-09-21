"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useSiteStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  // Shift above the compare tray so the two never overlap
  const compareCount = useSiteStore((s) => s.compare.length);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className={cn(
            "fixed right-6 z-50 h-11 w-11 rounded-full bg-walnut-800 text-ivory shadow-xl shadow-walnut-900/30 hover:bg-gold hover:text-espresso transition-all duration-300 flex items-center justify-center cursor-pointer print:hidden",
            compareCount > 0 ? "bottom-28 sm:bottom-32" : "bottom-6"
          )}
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
