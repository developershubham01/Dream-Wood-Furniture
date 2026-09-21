"use client";

import { useEffect, useState } from "react";
import { Search, Heart, ClipboardList, Menu, Phone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "./logo";
import { useSiteStore } from "@/lib/store";
import { useSiteData } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", view: { name: "home" } as const },
  { label: "Shop", view: { name: "shop" } as const },
  { label: "Custom Furniture", view: { name: "custom" } as const },
  { label: "About Us", view: { name: "about" } as const },
  { label: "Contact", view: { name: "contact" } as const },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const view = useSiteStore((s) => s.view);
  const navigate = useSiteStore((s) => s.navigate);
  const wishlist = useSiteStore((s) => s.wishlist);
  const enquiryCart = useSiteStore((s) => s.enquiryCart);
  const setEnquiryOpen = useSiteStore((s) => s.setEnquiryOpen);
  const setSearchOpen = useSiteStore((s) => s.setSearchOpen);
  const setWishlistOpen = useSiteStore((s) => s.setWishlistOpen);
  const { data } = useSiteData();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (name: string) => view.name === name;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500 border-b print:hidden",
        scrolled
          ? "bg-cream/95 backdrop-blur-md border-walnut-100 shadow-sm shadow-walnut-900/5"
          : "bg-cream/80 backdrop-blur-sm border-transparent"
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
          {/* Logo */}
          <Logo className="h-8 sm:h-9 lg:h-10" />

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.slice(0, 2).map((link) => (
              <NavLink
                key={link.label}
                active={isActive(link.view.name)}
                onClick={() => navigate(link.view)}
              >
                {link.label}
              </NavLink>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "px-4 py-2 text-sm font-medium tracking-wide rounded-full transition-colors flex items-center gap-1 cursor-pointer",
                    isActive("shop")
                      ? "text-walnut-900 bg-walnut-100/70"
                      : "text-walnut-700 hover:text-walnut-900 hover:bg-walnut-50"
                  )}
                >
                  Categories
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="w-56 bg-card border-walnut-100 rounded-xl shadow-xl shadow-walnut-900/10 p-1.5"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <DropdownMenuItem
                  onClick={() => navigate({ name: "shop" })}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-walnut-900 font-semibold focus:bg-walnut-50"
                >
                  <span className="text-sm">All Categories</span>
                </DropdownMenuItem>
                <div className="h-px bg-walnut-100 my-1" />
                {data.categories.map((cat) => (
                  <DropdownMenuItem
                    key={cat.id}
                    onClick={() => navigate({ name: "shop", category: cat.slug })}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-walnut-800 focus:bg-walnut-50 focus:text-walnut-900"
                  >
                    <span className="text-sm font-medium">{cat.name}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  onClick={() => navigate({ name: "custom" })}
                  className="mt-1 border-t border-walnut-100 px-3 py-2.5 rounded-lg cursor-pointer text-gold-dark focus:bg-gold/10"
                >
                  <span className="text-sm font-semibold">Custom Furniture ✦</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {NAV_LINKS.slice(2).map((link) => (
              <NavLink
                key={link.label}
                active={isActive(link.view.name)}
                onClick={() => navigate(link.view)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              title="Search (press /)"
              className="group h-10 w-10 lg:w-auto lg:px-3 rounded-full flex items-center justify-center lg:gap-2 text-walnut-700 hover:bg-walnut-100/60 hover:text-walnut-900 transition-colors cursor-pointer"
            >
              <Search className="h-[18px] w-[18px]" />
              {/* "/" shortcut hint — teaches the keyboard shortcut on desktop */}
              <kbd className="hidden lg:inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-walnut-200 bg-ivory px-1 font-sans text-[10px] font-semibold text-walnut-500 shadow-[inset_0_-1px_0_var(--color-walnut-100)] group-hover:border-walnut-300 group-hover:text-walnut-700 transition-colors">
                /
              </kbd>
            </button>
            <button
              onClick={() => setWishlistOpen(true)}
              aria-label={`Wishlist (${wishlist.length} items)`}
              className="relative h-10 w-10 rounded-full flex items-center justify-center text-walnut-700 hover:bg-walnut-100/60 hover:text-walnut-900 transition-colors cursor-pointer"
            >
              <Heart className="h-[18px] w-[18px]" />
              {wishlist.length > 0 && <CountDot n={wishlist.length} />}
            </button>
            <button
              onClick={() => setEnquiryOpen(true)}
              aria-label={`Enquiry list (${enquiryCart.length} items)`}
              className="relative h-10 w-10 rounded-full flex items-center justify-center text-walnut-700 hover:bg-walnut-100/60 hover:text-walnut-900 transition-colors cursor-pointer"
            >
              <ClipboardList className="h-[18px] w-[18px]" />
              {enquiryCart.length > 0 && <CountDot n={enquiryCart.length} />}
            </button>

            <a
              href={`tel:${data.settings.contact.phone.replace(/\s/g, "")}`}
              className="hidden xl:inline-flex ml-2 items-center gap-2 h-10 px-5 rounded-full bg-walnut-800 text-ivory text-sm font-medium hover:bg-walnut-700 transition-colors"
            >
              <Phone className="h-4 w-4" />
              {data.settings.contact.phoneDisplay}
            </a>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  aria-label="Open menu"
                  className="lg:hidden h-10 w-10 rounded-full flex items-center justify-center text-walnut-800 hover:bg-walnut-100/60 transition-colors cursor-pointer"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[340px] bg-cream border-walnut-100 p-0"
              >
                <div className="flex flex-col h-full">
                  <div className="p-5 border-b border-walnut-100 flex items-center justify-between">
                    <SheetTitle className="m-0">
                      <Logo className="h-8" />
                    </SheetTitle>
                  </div>
                  <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Mobile navigation">
                    {NAV_LINKS.map((link) => (
                      <button
                        key={link.label}
                        onClick={() => {
                          navigate(link.view);
                          setMobileOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl text-[15px] font-medium transition-colors cursor-pointer",
                          isActive(link.view.name)
                            ? "bg-walnut-800 text-ivory"
                            : "text-walnut-800 hover:bg-walnut-100/60"
                        )}
                      >
                        {link.label}
                      </button>
                    ))}
                    <p className="px-4 pt-5 pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                      Categories
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {data.categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            navigate({ name: "shop", category: cat.slug });
                            setMobileOpen(false);
                          }}
                          className="text-left px-3 py-2.5 rounded-lg text-sm text-walnut-700 hover:bg-walnut-100/60 hover:text-walnut-900 transition-colors cursor-pointer border border-walnut-100 bg-card"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </nav>
                  <div className="p-4 border-t border-walnut-100">
                    <Button
                      asChild
                      className="w-full bg-walnut-800 hover:bg-walnut-700 text-ivory rounded-full h-11"
                    >
                      <a href={`tel:${data.settings.contact.phone.replace(/\s/g, "")}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call Showroom
                      </a>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}

function NavLink({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium tracking-wide rounded-full transition-all duration-300 cursor-pointer",
        active
          ? "text-walnut-900 bg-walnut-100/70"
          : "text-walnut-700 hover:text-walnut-900 hover:bg-walnut-50"
      )}
    >
      {children}
    </button>
  );
}

function CountDot({ n }: { n: number }) {
  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-white text-[10px] font-bold flex items-center justify-center shadow">
      {n > 9 ? "9+" : n}
    </span>
  );
}
