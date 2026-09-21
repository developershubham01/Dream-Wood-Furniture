"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Navigation, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSiteData } from "@/lib/site-data";
import { mapsDirectionsUrl, mapsEmbedUrl } from "@/lib/format";
import { StarRating } from "../star-rating";
import { SectionHeading } from "../section-heading";
import { OpenNowBadge } from "../open-now-badge";

export function ShowroomSection() {
  const { data } = useSiteData();
  const contact = data.settings.contact;
  const rating = data.settings.rating;

  return (
    <section id="showroom" className="py-20 lg:py-28 bg-ivory/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Visit Us"
          title="Our Seawoods Showroom"
          description="Feel the fabrics, check the finishes, and picture the pieces in your own home — nothing beats seeing furniture in person."
        />

        <div className="mt-12 grid lg:grid-cols-[1fr_1.15fr] gap-6 lg:gap-8 items-stretch">
          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="h-full bg-walnut-900 text-ivory border-0 relative overflow-hidden rounded-3xl">
              <div className="absolute inset-0 wood-texture opacity-70" aria-hidden />
              <CardContent className="relative p-7 sm:p-9 flex flex-col h-full">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.25em] text-gold font-semibold">
                      Dream Wood Furniture
                    </p>
                    <p className="font-display text-2xl sm:text-3xl mt-2 text-ivory leading-snug">
                      Seawoods Showroom
                    </p>
                  </div>
                  <div className="flex flex-col items-center bg-white/10 border border-white/15 rounded-2xl px-4 py-3 backdrop-blur-sm shrink-0">
                    <StarRating rating={rating.value} size={14} />
                    <span className="mt-1 text-[11px] text-ivory/75 whitespace-nowrap">
                      {rating.value}/5 · {rating.count} reviews
                    </span>
                  </div>
                </div>

                <div className="mt-8 space-y-5 text-sm">
                  <div className="flex gap-3.5">
                    <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" aria-hidden />
                    <div>
                      <p className="font-medium text-ivory/90">{contact.addressLine1}</p>
                      <p className="text-ivory/70">{contact.addressLine2}</p>
                      <p className="text-ivory/70">{contact.addressLine3}</p>
                    </div>
                  </div>
                  <div className="flex gap-3.5 items-center">
                    <Phone className="h-5 w-5 text-gold shrink-0" aria-hidden />
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, "")}`}
                      className="font-medium text-ivory hover:text-gold-light transition-colors"
                    >
                      {contact.phoneDisplay}
                    </a>
                  </div>
                  <div className="flex gap-3.5 items-center">
                    <Clock className="h-5 w-5 text-gold shrink-0" aria-hidden />
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                      <p className="text-ivory/85">{contact.hours}</p>
                      <OpenNowBadge openTime={contact.openTime} closeTime={contact.closeTime} tone="dark" />
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-8 flex flex-col sm:flex-row gap-3">
                  <Button
                    asChild
                    className="rounded-full bg-gold hover:bg-gold-light text-espresso font-semibold px-6 flex-1"
                  >
                    <a
                      href={mapsDirectionsUrl(contact.mapsQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-ivory/30 text-ivory hover:bg-ivory/10 hover:border-ivory px-6 flex-1"
                  >
                    <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Map + image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6"
          >
            <div className="relative rounded-3xl overflow-hidden border border-walnut-100 shadow-lg shadow-walnut-900/10 h-[240px] sm:h-[280px]">
              <iframe
                title="Dream Wood Furniture showroom location map"
                src={mapsEmbedUrl(contact.mapsQuery)}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <div className="relative rounded-3xl overflow-hidden h-[220px] sm:h-[260px] img-zoom hidden sm:block">
              { }
              <img
                src={data.settings.about.showroomImage}
                alt="Dream Wood Furniture showroom interior"
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 to-transparent" />
              <div className="absolute bottom-4 left-5 flex items-center gap-2 text-ivory">
                <Star className="h-4 w-4 fill-gold text-gold" aria-hidden />
                <span className="text-sm font-medium">Furniture Store · Seawoods West, Navi Mumbai</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
