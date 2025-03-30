import { ButtonHTMLAttributes, ReactNode } from 'react';

interface CyberpunkButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'accent' | 'destructive';
  active?: boolean;
  fullWidth?: boolean;
}

export function CyberpunkButton({
  children,
  className = '',
  variant = 'default',
  active = true,
  fullWidth = false,
  ...props
}: CyberpunkButtonProps) {
  const baseClasses = 'relative px-6 py-2 rounded-sm font-orbitron text-sm transition-all duration-200 shadow-lg';
  
  let variantClasses = '';
  if (!active) {
    variantClasses = 'bg-cyber-black/50 text-steel-blue/50 border border-steel-blue/20 cursor-not-allowed';
  } else if (variant === 'default') {
    variantClasses = 'bg-cyber-black border border-neon-blue hover:border-neon-blue/80 text-neon-blue hover:text-white hover:bg-neon-blue/10 hover:shadow-[0_0_15px_rgba(0,243,255,0.5)] active:translate-y-0.5';
  } else if (variant === 'accent') {
    variantClasses = 'bg-cyber-black border border-neon-green hover:border-neon-green/80 text-neon-green hover:text-white hover:bg-neon-green/10 hover:shadow-[0_0_15px_rgba(57,255,20,0.5)] active:translate-y-0.5';
  } else if (variant === 'destructive') {
    variantClasses = 'bg-cyber-black border border-neon-orange hover:border-neon-orange/80 text-neon-orange hover:text-white hover:bg-neon-orange/10 hover:shadow-[0_0_15px_rgba(255,119,0,0.5)] active:translate-y-0.5';
  }

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${widthClass} ${className}`}
      disabled={!active}
      {...props}
    >
      {children}
      <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-sm"></div>
    </button>
  );
}