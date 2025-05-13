'use client';

import { motion } from 'framer-motion';

export default function Header() {
  return (
    <header className="mb-8 text-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-6xl font-bold text-white mb-2"
      >
        <span className="text-yellow-400">Gold</span>-Adjusted SPY Index
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-xl text-gray-200"
      >
        Visualizing the S&P 500 priced in gold ounces instead of USD
      </motion.p>
    </header>
  );
} 