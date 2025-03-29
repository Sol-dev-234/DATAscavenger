import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cyberpunkButtonVariants = cva(
  "relative inline-flex items-center justify-center font-orbitron text-sm uppercase font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-transparent border border-neon-blue text-neon-blue hover:bg-neon-blue/10 hover:shadow-[0_0_15px_rgba(0,243,255,0.5)]",
        secondary: "bg-transparent border border-neon-purple text-neon-purple hover:bg-neon-purple/10 hover:shadow-[0_0_15px_rgba(157,0,255,0.5)]",
        accent: "bg-transparent border border-neon-green text-neon-green hover:bg-neon-green/10 hover:shadow-[0_0_15px_rgba(57,255,20,0.5)]",
        destructive: "bg-transparent border border-destructive text-destructive hover:bg-destructive/10 hover:shadow-[0_0_15px_rgba(255,0,0,0.5)]",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        ghost: "text-neon-blue hover:text-neon-blue/80 hover:bg-neon-blue/10",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-sm px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
      },
      active: {
        true: "opacity-100",
        false: "opacity-50",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
      active: true,
    },
  }
);

export interface CyberpunkButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof cyberpunkButtonVariants> {}

const CyberpunkButton = React.forwardRef<HTMLButtonElement, CyberpunkButtonProps>(
  ({ className, variant, size, fullWidth, active, children, ...props }, ref) => {
    return (
      <button
        className={cn(cyberpunkButtonVariants({ variant, size, fullWidth, active, className }))}
        ref={ref}
        {...props}
      >
        {children}
        <span className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-500 group-hover:left-[100%]"></span>
      </button>
    );
  }
);

CyberpunkButton.displayName = "CyberpunkButton";

export { CyberpunkButton };
