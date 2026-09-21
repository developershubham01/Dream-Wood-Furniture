"use client";

import { Hero } from "./hero";
import { CategorySection } from "./category-section";
import { FeaturedSection } from "./featured-section";
import { WhyChooseSection } from "./why-choose-section";
import { CustomFurnitureSection } from "./custom-furniture-section";
import { ShowroomSection } from "./showroom-section";
import { ReviewsSection } from "./reviews-section";
import { GallerySection } from "./gallery-section";
import { FaqSection } from "./faq-section";
import { CtaSection } from "./cta-section";

export function HomeView() {
  return (
    <>
      <Hero />
      <CategorySection />
      <FeaturedSection />
      <WhyChooseSection />
      <CustomFurnitureSection />
      <ShowroomSection />
      <ReviewsSection />
      <GallerySection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
