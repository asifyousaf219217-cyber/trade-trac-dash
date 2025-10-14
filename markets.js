import { finnhubAPI } from './api.js';
import Chart from 'chart.js/auto';

let selectedStock = 'AAPL';
let stockChart = null;

// Initialize Markets Page
document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('markets.html')) return;
    
    initStockSelector();
    loadStockData();
    loadPopularStocks();
    
    // Auto-refresh every 30 seconds
    setInterval(loadStockData, 30000);
});

// Stock Selector
function initStockSelector() {
    const buttons = document.querySelectorAll('.stock-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedStock = btn.dataset.symbol;
            loadStockData();
        });
    });
}

// Load Stock Data
async function loadStockData() {
    const quote = await finnhubAPI.getQuote(selectedStock);
    if (!quote) return;

    // Update price info
    updateStockInfo(quote);
    
    // Load chart
    await loadStockChart();
}

function updateStockInfo(quote) {
    document.querySelector('.stock-symbol').textContent = selectedStock;
    document.querySelector('.stock-name').textContent = 'Live Quote';
    document.getElementById('currentPrice').textContent = `$${quote.c.toFixed(2)}`;
    
    const changeEl = document.getElementById('priceChange');
    const isPositive = quote.dp >= 0;
    changeEl.className = `stock-change ${isPositive ? 'positive' : 'negative'}`;
    changeEl.innerHTML = `
        <i class="fas fa-chart-line"></i>
        ${isPositive ? '+' : ''}${quote.dp.toFixed(2)}%
    `;
}

async function loadStockChart() {
    const to = Math.floor(Date.now() / 1000);
    const from = to - 24 * 60 * 60; // Last 24 hours
    
    const data = await finnhubAPI.getCandles(selectedStock, '5', from, to);
    if (!data || !data.c || data.s === 'no_data') {
        console.log('No chart data available');
        return;
    }

    const chartData = {
        labels: data.t.slice(-20).map(t => {
            const date = new Date(t * 1000);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }),
        datasets: [{
            label: selectedStock,
            data: data.c.slice(-20),
            borderColor: data.c[data.c.length - 1] > data.c[0] ? '#22c55e' : '#ef4444',
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0
        }]
    };

    const ctx = document.getElementById('stockChart');
    if (!ctx) return;
    
    if (stockChart) {
        stockChart.destroy();
    }

    stockChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: {
                duration: 750
            },
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: false,
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

// Load Popular Stocks
async function loadPopularStocks() {
    const container = document.getElementById('popularStocks');
    if (!container) return;

    const symbols = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'META', 'AMZN', 'AMD'];
    
    container.innerHTML = '<div class="loading">Loading stocks...</div>';
    
    try {
        const promises = symbols.map(symbol => finnhubAPI.getQuote(symbol));
        const quotes = await Promise.all(promises);
        
        container.innerHTML = '';
        
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

function createStockCard(symbol, quote) {
    const card = document.createElement('div');
    card.className = 'stock-card hover-lift';
    
    const isPositive = quote.dp >= 0;
    const icon = isPositive ? 'fa-chart-line' : 'fa-chart-line';
    
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
