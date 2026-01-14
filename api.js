/* 
   API CONFIGURATION FILE
   Created by: Eisa Abdul
   This file handles all API calls to Finnhub and NewsAPI
*/

// my API keys - these are needed to get data
const FINNHUB_API_KEY = 'd3n7u21r01qk65165l6gd3n7u21r01qk65165l70';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const NEWSAPI_KEY = 'a6542220e1e74e548cd3c1b7bf0a9762';
const NEWSAPI_BASE_URL = 'https://newsapi.org/v2';

// exporting these so other files can use them
export { FINNHUB_API_KEY, FINNHUB_BASE_URL, NEWSAPI_KEY, NEWSAPI_BASE_URL };

/* 
   FINNHUB API FUNCTIONS
   For getting stock market data
*/

export const finnhubAPI = {
    // function to get current price and change for a stock
    async getQuote(symbol) {
        try {
            // making API request to finnhub
            const response = await fetch(
                `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
            );
            // checking if request was successful
            if (!response.ok) throw new Error('Failed to fetch quote');
            // converting response to JSON
            return await response.json();
        } catch (error) {
            // if something goes wrong, log it and return null
            console.error('Error fetching quote:', error);
            return null;
        }
    },

    // function to get company information
    async getCompanyProfile(symbol) {
        try {
            const response = await fetch(
                `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
            );
            if (!response.ok) throw new Error('Failed to fetch company profile');
            return await response.json();
        } catch (error) {
            console.error('Error fetching company profile:', error);
            return null;
        }
    },

    // function to get historical price data for charts
    async getCandles(symbol, resolution = '5', from, to) {
        try {
            const response = await fetch(
                `${FINNHUB_BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
            );
            if (!response.ok) throw new Error('Failed to fetch candles');
            return await response.json();
        } catch (error) {
            console.error('Error fetching candles:', error);
            return null;
        }
    }
};

/* 
   NEWS API FUNCTIONS
   For getting financial news articles
*/

export const newsAPI = {
    // function to search for news articles
    async getEverything(query, pageSize = 12, language = 'en') {
        try {
            const response = await fetch(
                `${NEWSAPI_BASE_URL}/everything?q=${query}&pageSize=${pageSize}&language=${language}&apiKey=${NEWSAPI_KEY}`
            );
            if (!response.ok) throw new Error('Failed to fetch news');
            return await response.json();
        } catch (error) {
            console.error('Error fetching news:', error);
            return null;
        }
    },

    // function to get top headlines by category
    async getTopHeadlines(category, country = 'us', pageSize = 12) {
        try {
            // building the URL with or without category
            let url = `${NEWSAPI_BASE_URL}/top-headlines?country=${country}&pageSize=${pageSize}&apiKey=${NEWSAPI_KEY}`;
            if (category) {
                url += `&category=${category}`;
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch top headlines');
            return await response.json();
        } catch (error) {
            console.error('Error fetching top headlines:', error);
            return null;
        }
    },

    // function to get business news specifically
    async getBusinessNews(pageSize = 12) {
        return this.getTopHeadlines('business', 'us', pageSize);
    },

    // function to get financial news using search
    async getFinancialNews(pageSize = 12) {
        return this.getEverything('stock market OR finance OR economy', pageSize);
    },

    // function to get cryptocurrency news
    async getCryptoNews(pageSize = 12) {
        return this.getEverything('cryptocurrency OR bitcoin OR ethereum', pageSize);
    }
};

/* 
   UTILITY FUNCTIONS
   Helper functions used throughout the app
*/

// function to format big numbers nicely
// converts 1000000 to 1.0M, etc
export function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// function to convert date to "time ago" format
// like "2 hours ago" or "3 days ago"
export function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    // showing different text based on how old it is
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    return Math.floor(seconds / 86400) + ' days ago';
}
