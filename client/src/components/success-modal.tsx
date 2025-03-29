import { motion, AnimatePresence } from "framer-motion";
import { CyberpunkPanel } from "@/components/ui/cyberpunk-panel";
import { CyberpunkButton } from "@/components/ui/cyberpunk-button";

interface SuccessModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export function SuccessModal({ isOpen, message, onClose }: SuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-cyber-black/80" onClick={onClose} />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CyberpunkPanel className="relative z-10 max-w-md w-full p-6" glow>
              <div className="text-center">
                <motion.div 
                  className="flex justify-center mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <div 
                    className="progress-star w-16 h-16 bg-neon-green shadow-[0_0_10px_#39ff14]"
                    style={{
                      clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
                    }}
                  />
                </motion.div>
                
                <h3 className="font-orbitron text-2xl text-neon-green mb-2">CHALLENGE COMPLETE!</h3>
                <p className="font-tech-mono text-steel-blue mb-6">{message}</p>
                
                <CyberpunkButton 
                  variant="accent" 
                  fullWidth
                  onClick={onClose}
                >
                  CONTINUE
                </CyberpunkButton>
              </div>
            </CyberpunkPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
