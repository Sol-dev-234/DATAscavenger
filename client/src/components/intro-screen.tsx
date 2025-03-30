import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroScreenProps {
  onComplete: () => void;
}

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    let mounted = true;
    const interval = setInterval(() => {
      if (mounted) {
        setProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              if (mounted) onComplete();
            }, 500);
            return 100;
          }
          return newProgress;
        });
      }
    }, 300);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [onComplete]);
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-black"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center p-8">
          <h1 className="font-orbitron text-4xl md:text-6xl text-neon-blue mb-4 animate-pulse-slow">
            DATA<span className="text-neon-purple">CLUB</span>
          </h1>
          <p className="font-tech-mono text-steel-blue text-xl mb-8">INITIALIZING SYSTEM...</p>
          <div className="w-64 h-2 bg-gray-800 rounded-full mx-auto overflow-hidden">
            <motion.div 
              className="h-full bg-neon-green"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="mt-6 text-neon-purple font-tech-mono text-sm">
            CREATED BY: <span className="text-neon-blue">Sol Esther and John Andrei | BSIT</span>
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
