export interface Stock {
  symbol: string;
  companyName: string;
  currentPrice: number;
  previousClose: number;
  high: number;
  low: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
}

export interface StockHistory {
  date: string;
  price: number;
}