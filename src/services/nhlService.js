// src/services/nhlService.js - NHL-specific API calls with real API integration
import { apiService } from './ApiService';
import axios from 'axios';

// API Configuration from your provided keys
const NHL_API_KEY = '2I2qnUQq7kcNAuhaCo3ElrgoVfHcdSBNoKXGTiqj'; // Sportradar NHL API
const THE_ODDS_API_KEY = '14befba45463dc61bb71eb3da6428e9e';
const RAPIDAPI_KEY_PLAYER_PROPS = 'a0e5e0f406mshe0e4ba9f4f4daeap19859djsnfd92d0da5884';
const RAPIDAPI_KEY_PREDICTIONS = 'cdd1cfc95bmsh3dea79dcd1be496p167ea1jsnb355ed1075ec';

// Base URLs
const SPORTRADAR_NHL_BASE = 'https://api.sportradar.us/nhl';
const ESPN_NHL_BASE = 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl';
const ODDS_API_BASE = 'https://api.the-odds-api.com/v4/sports/icehockey_nhl';
const RAPIDAPI_BASE = 'https://api-nhl-v1.p.rapidapi.com'; // NHL-specific RapidAPI

export const NHLService = {
  // ========== GAMES & SCORES ==========
  
  // Get latest NHL games and scores - Primary endpoint as requested
  getLatest(limit = 10) {
    // Use ESPN for quick latest scores
    return apiService.fetchWithCache(`${ESPN_NHL_BASE}/scoreboard`, {
      ttl: 30000, // 30 seconds for live scores
      cacheKey: `nhl_latest_${limit}`,
      transform: (data) => {
        if (!data || !data.events) return { games: [], source: 'ESPN' };
        
        const games = data.events
          .slice(0, limit)
          .map(event => ({
            id: event.id,
            name: event.name,
            shortName: event.shortName,
            status: event.status,
            date: event.date,
            competitions: event.competitions,
            links: event.links
          }));
        
        return {
          source: 'ESPN NHL',
          timestamp: new Date().toISOString(),
          count: games.length,
          games
        };
      }
    });
  },

  // Get all games with filtering
  getGames(season = '2024', gameType = 'R', date = null) {
    let endpoint = `${SPORTRADAR_NHL_BASE}/trial/v8/en/games/${season}/${gameType}/schedule.json`;
    
    const params = {
      api_key: NHL_API_KEY
    };
    
    if (date) {
      // If specific date, use daily schedule endpoint
      endpoint = `${SPORTRADAR_NHL_BASE}/trial/v8/en/games/${date}/schedule.json`;
    }
    
    return apiService.fetchWithCache(endpoint, {
      ttl: 60000, // 1 minute cache
      params,
      cacheKey: `nhl_games_${season}_${gameType}_${date || 'all'}`,
      transform: (data) => {
        if (!data || !data.games) return { games: [] };
        
        return {
          source: 'Sportradar NHL',
          season: data.season?.year || season,
          gameType: data.gameType || gameType,
          count: data.games.length,
          games: data.games.map(game => ({
            id: game.id,
            status: game.status,
            scheduled: game.scheduled,
            venue: game.venue,
            home: game.home,
            away: game.away,
            broadcast: game.broadcast,
            odds: game.odds || null
          }))
        };
      }
    });
  },

  // Get live games with real-time updates
  getLiveGames() {
    return apiService.fetchWithCache(`${ESPN_NHL_BASE}/scoreboard`, {
      ttl: 15000, // 15 seconds for live games
      cacheKey: 'nhl_live_games',
      transform: (data) => {
        if (!data || !data.events) return { games: [] };
        
        const liveGames = data.events.filter(event => 
          event.status && event.status.type && 
          (event.status.type.state === 'in' || 
           event.status.type.state === 'inprogress' ||
           event.status.type.state === 'halftime')
        );
        
        return {
          source: 'ESPN NHL Live',
          timestamp: new Date().toISOString(),
          count: liveGames.length,
          games: liveGames.map(game => ({
            id: game.id,
            name: game.name,
            status: game.status,
            clock: game.status.type.detail,
            homeTeam: game.competitions?.[0]?.competitors?.find(c => c.homeAway === 'home'),
            awayTeam: game.competitions?.[0]?.competitors?.find(c => c.homeAway === 'away'),
            period: game.status.period,
            broadcast: game.competitions?.[0]?.broadcasts?.[0]?.names?.[0]
          }))
        };
      }
    });
  },

  // Get game details by ID
  getGameDetails(gameId) {
    // Try Sportradar first
    return apiService.fetchWithCache(`${SPORTRADAR_NHL_BASE}/trial/v8/en/games/${gameId}/summary.json`, {
      ttl: 30000,
      params: { api_key: NHL_API_KEY },
      cacheKey: `nhl_game_${gameId}`,
      fallback: async () => {
        // Fallback to ESPN
        try {
          const response = await axios.get(`${ESPN_NHL_BASE}/summary`, {
            params: { event: gameId }
          });
          return {
            source: 'ESPN',
            ...response.data
          };
        } catch (error) {
          throw new Error(`Failed to fetch game details: ${error.message}`);
        }
      }
    });
  },

  // ========== STANDINGS & TEAMS ==========
  
  getStandings(season = '2024', conference = null) {
    return apiService.fetchWithCache(`${SPORTRADAR_NHL_BASE}/trial/v8/en/seasons/${season}/REG/standings.json`, {
      ttl: 3600000, // 1 hour cache
      params: { api_key: NHL_API_KEY },
      cacheKey: `nhl_standings_${season}_${conference || 'all'}`,
      transform: (data) => {
        if (!data || !data.conferences) return { conferences: [] };
        
        if (conference) {
          const conf = data.conferences.find(c => 
            c.name && c.name.toLowerCase().includes(conference.toLowerCase())
          );
          return conf || { divisions: [] };
        }
        return data;
      }
    });
  },

  getTeams() {
    return apiService.fetchWithCache(`${SPORTRADAR_NHL_BASE}/trial/v8/en/league/hierarchy.json`, {
      ttl: 86400000, // 24 hours
      params: { api_key: NHL_API_KEY },
      cacheKey: 'nhl_teams',
      transform: (data) => {
        // Flatten teams from conferences and divisions
        const teams = [];
        if (data && data.conferences) {
          data.conferences.forEach(conf => {
            conf.divisions.forEach(div => {
              teams.push(...div.teams);
            });
          });
        }
        return {
          source: 'Sportradar',
          count: teams.length,
          teams
        };
      }
    });
  },

  getTeamDetails(teamId) {
    return apiService.fetchWithCache(`${SPORTRADAR_NHL_BASE}/trial/v8/en/teams/${teamId}/profile.json`, {
      ttl: 86400000,
      params: { api_key: NHL_API_KEY },
      cacheKey: `nhl_team_${teamId}`
    });
  },

  // ========== PLAYERS & STATS ==========
  
  getPlayers(teamId = null, position = null) {
    // Using RapidAPI for NHL players
    const params = {};
    if (teamId) params.teamId = teamId;
    if (position) params.position = position;
    
    return apiService.fetchWithCache(`${RAPIDAPI_BASE}/players`, {
      ttl: 300000, // 5 minutes
      params,
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY_PLAYER_PROPS,
        'X-RapidAPI-Host': 'api-nhl-v1.p.rapidapi.com'
      },
      cacheKey: `nhl_players_${teamId || 'all'}_${position || 'all'}`,
      fallback: async () => {
        // Fallback to Sportradar if RapidAPI fails
        if (teamId) {
          const teamData = await NHLService.getTeamDetails(teamId);
          return {
            source: 'Sportradar',
            players: teamData.players || []
          };
        }
        return { players: [] };
      }
    });
  },

  getPlayerStats(playerId, season = '2024') {
    return apiService.fetchWithCache(`${RAPIDAPI_BASE}/players/statistics`, {
      ttl: 300000,
      params: {
        playerId,
        season
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY_PLAYER_PROPS,
        'X-RapidAPI-Host': 'api-nhl-v1.p.rapidapi.com'
      },
      cacheKey: `nhl_player_stats_${playerId}_${season}`
    });
  },

  // ========== ODDS & BETTING ==========
  
  getOdds(region = 'us', market = 'h2h') {
    // Using The Odds API for NHL betting
    return apiService.fetchWithCache(`${ODDS_API_BASE}/odds`, {
      ttl: 60000, // 1 minute for odds
      params: {
        apiKey: THE_ODDS_API_KEY,
        regions: region,
        markets: market,
        oddsFormat: 'american'
      },
      cacheKey: `nhl_odds_${region}_${market}`,
      headers: {
        'Accept': 'application/json'
      }
    });
  },

  getPlayerProps(gameId, playerName = null) {
    // Using RapidAPI for player props
    return apiService.fetchWithCache(`${RAPIDAPI_BASE}/odds/playerprops`, {
      ttl: 60000,
      params: {
        gameId,
        ...(playerName && { playerName })
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY_PLAYER_PROPS,
        'X-RapidAPI-Host': 'api-nhl-v1.p.rapidapi.com'
      },
      cacheKey: `nhl_player_props_${gameId}_${playerName || 'all'}`
    });
  },

  // ========== PREDICTIONS ==========
  
  getPredictions(gameId = null) {
    // Using RapidAPI for predictions
    const params = gameId ? { gameId } : {};
    
    return apiService.fetchWithCache(`${RAPIDAPI_BASE}/predictions`, {
      ttl: 300000, // 5 minutes for predictions
      params,
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY_PREDICTIONS,
        'X-RapidAPI-Host': 'api-nhl-v1.p.rapidapi.com'
      },
      cacheKey: `nhl_predictions_${gameId || 'all'}`
    });
  },

  // ========== NEWS ==========
  
  getNews(limit = 10) {
    // ESPN NHL news endpoint
    return apiService.fetchWithCache(`${ESPN_NHL_BASE}/news`, {
      ttl: 300000, // 5 minutes
      params: { limit },
      cacheKey: `nhl_news_${limit}`,
      transform: (data) => {
        if (!data || !data.articles) return { articles: [] };
        
        return {
          source: 'ESPN NHL',
          count: data.articles.length,
          articles: data.articles.map(article => ({
            id: article.id,
            headline: article.headline,
            description: article.description,
            published: article.published,
            images: article.images,
            links: article.links,
            byline: article.byline
          }))
        };
      }
    });
  },

  // ========== SCHEDULE ==========
  
  getSchedule(season = '2024', teamId = null) {
    let endpoint = `${SPORTRADAR_NHL_BASE}/trial/v8/en/games/${season}/REG/schedule.json`;
    
    if (teamId) {
      endpoint = `${SPORTRADAR_NHL_BASE}/trial/v8/en/teams/${teamId}/schedule.json`;
    }
    
    return apiService.fetchWithCache(endpoint, {
      ttl: 3600000, // 1 hour
      params: { api_key: NHL_API_KEY },
      cacheKey: `nhl_schedule_${season}_${teamId || 'all'}`
    });
  },

  // ========== STATISTICS & ANALYTICS ==========
  
  getStatistics(teamId = null, season = '2024') {
    let endpoint = `${SPORTRADAR_NHL_BASE}/trial/v8/en/seasons/${season}/REG/statistics.json`;
    
    if (teamId) {
      endpoint = `${SPORTRADAR_NHL_BASE}/trial/v8/en/seasons/${season}/REG/teams/${teamId}/statistics.json`;
    }
    
    return apiService.fetchWithCache(endpoint, {
      ttl: 3600000,
      params: { api_key: NHL_API_KEY },
      cacheKey: `nhl_stats_${season}_${teamId || 'league'}`
    });
  },

  // ========== HELPER METHODS ==========
  
  getTeamRoster(teamId) {
    return apiService.fetchWithCache(`${RAPIDAPI_BASE}/teams/roster`, {
      ttl: 3600000,
      params: { teamId },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY_PLAYER_PROPS,
        'X-RapidAPI-Host': 'api-nhl-v1.p.rapidapi.com'
      },
      cacheKey: `nhl_roster_${teamId}`
    });
  },

  getPlayerProfile(playerId) {
    return apiService.fetchWithCache(`${RAPIDAPI_BASE}/players/${playerId}`, {
      ttl: 86400000,
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY_PLAYER_PROPS,
        'X-RapidAPI-Host': 'api-nhl-v1.p.rapidapi.com'
      },
      cacheKey: `nhl_player_${playerId}`
    });
  },

  // ========== CACHE MANAGEMENT ==========
  
  refreshGames() {
    apiService.clearCache(/^nhl_games/);
    apiService.clearCache(/^nhl_live/);
    apiService.clearCache(/^nhl_latest/);
    console.log('🔄 NHL games cache cleared');
    return true;
  },

  refreshAll() {
    apiService.clearCache(/^nhl_/);
    console.log('🗑️ All NHL cache cleared');
    return true;
  },

  // ========== API HEALTH CHECK ==========
  
  testAPIs() {
    const endpoints = [
      {
        name: 'Sportradar NHL',
        test: () => axios.get(`${SPORTRADAR_NHL_BASE}/trial/v8/en/games/2024/REG/schedule.json`, {
          params: { api_key: NHL_API_KEY }
        })
      },
      {
        name: 'ESPN NHL',
        test: () => axios.get(`${ESPN_NHL_BASE}/scoreboard`)
      },
      {
        name: 'The Odds API NHL',
        test: () => axios.get(`${ODDS_API_BASE}/odds`, {
          params: { apiKey: THE_ODDS_API_KEY, regions: 'us' }
        })
      }
    ];

    const results = [];
    
    const promises = endpoints.map(endpoint => 
      endpoint.test()
        .then(response => ({
          name: endpoint.name,
          status: '✅ Healthy',
          statusCode: response.status,
          latency: `${response.headers['x-response-time'] || 'N/A'}`
        }))
        .catch(error => ({
          name: endpoint.name,
          status: error.response?.status === 401 ? '🔑 Auth Error' : '❌ Unavailable',
          error: error.message
        }))
    );

    return Promise.all(promises).then(healthResults => {
      console.log('🔧 NHL API Health Check:', healthResults);
      return healthResults;
    });
  }
};

export default NHLService;
