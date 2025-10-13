import { useQuery } from "@tanstack/react-query";
import { finnhubAPI } from "@/services/finnhub";

export const useStockQuote = (symbol: string) => {
  return useQuery({
    queryKey: ["stock-quote", symbol],
    queryFn: () => finnhubAPI.getQuote(symbol),
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!symbol,
  });
};

export const useCompanyProfile = (symbol: string) => {
  return useQuery({
    queryKey: ["company-profile", symbol],
    queryFn: () => finnhubAPI.getCompanyProfile(symbol),
    enabled: !!symbol,
  });
};

export const useStockCandles = (symbol: string, resolution: string = "5") => {
  const to = Math.floor(Date.now() / 1000);
  const from = to - 24 * 60 * 60; // Last 24 hours

  return useQuery({
    queryKey: ["stock-candles", symbol, resolution],
    queryFn: () => finnhubAPI.getCandles(symbol, resolution, from, to),
    enabled: !!symbol,
  });
};
