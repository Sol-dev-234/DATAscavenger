import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StarRatingProps {
  totalStars: number;
  activeStar: number;
  className?: string;
}

export function StarRating({ totalStars, activeStar, className }: StarRatingProps) {
  return (
    <div className={cn("flex space-x-2", className)}>
      {Array.from({ length: totalStars }).map((_, index) => (
        <Star 
          key={index} 
          active={index < activeStar} 
          animate={index === activeStar - 1}
        />
      ))}
    </div>
  );
}

function Star({ active, animate }: { active: boolean; animate: boolean }) {
  return (
    <motion.div
      className={cn(
        "progress-star", 
        active ? "bg-neon-green shadow-[0_0_10px_#39ff14]" : "bg-steel-blue/30 shadow-none"
      )}
      initial={animate ? { scale: 0 } : { scale: 1 }}
      animate={animate ? { scale: [0, 1.5, 1] } : { scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
        width: "25px",
        height: "25px",
        display: "inline-block"
      }}
    />
  );
}
