"use client";

import { useSiteStore } from "@/lib/store";

export function Logo({
  className = "h-10",
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const goHome = useSiteStore((s) => s.goHome);
  return (
    <button
      onClick={() => goHome()}
      className="flex items-center gap-3 group cursor-pointer"
      aria-label="Dream Wood Furniture — home"
    >
      { }
      <img
        src={variant === "dark" ? "/logo.svg" : "/logo-white.svg"}
        alt="Dream Wood Furniture logo"
        className={`${className} w-auto object-contain transition-transform duration-500 group-hover:scale-[1.03]`}
      />
    </button>
  );
}
