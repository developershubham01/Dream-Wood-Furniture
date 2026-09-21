"use client";

import { motion } from "framer-motion";
import { TreePine, SlidersHorizontal, HeartHandshake, MapPin, Phone, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSiteData } from "@/lib/site-data";
import { useSiteStore } from "@/lib/store";
import { mapsDirectionsUrl } from "@/lib/format";
import { StarRating } from "../star-rating";

const VALUES = [
  {
    icon: TreePine,
    title: "Honest Materials",
    text: "We favour solid wood and finishes that age gracefully — no shortcuts that show up in a year.",
  },
  {
    icon: SlidersHorizontal,
    title: "Made-to-Fit Options",
    text: "Odd corners, low ceilings, specific storage — many pieces can be tailored to your exact space.",
  },
  {
    icon: HeartHandshake,
    title: "Neighbourhood Service",
    text: "A local Seawoods showroom where you're helped by people who remember your name and your project.",
  },
];

export function AboutView() {
  const { data } = useSiteData();
  const navigate = useSiteStore((s) => s.navigate);
  const about = data.settings.about;
  const contact = data.settings.contact;
  const rating = data.settings.rating;

  return (
    <div className="bg-background">
      {/* Header banner */}
      <div className="relative overflow-hidden min-h-[46vh] flex items-center">
        { }
        <img src={about.image} alt="Artisan woodworking at Dream Wood Furniture" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/85 via-espresso/50 to-espresso/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 w-full py-20">
          <p className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">About Us</p>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl text-ivory leading-tight max-w-2xl text-balance">
            Furniture, the way it should feel
          </h1>
          <p className="mt-4 text-ivory/75 max-w-xl leading-relaxed">
            Dream Wood Furniture · ड्रीम वुड फर्निचर — a furniture store in Seawoods West, Navi Mumbai.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold mb-4">Our Story</p>
            <h2 className="font-display text-3xl sm:text-4xl text-walnut-900 leading-tight">
              {about.storyTitle}
            </h2>
            <p className="mt-6 text-[15px] sm:text-base leading-relaxed text-foreground/80">
              {about.storyText}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                onClick={() => navigate({ name: "shop" })}
                className="rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory px-7"
              >
                Browse the Collection
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                onClick={() => navigate({ name: "custom" })}
                variant="outline"
                className="rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-50 px-7"
              >
                Explore Custom Furniture
              </Button>
            </div>
          </motion.div>

          {/* Rating card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <Card className="bg-walnut-900 text-ivory border-0 rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 wood-texture opacity-70" aria-hidden />
              <CardContent className="relative p-8 text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
                  {rating.label}
                </p>
                <div className="mt-5 flex items-center justify-center gap-2">
                  <span className="font-display text-6xl text-ivory leading-none">
                    {rating.value}
                  </span>
                  <span className="text-ivory/50 text-2xl self-end pb-1">/5</span>
                </div>
                <StarRating rating={rating.value} size={20} className="justify-center mt-4" />
                <p className="mt-4 text-sm text-ivory/70">
                  Based on <span className="text-ivory font-semibold">{rating.count} Google reviews</span> from
                  customers like you.
                </p>
                <div className="mt-7 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-gold font-semibold">Category</p>
                    <p className="text-sm text-ivory/85 mt-1">Furniture Store</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-gold font-semibold">Delivery</p>
                    <p className="text-sm text-ivory/85 mt-1">Assistance available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-ivory/60 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group p-7 rounded-2xl bg-card border border-walnut-100 hover:border-walnut-300 hover:shadow-lg hover:shadow-walnut-900/5 transition-all duration-500"
              >
                <div className="h-12 w-12 rounded-xl bg-walnut-800 group-hover:bg-gold transition-colors duration-500 flex items-center justify-center">
                  <v.icon className="h-5 w-5 text-ivory group-hover:text-espresso transition-colors duration-500" aria-hidden />
                </div>
                <h3 className="mt-5 font-display text-xl text-walnut-900">{v.title}</h3>
                <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">{v.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Showroom strip */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl overflow-hidden min-h-[320px] img-zoom"
          >
            { }
            <img
              src={about.showroomImage}
              alt="Dream Wood Furniture showroom in Seawoods"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold mb-4">
              Find Us
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-walnut-900 leading-tight">
              In the heart of Seawoods West
            </h2>
            <div className="mt-6 space-y-4 text-[15px]">
              <p className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold-dark shrink-0 mt-0.5" aria-hidden />
                <span className="text-foreground/85 leading-relaxed">
                  {contact.addressLine1}, {contact.addressLine2}, {contact.addressLine3}
                </span>
              </p>
              <p className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gold-dark" aria-hidden />
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="text-foreground/85 hover:text-gold-dark transition-colors">
                  {contact.phoneDisplay}
                </a>
              </p>
              <p className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gold-dark" aria-hidden />
                <span className="text-foreground/85">{contact.hours}</span>
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-walnut-800 hover:bg-walnut-700 text-ivory px-7">
                <a href={mapsDirectionsUrl(contact.mapsQuery)} target="_blank" rel="noopener noreferrer">
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Directions
                </a>
              </Button>
              <Button
                onClick={() => navigate({ name: "contact" })}
                variant="outline"
                className="rounded-full border-walnut-300 text-walnut-700 hover:bg-walnut-50 px-7"
              >
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
