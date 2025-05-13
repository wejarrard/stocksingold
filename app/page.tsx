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
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { motion, useScroll, useTransform } from 'framer-motion';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register Chart.js components
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
  annotationPlugin
);

// Define the data structure
interface GoldData {
  Date: string;
  Price: number;
}

interface SpyData {
  Date: string;
  'Closing Value': number;
}

interface CombinedData {
  date: string;
  spyUSD: number;
  goldPrice: number;
  spyInGold: number;
}

// Define historical gold standard events
const goldStandardEvents = [
  {
    date: '1971-08',
    label: 'Nixon ends convertibility',
    description: 'Nixon suspends gold convertibility ("Nixon Shock"), effectively ending Bretton Woods.'
  }
];

export default function Home() {
  const [combinedData, setCombinedData] = useState<CombinedData[]>([]);
  const [timeRange, setTimeRange] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [useLogScale, setUseLogScale] = useState<boolean>(false);
  
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
  
  // Filter data based on the selected time range
  const getFilteredData = () => {
    if (!combinedData.length) return [];
    
    let filteredData: CombinedData[] = [];
    const currentData = [...combinedData];
    
    switch (timeRange) {
      case '1year':
        filteredData = currentData.slice(-12);
        break;
      case '5years':
        filteredData = currentData.slice(-60);
        break;
      case '10years':
        filteredData = currentData.slice(-120);
        break;
      case '20years':
        filteredData = currentData.slice(-240);
        break;
      case 'all':
        filteredData = currentData;
        break;
      default:
        filteredData = currentData.slice(-120); // Default to 10 years
    }
    
    return filteredData;
  };

  // Prepare chart data
  const chartData: ChartData<'line'> = {
    labels: getFilteredData().map(d => {
      // Convert YYYY-MM to a Date object for proper display
      const [year, month] = d.date.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, 1);
    }),
    datasets: [
      {
        label: 'SPY in USD',
        data: getFilteredData().map(d => d.spyUSD),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        yAxisID: 'y',
        tension: 0.4,
      },
      {
        label: 'SPY in Gold (oz)',
        data: getFilteredData().map(d => d.spyInGold),
        borderColor: 'rgb(255, 215, 0)',
        backgroundColor: 'rgba(255, 215, 0, 0.5)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        yAxisID: 'y1',
        tension: 0.4,
      }
    ]
  };

  // Chart options
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timeRange === '1year' ? 'month' : 'year',
          displayFormats: {
            month: 'MMM yyyy',
            year: 'yyyy'
          },
          tooltipFormat: 'MMM dd, yyyy',
        },
        title: {
          display: true,
          text: 'Date',
          color: '#f8f9fa',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#f8f9fa',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: timeRange === '1year' ? 12 : timeRange === '5years' ? 10 : timeRange === '10years' ? 10 : timeRange === '20years' ? 10 : 15,
        },
      },
      y: {
        type: useLogScale ? 'logarithmic' : 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'SPY Price (USD)',
          color: '#f8f9fa',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#f8f9fa',
          callback: (value) => `$${value}`
        },
      },
      y1: {
        type: useLogScale ? 'logarithmic' : 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'SPY Price (Gold oz)',
          color: '#f8f9fa',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          color: '#f8f9fa',
          callback: (value) => `${(value as number).toFixed(2)} oz`
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#f8f9fa',
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (context) => {
            // Format the date in the tooltip title
            if (context[0]?.label) {
              const date = new Date(context[0].label);
              return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });
            }
            return '';
          },
          label: (context) => {
            const dataIndex = context.dataIndex;
            const data = getFilteredData()[dataIndex];
            
            if (context.dataset.yAxisID === 'y') {
              return `SPY in USD: $${data.spyUSD.toFixed(2)}`;
            } else {
              return [
                `SPY in Gold: ${data.spyInGold.toFixed(4)} oz`,
                `Gold Price: $${data.goldPrice.toFixed(2)} per oz`
              ];
            }
          }
        }
      },
      annotation: {
        annotations: {
          // Create annotations with unique keys
          ...goldStandardEvents.reduce((acc, event, index) => {
            // Only show events that fall within our time range
            const eventDate = new Date(`${event.date}-01`);
            const filteredData = getFilteredData();
            if (filteredData.length === 0) return acc;
            
            const firstDate = new Date(`${filteredData[0].date}-01`);
            const lastDate = new Date(`${filteredData[filteredData.length - 1].date}-01`);
            
            if (eventDate < firstDate || eventDate > lastDate) return acc;
            
            return {
              ...acc,
              [`event-${index}`]: {
                type: 'line',
                borderColor: 'rgba(255, 99, 132, 0.8)',
                borderWidth: 2,
                borderDash: [6, 6],
                label: {
                  display: true,
                  content: event.label,
                  position: 'start',
                  backgroundColor: 'rgba(255, 99, 132, 0.8)',
                  color: 'white',
                  font: {
                    size: 10,
                    weight: 'bold',
                  },
                  padding: 4,
                  xAdjust: 0,
                  yAdjust: index % 2 === 0 ? -30 - (index * 10) : 30 + (index * 10),
                },
                scaleID: 'x',
                value: eventDate,
              }
            };
          }, {})
        }
      },
    },
  };

  // Calculate statistics for the current time range
  const calculateStats = () => {
    const data = getFilteredData();
    if (!data.length) return { min: 0, max: 0, avg: 0, current: 0 };
    
    const values = data.map(d => d.spyInGold);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const current = values[values.length - 1];
    
    return { min, max, avg, current };
  };

  const stats = calculateStats();

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{
        backgroundImage: `linear-gradient(${gradientPos.get()}deg, #1a2a6c, #b21f1f, #fdbb2d)`,
        backgroundSize: '300% 300%',
        transition: 'background-position 0.5s ease-in-out',
      }}
      ref={containerRef}
    >
      <div className="container mx-auto px-4 py-8">
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

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-900 bg-opacity-80 rounded-2xl shadow-2xl p-6 mb-8 backdrop-blur-sm"
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 md:mb-0">Historical Performance</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {['1year', '5years', '10years', '20years', 'all'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      timeRange === range
                        ? 'bg-yellow-500 text-gray-900 font-medium'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {range === '1year'
                      ? '1 Year'
                      : range === '5years'
                      ? '5 Years'
                      : range === '10years'
                      ? '10 Years'
                      : range === '20years'
                      ? '20 Years'
                      : 'All Time'}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setUseLogScale(!useLogScale)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  useLogScale
                    ? 'bg-purple-500 text-white font-medium'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {useLogScale ? 'Logarithmic Scale' : 'Linear Scale'}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="h-96 flex justify-center items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
          ) : error ? (
            <div className="h-96 flex justify-center items-center">
              <p className="text-red-400 text-xl">{error}</p>
            </div>
          ) : (
            <div className="h-96">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      </div>

      <footer className="bg-gray-900 bg-opacity-90 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Gold-Adjusted SPY Index. Data from Macrotrends.</p>
          <p className="text-sm mt-2">
            Built with Next.js, Chart.js, and Framer Motion.
          </p>
        </div>
      </footer>
    </div>
  );
}