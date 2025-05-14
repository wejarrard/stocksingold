'use client';

import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { ChartData, ChartOptions } from 'chart.js';
import { CombinedData } from '../types';
import StatsCards from './StatsCards';

interface ChartContainerProps {
  combinedData: CombinedData[];
  isLoading: boolean;
  error: string | null;
  goldStandardEvents: { date: string; label: string; description: string }[];
}

export default function ChartContainer({ combinedData, isLoading, error, goldStandardEvents }: ChartContainerProps) {
  const [timeRange, setTimeRange] = useState<string>('all');
  const [useLogScale, setUseLogScale] = useState<boolean>(false);

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
        filteredData = currentData.slice(-120);
    }
    
    return filteredData;
  };

  const chartData: ChartData<'line'> = {
    labels: getFilteredData().map(d => {
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
        label: 'Gold Price (USD)',
        data: getFilteredData().map(d => d.goldPrice),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
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

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
    interaction: {
      mode: 'index',
      intersect: false,
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
          text: 'Price (USD)',
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
        position: 'nearest',
        callbacks: {
          title: (context) => {
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
            
            if (context.dataset.label === 'SPY in USD') {
              return `SPY in USD: $${data.spyUSD.toFixed(2)}`;
            } else if (context.dataset.label === 'Gold Price (USD)') {
              return `Gold Price: $${data.goldPrice.toFixed(2)} per oz`;
            } else {
              return `SPY in Gold: ${data.spyInGold.toFixed(4)} oz`;
            }
          }
        }
      },
      crosshair: {
        line: {
          color: 'rgba(255, 255, 255, 0.8)',
          width: 1,
          dashPattern: [5, 5]
        },
        sync: {
          enabled: true
        },
        zoom: {
          enabled: false
        }
      },
      annotation: {
        annotations: {
          ...goldStandardEvents.reduce((acc, event, index) => {
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
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-900 bg-opacity-80 rounded-2xl shadow-2xl p-6 mb-8 backdrop-blur-sm"
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-4 md:mb-0">SPY & Gold Price History</h2>
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
      
      <StatsCards stats={stats} />
    </motion.div>
  );
} 