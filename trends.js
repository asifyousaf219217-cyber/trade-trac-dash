let sectorChart = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('trends.html')) return;
    
    loadTrendingStocks();
    initSectorChart();
});

// Load Trending Stocks
async function loadTrendingStocks() {
    const container = document.getElementById('trendingStocks');
    if (!container) return;

    const symbols = ['NVDA', 'META', 'TSLA', 'AAPL', 'AMD'];
    
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
        console.error('Error loading trending stocks:', error);
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

// Sector Performance Chart
function initSectorChart() {
    const ctx = document.getElementById('sectorChart').getContext('2d');
    
    const data = {
        labels: ['Technology', 'Healthcare', 'Finance', 'Consumer', 'Industrial', 'Energy'],
        datasets: [{
            label: 'Performance (%)',
            data: [5.2, 2.8, 1.4, 0.9, -0.5, -1.8],
            backgroundColor: [
                '#3b82f6',
                '#22c55e',
                '#f59e0b',
                '#8b5cf6',
                '#ef4444',
                '#ef4444'
            ],
            borderRadius: 8
        }]
    };
    
    sectorChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}
