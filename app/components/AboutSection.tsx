'use client';

import { motion } from 'framer-motion';

interface GoldStandardEvent {
  date: string;
  label: string;
  description: string;
}

interface AboutSectionProps {
  goldStandardEvents: GoldStandardEvent[];
}

export default function AboutSection({ goldStandardEvents }: AboutSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-gray-900 bg-opacity-80 rounded-2xl shadow-2xl p-6 mb-8 backdrop-blur-sm"
    >
      <h2 className="text-2xl font-bold text-white mb-4">About This Visualization</h2>
      <div className="prose prose-invert max-w-none text-white">
        <p>
          This visualization shows the S&P 500 index priced in gold ounces rather than US dollars. 
          By measuring stocks against gold instead of currency, we can better distinguish between genuine value creation and the illusion of growth caused by currency devaluation.
        </p>
        <p className="font-semibold text-[rgba(255,99,132,0.8)]">
          When trust in money breaks, assets priced in that money often rise not because they gained value, but because the money lost it.
        </p>
        <p>
          This pattern is evident following major monetary policy changes like 1933 (when FDR abandoned the domestic gold standard) and 1971 (when Nixon ended dollar convertibility to gold). Both periods saw stock markets rise in dollar terms while declining when measured in gold.
        </p>
        <p>
          The main chart displays two metrics:
        </p>
        <ul>
          <li><strong>SPY in USD (blue line)</strong>: The dollar value of SPY shown on the left axis.</li>
          <li><strong>Gold Price in USD (pink line)</strong>: The dollar price of an ounce of gold shown on the left axis.</li>
          <li><strong>SPY in Gold (gold line)</strong>: How many ounces of gold it takes to buy one unit of the S&P 500 index, shown on the right axis.</li>
        </ul>
        <p>
          When SPY in Gold rises, stocks are genuinely outperforming gold. When it falls, the apparent growth in dollar terms may be masking a decline in real purchasing power.
        </p>

        <h3 className="text-xl font-bold text-white mt-6 mb-3">Historical Gold Standard Events</h3>
        <ul className="space-y-2">
          {goldStandardEvents.map((event, index) => (
            <li key={index} className="flex items-start">
              <div className="min-w-12 font-bold text-yellow-400">{event.date.split('-')[0]}</div>
              <div>
                <span className="font-semibold text-red-400">{event.label}</span>: <span className="text-white">{event.description}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
} 