// ============================================
// NEWS.JS - Fetches and displays financial news
// Uses an edge function to avoid CORS issues
// ============================================

// importing the helper function to format dates
import { getTimeAgo } from './api.js';

// our supabase configuration
// our supabase URL and API key from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://artyddpgtnbkdyybponr.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFydHlkZHBndG5ia2R5eWJwb25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODQzNjIsImV4cCI6MjA3NTk2MDM2Mn0.S9L7zFmmbUzZVl8kBO9ld7x4ShJFUZvkbeg_W6VJnjM';

// ============================================
// INITIALIZATION - runs when page loads
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // only run this code if we're on the news page
    if (!window.location.pathname.includes('news.html')) return;
    
    // load all the news articles
    loadAllNews();
});

// ============================================
// FETCH NEWS - gets articles from our edge function
// ============================================
async function fetchNews(query = 'finance OR stock market', pageSize = 20) {
    const url = `${SUPABASE_URL}/functions/v1/news-proxy?q=${encodeURIComponent(query)}&pageSize=${pageSize}`;
    console.log('Fetching news from:', url);
    
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('News data received:', data);
        return data;
    } catch (error) {
        console.error('Error in fetchNews:', error);
        return null;
    }
}

// ============================================
// LOAD ALL NEWS - fetches and displays news articles
// ============================================
async function loadAllNews() {
    // getting the container where news cards will go
    const container = document.getElementById('allNews');
    if (!container) {
        console.error('Could not find news container element');
        return;
    }
    
    // showing a loading spinner while we fetch data
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading news...</div>';
    
    try {
        console.log('Starting to fetch news...');
        // fetching Bitcoin-related news
        const data = await fetchNews('bitcoin OR btc OR cryptocurrency', 30);
        
        console.log('News fetch completed, data:', data);
        
        // if we got articles, display them
        if (data && data.articles && data.articles.length > 0) {
            renderNewsCards(container, data.articles);
        } else {
            // no articles found
            const errorMsg = data && data.message ? `Error: ${data.message}` : 'No articles available';
            console.warn('No articles found:', data);
            container.innerHTML = `
                <div class="loading">
                    <p>${errorMsg}</p>
                    <p>Please try again later or check the console for more details.</p>
                </div>`;
        }
    } catch (error) {
        // something went wrong
        console.error('Error in loadAllNews:', error);
        container.innerHTML = `
            <div class="loading">
                <p>Unable to load news. Please try again later.</p>
                <p>Error: ${error.message || 'Unknown error'}</p>
            </div>`;
    }
}

// ============================================
// RENDER NEWS CARDS - creates the html for each article
// ============================================
function renderNewsCards(container, articles) {
    // if no articles, show message
    if (!articles || articles.length === 0) {
        container.innerHTML = '<div class="loading">No Bitcoin news available. Please try again later.</div>';
        return;
    }
    
    // looping through articles and creating html for each one
    container.innerHTML = articles.map(article => {
        // Format date
        const date = new Date(article.publishedAt);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        return `
        <div class="news-card hover-lift" style="
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            background: #1e1e2d;
            height: 100%;
            display: flex;
            flex-direction: column;
            border: 1px solid #2d2d3d;
        ">
            <!-- Image section -->
            <div style="
                position: relative;
                height: 200px;
                overflow: hidden;
                background: #2d2d3d;
            ">
                ${article.urlToImage 
                    ? `<img 
                        src="${article.urlToImage}" 
                        alt="${article.title}" 
                        style="
                            width: 100%; 
                            height: 100%; 
                            object-fit: cover;
                            transition: transform 0.3s ease;
                        "
                        onerror="this.style.display='none'"
                        onload="this.style.opacity='1'"
                    >` 
                    : `<div style="
                        width: 100%; 
                        height: 100%; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center;
                        background: linear-gradient(135deg, #2d2d3d 0%, #1e1e2d 100%);
                    ">
                        <i class="fas fa-bitcoin" style="font-size: 3rem; color: #F7931A; opacity: 0.7;"></i>
                    </div>`
                }
                <span class="badge" style="
                    position: absolute; 
                    top: 1rem; 
                    left: 1rem;
                    background: #f7931a;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    font-weight: 600;
                ">Bitcoin</span>
                <div style="
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 1rem;
                    background: linear-gradient(transparent, rgba(0,0,0,0.7));
                    color: white;
                ">
                    <h3 style="
                        margin: 0;
                        font-size: 1.1rem;
                        line-height: 1.4;
                        color: #ffffff;
                        text-shadow: 0 1px 3px rgba(0,0,0,0.3);
                    ">${article.title}</h3>
                </div>
            </div>
            
            <!-- Content section -->
            <div style="
                padding: 1.25rem;
                flex-grow: 1;
                display: flex;
                flex-direction: column;
            ">
                <p style="
                    margin: 0 0 1rem 0;
                    color: #cdcdde;
                    flex-grow: 1;
                    font-size: 0.9rem;
                    line-height: 1.5;
                    font-weight: 400;
                ">
                    ${article.description || 'No description available'}
                </p>
                
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: auto;
                    padding-top: 1rem;
                    border-top: 1px solid #2d2d3d;
                    font-size: 0.8rem;
                    color: #8c8ea0;
                ">
                    <span>${article.source?.name || 'Unknown Source'}</span>
                    <span>${formattedDate}</span>
                </div>
            </div>
            
            <!-- Hover effect -->
            <style>
                .news-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                .news-card img {
                    opacity: 1;
                    transition: all 0.3s ease;
                }
                .news-card:hover img {
                    transform: scale(1.02);
                }
                .news-card a:hover {
                    color: #e07c00 !important;
                }
            </style>
            
            <!-- Read More Button -->
            <div style="
                padding: 0 1.25rem 1.25rem 1.25rem;
                margin-top: auto;
            ">
                <a href="${article.url}" target="_blank" rel="noopener noreferrer" 
                   style="
                       display: inline-flex;
                       align-items: center;
                       color: #f7931a;
                    transition: color 0.2s ease;
                       text-decoration: none;
                       font-weight: 500;
                       font-size: 0.9rem;
                   ">
                    Read Full Article
                    <i class="fas fa-external-link-alt" style="margin-left: 0.5rem; font-size: 0.8rem;"></i>
                </a>
            </div>
        </div>`;
    }).join('');
}
