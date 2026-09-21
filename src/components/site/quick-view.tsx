"use client";

import { useState } from "react";
import { Heart, Plus, ArrowRight, Ruler, Layers, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSiteStore } from "@/lib/store";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CompareToggle } from "./compare-dialog";
import { toast } from "@/hooks/use-toast";

/** Quick-view modal for product cards — peek at a piece without leaving the grid */
export function QuickView() {
  const product = useSiteStore((s) => s.quickViewProduct);
  const closeQuickView = useSiteStore((s) => s.closeQuickView);
  const navigate = useSiteStore((s) => s.navigate);
  const openQuickView = useSiteStore((s) => s.openQuickView);
  const wishlist = useSiteStore((s) => s.wishlist);
  const compare = useSiteStore((s) => s.compare);
  const toggleWishlist = useSiteStore((s) => s.toggleWishlist);
  const addToEnquiry = useSiteStore((s) => s.addToEnquiry);
  const setEnquiryOpen = useSiteStore((s) => s.setEnquiryOpen);
  const [activeImage, setActiveImage] = useState(0);
  const inCompare = !!product && compare.includes(product.id);

  const images = product?.images?.length ? product.images : ["/images/cat-living.png"];
  const cover = images[Math.min(activeImage, images.length - 1)];

  const handleWishlist = (id: string, name: string) => {
    const added = toggleWishlist(id);
    toast({ title: added ? "Added to wishlist" : "Removed from wishlist", description: name });
  };

  const handleAddEnquiry = () => {
    if (!product) return;
    addToEnquiry({
      productId: product.id,
      name: product.name,
      image: images[0],
      price: product.price,
    });
    closeQuickView();
    setEnquiryOpen(true);
  };

  const specs = product
    ? [
        { icon: Layers, label: "Materials", value: product.materials },
        { icon: Ruler, label: "Dimensions", value: product.dimensions },
        { icon: Palette, label: "Finishes", value: product.colors },
      ].filter((s) => s.value)
    : [];

  return (
    <Dialog
      open={!!product}
      onOpenChange={(open) => {
        if (!open) {
          closeQuickView();
          // Reset thumbnail selection for the next product
          requestAnimationFrame(() => setActiveImage(0));
        }
      }}
    >
      <DialogContent
        className="max-w-3xl max-h-[92vh] overflow-y-auto bg-card border-walnut-100 rounded-3xl p-0 gap-0 overflow-hidden"
        aria-describedby={product?.description ? "quickview-desc" : undefined}
      >
        {product && (
          <div className="grid sm:grid-cols-2">
            {/* Image side */}
            <div className="relative bg-walnut-50">
              <div className="aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-[380px] img-zoom">
                <img src={cover} alt={product.name} className="w-full h-full object-cover" />
              </div>
              {product.badge && (
                <Badge className="absolute top-4 left-4 bg-walnut-800/90 text-ivory hover:bg-walnut-800 border-0 text-[11px] tracking-wide font-medium px-3 py-1 rounded-full">
                  {product.badge}
                </Badge>
              )}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white/80 backdrop-blur-md rounded-full px-3 py-2 border border-white/40 shadow-lg">
                  {images.slice(0, 5).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      aria-label={`View image ${i + 1}`}
                      aria-current={i === Math.min(activeImage, images.length - 1)}
                      className={cn(
                        "h-2.5 w-2.5 rounded-full transition-all cursor-pointer",
                        i === Math.min(activeImage, images.length - 1)
                          ? "bg-walnut-800 scale-110"
                          : "bg-walnut-300 hover:bg-walnut-400"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Details side */}
            <div className="flex flex-col p-6 sm:p-8">
              <DialogTitle className="font-display text-2xl leading-tight text-walnut-900 text-left">
                {product.name}
              </DialogTitle>
              <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">

                {product.categoryName && (
                  <span className="text-[11px] uppercase tracking-wider text-gold-dark font-semibold">
                    {product.categoryName}
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                {product.price != null ? (
                  <>
                    <span className="text-2xl font-semibold text-walnut-800">{formatINR(product.price)}</span>
                    <span className="text-xs text-muted-foreground">onwards</span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium tracking-wide text-gold-dark bg-gold/10 border border-gold/30 rounded-full px-3.5 py-1.5">
                    Request a Quote
                  </span>
                )}
              </div>

              {product.description && (
                <DialogDescription
                  id="quickview-desc"
                  className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-5 text-left"
                >
                  {product.description}
                </DialogDescription>
              )}

              {specs.length > 0 && (
                <dl className="mt-5 space-y-2.5 rounded-2xl border border-walnut-100 bg-ivory/60 p-4">
                  {specs.map((s) => (
                    <div key={s.label} className="flex items-start gap-3 text-sm">
                      <s.icon className="h-4 w-4 mt-0.5 text-gold-dark shrink-0" aria-hidden />
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground w-24 shrink-0 pt-0.5">
                        {s.label}
                      </dt>
                      <dd className="text-walnut-800">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="mt-auto pt-6 space-y-3">
                <div className="grid grid-cols-[1fr_auto_auto] gap-2.5">
                  <Button
                    onClick={handleAddEnquiry}
                    className="h-11 rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory font-semibold"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Enquiry
                  </Button>
                  <Button
                    onClick={() => handleWishlist(product.id, product.name)}
                    variant="outline"
                    aria-label={wishlist.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                    className={cn(
                      "h-11 w-11 rounded-full p-0 border-walnut-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600",
                      wishlist.includes(product.id) && "text-red-600 border-red-200 bg-red-50"
                    )}
                  >
                    <Heart className={cn("h-4 w-4", wishlist.includes(product.id) && "fill-current")} />
                  </Button>
                  <CompareToggle
                    product={product}
                    className={cn(
                      "h-11 w-11 border border-walnut-200 hover:border-gold/60",
                      inCompare && "border-gold bg-gold/10"
                    )}
                    iconClassName="h-4 w-4"
                  />
                </div>
                <Button
                  onClick={() => {
                    closeQuickView();
                    navigate({ name: "product", slug: product.slug });
                  }}
                  variant="outline"
                  className="w-full h-11 rounded-full border-walnut-300 text-walnut-800 hover:bg-walnut-50 font-medium"
                >
                  View Full Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Circular quick-view trigger shown on product card images */
export function QuickViewButton({ onClick, name }: { onClick: () => void; name: string }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={`Quick view ${name}`}
      title="Quick view"
      className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-white/70 backdrop-blur text-walnut-700 hover:bg-white hover:text-gold-dark sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden
      >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  );
}
