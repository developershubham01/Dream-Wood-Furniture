"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Plus,
  Minus,
  MessageCircle,
  ClipboardList,
  ChevronRight,
  Ruler,
  Layers,
  Palette,
  Truck,
  PackageX,
  Share2,
  Link2,
  Check,
  Printer,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSiteData } from "@/lib/site-data";
import { useSiteStore } from "@/lib/store";
import { formatINR, whatsappLink } from "@/lib/format";
import { ProductCard } from "../product-card";
import { RecentlyViewed } from "../recently-viewed";
import { ProductLightbox } from "../product-lightbox";
import { CompareToggle } from "../compare-dialog";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export function ProductView({ slug }: { slug: string }) {
  const { data } = useSiteData();
  const navigate = useSiteStore((s) => s.navigate);
  const wishlist = useSiteStore((s) => s.wishlist);
  const toggleWishlist = useSiteStore((s) => s.toggleWishlist);
  const addToEnquiry = useSiteStore((s) => s.addToEnquiry);
  const setEnquiryOpen = useSiteStore((s) => s.setEnquiryOpen);

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  // Native share availability is browser-only — detect after mount (hydration-safe)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const product = useMemo(() => data.products.find((p) => p.slug === slug) ?? null, [data.products, slug]);
  const pushRecentlyViewed = useSiteStore((s) => s.pushRecentlyViewed);

  // Track this product in the recently-viewed list (max 8, newest first)
  useEffect(() => {
    if (product) pushRecentlyViewed(product.id);
  }, [product, pushRecentlyViewed]);

  const related = useMemo(() => {
    if (!product) return [];
    return data.products
      .filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug)
      .slice(0, 4);
  }, [data.products, product]);

  if (!product) {
    return (
      <div className="bg-background py-24">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <PackageX className="h-12 w-12 mx-auto text-walnut-300 mb-4" aria-hidden />
          <h1 className="font-display text-2xl text-walnut-900">Piece not found</h1>
          <p className="text-muted-foreground mt-2">This piece may have been retired or is being updated.</p>
          <Button
            onClick={() => navigate({ name: "shop" })}
            className="mt-6 rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory px-7"
          >
            Back to Collection
          </Button>
        </div>
      </div>
    );
  }

  const inWishlist = wishlist.includes(product.id);
  const cover = product.images[activeImage] || product.images[0] || "/images/cat-living.png";
  const waMessage = `Hi Dream Wood Furniture! I'm interested in the ${product.name}${
    product.price ? ` (${formatINR(product.price)})` : ""
  } listed on your website. Could you share more details?`;

  const handleAddEnquiry = () => {
    addToEnquiry({ productId: product.id, name: product.name, image: cover, price: product.price }, qty);
    setEnquiryOpen(true);
  };

  const productUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/#product/${product.slug}`
      : `#product/${product.slug}`;

  const shareMessage = `Check out the ${product.name} at Dream Wood Furniture, Seawoods (Navi Mumbai)${
    product.price != null ? ` — ${formatINR(product.price)} onwards` : ""
  }: ${productUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      toast({ title: "Link copied", description: "Share it with family or your interior designer." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Could not copy", description: "Copy the address from your browser bar instead.", variant: "destructive" });
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: product.name, text: shareMessage, url: productUrl });
    } catch {
      // user dismissed the share sheet — no action needed
    }
  };

  return (
    <div className="bg-background">
      {/* Print-only letterhead (spec sheet) */}
      <div className="hidden print:block border-b-2 border-walnut-800 pb-3 mb-6">
        <p className="font-display text-2xl text-walnut-900">Dream Wood Furniture</p>
        <p className="text-xs text-walnut-700 mt-1">
          {data.settings.contact.addressLine1}, {data.settings.contact.addressLine2}, {data.settings.contact.addressLine3} ·{" "}
          {data.settings.contact.phoneDisplay} · Printed {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-ivory/60 border-b border-walnut-100 print:hidden">
        <ol className="mx-auto max-w-7xl px-4 sm:px-6 py-3.5 flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto scrollbar-none">
          <li>
            <button onClick={() => navigate({ name: "home" })} className="hover:text-walnut-800 transition-colors cursor-pointer">
              Home
            </button>
          </li>
          <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
          <li>
            <button onClick={() => navigate({ name: "shop" })} className="hover:text-walnut-800 transition-colors cursor-pointer">
              Shop
            </button>
          </li>
          {product.categorySlug && (
            <>
              <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
              <li>
                <button
                  onClick={() => navigate({ name: "shop", category: product.categorySlug! })}
                  className="hover:text-walnut-800 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {product.categoryName}
                </button>
              </li>
            </>
          )}
          <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
          <li className="text-walnut-900 font-medium whitespace-nowrap" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 lg:py-16 print:px-0 print:py-0">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start print:block">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-32"
          >
            <div className="relative rounded-3xl overflow-hidden bg-walnut-50 border border-walnut-100 aspect-square img-zoom group print:aspect-auto print:rounded-none print:border-0 print:max-w-[105mm] print-avoid-break">
              { }
              <img src={cover} alt={product.name} className="w-full h-full object-cover print:object-contain print:h-auto" />
              {/* Click anywhere to open the zoom viewer */}
              <button
                onClick={() => setLightboxOpen(true)}
                aria-label={`Zoom in — view larger images of ${product.name}`}
                className="absolute inset-0 cursor-zoom-in print:hidden"
              />
              {/* Hover hint chip */}
              <span
                className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur px-3 py-1.5 text-[11px] font-medium text-ivory opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 print:hidden"
                aria-hidden
              >
                <ZoomIn className="h-3.5 w-3.5" />
                Tap to zoom
              </span>
              {product.badge && (
                <Badge className="absolute top-4 left-4 bg-walnut-800/90 text-ivory border-0 text-xs px-3 py-1.5 rounded-full">
                  {product.badge}
                </Badge>
              )}
              <button
                onClick={() => {
                  const added = toggleWishlist(product.id);
                  toast({ title: added ? "Added to wishlist" : "Removed from wishlist", description: product.name });
                }}
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                className={cn(
                  "absolute top-4 right-4 h-11 w-11 rounded-full flex items-center justify-center backdrop-blur transition-all cursor-pointer shadow-md print:hidden",
                  inWishlist ? "bg-white text-red-600" : "bg-white/80 text-walnut-700 hover:bg-white hover:text-red-500"
                )}
              >
                <Heart className={cn("h-5 w-5", inWishlist && "fill-current scale-110")} />
              </button>
            </div>

            {product.images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-none print:hidden">
                {product.images.map((img, i) => (
                  <button
                    key={img + i}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                    className={cn(
                      "h-20 w-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0",
                      activeImage === i ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    { }
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col"
          >
            {product.categoryName && (
              <button
                onClick={() => navigate({ name: "shop", category: product.categorySlug! })}
                className="self-start text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark hover:text-gold transition-colors cursor-pointer"
              >
                {product.categoryName}
              </button>
            )}
            <h1 className="mt-3 font-display text-3xl sm:text-4xl leading-tight text-walnut-900 text-balance">
              {product.name}
            </h1>

            <div className="mt-6 flex items-baseline gap-3">
              {product.price != null ? (
                <>
                  <span className="text-3xl font-semibold text-walnut-800">{formatINR(product.price)}</span>
                  <span className="text-sm text-muted-foreground">onwards · excl. taxes</span>
                </>
              ) : (
                <span className="text-xl font-medium text-gold-dark tracking-wide">
                  Price on request — Request a Quote below
                </span>
              )}
            </div>

            <Separator className="my-7 bg-walnut-100" />

            {product.description && (
              <p className="text-[15px] leading-relaxed text-foreground/85">{product.description}</p>
            )}

            {/* Specs */}
            <div className="mt-7 grid sm:grid-cols-2 gap-4 print-avoid-break">
              {product.materials && <Spec icon={Layers} label="Materials" value={product.materials} />}
              {product.dimensions && <Spec icon={Ruler} label="Dimensions" value={product.dimensions} />}
              {product.colors && <Spec icon={Palette} label="Finishes" value={product.colors} />}
              <Spec icon={Truck} label="Delivery" value="Delivery assistance available — confirm at showroom or on call" />
            </div>

            {/* Quantity + actions */}
            <div className="mt-9 flex flex-wrap items-center gap-4 print:hidden">
              <div className="flex items-center border border-walnut-200 rounded-full h-12 bg-card">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-full px-4 text-walnut-700 hover:text-walnut-900 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-semibold text-walnut-900 tabular-nums" aria-live="polite">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(9, q + 1))}
                  className="h-full px-4 text-walnut-700 hover:text-walnut-900 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button
                onClick={handleAddEnquiry}
                className="h-12 px-7 rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory font-medium text-base shadow-lg shadow-walnut-900/15 transition-all hover:-translate-y-0.5"
              >
                <ClipboardList className="h-5 w-5 mr-2" />
                Add to Enquiry List
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-12 px-7 rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-800 hover:text-ivory hover:border-walnut-800 font-medium text-base transition-all"
              >
                <a href={whatsappLink(data.settings.contact.whatsapp, waMessage)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Enquire on WhatsApp
                </a>
              </Button>

              <CompareToggle product={product} label className="h-12 px-6 text-base" />
            </div>

            <p className="mt-5 text-xs text-muted-foreground leading-relaxed print:hidden">
              This piece can typically be customised in size, finish or fabric — mention your preference in the
              enquiry. Images are indicative; visit the showroom to see material samples.
            </p>

            {/* Share + print row */}
            <div className="mt-6 flex flex-wrap items-center gap-2 print:hidden">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mr-1">
                Share
              </span>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-walnut-200 text-walnut-700 hover:bg-walnut-50 hover:border-walnut-400 text-xs"
              >
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                  WhatsApp
                </a>
              </Button>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-walnut-200 text-walnut-700 hover:bg-walnut-50 hover:border-walnut-400 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Link2 className="h-3.5 w-3.5 mr-1.5" />
                    Copy Link
                  </>
                )}
              </Button>
              {canNativeShare && (
                <Button
                  onClick={handleNativeShare}
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-full border-walnut-200 text-walnut-700 hover:bg-walnut-50 hover:border-walnut-400 text-xs"
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5" />
                  Share
                </Button>
              )}
              <span className="flex-1" aria-hidden />
              <Button
                onClick={() => window.print()}
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-walnut-300 text-walnut-800 hover:bg-walnut-800 hover:text-ivory hover:border-walnut-800 text-xs font-medium"
              >
                <Printer className="h-3.5 w-3.5 mr-1.5" />
                Print Spec Sheet
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20 lg:mt-28 print:hidden">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Complete the Room</p>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl text-walnut-900">You May Also Like</h2>
              </div>
              {product.categorySlug && (
                <Button
                  onClick={() => navigate({ name: "shop", category: product.categorySlug! })}
                  variant="ghost"
                  className="text-gold-dark hover:text-gold hover:bg-gold/10 rounded-full"
                >
                  More {product.categoryName}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Recently viewed */}
        <RecentlyViewed excludeId={product.id} />
      </div>

      {/* Zoom viewer */}
      <ProductLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        images={product.images}
        active={activeImage}
        onSelect={setActiveImage}
        productName={product.name}
      />
    </div>
  );
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="group flex gap-3.5 p-4 rounded-xl bg-ivory/70 border border-walnut-100 hover:border-walnut-200 hover:bg-ivory hover:shadow-md hover:shadow-walnut-900/5 transition-all duration-300">
      <span className="h-9 w-9 shrink-0 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/15 transition-colors">
        <Icon className="h-4.5 w-4.5 text-gold-dark" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm text-walnut-900 mt-1 leading-snug">{value}</p>
      </div>
    </div>
  );
}
