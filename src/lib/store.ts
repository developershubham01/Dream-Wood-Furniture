"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { View } from "./types";

export interface EnquiryCartItem {
  productId: string;
  name: string;
  image?: string;
  price: number | null;
  quantity: number;
}

interface SiteStore {
  view: View;
  navigate: (view: View) => void;
  goHome: (section?: string) => void;

  quickViewProduct: import("./types").Product | null;
  openQuickView: (product: import("./types").Product) => void;
  closeQuickView: () => void;

  recentlyViewed: string[];
  pushRecentlyViewed: (productId: string) => void;

  wishlist: string[];
  toggleWishlist: (productId: string) => boolean;
  inWishlist: (productId: string) => boolean;

  compare: string[];
  toggleCompare: (productId: string) => { added: boolean; full: boolean };
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;

  compareOpen: boolean;
  setCompareOpen: (open: boolean) => void;

  enquiryCart: EnquiryCartItem[];
  addToEnquiry: (item: Omit<EnquiryCartItem, "quantity">, quantity?: number) => void;
  removeFromEnquiry: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearEnquiry: () => void;

  enquiryOpen: boolean;
  setEnquiryOpen: (open: boolean) => void;

  wishlistOpen: boolean;
  setWishlistOpen: (open: boolean) => void;

  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

function viewToHash(view: View): string {
  switch (view.name) {
    case "home":
      return "#home";
    case "shop":
      return view.category ? `#shop/${view.category}` : "#shop";
    case "product":
      return `#product/${view.slug}`;
    case "wishlist":
      return "#wishlist";
    default:
      return `#${view.name}`;
  }
}

// Exported so the app shell can sync the view from the URL hash after mount
// (hydration-safe: SSR and the first client render always agree on "home").
export function hashToView(hash: string): View {
  const clean = hash.replace(/^#\/?/, "");
  if (!clean || clean === "home") return { name: "home" };
  const [head, ...rest] = clean.split("/");
  switch (head) {
    case "shop":
      return rest[0] ? { name: "shop", category: decodeURIComponent(rest[0]) } : { name: "shop" };
    case "product":
      return rest[0] ? { name: "product", slug: decodeURIComponent(rest[0]) } : { name: "home" };
    case "custom":
      return { name: "custom" };
    case "about":
      return { name: "about" };
    case "contact":
      return { name: "contact" };
    case "wishlist":
      return { name: "wishlist" };
    case "admin":
      return { name: "admin" };
    default:
      return { name: "home" };
  }
}

// Always start on a deterministic view so SSR and the first client render match.
// The real hash view (e.g. #admin, #shop) is applied by SiteApp in a mount effect.
const initialView: View = { name: "home" };

export const useSiteStore = create<SiteStore>()(
  persist(
    (set, get) => ({
      view: initialView,
      quickViewProduct: null,
      openQuickView: (product) => set({ quickViewProduct: product }),
      closeQuickView: () => set({ quickViewProduct: null }),

      recentlyViewed: [],
      pushRecentlyViewed: (productId) => {
        set((s) => ({
          recentlyViewed: [productId, ...s.recentlyViewed.filter((id) => id !== productId)].slice(0, 8),
        }));
      },
      navigate: (view) => {
        if (typeof window !== "undefined") {
          const newHash = viewToHash(view);
          if (window.location.hash !== newHash) {
            window.history.pushState(null, "", newHash);
          }
          window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
          setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
          }, 0);
        }
        set({ view });
      },
      goHome: (section) => {
        set({ view: { name: "home" } });
        if (typeof window !== "undefined") {
          window.history.pushState(null, "", "#home");
          requestAnimationFrame(() => {
            if (section) {
              const el = document.getElementById(section);
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
                return;
              }
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
          });
        }
      },

      wishlist: [],
      toggleWishlist: (productId) => {
        const current = get().wishlist;
        const exists = current.includes(productId);
        set({ wishlist: exists ? current.filter((id) => id !== productId) : [...current, productId] });
        return !exists;
      },
      inWishlist: (productId) => get().wishlist.includes(productId),

      compare: [],
      toggleCompare: (productId) => {
        const current = get().compare;
        const exists = current.includes(productId);
        if (exists) {
          set({ compare: current.filter((id) => id !== productId) });
          return { added: false, full: false };
        }
        if (current.length >= 3) {
          return { added: false, full: true };
        }
        set({ compare: [...current, productId] });
        return { added: true, full: false };
      },
      removeFromCompare: (productId) =>
        set((s) => ({ compare: s.compare.filter((id) => id !== productId) })),
      clearCompare: () => set({ compare: [] }),

      compareOpen: false,
      setCompareOpen: (open) => set({ compareOpen: open }),

      enquiryCart: [],
      addToEnquiry: (item, quantity = 1) => {
        const current = get().enquiryCart;
        const existing = current.find((i) => i.productId === item.productId);
        if (existing) {
          set({
            enquiryCart: current.map((i) =>
              i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
        } else {
          set({ enquiryCart: [...current, { ...item, quantity }] });
        }
      },
      removeFromEnquiry: (productId) =>
        set((s) => ({ enquiryCart: s.enquiryCart.filter((i) => i.productId !== productId) })),
      setQuantity: (productId, quantity) =>
        set((s) => ({
          enquiryCart: s.enquiryCart.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(9, quantity)) } : i
          ),
        })),
      clearEnquiry: () => set({ enquiryCart: [] }),

      enquiryOpen: false,
      setEnquiryOpen: (open) => set({ enquiryOpen: open }),

      wishlistOpen: false,
      setWishlistOpen: (open) => set({ wishlistOpen: open }),

      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),
    }),
    {
      name: "dreamwood-store",
      partialize: (state) => ({
        wishlist: state.wishlist,
        enquiryCart: state.enquiryCart,
        recentlyViewed: state.recentlyViewed,
        compare: state.compare,
      }),
    }
  )
);

// Listen for hash changes (browser back/forward)
if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    const view = hashToView(window.location.hash);
    const current = useSiteStore.getState().view;
    if (JSON.stringify(current) !== JSON.stringify(view)) {
      useSiteStore.setState({ view });
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  });
}
