import axios from 'axios';
import { Stock, StockHistory } from '../types/stock';
import { mockStockData, generateMockHistory } from './mockData';

const API_KEY = 'ZWKHQWTQQWE354ZI';
const BASE_URL = 'https://www.alphavantage.co/query';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Rate limit helper with retries
async function rateLimitedRequest<T>(
  request: () => Promise<T>,
  retries = 3,
  symbol?: string
): Promise<T> {
  try {
    const result = await request();
    await delay(1500); // Increased delay to 1.5s between requests
    return result;
  } catch (error) {
    if (retries > 0) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          await delay(60000); // Wait 1 minute on rate limit
          return rateLimitedRequest(request, retries - 1, symbol);
        }
      }
      await delay(2000); // Wait 2s before retry
      return rateLimitedRequest(request, retries - 1, symbol);
    }
    
    // If all retries failed and we have a symbol, return mock data
    if (symbol) {
      console.warn(`Using mock data for ${symbol} after all retries failed`);
      return mockStockData(symbol) as T;
    }
    throw error;
  }
}

export async function getStockData(symbol: string): Promise<Stock> {
  const request = async () => {
    const response = await api.get('', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol, // Using NSE symbols directly
        apikey: API_KEY
      }
    });

    const data = response.data['Global Quote'];
    
    if (!data || Object.keys(data).length === 0) {
      throw new Error(`No data available for ${symbol}`);
    }

    return {
      symbol,
      companyName: symbol,
      currentPrice: parseFloat(data['05. price']) || 0,
      previousClose: parseFloat(data['08. previous close']) || 0,
      high: parseFloat(data['03. high']) || 0,
      low: parseFloat(data['04. low']) || 0,
      change: parseFloat(data['09. change']) || 0,
      changePercent: parseFloat(data['10. change percent']?.replace('%', '')) || 0,
      volume: parseInt(data['06. volume']) || 0,
      marketCap: 0
    };
  };

  return rateLimitedRequest(request, 3, symbol);
}

export async function getStockHistory(symbol: string): Promise<StockHistory[]> {
  const request = async () => {
    const response = await api.get('', {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        apikey: API_KEY,
        outputsize: 'compact'
      }
    });

    const timeSeries = response.data['Time Series (Daily)'];
    
    if (!timeSeries || Object.keys(timeSeries).length === 0) {
      throw new Error(`No historical data available for ${symbol}`);
    }

    return Object.entries(timeSeries)
      .slice(0, 30)
      .map(([date, values]: [string, any]) => ({
        date,
        price: parseFloat(values['4. close']) || 0
      }))
      .reverse();
  };

  return rateLimitedRequest(request, 3, symbol).catch(() => generateMockHistory(symbol));
}