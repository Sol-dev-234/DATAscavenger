import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Award, CheckCircle } from "lucide-react";
import { CyberpunkButton } from "./ui/cyberpunk-button";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupCode: string;
}

export function CelebrationModal({ isOpen, onClose, groupCode }: CelebrationModalProps) {
  const [animationComplete, setAnimationComplete] = useState(false);

  // Start the second-phase animation after the initial animation
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setAnimationComplete(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setAnimationComplete(false);
    }
  }, [isOpen]);

  // Apply group-specific styling
  const getGroupColorClass = (groupCode: string) => {
    switch (groupCode) {
      case "1": return "text-neon-blue";
      case "2": return "text-neon-purple";
      case "3": return "text-neon-orange";
      case "4": return "text-neon-pink";
      default: return "text-neon-blue";
    }
  };

  const getGroupBgClass = (groupCode: string) => {
    switch (groupCode) {
      case "1": return "bg-neon-blue/10";
      case "2": return "bg-neon-purple/10";
      case "3": return "bg-neon-orange/10";
      case "4": return "bg-neon-pink/10";
      default: return "bg-neon-blue/10";
    }
  };
  
  const colorClass = getGroupColorClass(groupCode);
  const bgClass = getGroupBgClass(groupCode);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 15 }}
            className={`relative max-w-lg w-full rounded-md shadow-[0_0_15px_rgba(0,255,255,0.3)] border border-neon-green/50 ${bgClass} p-6 bg-cyber-black font-tech-mono`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex items-center justify-center h-24 w-24 rounded-full bg-neon-green/20 mb-6"
              >
                <Award className="h-14 w-14 text-neon-green" />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-3xl font-orbitron text-neon-green mb-4"
              >
                CONGRATULATIONS!
              </motion.h2>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="space-y-3 mb-6"
              >
                <p className={`text-xl ${colorClass}`}>
                  GROUP {groupCode} HAS COMPLETED ALL CHALLENGES!
                </p>
                
                <div className="mt-4 pt-4 border-t border-neon-green/30">
                  <motion.p
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ 
                      opacity: animationComplete ? [0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1] : 1,
                      scale: animationComplete ? [0.9, 1.1, 1] : 1
                    }}
                    transition={{ 
                      duration: animationComplete ? 2 : 0.5,
                      repeat: animationComplete ? Infinity : 0,
                      repeatDelay: 1
                    }}
                    className="text-2xl text-red-500 font-bold"
                  >
                    QUICKLY TELL YOUR HOST!!
                  </motion.p>
                </div>
                
                <div className="flex items-center justify-center mt-4 space-x-2 text-neon-green/80">
                  <CheckCircle className="h-5 w-5" />
                  <p>All team members have finished their challenges.</p>
                </div>
                
                <div className="flex items-center justify-center space-x-2 text-neon-green/80">
                  <AlertCircle className="h-5 w-5" />
                  <p>Your host is waiting to hear from your team!</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <CyberpunkButton onClick={onClose} variant="accent" className="mt-4">
                  ACKNOWLEDGE
                </CyberpunkButton>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}