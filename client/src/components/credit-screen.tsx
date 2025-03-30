import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";

interface CreditScreenProps {
  onComplete: () => void;
}

export function CreditScreen({ onComplete }: CreditScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Credit screen will be visible for 6 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  // When the exit animation completes, call onComplete
  const handleAnimationComplete = () => {
    if (!visible) {
      onComplete();
    }
  };

  return (
    <AnimatePresence onExitComplete={handleAnimationComplete}>
      {visible && (
        <motion.div 
          className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-cyber-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center max-w-md p-6"
          >
            <h1 className="font-orbitron text-neon-blue text-3xl mb-4">
              CYBER<span className="text-neon-purple">CHALLENGE</span>
            </h1>

            <div className="font-tech-mono mt-10 mb-2">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="text-neon-green text-xl mb-6"
              >
                Teamwork is the key, Godbless
              </motion.p>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.5 }}
                className="text-steel-blue text-sm"
              >
                created by Sol Esther and John Andrei Data Club Officers
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 1 }}
            className="absolute bottom-10 font-tech-mono text-steel-blue text-sm"
          >
            Loading mission data...
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}