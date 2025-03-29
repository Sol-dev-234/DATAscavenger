import * as React from "react";
import { cn } from "@/lib/utils";

export interface CyberpunkInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const CyberpunkInput = React.forwardRef<HTMLInputElement, CyberpunkInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full font-tech-mono bg-cyber-black/80 border border-neon-blue/50 text-neon-blue px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-steel-blue focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue focus:shadow-[0_0_10px_rgba(0,243,255,0.7)] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

CyberpunkInput.displayName = "CyberpunkInput";

export { CyberpunkInput };
