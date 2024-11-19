import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ProcessingOverlayProps {
  show: boolean;
  message: string;
}

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ show, message }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-black/80 border border-[#feffaf]/30 p-8 rounded-2xl shadow-2xl"
          >
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-[#feffaf]" />
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    "radial-gradient(circle, rgba(254,255,175,0.2) 0%, transparent 50%)",
                    "radial-gradient(circle, rgba(254,255,175,0.2) 50%, transparent 100%)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            </div>
            <p className="text-[#feffaf] text-xl font-medium text-center">
              {message}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};