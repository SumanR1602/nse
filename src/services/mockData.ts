import { Stock, StockHistory } from '../types/stock';

const MOCK_PRICES: Record<string, number> = {
  'RELIANCE': 2450.75,
  'TCS': 3890.25,
  'HDFCBANK': 1678.50,
  'INFY': 1456.80,
  'ICICIBANK': 987.65,
  'ITC': 432.15,
  'HINDUNILVR': 2567.90,
  'SBIN': 645.30
};

export function mockStockData(symbol: string): Stock {
  const basePrice = MOCK_PRICES[symbol] || 1000;
  const changePercent = (Math.random() * 4) - 2; // Random change between -2% and 2%
  const change = (basePrice * changePercent) / 100;
  
  return {
    symbol,
    companyName: symbol,
    currentPrice: basePrice + change,
    previousClose: basePrice,
    high: basePrice * (1 + Math.random() * 0.02),
    low: basePrice * (1 - Math.random() * 0.02),
    change,
    changePercent,
    volume: Math.floor(Math.random() * 1000000) + 500000,
    marketCap: basePrice * 1000000000
  };
}

export function generateMockHistory(symbol: string): StockHistory[] {
  const basePrice = MOCK_PRICES[symbol] || 1000;
  const history: StockHistory[] = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate a somewhat realistic price movement
    const volatility = 0.02; // 2% daily volatility
    const change = (Math.random() * 2 - 1) * volatility;
    const price = basePrice * (1 + change);
    
    history.push({
      date: date.toISOString().split('T')[0],
      price: Number(price.toFixed(2))
    });
  }
  
  return history;
}