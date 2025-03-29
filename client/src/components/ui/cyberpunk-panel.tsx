import * as React from "react";
import { cn } from "@/lib/utils";

export interface CyberpunkPanelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

const CyberpunkPanel = React.forwardRef<HTMLDivElement, CyberpunkPanelProps>(
  ({ className, glow = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative border border-neon-blue/30 rounded-sm bg-cyber-black/70",
          glow && "shadow-[0_0_10px_rgba(0,243,255,0.5),inset_0_0_10px_rgba(0,243,255,0.2)]",
          glow && "animate-glow",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CyberpunkPanel.displayName = "CyberpunkPanel";

export { CyberpunkPanel };
