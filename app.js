// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const html = document.documentElement;
    
    if (savedTheme === 'dark') {
        html.classList.add('dark');
        html.style.colorScheme = 'dark';
    } else {
        html.classList.remove('dark');
        html.style.colorScheme = 'light';
    }
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        updateThemeIcon(savedTheme);
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    
    if (newTheme === 'dark') {
        html.classList.add('dark');
        html.style.colorScheme = 'dark';
    } else {
        html.classList.remove('dark');
        html.style.colorScheme = 'light';
    }
    
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
}

// Ticker Animation
function initTicker() {
    const tickerContent = document.getElementById('tickerContent');
    if (!tickerContent) return;

    const tickerData = [
        { symbol: 'AAPL', change: 2.4, positive: true },
        { symbol: 'TSLA', change: -1.3, positive: false },
        { symbol: 'BTC', change: 0.7, positive: true },
        { symbol: 'GOOGL', change: 1.8, positive: true },
        { symbol: 'AMZN', change: -0.5, positive: false },
        { symbol: 'MSFT', change: 1.2, positive: true },
        { symbol: 'META', change: 3.1, positive: true },
        { symbol: 'NVDA', change: 2.9, positive: true }
    ];

    // Duplicate data for seamless loop
    const duplicatedData = [...tickerData, ...tickerData];
    
    tickerContent.innerHTML = duplicatedData.map(stock => `
        <div class="ticker-item">
            <span class="ticker-symbol">${stock.symbol}</span>
            <span class="ticker-change ${stock.positive ? 'positive' : 'negative'}">
                ${stock.positive ? '+' : ''}${stock.change}%
            </span>
        </div>
    `).join('');
}

// Load Stock Cards on Home Page
async function loadTopStocks() {
    const container = document.getElementById('topStocks');
    if (!container) return;

    const symbols = ['AAPL', 'TSLA', 'AMZN'];
    
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
        console.error('Error loading stocks:', error);
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
            <p class="stock-volume">Volume: ${formatNumber(quote.c * 1000000)}</p>
        </div>
    `;
    
    return card;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initTicker();
    
    // Load data for home page
    if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
        loadTopStocks();
    }
});
