// ============================================
// NEWS.JS - Fetches and displays financial news
// Uses an edge function to avoid CORS issues
// ============================================

// importing the helper function to format dates
import { getTimeAgo } from './api.js';

// our supabase url - needed to call the edge function
const SUPABASE_URL = 'https://artyddpgtnbkdyybponr.supabase.co';

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
    try {
        // calling our supabase edge function
        // we use an edge function because newsapi doesn't allow browser requests
        const response = await fetch(
            `${SUPABASE_URL}/functions/v1/news-proxy?q=${encodeURIComponent(query)}&pageSize=${pageSize}`
        );
        
        // if something went wrong, throw an error
        if (!response.ok) throw new Error('Failed to fetch news');
        
        // returning the json data
        return await response.json();
    } catch (error) {
        // logging error and returning null
        console.error('Error fetching news:', error);
        return null;
    }
}

// ============================================
// LOAD ALL NEWS - fetches and displays news articles
// ============================================
async function loadAllNews() {
    // getting the container where news cards will go
    const container = document.getElementById('allNews');
    if (!container) return;
    
    // showing a loading spinner while we fetch data
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading news...</div>';
    
    try {
        // fetching news about finance, stocks, market, economy, business
        const data = await fetchNews('finance OR stock OR market OR economy OR business', 30);
        
        // if we got articles, display them
        if (data && data.articles && data.articles.length > 0) {
            renderNewsCards(container, data.articles);
        } else {
            // no articles found
            container.innerHTML = '<div class="loading">No articles available. Please try again later.</div>';
        }
    } catch (error) {
        // something went wrong
        console.error('Error loading news:', error);
        container.innerHTML = '<div class="loading">Unable to load news. Please try again later.</div>';
    }
}

// ============================================
// RENDER NEWS CARDS - creates the html for each article
// ============================================
function renderNewsCards(container, articles) {
    // if no articles, show message
    if (!articles || articles.length === 0) {
        container.innerHTML = '<div class="loading">No articles available</div>';
        return;
    }
    
    // looping through articles and creating html for each one
    container.innerHTML = articles.map(article => `
        <div class="news-card hover-lift">
            <!-- image section at the top of card -->
            <div style="position: relative; height: 192px; overflow: hidden; background: var(--muted);">
                ${article.urlToImage 
                    ? `<img src="${article.urlToImage}" alt="${article.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">` 
                    : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"><i class="fas fa-newspaper" style="font-size: 4rem; color: var(--muted-foreground); opacity: 0.5;"></i></div>`
                }
                <span class="badge" style="position: absolute; top: 1rem; left: 1rem;">News</span>
            </div>
            
            <!-- content section below image -->
            <div class="news-content">
                <h3 class="news-title">${article.title}</h3>
                <p class="news-description">${article.description || 'No description available'}</p>
                
                <!-- footer with time and read more button -->
                <div class="news-footer">
                    <div class="news-time">
                        <i class="fas fa-clock"></i>
                        ${getTimeAgo(article.publishedAt)}
                    </div>
                    <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                        Read More
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
                
                <!-- source name at the bottom -->
                <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border);">
                    <p class="news-source">${article.source.name}</p>
                </div>
            </div>
        </div>
    `).join('');
}
