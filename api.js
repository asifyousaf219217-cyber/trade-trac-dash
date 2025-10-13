// API Configuration
const FINNHUB_API_KEY = 'd3j47thr01qvmiig7r30d3j47thr01qvmiig7r3g';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const NEWSAPI_KEY = '0d4bfc05d7404c6ebe8ed1f3d1dd22b0';
const NEWSAPI_BASE_URL = 'https://newsapi.org/v2';

// Finnhub API
const finnhubAPI = {
    async getQuote(symbol) {
        try {
            const response = await fetch(
                `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
            );
            if (!response.ok) throw new Error('Failed to fetch quote');
            return await response.json();
        } catch (error) {
            console.error('Error fetching quote:', error);
            return null;
        }
    },

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

// News API
const newsAPI = {
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

    async getTopHeadlines(category, country = 'us', pageSize = 12) {
        try {
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

    async getBusinessNews(pageSize = 12) {
        return this.getTopHeadlines('business', 'us', pageSize);
    },

    async getFinancialNews(pageSize = 12) {
        return this.getEverything('stock market OR finance OR economy', pageSize);
    },

    async getCryptoNews(pageSize = 12) {
        return this.getEverything('cryptocurrency OR bitcoin OR ethereum', pageSize);
    }
};

// Utility Functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    return Math.floor(seconds / 86400) + ' days ago';
}
