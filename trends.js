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
