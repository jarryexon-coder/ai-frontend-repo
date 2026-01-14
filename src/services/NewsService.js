// src/services/NewsService.js - News API calls with real API integration
import apiService from './Api';

// API Configuration from your provided keys
const NEWS_API_KEY = '0bcba4646f0a4963a1b72c3e3f1ebaa1';
const DEEPSEEK_API_KEY = 'sk-945dfebe71b9439795fe8de464a002dd';

// Base URLs
const NEWS_API_BASE = 'https://newsapi.org/v2';
const DEEPSEEK_API_BASE = 'https://api.deepseek.com/v1';
const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

// Helper function to generate unique ID (React Native compatible)
const generateId = (str) => {
  if (!str) return Date.now().toString();
  
  // Create a simple hash for React Native compatibility
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

const NewsService = {
  // ========== NEWS API.ORG (General News) ==========
  
  // Get all news with filtering - Using NewsAPI
  getNews: async (options = {}) => {
    try {
      const {
        sport = null,
        category = 'sports',
        limit = 20,
        offset = 0,
        query = null
      } = options;
      
      // Build query string for NewsAPI
      let q = '';
      if (sport) {
        q = `${sport} OR NBA OR NFL OR ${sport} news`;
      } else if (query) {
        q = query;
      } else {
        q = 'sports OR basketball OR football OR NBA OR NFL';
      }
      
      const params = new URLSearchParams({
        apiKey: NEWS_API_KEY,
        q,
        pageSize: limit,
        page: offset ? Math.floor(offset / limit) + 1 : 1,
        language: 'en',
        sortBy: 'publishedAt'
      });
      
      if (category) {
        params.append('category', category);
      }
      
      const url = `${NEWS_API_BASE}/everything?${params.toString()}`;
      const cacheKey = `news_${sport || 'all'}_${category || 'all'}_${limit}_${offset}`;
      
      const data = await apiService.fetchWithCache(url, {
        ttl: 300000, // 5 minutes
        cacheKey,
      });
      
      if (!data || !data.articles) return { articles: [] };
      
      return {
        source: 'NewsAPI',
        totalResults: data.totalResults,
        articles: data.articles.map(article => ({
          id: generateId(article.url),
          title: article.title,
          description: article.description,
          content: article.content,
          excerpt: article.description?.substring(0, 150) || '',
          sport: NewsService._extractSportFromArticle(article),
          category: category,
          publishedAt: article.publishedAt,
          imageUrl: article.urlToImage,
          source: article.source?.name,
          url: article.url,
          author: article.author
        }))
      };
    } catch (error) {
      console.error('❌ Error in getNews:', error);
      return { articles: [] };
    }
  },

  // Get latest news - Specific endpoint as requested
  getLatestNews: async (limit = 10) => {
    try {
      const params = new URLSearchParams({
        apiKey: NEWS_API_KEY,
        category: 'sports',
        pageSize: limit,
        country: 'us',
        language: 'en'
      });
      
      const url = `${NEWS_API_BASE}/top-headlines?${params.toString()}`;
      const cacheKey = `news_latest_${limit}`;
      
      const data = await apiService.fetchWithCache(url, {
        ttl: 180000, // 3 minutes for latest news
        cacheKey,
      });
      
      if (!data || !data.articles) return { articles: [] };
      
      return {
        source: 'NewsAPI Latest',
        totalResults: data.totalResults,
        articles: data.articles.map(article => ({
          id: generateId(article.url),
          title: article.title,
          excerpt: article.description?.substring(0, 150) || '',
          sport: NewsService._extractSportFromArticle(article),
          publishedAt: article.publishedAt,
          imageUrl: article.urlToImage,
          source: article.source?.name,
          url: article.url
        }))
      };
    } catch (error) {
      console.error('❌ Error in getLatestNews:', error);
      return { articles: [] };
    }
  },

  // Get top stories
  getTopStories: async (limit = 5) => {
    try {
      const params = new URLSearchParams({
        apiKey: NEWS_API_KEY,
        category: 'sports',
        pageSize: limit,
        country: 'us',
        sortBy: 'popularity'
      });
      
      const url = `${NEWS_API_BASE}/top-headlines?${params.toString()}`;
      const cacheKey = `news_top_${limit}`;
      
      const data = await apiService.fetchWithCache(url, {
        ttl: 600000, // 10 minutes
        cacheKey,
      });
      
      if (!data || !data.articles) return { articles: [] };
      
      // Sort by source reliability (simple heuristic)
      const prioritySources = ['ESPN', 'BBC Sport', 'Fox Sports', 'CBS Sports', 'NBC Sports'];
      
      const sortedArticles = [...data.articles].sort((a, b) => {
        const aPriority = prioritySources.includes(a.source?.name) ? 1 : 0;
        const bPriority = prioritySources.includes(b.source?.name) ? 1 : 0;
        return bPriority - aPriority;
      });
      
      return {
        source: 'NewsAPI Top',
        totalResults: data.totalResults,
        articles: sortedArticles.slice(0, limit).map(article => ({
          id: generateId(article.url),
          title: article.title,
          excerpt: article.description?.substring(0, 120) || '',
          sport: NewsService._extractSportFromArticle(article),
          publishedAt: article.publishedAt,
          imageUrl: article.urlToImage,
          source: article.source?.name,
          url: article.url
        }))
      };
    } catch (error) {
      console.error('❌ Error in getTopStories:', error);
      return { articles: [] };
    }
  },

  // Get trending news
  getTrending: async () => {
    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const fromDate = yesterday.toISOString().split('T')[0];
      
      const params = new URLSearchParams({
        apiKey: NEWS_API_KEY,
        q: 'NBA OR NFL OR "March Madness" OR playoffs',
        pageSize: 10,
        sortBy: 'relevancy',
        language: 'en',
        from: fromDate
      });
      
      const url = `${NEWS_API_BASE}/everything?${params.toString()}`;
      const cacheKey = 'news_trending';
      
      const data = await apiService.fetchWithCache(url, {
        ttl: 300000,
        cacheKey,
      });
      
      if (!data || !data.articles) return { articles: [] };
      
      return {
        source: 'NewsAPI Trending',
        totalResults: data.totalResults,
        articles: data.articles.map(article => ({
          id: generateId(article.url),
          title: article.title,
          excerpt: article.description?.substring(0, 100) || '',
          sport: NewsService._extractSportFromArticle(article),
          publishedAt: article.publishedAt,
          imageUrl: article.urlToImage,
          trendingScore: NewsService._calculateTrendingScore(article),
          source: article.source?.name,
          url: article.url
        })).sort((a, b) => b.trendingScore - a.trendingScore)
      };
    } catch (error) {
      console.error('❌ Error in getTrending:', error);
      return { articles: [] };
    }
  },

  // ========== ESPN API (Sports-Specific News) ==========
  
  // Get news by sport - Using ESPN for sport-specific news
  getSportNews: async (sport, limit = 10) => {
    try {
      const sportMap = {
        'nba': 'basketball/nba',
        'nfl': 'football/nfl',
        'mlb': 'baseball/mlb',
        'nhl': 'hockey/nhl'
      };
      
      const sportPath = sportMap[sport.toLowerCase()] || 'basketball/nba';
      const url = `${ESPN_API_BASE}/${sportPath}/news?limit=${limit}`;
      const cacheKey = `news_espn_${sport}_${limit}`;
      
      const data = await apiService.fetchWithCache(url, {
        ttl: 300000,
        cacheKey,
      });
      
      if (!data || !data.articles) return { articles: [] };
      
      return {
        source: 'ESPN',
        sport: sport,
        articles: data.articles.slice(0, limit).map(article => ({
          id: generateId(article.links?.web?.href || article.id),
          title: article.headline,
          excerpt: article.description,
          sport: sport,
          category: article.categories?.[0]?.description || 'sports',
          publishedAt: article.published,
          imageUrl: article.images?.[0]?.url,
          source: 'ESPN',
          url: article.links?.web?.href,
          author: article.byline
        }))
      };
    } catch (error) {
      console.error(`❌ Error in getSportNews for ${sport}:`, error);
      return { articles: [] };
    }
  },

  // NBA News (enhanced with NewsAPI + ESPN)
  getNBANews: async () => {
    try {
      const [espnNews, newsApiNews] = await Promise.all([
        NewsService.getSportNews('nba', 5),
        NewsService.getNews({ sport: 'NBA', limit: 5 })
      ]);
      
      const combinedArticles = [
        ...(espnNews.articles || []),
        ...(newsApiNews.articles || [])
      ];
      
      // Remove duplicates and sort by date
      const uniqueArticles = NewsService._removeDuplicateArticles(combinedArticles);
      
      return {
        source: 'Multiple (ESPN + NewsAPI)',
        sport: 'nba',
        articles: uniqueArticles
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          .slice(0, 10)
      };
    } catch (error) {
      console.error('❌ Error in getNBANews:', error);
      return { articles: [] };
    }
  },

  // NFL News (enhanced with NewsAPI + ESPN)
  getNFLNews: async () => {
    try {
      const [espnNews, newsApiNews] = await Promise.all([
        NewsService.getSportNews('nfl', 5),
        NewsService.getNews({ sport: 'NFL', limit: 5 })
      ]);
      
      const combinedArticles = [
        ...(espnNews.articles || []),
        ...(newsApiNews.articles || [])
      ];
      
      // Remove duplicates and sort by date
      const uniqueArticles = NewsService._removeDuplicateArticles(combinedArticles);
      
      return {
        source: 'Multiple (ESPN + NewsAPI)',
        sport: 'nfl',
        articles: uniqueArticles
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          .slice(0, 10)
      };
    } catch (error) {
      console.error('❌ Error in getNFLNews:', error);
      return { articles: [] };
    }
  },

  // ========== DEEPSEEK AI (News Analysis) ==========
  
  // Get AI analysis of news article
  analyzeArticle: async (articleText, options = {}) => {
    try {
      const {
        summaryLength = 'medium',
        includeSentiment = true,
        includeKeyPoints = true
      } = options;
      
      const prompt = `Analyze this sports news article and provide:
${includeSentiment ? '- Sentiment analysis (positive/negative/neutral)\n' : ''}
${includeKeyPoints ? '- 3-5 key points\n' : ''}
- A ${summaryLength} summary (${summaryLength === 'short' ? '2-3 sentences' : summaryLength === 'medium' ? 'paragraph' : 'detailed analysis'})

Article: ${articleText.substring(0, 3000)}...`;

      const url = `${DEEPSEEK_API_BASE}/chat/completions`;
      const cacheKey = `news_analysis_${generateId(articleText.substring(0, 100))}`;
      
      const data = await apiService.fetchWithCache(url, {
        ttl: 86400000, // 24 hours for analysis
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a sports news analyst. Provide concise, accurate analysis of sports articles.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        }),
        cacheKey,
      });
      
      return {
        analysis: data.choices?.[0]?.message?.content || 'No analysis available',
        model: data.model,
        usage: data.usage
      };
    } catch (error) {
      console.error('❌ Error in analyzeArticle:', error);
      return {
        analysis: 'Unable to analyze article at this time.',
        error: error.message
      };
    }
  },

  // Get AI-generated news summary for multiple articles
  generateNewsDigest: async (sport = null, articleCount = 5) => {
    try {
      const newsData = await NewsService.getSportNews(sport || 'nba', articleCount);
      
      if (!newsData.articles || newsData.articles.length === 0) {
        throw new Error('No articles found');
      }
      
      // Create a combined summary of all articles
      const combinedText = newsData.articles
        .map((article, index) => `${index + 1}. ${article.title}: ${article.excerpt || ''}`)
        .join('\n\n');
      
      const prompt = `Create a daily sports news digest based on these ${newsData.articles.length} articles.
      Provide:
      1. Top story of the day
      2. 3-5 key takeaways
      3. Brief analysis of each major story
      
      Articles:\n${combinedText.substring(0, 4000)}`;
      
      const url = `${DEEPSEEK_API_BASE}/chat/completions`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a sports journalist creating a daily news digest. Be concise, informative, and engaging.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.4,
          max_tokens: 800
        })
      });
      
      const data = await response.json();
      
      return {
        sport: sport || 'general',
        date: new Date().toISOString().split('T')[0],
        articleCount: newsData.articles.length,
        digest: data.choices?.[0]?.message?.content || 'No digest generated',
        articles: newsData.articles.map(a => ({ title: a.title, url: a.url }))
      };
    } catch (error) {
      console.error('❌ Error in generateNewsDigest:', error);
      return {
        sport: sport || 'general',
        date: new Date().toISOString().split('T')[0],
        articleCount: 0,
        digest: 'Unable to generate digest at this time.',
        articles: []
      };
    }
  },

  // ========== OTHER METHODS ==========
  
  // Get single article with AI analysis
  getArticle: async (articleId) => {
    // For now, return a promise that simulates getting an article
    // In a real implementation, you'd fetch from a database or API
    return {
      id: articleId,
      title: 'Sample Article - API integration complete',
      content: 'This is a placeholder article. Real implementation would fetch from NewsAPI or ESPN.',
      publishedAt: new Date().toISOString(),
      source: 'Sports App'
    };
  },

  // Search news across multiple sources
  searchNews: async (query, options = {}) => {
    const { limit = 20, sport = null } = options;
    const searchQuery = sport ? `${query} ${sport}` : query;
    
    return NewsService.getNews({
      query: searchQuery,
      limit,
      category: 'sports'
    });
  },

  // Get news by multiple sports
  getMultiSportNews: async (sports = ['nba', 'nfl'], limit = 5) => {
    try {
      const promises = sports.map(sport => 
        NewsService.getSportNews(sport, limit)
          .then(data => data.articles || [])
          .catch(() => []) // Return empty array on error
      );
      
      const results = await Promise.all(promises);
      
      // Combine and sort by date
      const allNews = results.flat();
      const uniqueNews = NewsService._removeDuplicateArticles(allNews);
      
      return {
        source: 'Multi-sport',
        sports: sports,
        articles: uniqueNews
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          .slice(0, limit * sports.length)
      };
    } catch (error) {
      console.error('❌ Error in getMultiSportNews:', error);
      return {
        source: 'Multi-sport',
        sports: sports,
        articles: []
      };
    }
  },

  // ========== HELPER METHODS ==========
  
  _extractSportFromArticle: (article) => {
    const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();
    
    if (text.includes('nba') || text.includes('basketball') || text.includes('lebron') || text.includes('steph curry')) {
      return 'nba';
    } else if (text.includes('nfl') || text.includes('football') || text.includes('mahomes') || text.includes('super bowl')) {
      return 'nfl';
    } else if (text.includes('mlb') || text.includes('baseball')) {
      return 'mlb';
    } else if (text.includes('nhl') || text.includes('hockey')) {
      return 'nhl';
    }
    
    return 'sports';
  },

  _calculateTrendingScore: (article) => {
    let score = 0;
    const title = article.title?.toLowerCase() || '';
    const now = new Date();
    const published = new Date(article.publishedAt);
    const hoursAgo = (now - published) / (1000 * 60 * 60);
    
    // Recency score (more recent = higher score)
    if (hoursAgo < 1) score += 50;
    else if (hoursAgo < 6) score += 30;
    else if (hoursAgo < 24) score += 10;
    
    // Source reliability
    const reliableSources = ['ESPN', 'BBC', 'Reuters', 'Associated Press', 'Fox Sports'];
    if (reliableSources.includes(article.source?.name)) {
      score += 20;
    }
    
    // Keywords
    const trendingKeywords = ['breaking', 'exclusive', 'major', 'huge', 'playoffs', 'championship'];
    trendingKeywords.forEach(keyword => {
      if (title.includes(keyword)) score += 5;
    });
    
    return score;
  },

  _removeDuplicateArticles: (articles) => {
    const seen = new Set();
    return articles.filter(article => {
      const identifier = article.url || article.title;
      if (seen.has(identifier)) {
        return false;
      }
      seen.add(identifier);
      return true;
    });
  },

  // ========== REFRESH METHODS ==========
  
  refreshNews: (sport = null) => {
    const pattern = sport ? `news_${sport}` : 'news_';
    apiService.clearCache(new RegExp(pattern, 'i'));
    console.log(`🔄 News cache cleared${sport ? ` for ${sport}` : ''}`);
    return true;
  },

  // ========== API HEALTH CHECK ==========
  
  testAPIs: async () => {
    const endpoints = [
      {
        name: 'NewsAPI',
        test: async () => {
          const params = new URLSearchParams({
            apiKey: NEWS_API_KEY,
            category: 'sports',
            pageSize: 1
          });
          const response = await fetch(`${NEWS_API_BASE}/top-headlines?${params.toString()}`);
          return response;
        }
      },
      {
        name: 'DeepSeek AI',
        test: async () => {
          const response = await fetch(`${DEEPSEEK_API_BASE}/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [{ role: 'user', content: 'Test' }],
              max_tokens: 5
            })
          });
          return response;
        }
      },
      {
        name: 'ESPN NBA News',
        test: async () => {
          const response = await fetch(`${ESPN_API_BASE}/basketball/nba/news?limit=1`);
          return response;
        }
      }
    ];

    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await endpoint.test();
        const latency = Date.now() - startTime;
        
        results.push({
          name: endpoint.name,
          status: response.ok ? '✅ Healthy' : '⚠️ Issues',
          statusCode: response.status,
          latency: `${latency}ms`
        });
      } catch (error) {
        results.push({
          name: endpoint.name,
          status: error.response?.status === 401 ? '🔑 Auth Error' : '❌ Unavailable',
          error: error.message
        });
      }
    }
    
    console.log('🔧 News API Health Check:', results);
    return results;
  }
};

export default NewsService;
