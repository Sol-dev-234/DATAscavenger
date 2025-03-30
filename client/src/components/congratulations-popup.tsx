
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  groupCode: string;
  onClose?: () => void;
}

export function CongratulationsPopup({ groupCode, onClose }: Props) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Auto-hide after 10 seconds
    const timer = setTimeout(() => {
      setShow(false);
      onClose?.();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/80"
    >
      <div className="max-w-md w-full mx-4 p-6 bg-background border-2 border-neon-green rounded-sm">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-orbitron text-neon-green animate-pulse">
            🎉 CONGRATULATIONS! 🎉
          </h2>
          <p className="font-tech-mono text-neon-blue">
            Group {groupCode} has completed all challenges!
          </p>
          <div className="mt-8 space-y-2">
            <p className="text-steel-blue font-tech-mono text-sm">
              ⚡ Please inform the host immediately! ⚡
            </p>
            <p className="text-neon-orange font-tech-mono text-sm animate-pulse">
              Your team's completion time has been recorded.
            </p>
          </div>
          <button
            onClick={() => {
              setShow(false);
              onClose?.();
            }}
            className="mt-6 px-4 py-2 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green border border-neon-green rounded-sm font-tech-mono transition-colors"
          >
            ACKNOWLEDGE
          </button>
        </div>
      </div>
    </motion.div>
  );
}
