import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

// Set NEXT_PUBLIC_SITE_URL in production so canonical/OG/sitemap URLs resolve
// to the real domain instead of the dev placeholder.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dream Wood Furniture | Premium Furniture Showroom in Seawoods, Navi Mumbai",
    template: "%s | Dream Wood Furniture",
  },
  description:
    "Dream Wood Furniture (ड्रीम वुड फर्निचर) — thoughtfully designed sofas, beds, wardrobes, dining sets and custom furniture. Visit our showroom at Balaji Tower, Seawoods West, Navi Mumbai. Rated 4.8/5 by 204 customers.",
  keywords: [
    "Dream Wood Furniture",
    "furniture Seawoods",
    "furniture Navi Mumbai",
    "custom furniture",
    "sofas Navi Mumbai",
    "wardrobes",
    "dining sets",
    "furniture showroom",
    "ड्रीम वुड फर्निचर",
  ],
  authors: [{ name: "Dream Wood Furniture" }],
  icons: {
    icon: "/logo-mark.svg",
  },
  openGraph: {
    title: "Dream Wood Furniture | Premium Furniture Showroom",
    description:
      "Furniture that makes your space feel like home. Sofas, beds, wardrobes, dining & custom furniture in Seawoods, Navi Mumbai.",
    siteName: "Dream Wood Furniture",
    type: "website",
    locale: "en_IN",
    images: [{ url: "/images/hero.png", width: 1440, height: 720, alt: "Dream Wood Furniture premium living room collection" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dream Wood Furniture | Premium Furniture Showroom",
    description: "Furniture that makes your space feel like home. Seawoods, Navi Mumbai.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
