import { useQuery } from "@tanstack/react-query";
import { newsAPI } from "@/services/newsapi";

export const useFinancialNews = (pageSize: number = 12) => {
  return useQuery({
    queryKey: ["financial-news", pageSize],
    queryFn: () => newsAPI.getFinancialNews("stock market OR finance OR economy", pageSize),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useBusinessNews = (pageSize: number = 12) => {
  return useQuery({
    queryKey: ["business-news", pageSize],
    queryFn: () => newsAPI.getBusinessNews(pageSize),
    refetchInterval: 5 * 60 * 1000,
  });
};

export const useCryptoNews = (pageSize: number = 12) => {
  return useQuery({
    queryKey: ["crypto-news", pageSize],
    queryFn: () => newsAPI.getCryptoNews(pageSize),
    refetchInterval: 5 * 60 * 1000,
  });
};

export const useCustomNews = (query: string, pageSize: number = 12) => {
  return useQuery({
    queryKey: ["custom-news", query, pageSize],
    queryFn: () => newsAPI.getEverything(query, pageSize),
    enabled: !!query,
    refetchInterval: 5 * 60 * 1000,
  });
};
