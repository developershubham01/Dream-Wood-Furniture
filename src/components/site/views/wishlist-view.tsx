"use client";

import { motion } from "framer-motion";
import { Heart, ArrowRight, ClipboardList, GitCompareArrows, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteData } from "@/lib/site-data";
import { useSiteStore } from "@/lib/store";
import { ProductCard } from "../product-card";
import { toast } from "@/hooks/use-toast";

export function WishlistView() {
  const { data } = useSiteData();
  const wishlist = useSiteStore((s) => s.wishlist);
  const navigate = useSiteStore((s) => s.navigate);
  const addToEnquiry = useSiteStore((s) => s.addToEnquiry);
  const setEnquiryOpen = useSiteStore((s) => s.setEnquiryOpen);
  const setCompareOpen = useSiteStore((s) => s.setCompareOpen);
  const items = data.products.filter((p) => wishlist.includes(p.id));

  const handleAddAllToEnquiry = () => {
    if (items.length === 0) return;
    items.forEach((p) =>
      addToEnquiry({
        productId: p.id,
        name: p.name,
        image: p.images[0] || "/images/cat-living.png",
        price: p.price,
      })
    );
    setEnquiryOpen(true);
    toast({
      title: "Wishlist added to enquiry",
      description: `${items.length} piece${items.length !== 1 ? "s" : ""} moved to your enquiry list.`,
    });
  };

  return (
    <div className="bg-background">
      <div className="bg-walnut-900 relative overflow-hidden">
        <div className="absolute inset-0 wood-texture opacity-70" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-14 lg:py-20">
          <button
            onClick={() => navigate({ name: "home" })}
            className="text-xs uppercase tracking-[0.2em] text-gold-light hover:text-gold transition-colors cursor-pointer"
          >
            Home
          </button>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl text-ivory flex items-center gap-4">
            Your Wishlist
            <Heart className="h-8 w-8 fill-gold text-gold" aria-hidden />
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="text-ivory/70 text-sm sm:text-base">
              {items.length} piece{items.length !== 1 ? "s" : ""} saved — add them to your enquiry list when you're ready.
            </p>
            {items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center gap-2"
              >
                <Button
                  onClick={handleAddAllToEnquiry}
                  size="sm"
                  className="h-9 rounded-full bg-gold text-espresso hover:bg-gold-light font-semibold"
                >
                  <ClipboardList className="h-4 w-4 mr-1.5" />
                  Add All to Enquiry
                </Button>
                {items.length >= 2 && (
                  <Button
                    onClick={() => setCompareOpen(true)}
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-full border-white/25 bg-white/5 text-ivory hover:bg-white/15 hover:text-ivory backdrop-blur"
                  >
                    <GitCompareArrows className="h-4 w-4 mr-1.5 text-gold" />
                    Compare
                  </Button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
        {items.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-6 border-b border-walnut-100">
            <p className="text-sm text-muted-foreground">
              Tap the <Heart className="h-3.5 w-3.5 inline-block text-red-500 fill-current mx-0.5" aria-hidden />
              on a card to remove it, or use the compare icon to shortlist finalists.
            </p>
            <Button
              onClick={() => {
                items.forEach((p) => useSiteStore.getState().toggleWishlist(p.id));
                toast({ title: "Wishlist cleared", description: `${items.length} piece${items.length !== 1 ? "s" : ""} removed.` });
              }}
              variant="ghost"
              size="sm"
              className="h-9 rounded-full text-walnut-500 hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Clear wishlist
            </Button>
          </div>
        )}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {items.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-walnut-200 rounded-3xl">
            <span className="mx-auto h-16 w-16 rounded-full bg-walnut-50 border border-walnut-100 flex items-center justify-center">
              <Heart className="h-7 w-7 text-walnut-300" aria-hidden />
            </span>
            <h2 className="mt-6 font-display text-2xl text-walnut-900">Nothing saved yet</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Tap the heart on any piece you love — it'll wait for you here.
            </p>
            <Button
              onClick={() => navigate({ name: "shop" })}
              className="mt-7 rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory px-7"
            >
              Browse the Collection
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
