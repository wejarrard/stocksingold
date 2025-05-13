# Gold-Adjusted SPY Index

A data visualization tool that shows the S&P 500 index priced in gold ounces instead of USD, allowing viewers to distinguish between genuine value creation and the illusion of growth caused by currency devaluation.

https://stocksingold.vercel.app/

## About this Project

This visualization allows you to view the S&P 500 from two perspectives:
- **SPY in USD (blue line)**: The conventional dollar value of SPY shown on the left axis
- **SPY in Gold (gold line)**: How many ounces of gold it takes to buy one unit of the S&P 500 index, shown on the right axis

When SPY in Gold rises, stocks are genuinely outperforming gold. When it falls, the apparent growth in dollar terms may be masking a decline in real purchasing power.

The visualization includes a vertical marker for the "Nixon Shock" of 1971, when the US abandoned the gold standard, a pivotal moment in monetary history.

## Features

- **Multiple Time Ranges**: View data for 1 year, 5 years, 10 years, 20 years, or all time
- **Dual Y-Axes**: See both USD and gold-valued SPY simultaneously
- **Interactive Tooltips**: Hover over any point to see exact values and dates
- **Logarithmic Scale Toggle**: Switch between linear and logarithmic scales for better visibility of historical data
- **Responsive Design**: Works on desktop and mobile devices
- **Historical Context**: Highlight of key monetary policy event that impacted asset valuation

## Data Source

All data is sourced from Macrotrends, offering reliable historical values for both the S&P 500 index and gold prices.

## Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stocksingold.git
cd stocksingold
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the visualization.

## Technology Stack

- **Next.js**: React framework for the frontend
- **Chart.js**: For data visualization
- **Framer Motion**: For animations and transitions
- **Tailwind CSS**: For styling
- **Papa Parse**: For CSV parsing

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Data provided by Macrotrends
- Inspired by monetary history and the relationship between fiat currency and hard assets
