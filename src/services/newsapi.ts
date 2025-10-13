const NEWSAPI_KEY = "0d4bfc05d7404c6ebe8ed1f3d1dd22b0";
const NEWSAPI_BASE_URL = "https://newsapi.org/v2";

export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export const newsAPI = {
  // Get everything (all news)
  async getEverything(
    query: string,
    pageSize: number = 20,
    language: string = "en"
  ): Promise<NewsResponse> {
    const response = await fetch(
      `${NEWSAPI_BASE_URL}/everything?q=${query}&pageSize=${pageSize}&language=${language}&apiKey=${NEWSAPI_KEY}`
    );
    if (!response.ok) throw new Error("Failed to fetch news");
    return response.json();
  },

  // Get top headlines
  async getTopHeadlines(
    category?: string,
    country: string = "us",
    pageSize: number = 20
  ): Promise<NewsResponse> {
    let url = `${NEWSAPI_BASE_URL}/top-headlines?country=${country}&pageSize=${pageSize}&apiKey=${NEWSAPI_KEY}`;
    if (category) {
      url += `&category=${category}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch top headlines");
    return response.json();
  },

  // Get business news
  async getBusinessNews(pageSize: number = 20): Promise<NewsResponse> {
    return this.getTopHeadlines("business", "us", pageSize);
  },

  // Get financial news by query
  async getFinancialNews(
    keywords: string = "stock market OR finance OR economy",
    pageSize: number = 20
  ): Promise<NewsResponse> {
    return this.getEverything(keywords, pageSize);
  },

  // Get crypto news
  async getCryptoNews(pageSize: number = 20): Promise<NewsResponse> {
    return this.getEverything("cryptocurrency OR bitcoin OR ethereum", pageSize);
  },
};
