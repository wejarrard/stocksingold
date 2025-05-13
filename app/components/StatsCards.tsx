'use client';

import { motion } from 'framer-motion';
import { Stats } from '../types';

interface StatsCardsProps {
  stats: Stats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {[
        { label: 'Current Value', value: stats.current.toFixed(4), color: 'bg-yellow-500' },
        { label: 'Average', value: stats.avg.toFixed(4), color: 'bg-blue-500' },
        { label: 'Minimum', value: stats.min.toFixed(4), color: 'bg-red-500' },
        { label: 'Maximum', value: stats.max.toFixed(4), color: 'bg-green-500' },
      ].map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 * index }}
          className="bg-gray-900 bg-opacity-80 rounded-xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center mb-2">
            <div className={`w-3 h-3 rounded-full ${stat.color} mr-2`}></div>
            <h3 className="text-lg font-medium text-gray-300">{stat.label}</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stat.value}</p>
          <p className="text-sm text-gray-400">ounces of gold per SPY</p>
        </motion.div>
      ))}
    </div>
  );
} 