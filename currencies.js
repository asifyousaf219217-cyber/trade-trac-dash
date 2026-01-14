// ============================================
// CURRENCIES.JS - Currency converter and rates
// Shows live currency exchange rates and conversions
// ============================================

// importing chart.js for the currency chart
import Chart from 'chart.js/auto';

// storing the chart so we can update it later
let currencyChart = null;

// ============================================
// INITIALIZATION - runs when page loads
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // only run on currencies page
    if (!window.location.pathname.includes('currencies.html')) return;
    
    // setting up all the currency features
    initConverter();
    initChart();
    loadCurrencyGrid();
});

// ============================================
// CURRENCY CONVERTER - converts between currencies
// ============================================
function initConverter() {
    // getting the input elements
    const amountInput = document.getElementById('amount');
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');
    
    // this function does the actual conversion
    function updateConversion() {
        // getting the amount user entered
        const amount = parseFloat(amountInput.value) || 0;
        const from = fromSelect.value;
        const to = toSelect.value;
        
        // exchange rates (these are static for now)
        // in a real app, you'd fetch these from an API
        const rates = {
            USD: 1.0000,
            EUR: 0.9245,
            GBP: 0.7892,
            AED: 3.6725,
            JPY: 149.32,
            CAD: 1.3542
        };
        
        // doing the math to convert currencies
        const fromRate = rates[from];
        const toRate = rates[to];
        const result = ((amount / fromRate) * toRate).toFixed(2);
        
        // showing the result
        document.getElementById('conversionFrom').textContent = `${amount} ${from}`;
        document.getElementById('conversionTo').textContent = `${result} ${to}`;
    }
    
    // updating conversion whenever user changes anything
    amountInput.addEventListener('input', updateConversion);
    fromSelect.addEventListener('change', updateConversion);
    toSelect.addEventListener('change', updateConversion);
    
    // running conversion on page load
    updateConversion();
}

// ============================================
// CURRENCY CHART - shows exchange rate over time
// ============================================
function initChart() {
    // getting the canvas element
    const ctx = document.getElementById('currencyChart').getContext('2d');
    
    // sample data for the chart (usd to aed over a week)
    const data = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'USD → AED',
            data: [3.65, 3.66, 3.67, 3.68, 3.67, 3.67, 3.67],
            borderColor: '#22c55e',          // green line
            backgroundColor: 'transparent',   // no fill
            borderWidth: 3,
            tension: 0.4,                     // makes line curvy
            pointRadius: 4,
            pointBackgroundColor: '#22c55e'
        }]
    };
    
    // creating the chart
    currencyChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }    // hiding the legend
            },
            scales: {
                y: {
                    min: 3.64,
                    max: 3.69,
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
// CURRENCY GRID - shows all currency cards
// ============================================
function loadCurrencyGrid() {
    const container = document.getElementById('currencyGrid');
    if (!container) return;
    
    // list of currencies to show
    const currencies = [
        { code: 'USD', name: 'US Dollar', flag: '🇺🇸', rate: 1.0000 },
        { code: 'EUR', name: 'Euro', flag: '🇪🇺', rate: 0.9245 },
        { code: 'GBP', name: 'British Pound', flag: '🇬🇧', rate: 0.7892 },
        { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', rate: 3.6725 },
        { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', rate: 149.32 },
        { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', rate: 1.3542 },
        { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', rate: 1.5287 },
        { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', rate: 0.8845 }
    ];
    
    // creating a card for each currency
    container.innerHTML = currencies.map(currency => {
        // generating a random change percentage (for demo purposes)
        const change = (Math.random() * 2 - 1).toFixed(2);
        const isPositive = parseFloat(change) >= 0;
        
        return `
            <div class="currency-card hover-lift">
                <!-- top row with flag and currency name -->
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 2rem;">${currency.flag}</span>
                        <div>
                            <h3 style="font-weight: 700; font-size: 1.125rem;">${currency.code}</h3>
                            <p style="font-size: 0.875rem; color: var(--muted-foreground);">${currency.name}</p>
                        </div>
                    </div>
                </div>
                
                <!-- exchange rate -->
                <div style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">${currency.rate.toFixed(4)}</div>
                
                <!-- change percentage (green if up, red if down) -->
                <div class="${isPositive ? 'positive' : 'negative'}" style="display: flex; align-items: center; font-size: 0.875rem; font-weight: 600;">
                    <i class="fas fa-chart-line" style="margin-right: 0.25rem;"></i>
                    ${isPositive ? '+' : ''}${change}%
                </div>
            </div>
        `;
    }).join('');
}
