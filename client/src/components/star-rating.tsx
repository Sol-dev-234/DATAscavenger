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
        "progress-star relative", 
        active ? "text-neon-green" : "text-muted-foreground"
      )}
      initial={animate ? { scale: 0, rotate: -180 } : { scale: 1 }}
      animate={animate ? { 
        scale: [0, 1.2, 1],
        rotate: [-180, 0],
      } : { scale: 1 }}
      transition={{ 
        duration: 0.6, 
        ease: "backOut",
      }}
      style={{
        width: "35px",
        height: "35px",
        display: "inline-block",
        filter: active ? "drop-shadow(0 0 12px #39ff14)" : "none",
        transform: "translateZ(0)", // Hardware acceleration
        willChange: "transform" // Optimization hint
      }}
    />
  );
}