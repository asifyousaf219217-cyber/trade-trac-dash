// importing API functions from my api.js file
import { finnhubAPI, formatNumber } from './api.js';
// importing supabase for auth stuff
import { supabase } from './src/integrations/supabase/client.ts';

/* 
   THEME MANAGEMENT
   This handles switching between light and dark mode
*/

// function to set up the theme when page loads
function initTheme() {
    // check if user has a saved theme preference, default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // applying the saved theme to body element
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
    
    // getting the theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        updateThemeIcon(savedTheme);
        // adding click listener to toggle theme
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// function to switch between light and dark mode
function toggleTheme() {
    const isDark = document.body.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    
    // applying new theme to body
    if (newTheme === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
    
    // saving preference so it persists on reload
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

// function to update the icon in the theme button
function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            // moon icon for light mode, sun icon for dark mode
            icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
}

/* 
   TICKER ANIMATION
   The moving bar at top showing stock prices
*/

// function to load real stock data into the ticker
async function initTicker() {
    const tickerContent = document.getElementById('tickerContent');
    if (!tickerContent) return;

    // list of stock symbols to show in ticker
    const symbols = ['AAPL', 'TSLA', 'GOOGL', 'AMZN', 'MSFT', 'META'];
    
    // showing loading message while fetching data
    tickerContent.innerHTML = '<div class="ticker-item">Loading market data...</div>';
    
    try {
        // fetching quote data for all symbols at once
        const promises = symbols.map(symbol => finnhubAPI.getQuote(symbol));
        const quotes = await Promise.all(promises);
        
        // converting quotes to ticker format
        const tickerData = quotes.map((quote, index) => {
            if (quote && quote.c && quote.dp !== undefined) {
                return {
                    symbol: symbols[index],
                    change: quote.dp,
                    positive: quote.dp >= 0
                };
            }
            return null;
        }).filter(item => item !== null);

        if (tickerData.length === 0) {
            tickerContent.innerHTML = '<div class="ticker-item">Market data unavailable</div>';
            return;
        }

        // duplicating data for seamless infinite scroll
        const duplicatedData = [...tickerData, ...tickerData];
        
        // building HTML for ticker items
        tickerContent.innerHTML = duplicatedData.map(stock => `
            <div class="ticker-item">
                <span class="ticker-symbol">${stock.symbol}</span>
                <span class="ticker-change ${stock.positive ? 'positive' : 'negative'}">
                    ${stock.positive ? '+' : ''}${stock.change.toFixed(2)}%
                </span>
            </div>
        `).join('');
    } catch (error) {
        // if API fails, show static fallback
        console.error('Error loading ticker:', error);
        tickerContent.innerHTML = '<div class="ticker-item">Market data unavailable</div>';
    }
}

/* 
   STOCK CARDS
   Loading the top 3 stocks on homepage
*/

// function to load and display top stocks
async function loadTopStocks() {
    const container = document.getElementById('topStocks');
    if (!container) return;

    // picking 3 popular stocks to display
    const symbols = ['AAPL', 'TSLA', 'AMZN'];
    
    // showing loading skeleton
    container.innerHTML = '<div class="loading">Loading stocks...</div>';
    
    try {
        // fetching quote data for these stocks
        const promises = symbols.map(symbol => finnhubAPI.getQuote(symbol));
        const quotes = await Promise.all(promises);
        
        // clearing container
        container.innerHTML = '';
        
        // creating a card for each stock
        quotes.forEach((quote, index) => {
            if (quote && quote.c) {
                const card = createStockCard(symbols[index], quote);
                container.appendChild(card);
            }
        });
    } catch (error) {
        // handling errors gracefully
        console.error('Error loading stocks:', error);
        container.innerHTML = '<div class="loading">Unable to load stocks</div>';
    }
}

// function to create a single stock card element
function createStockCard(symbol, quote) {
    const card = document.createElement('div');
    card.className = 'stock-card hover-lift';
    
    // checking if stock is up or down
    const isPositive = quote.dp >= 0;
    const icon = isPositive ? 'fa-chart-line' : 'fa-chart-line';
    
    // building the card HTML
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
    
    // adding 3D tilt effect on mouse move - this is super unique!
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // mouse x position within card
        const y = e.clientY - rect.top;  // mouse y position within card
        
        // calculating rotation based on mouse position
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10; // tilt up/down
        const rotateY = (centerX - x) / 10; // tilt left/right
        
        // applying 3D transform
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    
    // reset when mouse leaves
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
    
    return card;
}

/* 
   MOBILE MENU
   Hamburger menu for phones
*/

// function to set up mobile menu toggle
function initMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        // toggle menu when hamburger is clicked
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                // switching between hamburger and X icon
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
        
        // close menu when a link is clicked
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            });
        });
    }
}

/* 
   AUTHENTICATION
   Handling login/logout buttons and profile dropdown
*/

// function to initialize auth state checking
function initAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const profileTrigger = document.getElementById('profileTrigger');
    const profileMenu = document.getElementById('profileMenu');

    // listening for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
        updateAuthUI(session);
        if (session) {
            // Defer profile fetch to avoid deadlock
            setTimeout(() => {
                loadUserProfile(session.user);
            }, 0);
        }
    });

    // checking if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
        updateAuthUI(session);
        if (session) {
            loadUserProfile(session.user);
        }
    });

    // Profile dropdown toggle
    if (profileTrigger && profileMenu) {
        profileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            profileMenu.classList.toggle('active');
            profileTrigger.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileTrigger.contains(e.target) && !profileMenu.contains(e.target)) {
                profileMenu.classList.remove('active');
                profileTrigger.classList.remove('active');
            }
        });
    }

    // logout button handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await supabase.auth.signOut();
                // redirecting to home page after logout
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }
}

// Load user profile data
async function loadUserProfile(user) {
    if (!user) return;

    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', user.id)
            .maybeSingle();

        const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
        const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

        // Update nav dropdown
        const menuName = document.getElementById('menuName');
        const menuEmail = document.getElementById('menuEmail');
        const navAvatar = document.getElementById('navAvatar');
        const menuAvatar = document.getElementById('menuAvatar');

        if (menuName) menuName.textContent = displayName;
        if (menuEmail) menuEmail.textContent = user?.email || '';

        // Update avatars
        [navAvatar, menuAvatar].forEach(el => {
            if (!el) return;
            if (avatarUrl) {
                el.innerHTML = `<img src="${avatarUrl}" alt="${displayName}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>'">`;
            } else {
                const initial = displayName.charAt(0).toUpperCase();
                el.innerHTML = `<span class="avatar-initial">${initial}</span>`;
            }
        });
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// function to show/hide login and profile dropdown
function updateAuthUI(session) {
    const loginBtn = document.getElementById('loginBtn');
    const profileDropdown = document.getElementById('profileDropdown');

    if (session) {
        // user is logged in - show profile dropdown
        if (loginBtn) loginBtn.style.display = 'none';
        if (profileDropdown) profileDropdown.style.display = 'block';
    } else {
        // user is not logged in - show login button
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (profileDropdown) profileDropdown.style.display = 'none';
    }
}

/* 
   3D TILT EFFECT FOR FEATURE BOXES
   Making feature cards tilt based on mouse position - super unique!
*/

// function to add 3D tilt to all feature boxes
function init3DTilt() {
    const featureBoxes = document.querySelectorAll('.feature-box');
    
    featureBoxes.forEach(box => {
        // adding mouse move listener to each feature box
        box.addEventListener('mousemove', (e) => {
            const rect = box.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // calculating center point
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // calculating rotation angles based on mouse position
            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;
            
            // applying 3D transform with perspective
            box.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });
        
        // resetting transform when mouse leaves
        box.addEventListener('mouseleave', () => {
            box.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

/* 
   INITIALIZATION
   Starting everything when page loads
*/

// running all initialization functions when page is ready
document.addEventListener('DOMContentLoaded', () => {
    initTheme();        // setting up theme
    initMobileMenu();   // setting up mobile menu
    initTicker();       // loading ticker data
    initAuth();         // checking auth status
    init3DTilt();       // adding 3D tilt to feature boxes
    
    // loading stock cards only on home page
    if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
        loadTopStocks();
    }
});
