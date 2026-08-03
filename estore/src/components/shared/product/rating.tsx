import { StarHalfIcon, StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type RatingProps = {
  value: number | string;
  caption?: string;
  className?: string;
};

const getStarType = (rating: number, position: number) => {
  if (rating >= position) return "full";
  if (rating >= position - 0.5) return "half";
  return "empty";
};

const Rating = ({ value, caption, className }: RatingProps) => {
  const rating = Math.max(0, Math.min(5, Number(value) || 0));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, index) => {
          const position = index + 1;
          const starType = getStarType(rating, position);

          if (starType === "half") {
            return (
              <StarHalfIcon
                key={`star-${position}`}
                className="size-4 fill-yellow-500 text-yellow-500"
              />
            );
          }

          return (
            <StarIcon
              key={`star-${position}`}
              className={cn(
                "size-4 text-yellow-500",
                starType === "full" && "fill-yellow-500",
              )}
            />
          );
        })}
      </div>

      {caption && (
        <span className="text-sm text-muted-foreground">{caption}</span>
      )}
    </div>
  );
};

export default Rating;
