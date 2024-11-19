import React from 'react';
import { Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

interface WalletButtonProps {
  isConnected: boolean;
  onConnect: () => void;
  address?: string;
}

export const WalletButton: React.FC<WalletButtonProps> = ({ isConnected, onConnect, address }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onConnect}
      className="relative group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#feffaf]/20 to-[#feffaf]/30 hover:from-[#feffaf]/30 hover:to-[#feffaf]/40 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
    >
      <Wallet className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
      <span className="font-medium">
        {isConnected
          ? `${address?.slice(0, 4)}...${address?.slice(-4)}`
          : 'Connect Phantom'}
      </span>
      <div className="absolute inset-0 rounded-xl bg-[#feffaf]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.button>
  );
};