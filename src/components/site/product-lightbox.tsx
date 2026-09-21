"use client";

import { useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Fullscreen product image viewer with prev/next arrows, thumbnail strip
 * and arrow-key navigation. Image selection is shared with the product
 * page gallery (single source of truth via the `active` prop).
 */
export function ProductLightbox({
  open,
  onOpenChange,
  images,
  active,
  onSelect,
  productName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  active: number;
  onSelect: (index: number) => void;
  productName: string;
}) {
  const count = images.length;
  const go = useCallback(
    (dir: 1 | -1) => onSelect((active + dir + count) % count),
    [active, count, onSelect]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onKeyDown={handleKeyDown}
        className="sm:max-w-4xl w-[calc(100%-2rem)] bg-espresso/95 backdrop-blur border border-walnut-700/50 rounded-3xl p-4 sm:p-5 gap-3 shadow-2xl"
      >
        <DialogTitle className="sr-only">{productName} — image viewer</DialogTitle>
        <DialogDescription className="sr-only">
          Use the left and right arrow keys to browse the images.
        </DialogDescription>

        {/* Image stage */}
        <div className="relative rounded-2xl overflow-hidden bg-black/30 select-none">
          { }
          <img
            src={images[active]}
            alt={`${productName} — image ${active + 1} of ${count}`}
            className="w-full max-h-[70vh] object-contain"
          />
          <span
            className="absolute top-3 left-3 rounded-full bg-black/45 backdrop-blur text-ivory/90 text-[11px] font-semibold tabular-nums px-2.5 py-1 tracking-wide"
            aria-hidden
          >
            {active + 1} / {count}
          </span>

          {count > 1 && (
            <>
              <button
                onClick={() => go(-1)}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur text-ivory flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur text-ivory flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {count > 1 && (
          <div className="flex justify-center gap-2.5 pt-0.5 overflow-x-auto px-1 scrollbar-none" role="tablist" aria-label="Image thumbnails">
            {images.map((img, i) => (
              <button
                key={img + i}
                onClick={() => onSelect(i)}
                role="tab"
                aria-selected={active === i}
                aria-label={`Image ${i + 1}`}
                className={cn(
                  "h-14 w-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer",
                  active === i ? "border-gold" : "border-transparent opacity-55 hover:opacity-90"
                )}
              >
                { }
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
