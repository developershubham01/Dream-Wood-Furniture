"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Minus,
  Plus,
  Trash2,
  ClipboardList,
  MessageCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  CircleHelp,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useSiteStore } from "@/lib/store";
import { useSiteData } from "@/lib/site-data";
import { formatINR, whatsappLink } from "@/lib/format";
import { toast } from "@/hooks/use-toast";

const detailsSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91[-\s]?)?[0]?[6-9]\d{9}$/, "Enter a valid 10-digit mobile"),
  email: z.string().trim().email("Enter a valid email").or(z.literal("")),
  contactMethod: z.enum(["phone", "whatsapp", "email"]),
});

type Details = z.infer<typeof detailsSchema>;

export function EnquirySheet() {
  const enquiryOpen = useSiteStore((s) => s.enquiryOpen);
  const setEnquiryOpen = useSiteStore((s) => s.setEnquiryOpen);
  const enquiryCart = useSiteStore((s) => s.enquiryCart);
  const removeFromEnquiry = useSiteStore((s) => s.removeFromEnquiry);
  const setQuantity = useSiteStore((s) => s.setQuantity);
  const clearEnquiry = useSiteStore((s) => s.clearEnquiry);
  const navigate = useSiteStore((s) => s.navigate);
  const goHome = useSiteStore((s) => s.goHome);
  const { data } = useSiteData();

  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Details>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { name: "", phone: "", email: "", contactMethod: "phone" },
  });

  const contactMethod = watch("contactMethod");

  const onSubmit = async (values: Details) => {
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          source: "product-quote",
          furnitureType: enquiryCart.length === 1 ? "Product enquiry" : "Multiple product enquiry",
          description: `Enquiry list: ${enquiryCart
            .map((i) => `${i.name} × ${i.quantity}`)
            .join(", ")}`,
          items: enquiryCart.map((i) => ({
            productId: i.productId,
            productName: i.name,
            quantity: i.quantity,
          })),
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      clearEnquiry();
      toast({
        title: "Enquiry submitted!",
        description: "Our team will get back to you shortly.",
      });
    } catch {
      toast({
        title: "Submission failed",
        description: "Please try again or WhatsApp us directly.",
        variant: "destructive",
      });
    }
  };

  const totalValue = enquiryCart.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0);

  // Structured WhatsApp message for the enquiry list (numbered, with prices)
  const waMessage = [
    "Hi Dream Wood Furniture! I'd like a quote for:",
    ...enquiryCart.map(
      (i, idx) =>
        `${idx + 1}. ${i.name} × ${i.quantity}${i.price != null ? ` (${formatINR(i.price)} onwards)` : ""}`
    ),
    totalValue > 0 ? `Indicative total: ${formatINR(totalValue)}` : "",
    "— sent from your website enquiry list",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <Sheet
      open={enquiryOpen}
      onOpenChange={(o) => {
        setEnquiryOpen(o);
        if (!o) setSubmitted(false);
      }}
    >
      <SheetContent className="w-full sm:max-w-md bg-cream border-walnut-100 p-0 flex flex-col">
        <SheetHeader className="p-5 border-b border-walnut-100 bg-card">
          <SheetTitle className="flex items-center gap-2.5 font-display text-lg text-walnut-900">
            <ClipboardList className="h-5 w-5 text-gold-dark" aria-hidden />
            Your Enquiry List
          </SheetTitle>
          <SheetDescription className="text-xs">
            {enquiryCart.length === 0
              ? "Add pieces you like, then request one combined quote."
              : `${enquiryCart.length} piece${enquiryCart.length > 1 ? "s" : ""} — we'll quote these together.`}
          </SheetDescription>
        </SheetHeader>

        {submitted ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
            <span className="h-16 w-16 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-gold-dark" aria-hidden />
            </span>
            <h3 className="mt-5 font-display text-xl text-walnut-900">Quote request sent!</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              We've received your enquiry list and will reach out on your preferred contact method.
            </p>
            <Button
              asChild
              className="mt-6 rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory"
            >
              <a
                href={whatsappLink(data.settings.contact.whatsapp, waMessage)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Also send on WhatsApp
              </a>
            </Button>
            <Button
              variant="outline"
              onClick={() => setEnquiryOpen(false)}
              className="mt-3 rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-50"
            >
              Continue browsing
            </Button>
            {data.faqs.length > 0 && (
              <button
                onClick={() => {
                  setEnquiryOpen(false);
                  goHome("faq");
                }}
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-gold-dark hover:text-gold-dark/80 underline underline-offset-4 decoration-gold/40 hover:decoration-gold-dark/60 transition-colors cursor-pointer"
              >
                <CircleHelp className="h-3.5 w-3.5" aria-hidden />
                Read our FAQs while you wait
              </button>
            )}
          </div>
        ) : enquiryCart.length === 0 ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
            <span className="h-16 w-16 rounded-full bg-walnut-50 border border-walnut-100 flex items-center justify-center">
              <ClipboardList className="h-7 w-7 text-walnut-300" aria-hidden />
            </span>
            <h3 className="mt-5 font-display text-xl text-walnut-900">Your list is empty</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              Tap "Enquiry" on any product to start building your quote list.
            </p>
            <Button
              onClick={() => {
                setEnquiryOpen(false);
                navigate({ name: "shop" });
              }}
              className="mt-6 rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory"
            >
              Browse Furniture
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[46vh]">
              {enquiryCart.map((item, idx) => (
                <div
                  key={item.productId}
                  className="relative flex gap-4 p-3 pl-4 rounded-2xl bg-card border border-walnut-100"
                >
                  {/* Numbered badge — easy to reference on a call */}
                  <span
                    className="absolute -left-1.5 top-5 h-6 w-6 rounded-full bg-walnut-800 text-ivory text-[11px] font-bold flex items-center justify-center shadow"
                    aria-hidden
                  >
                    {idx + 1}
                  </span>
                  { }
                  <img
                    src={item.image || "/images/cat-living.png"}
                    alt={item.name}
                    className="h-20 w-20 rounded-xl object-cover border border-walnut-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-walnut-900 leading-snug line-clamp-2">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.price != null ? formatINR(item.price) + " onwards" : "Quote on request"}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center border border-walnut-200 rounded-full h-8 bg-background">
                        <button
                          onClick={() => setQuantity(item.productId, item.quantity - 1)}
                          className="h-full px-2.5 text-walnut-700 hover:text-walnut-900 cursor-pointer"
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(item.productId, item.quantity + 1)}
                          className="h-full px-2.5 text-walnut-700 hover:text-walnut-900 cursor-pointer"
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromEnquiry(item.productId)}
                        className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {totalValue > 0 && (
                <p className="text-xs text-muted-foreground px-1">
                  Indicative total:{" "}
                  <span className="font-semibold text-walnut-800">{formatINR(totalValue)}</span>{" "}
                  (final quote confirmed by our team)
                </p>
              )}
            </div>

            {/* Details form */}
            <div className="border-t border-walnut-100 bg-card p-5 space-y-3.5">
              <Separator className="bg-walnut-100" />
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="enq-name" className="text-xs font-medium text-walnut-900">
                      Name *
                    </Label>
                    <Input
                      id="enq-name"
                      {...register("name")}
                      placeholder="Your name"
                      className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold text-sm mt-1"
                    />
                    {errors.name && (
                      <p role="alert" className="text-[11px] text-destructive mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="enq-phone" className="text-xs font-medium text-walnut-900">
                      Mobile *
                    </Label>
                    <Input
                      id="enq-phone"
                      {...register("phone")}
                      type="tel"
                      placeholder="10-digit"
                      className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold text-sm mt-1"
                    />
                    {errors.phone && (
                      <p role="alert" className="text-[11px] text-destructive mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="enq-email" className="text-xs font-medium text-walnut-900">
                      Email
                    </Label>
                    <Input
                      id="enq-email"
                      {...register("email")}
                      type="email"
                      placeholder="Optional"
                      className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold text-sm mt-1"
                    />
                    {errors.email && (
                      <p role="alert" className="text-[11px] text-destructive mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-walnut-900">Reach me on</Label>
                    <Select
                      value={contactMethod}
                      onValueChange={(v) => setValue("contactMethod", v as Details["contactMethod"])}
                    >
                      <SelectTrigger className="h-10 rounded-xl border-walnut-200 focus-visible:ring-gold text-sm mt-1 w-full cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone">Phone call</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-1">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-11 rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory font-medium text-sm"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Request Quote"
                    )}
                  </Button>
                  <Button
                    type="button"
                    asChild
                    variant="outline"
                    className="h-11 rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-50"
                  >
                    <a
                      href={whatsappLink(data.settings.contact.whatsapp, waMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Send enquiry list on WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
