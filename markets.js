// ============================================
// MARKETS.JS - Stock market data and charts
// Shows live stock prices and trading charts
// ============================================

// importing the api functions and chart library
import { finnhubAPI } from './api.js';
import Chart from 'chart.js/auto';

// keeping track of which stock is selected
let selectedStock = 'AAPL';

// storing the chart so we can update it
let stockChart = null;

// ============================================
// INITIALIZATION - runs when page loads
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // only run on markets page
    if (!window.location.pathname.includes('markets.html')) return;
    
    // setting up the page
    initStockSelector();
    loadStockData();
    loadPopularStocks();
    
    // refreshing stock data every 30 seconds
    setInterval(loadStockData, 30000);
});

// ============================================
// STOCK SELECTOR - the buttons to pick different stocks
// ============================================
function initStockSelector() {
    // getting all the stock buttons
    const buttons = document.querySelectorAll('.stock-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // removing active class from all buttons
            buttons.forEach(b => b.classList.remove('active'));
            
            // adding active to clicked button
            btn.classList.add('active');
            
            // updating selected stock and loading new data
            selectedStock = btn.dataset.symbol;
            loadStockData();
        });
    });
}

// ============================================
// LOAD STOCK DATA - fetches current price and updates chart
// ============================================
async function loadStockData() {
    // getting quote from finnhub api
    const quote = await finnhubAPI.getQuote(selectedStock);
    if (!quote) return;

    // updating the price info display
    updateStockInfo(quote);
    
    // loading the chart with new data
    await loadStockChart();
}

// updates the stock price display
function updateStockInfo(quote) {
    // showing the symbol and current price
    document.querySelector('.stock-symbol').textContent = selectedStock;
    document.querySelector('.stock-name').textContent = 'Live Quote';
    document.getElementById('currentPrice').textContent = `$${quote.c.toFixed(2)}`;
    
    // showing the percentage change (green if up, red if down)
    const changeEl = document.getElementById('priceChange');
    const isPositive = quote.dp >= 0;
    changeEl.className = `stock-change ${isPositive ? 'positive' : 'negative'}`;
    changeEl.innerHTML = `
        <i class="fas fa-chart-line"></i>
        ${isPositive ? '+' : ''}${quote.dp.toFixed(2)}%
    `;
}

// ============================================
// LOAD STOCK CHART - shows price history as a line chart
// ============================================
async function loadStockChart() {
    // calculating time range (last 24 hours)
    const to = Math.floor(Date.now() / 1000);
    const from = to - 24 * 60 * 60;
    
    // fetching candle data (price history)
    const data = await finnhubAPI.getCandles(selectedStock, '5', from, to);
    
    // if no data, just log and return
    if (!data || !data.c || data.s === 'no_data') {
        console.log('No chart data available');
        return;
    }

    // preparing chart data
    // taking last 20 data points
    const chartData = {
        labels: data.t.slice(-20).map(t => {
            // converting timestamp to readable time
            const date = new Date(t * 1000);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }),
        datasets: [{
            label: selectedStock,
            data: data.c.slice(-20),
            // green if stock went up, red if went down
            borderColor: data.c[data.c.length - 1] > data.c[0] ? '#22c55e' : '#ef4444',
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,          // makes line smooth
            pointRadius: 0         // no dots on line
        }]
    };

    // getting the canvas
    const ctx = document.getElementById('stockChart');
    if (!ctx) return;
    
    // destroying old chart if it exists
    if (stockChart) {
        stockChart.destroy();
    }

    // creating new chart
    stockChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: {
                duration: 750       // smooth animation
            },
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: false,   // start from lowest value, not zero
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// ============================================
// POPULAR STOCKS - shows grid of stock cards
// ============================================
async function loadPopularStocks() {
    const container = document.getElementById('popularStocks');
    if (!container) return;

    // list of popular stock symbols
    const symbols = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'META', 'AMZN', 'AMD'];
    
    // showing loading message
    container.innerHTML = '<div class="loading">Loading stocks...</div>';
    
    try {
        // fetching quotes for all stocks at once
        const promises = symbols.map(symbol => finnhubAPI.getQuote(symbol));
        const quotes = await Promise.all(promises);
        
        // clearing the container
        container.innerHTML = '';
        
        // creating a card for each stock
        quotes.forEach((quote, index) => {
            if (quote && quote.c) {
                const card = createStockCard(symbols[index], quote);
                container.appendChild(card);
            }
        });
    } catch (error) {
        console.error('Error loading popular stocks:', error);
        container.innerHTML = '<div class="loading">Unable to load stocks</div>';
    }
}

// creates a single stock card element
function createStockCard(symbol, quote) {
    const card = document.createElement('div');
    card.className = 'stock-card hover-lift';
    
    // checking if stock is up or down
    const isPositive = quote.dp >= 0;
    const icon = isPositive ? 'fa-chart-line' : 'fa-chart-line';
    
    // building the card html
    card.innerHTML = `
        <div class="stock-header">
            <div>
                <h3 class="stock-symbol">${symbol}</h3>
                <p class="stock-name">${symbol}</p>
            </div>
            <i class="fas ${icon} ${isPositive ? 'text-success' : 'text-destructive'}"></i>
        </div>
        <div>
            <div class="stock-price">$${quote.c.toFixed(2)}</div>
            <div class="stock-change ${isPositive ? 'positive' : 'negative'}">
                ${isPositive ? '+' : ''}${quote.dp.toFixed(2)}%
            </div>
        </div>
    `;
    
    return card;
}
