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
    if (!data || !data.c || data.s === 'no_data') return;

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
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 0
        }]
    };

    const ctx = document.getElementById('stockChart').getContext('2d');
    
    if (stockChart) {
        stockChart.destroy();
    }

    stockChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
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
    
    const cards = [];
    for (const symbol of symbols) {
        const quote = await finnhubAPI.getQuote(symbol);
        if (quote && quote.c) {
            cards.push(createStockCard(symbol, quote));
        }
    }
    
    container.innerHTML = '';
    cards.forEach(card => container.appendChild(card));
}
