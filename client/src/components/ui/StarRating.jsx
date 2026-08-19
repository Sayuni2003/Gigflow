import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const STAR_VALUES = [1, 2, 3, 4, 5];

const SIZE_CLASSES = {
  sm: "size-4",
  md: "size-5",
  lg: "size-7",
};

const StarRating = ({ value = 0, onChange, readOnly = false, size = "md", className }) => {
  const [hoverValue, setHoverValue] = useState(0);
  const isInteractive = !readOnly && typeof onChange === "function";
  const displayValue = isInteractive && hoverValue > 0 ? hoverValue : value;

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      onMouseLeave={isInteractive ? () => setHoverValue(0) : undefined}
      role={isInteractive ? "radiogroup" : undefined}
      aria-label={isInteractive ? "Rating" : `Rated ${value} out of 5`}
    >
      {STAR_VALUES.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!isInteractive}
          onClick={isInteractive ? () => onChange(star) : undefined}
          onMouseEnter={isInteractive ? () => setHoverValue(star) : undefined}
          className={cn(
            "text-warning-text disabled:cursor-default",
            isInteractive && "cursor-pointer",
          )}
          aria-checked={isInteractive ? value === star : undefined}
          role={isInteractive ? "radio" : undefined}
          aria-label={isInteractive ? `${star} star${star === 1 ? "" : "s"}` : undefined}
        >
          <Star
            className={cn(SIZE_CLASSES[size], star <= displayValue ? "fill-current" : "fill-none")}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
