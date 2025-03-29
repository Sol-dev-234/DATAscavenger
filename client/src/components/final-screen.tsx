import { motion } from "framer-motion";
import { CyberpunkPanel } from "@/components/ui/cyberpunk-panel";
import { CyberpunkButton } from "@/components/ui/cyberpunk-button";
import { StarRating } from "@/components/star-rating";
import { useEffect, useState } from "react";

interface FinalScreenProps {
  onRestart: () => void;
  completionTime?: number;
  groupCode?: string | number;
}

function getGroupTextClass(groupCode?: string | number) {
  if (!groupCode) return "text-neon-blue";
  
  switch (groupCode.toString()) {
    case "1": return "text-neon-blue";
    case "2": return "text-neon-purple";
    case "3": return "text-neon-orange";
    case "4": return "text-neon-pink";
    default: return "text-neon-blue";
  }
}

export function FinalScreen({ onRestart, completionTime = 0, groupCode = "1" }: FinalScreenProps) {
  const [showFinalMsg, setShowFinalMsg] = useState(false);
  
  useEffect(() => {
    // Show the final message after 2 seconds
    const timer = setTimeout(() => {
      setShowFinalMsg(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const groupTextColor = getGroupTextClass(groupCode);
  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center p-8 max-w-2xl">
        <motion.h1 
          className="font-orbitron text-4xl md:text-6xl text-neon-green mb-6 animate-pulse-slow"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          MISSION ACCOMPLISHED
        </motion.h1>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <CyberpunkPanel className="p-6 mb-8" glow>
            <p className="font-tech-mono text-xl text-steel-blue mb-4">All challenges completed successfully!</p>
            
            <p className="font-tech-mono text-steel-blue mb-2">
              Final Score: <span className={`${groupTextColor} text-2xl`}>100%</span>
            </p>
            
            {completionTime > 0 && (
              <p className="font-tech-mono text-steel-blue mb-4">
                Completion Time: <span className="text-neon-green text-xl font-bold tabular-nums">{formatTime(completionTime)}</span>
              </p>
            )}
            
            <div className="flex justify-center my-6">
              <StarRating totalStars={5} activeStar={5} />
            </div>
            
            {showFinalMsg && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mt-4 p-3 border border-neon-green/30 bg-cyber-black/50 rounded"
              >
                <p className="font-orbitron text-neon-green text-lg mb-2 animate-pulse">QUICKLY TELL YOUR HOSTS!</p>
                <p className="font-tech-mono text-steel-blue text-sm">
                  Thank you for playing our game
                  <span className={`${groupTextColor} mx-1`}>[Sol & Andrei]</span>
                </p>
              </motion.div>
            )}
          </CyberpunkPanel>
        </motion.div>
        
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <CyberpunkButton onClick={onRestart}>
            RESTART SIMULATION
          </CyberpunkButton>
        </motion.div>
      </div>
    </motion.div>
  );
}
