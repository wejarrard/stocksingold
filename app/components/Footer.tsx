'use client';

export default function Footer() {
  return (
    <footer className="bg-gray-900 bg-opacity-90 py-6">
      <div className="container mx-auto px-4 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} Gold-Adjusted SPY Index. Data from Macrotrends.</p>
        <p className="text-sm mt-2">
          Built with Next.js, Chart.js, and Framer Motion.
        </p>
      </div>
    </footer>
  );
} 