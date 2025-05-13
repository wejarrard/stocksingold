'use client';

export default function Footer() {
  return (
    <footer className="bg-gray-900 bg-opacity-90 py-6">
      <div className="container mx-auto px-4 text-center text-gray-400">
        <p>&copy; Gold-Adjusted SPY Index. Data from Macrotrends. Made by <a href="https://willjarrard.com" className="hover:text-gray-200 text-white">Will Jarrard</a> with ❤️</p>
        <p className="text-sm mt-2">
          Built with Next.js, Chart.js, and Framer Motion.
        </p>
      </div>
    </footer>
  );
} 