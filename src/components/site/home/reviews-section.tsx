"use client";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Quote } from "lucide-react";
import { useSiteData } from "@/lib/site-data";
import { StarRating } from "../star-rating";
import { SectionHeading } from "../section-heading";

export function ReviewsSection() {
  const { data } = useSiteData();
  const rating = data.settings.rating;
  const testimonials = data.testimonials;

  if (testimonials.length === 0) return null;

  return (
    <section id="reviews" className="py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Customer Love"
          title="What Our Customers Say"
          description={`Rated ${rating.value}/5 by ${rating.count} customers on Google. Here's what visiting the showroom feels like.`}
        />

        <div className="mt-12 relative">
          <Carousel
            opts={{ align: "start", loop: testimonials.length > 2 }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 sm:-ml-6">
              {testimonials.map((t) => (
                <CarouselItem key={t.id} className="pl-4 sm:pl-6 basis-full md:basis-1/2 lg:basis-1/3">
                  <figure className="group relative h-full flex flex-col bg-card border border-walnut-100 rounded-2xl p-6 sm:p-7 overflow-hidden hover:shadow-lg hover:shadow-walnut-900/5 transition-shadow duration-500">
                    {/* Oversized serif quote watermark for depth */}
                    <span
                      className="pointer-events-none select-none absolute -top-3 right-3 font-display text-[7rem] leading-none text-gold/[0.07]"
                      aria-hidden
                    >
                      &#8220;
                    </span>
                    {/* Gold top accent that draws in on hover */}
                    <span
                      className="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-gold via-gold-light to-gold transition-transform duration-500 group-hover:scale-x-100"
                      aria-hidden
                    />
                    <Quote className="h-6 w-6 text-gold/60 mb-4" aria-hidden />
                    <blockquote className="relative flex-1 text-[15px] leading-[1.7] text-walnut-800/90">
                      "{t.text}"
                    </blockquote>
                    <figcaption className="mt-6 pt-5 border-t border-walnut-100 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-walnut-900 text-sm">{t.name}</p>
                        {t.location && (
                          <p className="text-xs text-muted-foreground mt-0.5">{t.location}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <StarRating rating={t.rating} size={14} />
                        {t.date && <p className="text-[11px] text-muted-foreground">{t.date}</p>}
                      </div>
                    </figcaption>
                  </figure>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 sm:-left-4 bg-walnut-800 text-ivory border-walnut-800 hover:bg-walnut-700 hover:text-ivory" />
            <CarouselNext className="right-2 sm:-right-4 bg-walnut-800 text-ivory border-walnut-800 hover:bg-walnut-700 hover:text-ivory" />
          </Carousel>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Reviews are managed by the showroom team. Share your experience on Google after your visit.
        </p>
      </div>
    </section>
  );
}
