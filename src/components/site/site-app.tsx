"use client";

import { useEffect } from "react";
import { SiteDataProvider } from "@/lib/site-data";
import { useSiteStore, hashToView } from "@/lib/store";
import { AnnouncementBar } from "./announcement-bar";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { BackToTop } from "./back-to-top";
import { SearchDialog } from "./search-dialog";
import { EnquirySheet } from "./enquiry-sheet";
import { WishlistSheet } from "./wishlist-sheet";
import { QuickView } from "./quick-view";
import { CompareBar } from "./compare-bar";
import { CompareDialog } from "./compare-dialog";
import { WhatsappFab } from "./whatsapp-fab";
import { HomeView } from "./home/home-view";
import { ShopView } from "./views/shop-view";
import { ProductView } from "./views/product-view";
import { CustomView } from "./views/custom-view";
import { AboutView } from "./views/about-view";
import { ContactView } from "./views/contact-view";
import { WishlistView } from "./views/wishlist-view";
import { AdminView } from "./admin/admin-view";
import type { SiteData } from "@/lib/types";

export function SiteApp({ initialData }: { initialData: SiteData }) {
  const view = useSiteStore((s) => s.view);

  // Hydration-safe hash routing: SSR always renders "home". After mount,
  // switch to whatever view the URL hash actually points at (e.g. #admin).
  useEffect(() => {
    const fromHash = hashToView(window.location.hash);
    const current = useSiteStore.getState().view;
    if (JSON.stringify(current) !== JSON.stringify(fromHash)) {
      useSiteStore.setState({ view: fromHash });
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, []);

  // Scroll to top on every view transition so header and page top are always visible
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }, 0);
    return () => clearTimeout(timer);
  }, [view]);

  // Admin takes over the whole screen
  if (view.name === "admin") {
    return (
      <SiteDataProvider initialData={initialData}>
        <AdminView />
      </SiteDataProvider>
    );
  }

  return (
    <SiteDataProvider initialData={initialData}>
      <div className="min-h-screen flex flex-col">
        <AnnouncementBar />
        <Navbar />
        <main className="flex-1">
          {view.name === "home" && <HomeView />}
          {view.name === "shop" && (
            <ShopView
              key={`${view.category ?? "all"}-${view.query ?? ""}`}
              initialCategory={view.category}
              initialQuery={view.query}
            />
          )}
          {view.name === "product" && <ProductView slug={view.slug} />}
          {view.name === "custom" && <CustomView />}
          {view.name === "about" && <AboutView />}
          {view.name === "contact" && <ContactView />}
          {view.name === "wishlist" && <WishlistView />}
        </main>
        <Footer />
        <SearchDialog />
        <EnquirySheet />
        <WishlistSheet />
        <QuickView />
        <CompareBar />
        <CompareDialog />
        <BackToTop />
        <WhatsappFab />
      </div>
    </SiteDataProvider>
  );
}
