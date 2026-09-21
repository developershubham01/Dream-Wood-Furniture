"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Clock, MessageCircle, Navigation, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "../section-heading";
import { useSiteData } from "@/lib/site-data";
import { mapsDirectionsUrl, mapsEmbedUrl, whatsappLink } from "@/lib/format";
import { OpenNowBadge } from "../open-now-badge";

// FAQs come from the database (managed in Admin → FAQs) so the contact page
// always shows what the owner published — same source as the homepage FAQ section.

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91[-\s]?)?[0]?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z.string().trim().email("Enter a valid email").or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

type ContactValues = z.infer<typeof contactSchema>;

export function ContactView() {
  const { data } = useSiteData();
  const contact = data.settings.contact;
  const [submitted, setSubmitted] = useState<null | boolean>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", phone: "", email: "", description: "" },
  });

  const onSubmit = async (values: ContactValues) => {
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, source: "general", contactMethod: "phone" }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setSubmitted(false);
    }
  };

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="bg-walnut-900 relative overflow-hidden">
        <div className="absolute inset-0 wood-texture opacity-70" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-14 lg:py-20">
          <p className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Get in Touch</p>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl text-ivory leading-tight">
            We'd love to hear from you
          </h1>
          <p className="mt-4 text-ivory/70 max-w-xl leading-relaxed">
            Questions about a piece, a custom project, or delivery — call, WhatsApp, or drop by the showroom.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-8 lg:gap-12 items-start">
          {/* Info column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Card className="bg-card border-walnut-100 rounded-3xl">
              <CardContent className="p-7 space-y-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                    Showroom
                  </p>
                  <p className="font-display text-xl text-walnut-900 mt-1.5">Dream Wood Furniture</p>
                  <p className="text-sm text-muted-foreground">ड्रीम वुड फर्निचर</p>
                </div>

                <div className="space-y-4 text-sm">
                  <p className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gold-dark shrink-0 mt-0.5" aria-hidden />
                    <span className="text-foreground/85 leading-relaxed">
                      {contact.addressLine1}
                      <br />
                      {contact.addressLine2}
                      <br />
                      {contact.addressLine3}
                    </span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gold-dark shrink-0" aria-hidden />
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, "")}`}
                      className="font-medium text-walnut-800 hover:text-gold-dark transition-colors text-base"
                    >
                      {contact.phoneDisplay}
                    </a>
                  </p>
                  <p className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gold-dark shrink-0" aria-hidden />
                    <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                      <span className="text-foreground/85">{contact.hours}</span>
                      <OpenNowBadge openTime={contact.openTime} closeTime={contact.closeTime} />
                    </span>
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <Button asChild className="rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory h-11">
                    <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-50 h-11">
                    <a
                      href={whatsappLink(contact.whatsapp, "Hi Dream Wood Furniture! I have a question.")}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp Us
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-50 h-11">
                    <a href={mapsDirectionsUrl(contact.mapsQuery)} target="_blank" rel="noopener noreferrer">
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <div className="rounded-3xl overflow-hidden border border-walnut-100 shadow-lg shadow-walnut-900/10 h-[260px]">
              <iframe
                title="Dream Wood Furniture location"
                src={mapsEmbedUrl(contact.mapsQuery)}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </motion.div>

          {/* Form column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <AnimatePresence mode="wait">
              {submitted === true ? (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl border border-gold/40 bg-gradient-to-b from-gold/10 to-card p-10 text-center h-full flex flex-col justify-center"
                >
                  <span className="mx-auto h-16 w-16 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-gold-dark" aria-hidden />
                  </span>
                  <h2 className="mt-6 font-display text-2xl sm:text-3xl text-walnut-900">
                    Message received!
                  </h2>
                  <p className="mt-3 text-muted-foreground max-w-sm mx-auto">
                    Thank you for reaching out — we'll get back to you shortly. For anything urgent,
                    call {contact.phoneDisplay}.
                  </p>
                  <Button
                    onClick={() => setSubmitted(null)}
                    variant="outline"
                    className="mt-7 rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-50 self-center px-6"
                  >
                    Send another message
                  </Button>
                </motion.div>
              ) : submitted === false ? (
                <motion.div
                  key="err"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center"
                >
                  <h2 className="font-display text-2xl text-red-800">Couldn't send message</h2>
                  <p className="mt-3 text-sm text-red-700/80">
                    Please try again, or reach us directly at{" "}
                    <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="font-semibold underline">
                      {contact.phoneDisplay}
                    </a>
                    .
                  </p>
                  <Button onClick={() => setSubmitted(null)} className="mt-6 rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory">
                    Try again
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="rounded-3xl border border-walnut-100 bg-card p-6 sm:p-9 shadow-xl shadow-walnut-900/5"
                  noValidate
                >
                  <h2 className="font-display text-2xl text-walnut-900">Send us a message</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    We usually respond within working hours ({contact.hours}).
                  </p>

                  <div className="mt-7 grid sm:grid-cols-2 gap-5">
                    <div>
                      <Label className="text-sm font-medium text-walnut-900 mb-1.5 block">Your Name *</Label>
                      <Input
                        {...register("name")}
                        placeholder="Full name"
                        className="h-11 rounded-xl border-walnut-200 focus-visible:ring-gold"
                      />
                      {errors.name && (
                        <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-walnut-900 mb-1.5 block">Mobile *</Label>
                      <Input
                        {...register("phone")}
                        type="tel"
                        placeholder="10-digit mobile"
                        className="h-11 rounded-xl border-walnut-200 focus-visible:ring-gold"
                      />
                      {errors.phone && (
                        <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.phone.message}</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-sm font-medium text-walnut-900 mb-1.5 block">Email (optional)</Label>
                      <Input
                        {...register("email")}
                        type="email"
                        placeholder="you@example.com"
                        className="h-11 rounded-xl border-walnut-200 focus-visible:ring-gold"
                      />
                      {errors.email && (
                        <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-sm font-medium text-walnut-900 mb-1.5 block">
                        How can we help? (optional)
                      </Label>
                      <Textarea
                        {...register("description")}
                        rows={5}
                        placeholder="A sofa for my living room, a wardrobe quote, delivery question…"
                        className="rounded-xl border-walnut-200 focus-visible:ring-gold resize-none"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-8 w-full h-13 rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory font-semibold text-base shadow-lg shadow-walnut-900/20 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* FAQ section — database-driven (Admin → FAQs); hidden when none are published */}
      {data.faqs.length > 0 && (
      <section aria-labelledby="faq-heading" className="py-16 lg:py-24 bg-ivory/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Visually hidden label so the section landmark is announced by its heading text */}
          <span id="faq-heading" className="sr-only">
            Frequently Asked Questions
          </span>
          <SectionHeading
            eyebrow="Common Questions"
            title="Frequently Asked Questions"
            description="Quick answers about visiting, customisation, quotes and delivery. For anything else, you're always welcome to call or WhatsApp us."
          />

          <div className="mt-10 lg:mt-14 max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {data.faqs.map((f) => (
                <AccordionItem
                  key={f.id}
                  value={f.id}
                  className="group rounded-2xl border border-walnut-100 bg-card px-5 sm:px-7 shadow-sm shadow-walnut-900/5 transition-colors duration-300 hover:border-walnut-300 data-[state=open]:border-gold/40 data-[state=open]:shadow-md data-[state=open]:shadow-walnut-900/5 last:border-b"
                >
                  <AccordionTrigger className="py-5 text-left hover:no-underline [&>svg]:hidden">
                    <span className="flex items-center gap-3 text-left">
                      <span
                        className="h-1.5 w-1.5 rotate-45 shrink-0 transition-colors"
                        aria-hidden
                        style={{ backgroundColor: "var(--color-gold)" }}
                      />
                      <span className="font-display text-lg text-walnut-900 leading-snug">
                        {f.question}
                      </span>
                    </span>
                    <svg
                      className="h-4 w-4 shrink-0 text-walnut-400 transition-transform duration-300 group-data-[state=open]:rotate-180 group-data-[state=open]:text-gold-dark"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-0 pl-[30px] text-sm leading-[1.75] text-walnut-700/90">
                    {f.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Still have questions? mini-CTA */}
            <div className="mt-10 lg:mt-12 flex flex-col sm:flex-row items-center justify-between gap-5 rounded-2xl border border-gold/40 bg-gradient-to-b from-gold/10 to-card p-6 sm:p-7">
              <div className="text-center sm:text-left">
                <h3 className="font-display text-xl text-walnut-900">Still have questions?</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  Call or WhatsApp us — we're always happy to help you find the right piece.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                <Button
                  asChild
                  className="rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory h-11 px-6"
                >
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                    <Phone className="h-4 w-4 mr-2" aria-hidden />
                    Call {contact.phoneDisplay}
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-gold/60 text-gold-dark hover:bg-gold/10 hover:border-gold h-11 px-6"
                >
                  <a
                    href={whatsappLink(contact.whatsapp, "Hi Dream Wood Furniture! I have a question.")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" aria-hidden />
                    WhatsApp Us
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}
    </div>
  );
}
