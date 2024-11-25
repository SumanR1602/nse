import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Stock } from '../types/stock';
import StockChart from './StockChart';

interface Props {
  stock: Stock;
  history: { date: string; price: number; }[];
}

export default function StockCard({ stock, history }: Props) {
  const isPositive = stock.changePercent >= 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{stock.companyName}</h3>
          <p className="text-sm text-gray-500">{stock.symbol}</p>
        </div>
        <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline">
          <span className="text-2xl font-bold">₹{stock.currentPrice.toFixed(2)}</span>
          <span className={`ml-2 flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(stock.changePercent).toFixed(2)}%
          </span>
        </div>
      </div>

      <StockChart data={history} isPositive={isPositive} />

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-sm text-gray-500">Day's Range</p>
          <p className="font-medium">₹{stock.low.toFixed(2)} - ₹{stock.high.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Volume</p>
          <p className="font-medium">{stock.volume.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Previous Close</p>
          <p className="font-medium">₹{stock.previousClose.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Market Cap</p>
          <p className="font-medium">₹{(stock.marketCap / 10000000).toFixed(2)}Cr</p>
        </div>
      </div>
    </div>
  );
}