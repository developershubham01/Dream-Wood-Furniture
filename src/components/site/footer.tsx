"use client";

import { useState } from "react";
import { MapPin, Phone, Clock, Instagram, Facebook, ShieldCheck, ExternalLink, CircleHelp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useSiteData } from "@/lib/site-data";
import { useSiteStore } from "@/lib/store";
import { whatsappLink } from "@/lib/format";

const QUICK_LINKS = [
  { label: "Home", view: { name: "home" } as const },
  { label: "Shop Collection", view: { name: "shop" } as const },
  { label: "Custom Furniture", view: { name: "custom" } as const },
  { label: "About Us", view: { name: "about" } as const },
  { label: "Contact", view: { name: "contact" } as const },
  { label: "Wishlist", view: { name: "wishlist" } as const },
];

export function Footer() {
  const { data } = useSiteData();
  const navigate = useSiteStore((s) => s.navigate);
  const goHome = useSiteStore((s) => s.goHome);
  const contact = data.settings.contact;
  const social = data.settings.social;

  return (
    <footer className="bg-espresso text-ivory/80 mt-auto print:hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.3fr]">
          {/* Brand */}
          <div>
            <img src="/logo-white.svg" alt="Dream Wood Furniture" className="h-11 w-auto" />
            <p className="mt-5 text-sm leading-relaxed text-ivory/60 max-w-sm">
              A premium furniture showroom in Seawoods, Navi Mumbai — thoughtfully designed
              furniture, customisation options and honest, personalised service for your home.
            </p>
            <p className="mt-3 text-sm text-gold/90">Premium Solid Wood Furniture · Seawoods West</p>
            <div className="mt-6 flex items-center gap-2.5">
              {social.instagram && (
                <SocialIcon href={social.instagram} label="Instagram">
                  <Instagram className="h-4 w-4" />
                </SocialIcon>
              )}
              {social.facebook && (
                <SocialIcon href={social.facebook} label="Facebook">
                  <Facebook className="h-4 w-4" />
                </SocialIcon>
              )}
              <SocialIcon
                href={whatsappLink(contact.whatsapp, "Hi Dream Wood Furniture!")}
                label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.03c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" />
                </svg>
              </SocialIcon>
              {social.justdial && (
                <SocialIcon href={social.justdial} label="Justdial gallery">
                  <ExternalLink className="h-4 w-4" />
                </SocialIcon>
              )}
            </div>
          </div>

          {/* Quick links */}
          <nav aria-label="Quick links">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-5">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <button
                    onClick={() => navigate(l.view)}
                    className="text-ivory/70 hover:text-gold-light transition-colors cursor-pointer"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
              {data.faqs.length > 0 && (
                <li>
                  <button
                    onClick={() => goHome("faq")}
                    className="inline-flex items-center gap-1.5 text-ivory/70 hover:text-gold-light transition-colors cursor-pointer"
                  >
                    FAQs
                    <CircleHelp className="h-3 w-3 opacity-50" aria-hidden />
                  </button>
                </li>
              )}
            </ul>
          </nav>

          {/* Categories */}
          <nav aria-label="Product categories">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-5">Categories</h3>
            <ul className="space-y-3 text-sm">
              {data.categories.slice(0, 7).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => navigate({ name: "shop", category: cat.slug })}
                    className="text-ivory/70 hover:text-gold-light transition-colors cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-5">Visit Our Showroom</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="h-4 w-4 text-gold/80 shrink-0 mt-0.5" aria-hidden />
                <span className="text-ivory/70 leading-relaxed">
                  {contact.addressLine1}, {contact.addressLine2}, {contact.addressLine3}
                </span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone className="h-4 w-4 text-gold/80 shrink-0" aria-hidden />
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="text-ivory/70 hover:text-gold-light transition-colors">
                  {contact.phoneDisplay}
                </a>
              </li>
              <li className="flex gap-3 items-center">
                <Clock className="h-4 w-4 text-gold/80 shrink-0" aria-hidden />
                <span className="text-ivory/70">{contact.hours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar — gold seam echoing the CTA/announcement hairlines */}
      <div className="relative border-t border-white/10">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ivory/50">
          <p>© {new Date().getFullYear()} Dream Wood Furniture · All rights reserved</p>
          <div className="flex items-center gap-4">
            <LegalDialog type="privacy" />
            <span className="h-1 w-1 rounded-full bg-ivory/30" aria-hidden />
            <LegalDialog type="terms" />
            {/* Hidden admin access */}
            <button
              onClick={() => navigate({ name: "admin" })}
              className="inline-flex items-center gap-1.5 text-ivory/35 hover:text-gold transition-colors cursor-pointer"
              aria-label="Staff admin login"
              title="Staff access"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="text-[11px]">Admin</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="h-9 w-9 rounded-full bg-white/8 bg-white/10 border border-white/10 flex items-center justify-center text-ivory/70 hover:text-espresso hover:bg-gold hover:border-gold transition-all duration-300"
    >
      {children}
    </a>
  );
}

function LegalDialog({ type }: { type: "privacy" | "terms" }) {
  const [open, setOpen] = useState(false);
  const isPrivacy = type === "privacy";
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="hover:text-gold-light transition-colors cursor-pointer">
          {isPrivacy ? "Privacy Policy" : "Terms & Conditions"}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-card text-foreground border-walnut-200">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-walnut-900">
            {isPrivacy ? "Privacy Policy" : "Terms & Conditions"}
          </DialogTitle>
          <DialogDescription>Last updated: {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</DialogDescription>
        </DialogHeader>
        <div className="text-sm text-muted-foreground leading-relaxed space-y-3 max-h-[50vh] overflow-y-auto pr-2">
          {isPrivacy ? (
            <>
              <p><strong className="text-foreground">What we collect:</strong> When you submit an enquiry, we collect your name, phone number, email (optional) and the details you share about your furniture needs — solely to respond to your enquiry.</p>
              <p><strong className="text-foreground">How we use it:</strong> Your details are used to contact you about your enquiry, provide quotations and assist with your purchase. We do not sell or share your personal information with third parties for marketing.</p>
              <p><strong className="text-foreground">Storage & security:</strong> Enquiry data is stored in our website database with access restricted to authorised showroom staff.</p>
              <p><strong className="text-foreground">Your choices:</strong> You may request correction or deletion of your enquiry details anytime by calling the showroom.</p>
            </>
          ) : (
            <>
              <p><strong className="text-foreground">Catalogue:</strong> Product images, specifications and indicative prices shown on this website are for reference. Actual product details, availability, and final pricing are confirmed at the showroom or through a formal quotation.</p>
              <p><strong className="text-foreground">Custom furniture:</strong> Custom orders are accepted after design discussion, measurements and a written quotation approved by you.</p>
              <p><strong className="text-foreground">Quotations & enquiries:</strong> Submitting an enquiry does not constitute an order or a booking. Our team will contact you to confirm details, timelines and delivery.</p>
              <p><strong className="text-foreground">Content:</strong> Website content, including images and copy, is managed by Dream Wood Furniture and may be updated without notice.</p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
