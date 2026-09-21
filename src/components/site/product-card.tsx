"use client";

import { motion } from "framer-motion";
import { Heart, Plus, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSiteStore } from "@/lib/store";
import { useSiteData } from "@/lib/site-data";
import { formatINR } from "@/lib/format";
import { QuickViewButton } from "./quick-view";
import { CompareToggle } from "./compare-dialog";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export function ProductCard({
  product,
  index = 0,
  className,
}: {
  product: Product;
  index?: number;
  className?: string;
}) {
  const navigate = useSiteStore((s) => s.navigate);
  const wishlist = useSiteStore((s) => s.wishlist);
  const compare = useSiteStore((s) => s.compare);
  const toggleWishlist = useSiteStore((s) => s.toggleWishlist);
  const addToEnquiry = useSiteStore((s) => s.addToEnquiry);
  const setEnquiryOpen = useSiteStore((s) => s.setEnquiryOpen);
  const openQuickView = useSiteStore((s) => s.openQuickView);
  const { data } = useSiteData();

  const inWishlist = wishlist.includes(product.id);
  const inCompare = compare.includes(product.id);
  const cover = product.images[0] || "/images/cat-living.png";

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const added = toggleWishlist(product.id);
    toast({
      title: added ? "Added to wishlist" : "Removed from wishlist",
      description: product.name,
    });
  };

  const handleAddEnquiry = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToEnquiry({
      productId: product.id,
      name: product.name,
      image: cover,
      price: product.price,
    });
    setEnquiryOpen(true);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.06, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className={cn("group relative flex flex-col bg-card border border-walnut-100 rounded-2xl overflow-hidden hover:border-walnut-200 hover:shadow-xl hover:shadow-walnut-900/10 transition-all duration-500", className)}
    >
      {/* Gold accent hairline — reveals on hover */}
      <span
        aria-hidden
        className="absolute top-0 left-0 right-0 h-[3px] z-10 bg-gradient-to-r from-gold/0 via-gold to-gold/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"
      />

      {/* Image */}
      <div
        className="relative aspect-[4/3] img-zoom cursor-pointer bg-walnut-50"
        onClick={() => navigate({ name: "product", slug: product.slug })}
        role="link"
        aria-label={`View ${product.name}`}
      >
        <img
          src={cover}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        {product.badge && (
          <Badge className="absolute top-3 left-3 bg-walnut-800/90 text-ivory hover:bg-walnut-800 border-0 text-[11px] tracking-wide font-medium px-3 py-1 rounded-full">
            {product.badge}
          </Badge>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={handleWishlist}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "h-9 w-9 rounded-full flex items-center justify-center backdrop-blur transition-all duration-300 cursor-pointer",
              inWishlist
                ? "bg-white text-red-600 shadow-md"
                : "bg-white/70 text-walnut-700 hover:bg-white hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            )}
          >
            <Heart className={cn("h-4 w-4 transition-transform", inWishlist && "fill-current scale-110")} />
          </button>
          <CompareToggle
            product={product}
            className={cn(
              "h-9 w-9",
              inCompare
                ? "opacity-100"
                : "bg-white/70 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            )}
          />
        </div>
        <QuickViewButton onClick={() => openQuickView(product)} name={product.name} />
        {product.categoryName && (
          <span className="absolute bottom-3 left-3 text-[11px] uppercase tracking-wider text-ivory/95 bg-walnut-900/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
            {product.categoryName}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <h3
          className="font-display text-lg leading-snug text-walnut-900 cursor-pointer hover:text-walnut-600 transition-colors line-clamp-1"
          onClick={() => navigate({ name: "product", slug: product.slug })}
        >
          {product.name}
        </h3>
        {product.nameHi && (
          <p className="text-sm text-muted-foreground mt-0.5">{product.nameHi}</p>
        )}

        <div className="mt-3 flex items-baseline gap-2">
          {product.price != null ? (
            <>
              <span className="text-xl font-semibold text-walnut-800 tabular-nums">{formatINR(product.price)}</span>
              <span className="text-xs text-muted-foreground">onwards</span>
            </>
          ) : (
            <span className="text-sm font-medium tracking-wide text-gold-dark">
              Request a Quote
            </span>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-walnut-100 grid grid-cols-[1fr_auto] gap-2 items-center">
          <Button
            onClick={handleAddEnquiry}
            variant="outline"
            size="sm"
            className="border-walnut-200 text-walnut-700 hover:bg-walnut-50 hover:border-walnut-400 hover:text-walnut-900 h-9"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Enquiry
          </Button>
          <Button
            onClick={() => navigate({ name: "product", slug: product.slug })}
            variant="ghost"
            size="sm"
            className="text-gold-dark hover:text-gold hover:bg-gold/10 h-9 font-medium"
          >
            Details
            <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
