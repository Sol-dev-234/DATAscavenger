import { motion } from "framer-motion";
import { CyberpunkPanel } from "@/components/ui/cyberpunk-panel";
import { CyberpunkButton } from "@/components/ui/cyberpunk-button";
import { StarRating } from "@/components/star-rating";

interface FinalScreenProps {
  onRestart: () => void;
}

export function FinalScreen({ onRestart }: FinalScreenProps) {
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
            <p className="font-tech-mono text-steel-blue">
              Final Score: <span className="text-neon-blue text-2xl">100%</span>
            </p>
            
            <div className="flex justify-center my-6">
              <StarRating totalStars={5} activeStar={5} />
            </div>
          </CyberpunkPanel>
        </motion.div>
        
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <CyberpunkButton onClick={onRestart}>
            RESTART SIMULATION
          </CyberpunkButton>
        </motion.div>
      </div>
    </motion.div>
  );
}
