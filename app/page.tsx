'use client';

import { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  LogarithmicScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useScroll, useTransform } from 'framer-motion';
import annotationPlugin from 'chartjs-plugin-annotation';
import crosshairPlugin from 'chartjs-plugin-crosshair';

import Header from './components/Header';
import AboutSection from './components/AboutSection';
import ChartContainer from './components/ChartContainer';
import Footer from './components/Footer';
import { CombinedData, GoldData, SpyData } from './types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  annotationPlugin,
  crosshairPlugin
);

const goldStandardEvents = [
  {
    date: '1933-04',
    label: 'FDR abandons gold standard',
    description: 'Executive Order 6102 prohibits private gold ownership for US citizens, effectively ending the gold standard domestically.'
  },
  {
    date: '1971-08',
    label: 'Nixon ends convertibility',
    description: 'Nixon suspends gold convertibility ("Nixon Shock"), effectively ending Bretton Woods.'
  }
];

export default function Home() {
  const [combinedData, setCombinedData] = useState<CombinedData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { scrollYProgress } = useScroll();
  const gradientPos = useTransform(scrollYProgress, [0, 1], [0, 100]);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse the data and calculate SPY in terms of gold
  useEffect(() => {
    const processData = async () => {
      try {
        setIsLoading(true);
        
        // Load the data files
        const goldResponse = await fetch('/assets/gold.csv');
        const spyResponse = await fetch('/assets/spy.csv');
        
        if (!goldResponse.ok || !spyResponse.ok) {
          throw new Error('Failed to fetch data files');
        }
        
        const goldText = await goldResponse.text();
        const spyText = await spyResponse.text();
        
        // Parse the CSV files
        const goldParsed = Papa.parse<GoldData>(goldText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        });
        
        const spyParsed = Papa.parse<SpyData>(spyText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        });
        
        // Create lookup objects for easier date matching
        const goldByMonth: Record<string, number> = {};
        goldParsed.data.forEach(row => {
          if (row.Date && row.Price) {
            goldByMonth[row.Date] = row.Price;
          }
        });
        
        const spyByMonth: Record<string, number> = {};
        spyParsed.data.forEach(row => {
          if (row.Date && row['Closing Value']) {
            // Convert YYYY-MM-DD to YYYY-MM
            const dateParts = row.Date.split('-');
            if (dateParts.length >= 2) {
              const yearMonth = `${dateParts[0]}-${dateParts[1].padStart(2, '0')}`;
              spyByMonth[yearMonth] = row['Closing Value'];
            }
          }
        });
        
        // Find common dates and calculate SPY in gold
        const commonDates = Object.keys(goldByMonth)
          .filter(date => spyByMonth[date] !== undefined)
          .sort();
        
        const processedData = commonDates.map(date => ({
          date,
          spyUSD: spyByMonth[date],
          goldPrice: goldByMonth[date],
          spyInGold: spyByMonth[date] / goldByMonth[date]
        }));
        
        setCombinedData(processedData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error processing data:', err);
        setError('Failed to process data. Please try again later.');
        setIsLoading(false);
      }
    };
    
    processData();
  }, []);

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{
        backgroundImage: `linear-gradient(to right, #1a2a6c, #fdbb2d)`,
        backgroundSize: '100% 100%',
        transition: 'background-position 0.5s ease-in-out',
      }}
      ref={containerRef}
    >
      <div className="container mx-auto px-4 py-8">
        <Header />
        <AboutSection goldStandardEvents={goldStandardEvents} />
        <ChartContainer 
          combinedData={combinedData} 
          isLoading={isLoading} 
          error={error} 
          goldStandardEvents={goldStandardEvents} 
        />
      </div>
      <Footer />
    </div>
  );
}