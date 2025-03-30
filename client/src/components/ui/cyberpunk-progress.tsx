import React from 'react';
import { motion } from 'framer-motion';

interface CyberpunkProgressProps {
  value: number;
  max: number;
  showPercentage?: boolean;
  color?: string;
  className?: string;
}

export function CyberpunkProgress({
  value,
  max,
  showPercentage = false,
  color = 'neon-blue',
  className = '',
}: CyberpunkProgressProps) {
  // Ensure value is within bounds
  const safeValue = Math.max(0, Math.min(value, max));
  const percentage = Math.round((safeValue / max) * 100);

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div className="w-full h-4 bg-cyber-black border border-steel-blue/30 relative rounded-sm overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full relative transition-colors duration-300`}
          style={{
            backgroundColor: `var(--${color})`,
            boxShadow: `0 0 10px var(--${color})`,
          }}
        >
          <div className="absolute top-0 left-0 w-full h-full grid grid-cols-12 gap-0.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i} 
                className="h-full bg-black/20 w-full"
              />
            ))}
          </div>
        </motion.div>
        
        {/* Glitch effect overlays */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/10 to-transparent"></div>
        </div>
      </div>
      
      {showPercentage && (
        <div className="text-right mt-1">
          <span className={`text-xs font-tech-mono text-${color}`}>
            {percentage}%
          </span>
        </div>
      )}
    </div>
  );
}