
// static/js/newspaper.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, fetching news...');
    // Fetch news data from the API
    fetchNews();
});

async function fetchNews() {
    const newsContent = document.getElementById('news-content');
    
    if (!newsContent) {
        console.error('News content element not found!');
        return;
    }
    
    try {
        console.log('Fetching news from API...');
        const response = await fetch('/api/news');
        
        if (!response.ok) {
            throw new Error(`Failed to fetch news data: ${response.status} ${response.statusText}`);
        }
        
        const newsData = await response.json();
        console.log('News data retrieved:', newsData.length, 'articles');
        
        // Clear loading message
        newsContent.innerHTML = '';
        
        if (newsData.length === 0) {
            console.log('No news articles found in database');
            newsContent.innerHTML = `
                <div class="no-news">
                    <p>No news articles available.</p>
                    <p>Click the button below to scrape the latest fashion news:</p>
                    <button onclick="runScraper()" class="scraper-button">Scrape Latest Fashion News</button>
                </div>`;
            return;
        }
        
        // Create newspaper layout
        createNewspaperLayout(newsContent, newsData);
        
    } catch (error) {
        console.error('Error fetching news:', error);
        newsContent.innerHTML = `
            <div class="error">
                <p>Error loading news: ${error.message}</p>
                <p>Please make sure MongoDB is running and try running the scraper:</p>
                <button onclick="runScraper()" class="scraper-button">Scrape Latest Fashion News</button>
            </div>`;
    }
}

function createNewspaperLayout(container, newsData) {
    // Make a copy of the data so we can modify it
    const articles = [...newsData];
    
    if (articles.length === 0) return;
    
    // Extract the headline article (first article)
    const headlineArticle = articles.shift();
    
    // Create headline article section
    const headlineSection = document.createElement('section');
    headlineSection.className = 'headline-article';
    
    const headlineContent = document.createElement('div');
    headlineContent.className = 'headline-content';
    
    const headlineTitle = document.createElement('h2');
    headlineTitle.className = 'headline-title';
    headlineTitle.textContent = headlineArticle.title;
    
    const headlineExcerpt = document.createElement('p');
    headlineExcerpt.className = 'headline-excerpt';
    headlineExcerpt.textContent = headlineArticle.excerpt || 'Read the latest fashion trends and news.';
    
    const headlineMeta = document.createElement('div');
    headlineMeta.className = 'headline-meta';
    
    // Format the date
    let formattedDate = 'Recent';
    try {
        if (headlineArticle.date) {
            const date = new Date(headlineArticle.date);
            formattedDate = date.toLocaleDateString();
        }
    } catch (e) {
        console.error('Error formatting date:', e);
    }
    
    const headlineDate = document.createElement('span');
    headlineDate.className = 'headline-date';
    headlineDate.textContent = formattedDate;
    
    const headlineLink = document.createElement('a');
    headlineLink.className = 'headline-link';
    headlineLink.href = headlineArticle.link || '#';
    headlineLink.target = '_blank';
    headlineLink.textContent = 'Read full article';
    
    headlineMeta.appendChild(headlineDate);
    headlineMeta.appendChild(headlineLink);
    
    headlineContent.appendChild(headlineTitle);
    headlineContent.appendChild(headlineExcerpt);
    headlineContent.appendChild(headlineMeta);
    
    const headlineImageContainer = document.createElement('div');
    headlineImageContainer.className = 'headline-image-container';
    
    const headlineImage = document.createElement('img');
    headlineImage.className = 'headline-image';
    headlineImage.src = headlineArticle.image_url || 'https://assets.vogue.in/photos/5ce41ea6f55c27c59b82a9a9/16:9/w_1920,h_1080,c_limit/Vogue-Logo.jpg';
    headlineImage.alt = headlineArticle.title;
    headlineImage.onerror = function() {
        this.onerror = null;
        this.src = 'https://assets.vogue.in/photos/5ce41ea6f55c27c59b82a9a9/16:9/w_1920,h_1080,c_limit/Vogue-Logo.jpg';
    };
    
    headlineImageContainer.appendChild(headlineImage);
    
    headlineSection.appendChild(headlineContent);
    headlineSection.appendChild(headlineImageContainer);
    
    container.appendChild(headlineSection);
    
    // Secondary row with 2 articles if available
    if (articles.length >= 2) {
        const secondaryRow = document.createElement('section');
        secondaryRow.className = 'secondary-row';
        
        // Create two secondary articles
        for (let i = 0; i < 2; i++) {
            if (i < articles.length) {
                const article = articles.shift();
                const secondaryArticle = createArticleElement(article, 'secondary-article');
                secondaryRow.appendChild(secondaryArticle);
            }
        }
        
        container.appendChild(secondaryRow);
    }
    
    // Remaining articles in a grid
    if (articles.length > 0) {
        const articlesGrid = document.createElement('section');
        articlesGrid.className = 'articles-grid';
        
        // Add remaining articles to the grid
        articles.forEach(article => {
            const articleElement = createArticleElement(article);
            articlesGrid.appendChild(articleElement);
        });
        
        container.appendChild(articlesGrid);
    }
}

function createArticleElement(article, className = 'article') {
    const articleElement = document.createElement('article');
    articleElement.className = className;
    
    // Create image
    const imageElement = document.createElement('img');
    imageElement.className = 'article-image';
    imageElement.src = article.image_url || 'https://assets.vogue.in/photos/5ce41ea6f55c27c59b82a9a9/16:9/w_1920,h_1080,c_limit/Vogue-Logo.jpg';
    imageElement.alt = article.title;
    imageElement.onerror = function() {
        this.onerror = null;
        this.src = 'https://assets.vogue.in/photos/5ce41ea6f55c27c59b82a9a9/16:9/w_1920,h_1080,c_limit/Vogue-Logo.jpg';
    };
    
    // Create title
    const titleElement = document.createElement('h3');
    titleElement.className = 'article-title';
    titleElement.textContent = article.title;
    
    // Create excerpt
    const excerptElement = document.createElement('p');
    excerptElement.className = 'article-excerpt';
    excerptElement.textContent = article.excerpt || 'Read the latest fashion trends and news.';
    
    // Create meta
    const metaElement = document.createElement('div');
    metaElement.className = 'article-meta';
    
    // Format the date
    let formattedDate = 'Recent';
    try {
        if (article.date) {
            const date = new Date(article.date);
            formattedDate = date.toLocaleDateString();
        }
    } catch (e) {
        console.error('Error formatting date:', e);
    }
    
    const dateElement = document.createElement('span');
    dateElement.className = 'article-date';
    dateElement.textContent = formattedDate;
    
    const linkElement = document.createElement('a');
    linkElement.className = 'article-link';
    linkElement.href = article.link || '#';
    linkElement.target = '_blank';
    linkElement.textContent = 'Read more';
    
    metaElement.appendChild(dateElement);
    metaElement.appendChild(linkElement);
    
    // Add all elements to article
    articleElement.appendChild(imageElement);
    articleElement.appendChild(titleElement);
    articleElement.appendChild(excerptElement);
    articleElement.appendChild(metaElement);
    
    return articleElement;
}

async function runScraper() {
    const newsContent = document.getElementById('news-content');
    newsContent.innerHTML = '<div class="loading-container"><div class="loading">Scraping latest fashion news...</div></div>';
    
    try {
        console.log('Running scraper...');
        const response = await fetch('/run-scraper');
        const data = await response.json();
        
        if (data.status === 'success') {
            newsContent.innerHTML = `
                <div class="success">
                    <p>${data.message}</p>
                    <p>Refreshing content...</p>
                </div>`;
            
            // Wait a moment, then refresh the news
            setTimeout(() => {
                fetchNews();
            }, 2000);
        } else {
            newsContent.innerHTML = `
                <div class="error">
                    <p>Error running scraper: ${data.message}</p>
                    <button onclick="fetchNews()" class="refresh-button">Refresh Page</button>
                </div>`;
        }
    } catch (error) {
        console.error('Error running scraper:', error);
        newsContent.innerHTML = `
            <div class="error">
                <p>Error running scraper: ${error.message}</p>
                <button onclick="fetchNews()" class="refresh-button">Refresh Page</button>
            </div>`;
    }
}