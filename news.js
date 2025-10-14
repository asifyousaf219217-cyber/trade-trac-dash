document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('news.html')) return;
    
    loadAllNews();
});

// Load All News
async function loadAllNews() {
    const container = document.getElementById('allNews');
    
    try {
        // Fetch all news with a broader query
        const data = await newsAPI.getEverything('finance OR stock OR market OR economy OR business', 50);
        
        if (data && data.articles && data.articles.length > 0) {
            renderNewsCards(container, data.articles);
        } else {
            container.innerHTML = '<div class="loading">No articles available</div>';
        }
    } catch (error) {
        console.error('Error loading news:', error);
        container.innerHTML = '<div class="loading">Unable to load news</div>';
    }
}

function renderNewsCards(container, articles) {
    if (!articles || articles.length === 0) {
        container.innerHTML = '<div class="loading">No articles available</div>';
        return;
    }
    
    container.innerHTML = articles.map(article => `
        <div class="news-card hover-lift">
            <div style="position: relative; height: 192px; overflow: hidden; background: var(--muted);">
                ${article.urlToImage 
                    ? `<img src="${article.urlToImage}" alt="${article.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">` 
                    : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"><i class="fas fa-newspaper" style="font-size: 4rem; color: var(--muted-foreground); opacity: 0.5;"></i></div>`
                }
                <span class="badge" style="position: absolute; top: 1rem; left: 1rem;">News</span>
            </div>
            <div class="news-content">
                <h3 class="news-title">${article.title}</h3>
                <p class="news-description">${article.description || 'No description available'}</p>
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
                <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border);">
                    <p class="news-source">${article.source.name}</p>
                </div>
            </div>
        </div>
    `).join('');
}
