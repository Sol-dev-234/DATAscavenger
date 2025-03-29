import * as React from "react";
import { cn } from "@/lib/utils";

export interface CyberpunkProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max: number;
  showPercentage?: boolean;
}

const CyberpunkProgress = React.forwardRef<HTMLDivElement, CyberpunkProgressProps>(
  ({ className, value, max, showPercentage = false, ...props }, ref) => {
    const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
    
    return (
      <div
        ref={ref}
        className={cn("w-full flex flex-col space-y-2", className)}
        {...props}
      >
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-neon-green transition-all duration-1000"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {showPercentage && (
          <p className="mt-2 text-right font-tech-mono text-xs text-steel-blue">
            <span>{Math.round(percentage)}%</span> COMPLETE
          </p>
        )}
      </div>
    );
  }
);

CyberpunkProgress.displayName = "CyberpunkProgress";

export { CyberpunkProgress };
