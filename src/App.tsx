import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { getStockData, getStockHistory } from './services/api';
import { Stock, StockHistory } from './types/stock';
import StockCard from './components/StockCard';

const STOCKS = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'ITC', 'HINDUNILVR', 'SBIN'];
const REFRESH_INTERVAL = 60000;

function App() {
  const [stocks, setStocks] = useState<Array<{ stock: Stock; history: StockHistory[] }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'change' | 'volume'>('price');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStockData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      let hasError = false;
      
      // Fetch stocks sequentially to respect rate limits
      for (const symbol of STOCKS) {
        try {
          const [stock, history] = await Promise.all([
            getStockData(symbol),
            getStockHistory(symbol)
          ]);
          
          // Update state incrementally as data comes in
          setStocks(current => {
            const others = current.filter(item => item.stock.symbol !== symbol);
            return [...others, { stock, history }];
          });
        } catch (err) {
          console.warn(`Warning: Using fallback data for ${symbol}`);
          hasError = true;
        }
      }
      
      setLastUpdated(new Date());
      if (hasError) {
        setError('Some stock data may be delayed or using estimates');
      } else {
        setError(null);
      }
    } catch (err) {
      setError('Unable to fetch real-time data. Showing estimated values.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStockData();
    const interval = setInterval(fetchStockData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStockData]);

  const filteredStocks = stocks
    .filter(({ stock }) => 
      stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
      stock.companyName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.stock.currentPrice - a.stock.currentPrice;
        case 'change':
          return b.stock.changePercent - a.stock.changePercent;
        case 'volume':
          return b.stock.volume - a.stock.volume;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Indian Stock Dashboard</h1>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={fetchStockData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search stocks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'price' | 'change' | 'volume')}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="price">Sort by Price</option>
            <option value="change">Sort by Change %</option>
            <option value="volume">Sort by Volume</option>
          </select>
        </div>

        {loading && stocks.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStocks.map(({ stock, history }) => (
              <StockCard key={stock.symbol} stock={stock} history={history} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;