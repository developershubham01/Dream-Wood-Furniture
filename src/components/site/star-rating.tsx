import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  className = "",
  size = 16,
}: {
  rating: number;
  className?: string;
  size?: number;
}) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) {
          return <Star key={i} width={size} height={size} className="fill-gold text-gold" />;
        }
        if (i === full && half) {
          return (
            <span key={i} className="relative inline-flex" style={{ width: size, height: size }}>
              <Star width={size} height={size} className="absolute inset-0 text-walnut-200" />
              <StarHalf width={size} height={size} className="absolute inset-0 fill-gold text-gold" />
            </span>
          );
        }
        return <Star key={i} width={size} height={size} className="text-walnut-200" />;
      })}
    </div>
  );
}
