const FINNHUB_API_KEY = "d3j47thr01qvmiig7r30d3j47thr01qvmiig7r3g";
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

export interface StockQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
}

export interface CompanyProfile {
  name: string;
  ticker: string;
  exchange: string;
  currency: string;
  marketCapitalization: number;
}

export interface Candle {
  c: number[]; // Close prices
  h: number[]; // High prices
  l: number[]; // Low prices
  o: number[]; // Open prices
  t: number[]; // Timestamps
  v: number[]; // Volume
}

export const finnhubAPI = {
  // Get stock quote
  async getQuote(symbol: string): Promise<StockQuote> {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    if (!response.ok) throw new Error("Failed to fetch quote");
    return response.json();
  },

  // Get company profile
  async getCompanyProfile(symbol: string): Promise<CompanyProfile> {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    if (!response.ok) throw new Error("Failed to fetch company profile");
    return response.json();
  },

  // Get candles (historical data)
  async getCandles(
    symbol: string,
    resolution: string = "5",
    from: number,
    to: number
  ): Promise<Candle> {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
    );
    if (!response.ok) throw new Error("Failed to fetch candles");
    return response.json();
  },

  // Get market news
  async getMarketNews(category: string = "general"): Promise<any[]> {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/news?category=${category}&token=${FINNHUB_API_KEY}`
    );
    if (!response.ok) throw new Error("Failed to fetch market news");
    return response.json();
  },

  // Get company news
  async getCompanyNews(symbol: string, from: string, to: string): Promise<any[]> {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
    );
    if (!response.ok) throw new Error("Failed to fetch company news");
    return response.json();
  },
};
