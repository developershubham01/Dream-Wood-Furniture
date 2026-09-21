"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Phone,
  Mail,
  Ruler,
  Palette,
  PackageCheck,
  CheckCircle2,
  Loader2,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSiteData } from "@/lib/site-data";
import { whatsappLink } from "@/lib/format";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91[-\s]?)?[0]?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z.string().trim().email("Enter a valid email address").or(z.literal("")),
  furnitureType: z.string().min(1, "Choose a furniture type"),
  material: z.string().min(1, "Choose a preferred material"),
  size: z.string().max(120).optional().or(z.literal("")),
  budget: z.string().optional().or(z.literal("")),
  description: z
    .string()
    .trim()
    .min(10, "Tell us a little about what you need (min 10 characters)")
    .max(2000),
  referenceNote: z.string().max(500).optional().or(z.literal("")),
  contactMethod: z.enum(["phone", "whatsapp", "email"]),
});

type FormValues = z.infer<typeof formSchema>;

const FURNITURE_TYPES = [
  "Sofa / Seating",
  "Bed",
  "Wardrobe",
  "Dining Set",
  "TV Unit",
  "Coffee / Side Table",
  "Study Table",
  "Full Home Interiors",
  "Something Else",
];

const MATERIALS = [
  "Solid Wood",
  "Engineered Wood",
  "Fabric Upholstery",
  "Leather Upholstery",
  "Cane / Rattan",
  "Mixed Materials",
  "Not sure — advise me",
];

const BUDGETS = [
  "Under ₹25,000",
  "₹25,000 – ₹50,000",
  "₹50,000 – ₹1,00,000",
  "₹1,00,000 – ₹2,00,000",
  "Above ₹2,00,000",
  "Prefer to discuss",
];

export function CustomView() {
  const { data } = useSiteData();
  const [submitted, setSubmitted] = useState<null | { ok: boolean }>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      furnitureType: "",
      material: "",
      size: "",
      budget: "",
      description: "",
      referenceNote: "",
      contactMethod: "phone",
    },
  });

  const contactMethod = watch("contactMethod");
  const contact = data.settings.contact;

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, source: "custom-form" }),
      });
      if (!res.ok) throw new Error("failed");
      setSubmitted({ ok: true });
    } catch {
      setSubmitted({ ok: false });
    }
  };

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-walnut-900">
        { }
        <img
          src={data.settings.custom.image}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/90 via-espresso/60 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 lg:py-24">
          <p className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Bespoke Furniture</p>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl text-ivory leading-tight max-w-2xl">
            Custom Furniture Enquiry
          </h1>
          <p className="mt-4 text-ivory/75 max-w-xl leading-relaxed">
            Tell us about your space and what you're dreaming of. We'll get back with ideas,
            material options and a transparent quotation.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-12 items-start">
          {/* Side info */}
          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 lg:sticky lg:top-32"
          >
            <div className="rounded-3xl bg-walnut-900 text-ivory p-7 relative overflow-hidden">
              <div className="absolute inset-0 wood-texture opacity-70" aria-hidden />
              <h2 className="relative font-display text-2xl">How it works</h2>
              <ol className="relative mt-6 space-y-5">
                {[
                  { icon: MessageCircle, text: "Share your idea, room and budget range" },
                  { icon: Ruler, text: "We discuss measurements & propose a design" },
                  { icon: Palette, text: "Choose materials and finishes at our showroom" },
                  { icon: PackageCheck, text: "Your piece is crafted and delivered" },
                ].map((s, i) => (
                  <li key={i} className="flex items-start gap-3.5">
                    <span className="h-9 w-9 shrink-0 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
                      <s.icon className="h-4 w-4 text-gold-light" aria-hidden />
                    </span>
                    <p className="text-sm text-ivory/80 leading-snug pt-1.5">{s.text}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-3xl border border-walnut-100 bg-card p-7">
              <h3 className="font-display text-lg text-walnut-900">Prefer to talk?</h3>
              <div className="mt-4 space-y-3.5 text-sm">
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-walnut-800 hover:text-gold-dark transition-colors">
                  <Phone className="h-4 w-4 text-gold-dark" aria-hidden /> {contact.phoneDisplay}
                </a>
                <a
                  href={whatsappLink(contact.whatsapp, "Hi! I'd like to discuss custom furniture for my home.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-walnut-800 hover:text-gold-dark transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-gold-dark" aria-hidden /> WhatsApp us
                </a>
                <p className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-gold-dark shrink-0 mt-0.5" aria-hidden />
                  <span>
                    {contact.addressLine1}, {contact.addressLine2}
                    <br />
                    {contact.addressLine3}
                  </span>
                </p>
                <p className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="h-4 w-4 text-gold-dark" aria-hidden /> {contact.hours}
                </p>
              </div>
            </div>
          </motion.aside>

          {/* Form / Success */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <AnimatePresence mode="wait">
              {submitted?.ok ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl border border-gold/40 bg-gradient-to-b from-gold/10 to-card p-10 text-center"
                >
                  <span className="mx-auto h-16 w-16 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-gold-dark" aria-hidden />
                  </span>
                  <h2 className="mt-6 font-display text-2xl sm:text-3xl text-walnut-900">
                    Enquiry received — thank you!
                  </h2>
                  <p className="mt-3 text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Our team will reach out shortly on your preferred contact method. If you'd like to
                    add anything, feel free to WhatsApp us meanwhile.
                  </p>
                  <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
                    <Button
                      asChild
                      className="rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory px-6"
                    >
                      <a
                        href={whatsappLink(
                          contact.whatsapp,
                          "Hi! I just submitted a custom furniture enquiry on your website."
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Continue on WhatsApp
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSubmitted(null)}
                      className="rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-50 px-6"
                    >
                      Submit another enquiry
                    </Button>
                  </div>
                </motion.div>
              ) : submitted && !submitted.ok ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center"
                >
                  <h2 className="font-display text-2xl text-red-800">Something went wrong</h2>
                  <p className="mt-3 text-red-700/80 text-sm">
                    We couldn't submit your enquiry. Please try again or call us directly at{" "}
                    <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="font-semibold underline">
                      {contact.phoneDisplay}
                    </a>
                    .
                  </p>
                  <Button
                    onClick={() => setSubmitted(null)}
                    className="mt-6 rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory"
                  >
                    Back to the form
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="rounded-3xl border border-walnut-100 bg-card p-6 sm:p-9 shadow-xl shadow-walnut-900/5"
                  noValidate
                >
                  <h2 className="font-display text-2xl text-walnut-900">Tell us about your piece</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fields marked * are required. Your details stay private.
                  </p>

                  <div className="mt-8 grid sm:grid-cols-2 gap-5">
                    <FormField label="Full Name *" error={errors.name?.message}>
                      <Input {...register("name")} placeholder="e.g. Aarav Mehta" className="h-11 rounded-xl border-walnut-200 focus-visible:ring-gold" />
                    </FormField>

                    <FormField label="Mobile Number *" error={errors.phone?.message}>
                      <Input {...register("phone")} type="tel" placeholder="10-digit mobile" className="h-11 rounded-xl border-walnut-200 focus-visible:ring-gold" />
                    </FormField>

                    <FormField label="Email (optional)" error={errors.email?.message} className="sm:col-span-2">
                      <Input {...register("email")} type="email" placeholder="you@example.com" className="h-11 rounded-xl border-walnut-200 focus-visible:ring-gold" />
                    </FormField>

                    <FormField label="Furniture Type *" error={errors.furnitureType?.message}>
                      <Select
                        value={watch("furnitureType")}
                        onValueChange={(v) => setValue("furnitureType", v, { shouldValidate: true })}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-walnut-200 focus-visible:ring-gold w-full cursor-pointer">
                          <SelectValue placeholder="Choose…" />
                        </SelectTrigger>
                        <SelectContent>
                          {FURNITURE_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Preferred Material *" error={errors.material?.message}>
                      <Select
                        value={watch("material")}
                        onValueChange={(v) => setValue("material", v, { shouldValidate: true })}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-walnut-200 focus-visible:ring-gold w-full cursor-pointer">
                          <SelectValue placeholder="Choose…" />
                        </SelectTrigger>
                        <SelectContent>
                          {MATERIALS.map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Preferred Size (optional)" error={errors.size?.message}>
                      <Input {...register("size")} placeholder='e.g. "L 180 × D 90 cm" or "6-seater"' className="h-11 rounded-xl border-walnut-200 focus-visible:ring-gold" />
                    </FormField>

                    <FormField label="Budget Range (optional)">
                      <Select value={watch("budget") || undefined} onValueChange={(v) => setValue("budget", v)}>
                        <SelectTrigger className="h-11 rounded-xl border-walnut-200 focus-visible:ring-gold w-full cursor-pointer">
                          <SelectValue placeholder="Choose…" />
                        </SelectTrigger>
                        <SelectContent>
                          {BUDGETS.map((b) => (
                            <SelectItem key={b} value={b}>{b}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField
                      label="Describe Your Requirements *"
                      error={errors.description?.message}
                      className="sm:col-span-2"
                    >
                      <Textarea
                        {...register("description")}
                        rows={5}
                        placeholder="Tell us about the room, style you like, storage needs, references you've seen…"
                        className="rounded-xl border-walnut-200 focus-visible:ring-gold resize-none"
                      />
                    </FormField>

                    <FormField
                      label="Reference link (optional)"
                      className="sm:col-span-2"
                      hint="Paste a Pinterest board, Instagram post or Justdial photo link you like"
                    >
                      <Input {...register("referenceNote")} placeholder="https://…" className="h-11 rounded-xl border-walnut-200 focus-visible:ring-gold" />
                    </FormField>

                    {/* Contact method */}
                    <fieldset className="sm:col-span-2">
                      <legend className="text-sm font-medium text-walnut-900 mb-3">
                        Preferred contact method
                      </legend>
                      <RadioGroup
                        value={contactMethod}
                        onValueChange={(v) => setValue("contactMethod", v as FormValues["contactMethod"])}
                        className="grid grid-cols-3 gap-2"
                      >
                        {[
                          { value: "phone", label: "Phone call", icon: Phone },
                          { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
                          { value: "email", label: "Email", icon: Mail },
                        ].map((opt) => (
                          <Label
                            key={opt.value}
                            className={cn(
                              "flex flex-col items-center justify-center gap-1.5 rounded-xl border p-4 cursor-pointer transition-all",
                              contactMethod === opt.value
                                ? "border-gold bg-gold/10 text-gold-dark"
                                : "border-walnut-200 text-muted-foreground hover:border-walnut-400"
                            )}
                          >
                            <RadioGroupItem value={opt.value} className="sr-only" />
                            <opt.icon className="h-5 w-5" aria-hidden />
                            <span className="text-xs font-medium">{opt.label}</span>
                          </Label>
                        ))}
                      </RadioGroup>
                    </fieldset>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-8 w-full h-13 rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory font-semibold text-base shadow-lg shadow-walnut-900/20 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Submitting enquiry…
                      </>
                    ) : (
                      <>
                        Submit Enquiry
                      </>
                    )}
                  </Button>
                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    By submitting, you agree to be contacted about your enquiry. We never spam.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  error,
  hint,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="text-sm font-medium text-walnut-900 mb-1.5 block">{label}</Label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-destructive font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
