"use client";

import { Heart, Trash2, ArrowRight, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useSiteStore } from "@/lib/store";
import { useSiteData } from "@/lib/site-data";
import { formatINR } from "@/lib/format";
import { toast } from "@/hooks/use-toast";

export function WishlistSheet() {
  const wishlistOpen = useSiteStore((s) => s.wishlistOpen);
  const setWishlistOpen = useSiteStore((s) => s.setWishlistOpen);
  const wishlist = useSiteStore((s) => s.wishlist);
  const toggleWishlist = useSiteStore((s) => s.toggleWishlist);
  const addToEnquiry = useSiteStore((s) => s.addToEnquiry);
  const setEnquiryOpen = useSiteStore((s) => s.setEnquiryOpen);
  const navigate = useSiteStore((s) => s.navigate);
  const { data } = useSiteData();

  const items = data.products.filter((p) => wishlist.includes(p.id));

  return (
    <Sheet open={wishlistOpen} onOpenChange={setWishlistOpen}>
      <SheetContent className="w-full sm:max-w-md bg-cream border-walnut-100 p-0 flex flex-col">
        <SheetHeader className="p-5 border-b border-walnut-100 bg-card">
          <SheetTitle className="flex items-center gap-2.5 font-display text-lg text-walnut-900">
            <Heart className="h-5 w-5 fill-gold text-gold" aria-hidden />
            Wishlist
          </SheetTitle>
          <SheetDescription className="text-xs">
            {items.length} saved piece{items.length !== 1 ? "s" : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 max-h-full">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <span className="h-16 w-16 rounded-full bg-walnut-50 border border-walnut-100 flex items-center justify-center">
                <Heart className="h-7 w-7 text-walnut-300" aria-hidden />
              </span>
              <h3 className="mt-5 font-display text-xl text-walnut-900">Nothing saved yet</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                Tap the heart icon on any piece you love.
              </p>
              <Button
                onClick={() => {
                  setWishlistOpen(false);
                  navigate({ name: "shop" });
                }}
                className="mt-6 rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory"
              >
                Browse Furniture
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((p) => (
                <div
                  key={p.id}
                  className="flex gap-4 p-3 rounded-2xl bg-card border border-walnut-100 group"
                >
                  { }
                  <img
                    src={p.images[0] || "/images/cat-living.png"}
                    alt={p.name}
                    className="h-20 w-20 rounded-xl object-cover border border-walnut-100 shrink-0 cursor-pointer"
                    onClick={() => {
                      setWishlistOpen(false);
                      navigate({ name: "product", slug: p.slug });
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-walnut-900 leading-snug line-clamp-2">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {p.price != null ? formatINR(p.price) + " onwards" : "Quote on request"}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-50 text-xs px-3"
                        onClick={() => {
                          addToEnquiry({ productId: p.id, name: p.name, image: p.images[0], price: p.price });
                          toast({ title: "Added to enquiry list", description: p.name });
                          setEnquiryOpen(true);
                          setWishlistOpen(false);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Enquiry
                      </Button>
                      <button
                        onClick={() => {
                          toggleWishlist(p.id);
                          toast({ title: "Removed from wishlist", description: p.name });
                        }}
                        className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        aria-label={`Remove ${p.name} from wishlist`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                onClick={() => {
                  setWishlistOpen(false);
                  navigate({ name: "wishlist" });
                }}
                variant="outline"
                className="w-full rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-50"
              >
                View full wishlist page
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
