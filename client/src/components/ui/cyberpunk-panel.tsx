import { ReactNode } from 'react';

interface CyberpunkPanelProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'accent';
}

export function CyberpunkPanel({
  children,
  className = '',
  variant = 'default',
}: CyberpunkPanelProps) {
  const baseClasses = 'rounded-sm flex flex-col overflow-hidden shadow-lg';
  const variantClasses = 
    variant === 'default'
      ? 'border border-neon-blue/30 bg-gradient-to-b from-cyber-black/50 to-cyber-black/30 backdrop-blur-sm'
      : 'border border-neon-purple/30 bg-gradient-to-b from-cyber-black/50 to-cyber-black/30 backdrop-blur-sm';

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </div>
  );
}