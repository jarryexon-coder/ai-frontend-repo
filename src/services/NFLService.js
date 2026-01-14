// src/services/NFLService.js - NFL-specific API calls with real API integration
import { apiService } from './ApiService';
import axios from 'axios';

// API Configuration
const NFL_API_KEY = '2I2qnUQq7kcNAuhaCo3ElrgoVfHcdSBNoKXGTiqj';
const BALLDONTLIE_API_KEY = '110e9686-5e16-4b69-991f-2744c42a9e9d';
const THE_ODDS_API_KEY = '14befba45463dc61bb71eb3da6428e9e';
const RAPIDAPI_KEY_PLAYER_PROPS = 'a0e5e0f406mshe0e4ba9f4f4daeap19859djsnfd92d0da5884';
const RAPIDAPI_KEY_PREDICTIONS = 'cdd1cfc95bmsh3dea79dcd1be496p167ea1jsnb355ed1075ec';

// Base URLs
const NFL_API_BASE = 'https://api.sportradar.us/nfl/official/production/v7/en';
const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';
const BALLDONTLIE_API_BASE = 'https://www.balldontlie.io/api/v1';
const ODDS_API_BASE = 'https://api.the-odds-api.com/v4/sports/americanfootball_nfl';
const RAPIDAPI_BASE = 'https://api-football-v1.p.rapidapi.com/v3';

export const NFLService = {
  // ========== GAMES & SCORES ==========
  
  // Get all games (Sportradar NFL API)
  getGames(week = null, season = '2024') {
    const params = {
      api_key: NFL_API_KEY,
      format: 'json'
    };
    
    let endpoint = `${NFL_API_BASE}/games/${season}/REG/schedule.json`;
    if (week) {
      endpoint = `${NFL_API_BASE}/games/${season}/REG/${week}/schedule.json`;
    }
    
    return apiService.fetchWithCache(endpoint, {
      ttl: 60000, // 1 minute cache
      params,
      cacheKey: `nfl_games_week${week || 'all'}_season${season}`,
      headers: {
        'Accept': 'application/json'
      }
    });
  },

  // Get live games with real-time data (ESPN + Sportradar)
  getLiveGames() {
    // First try ESPN for quick live scores
    return apiService.fetchWithCache(`${ESPN_API_BASE}/scoreboard`, {
      ttl: 10000, // 10 seconds for live games
      cacheKey: 'nfl_live_games_espn',
      transform: (data) => {
        if (data && data.events) {
          const liveGames = data.events.filter(event => 
            event.status && event.status.type && 
            (event.status.type.state === 'in' || 
             event.status.type.state === 'inprogress' ||
             event.status.type.state === 'halftime')
          );
          
          // Enhance with Sportradar data if available
          return {
            source: 'ESPN',
            timestamp: new Date().toISOString(),
            count: liveGames.length,
            games: liveGames
          };
        }
        return data;
      }
    });
  },

  // Get detailed game info by ID
  getGameDetails(gameId) {
    // Try Sportradar first (most detailed)
    return apiService.fetchWithCache(`${NFL_API_BASE}/games/${gameId}/summary.json`, {
      ttl: 30000,
      params: { api_key: NFL_API_KEY, format: 'json' },
      cacheKey: `nfl_game_details_${gameId}`,
      fallback: async () => {
        // Fallback to ESPN
        const response = await axios.get(`${ESPN_API_BASE}/summary`, {
          params: { event: gameId }
        });
        return response.data;
      }
    });
  },

  // ========== STANDINGS ==========
  
  getStandings(conference = null, season = '2024') {
    // Using Sportradar for official standings
    return apiService.fetchWithCache(`${NFL_API_BASE}/seasons/${season}/REG/standings.json`, {
      ttl: 3600000, // 1 hour cache
      params: { api_key: NFL_API_KEY, format: 'json' },
      cacheKey: `nfl_standings_${season}_${conference || 'all'}`,
      transform: (data) => {
        if (!data || !data.conferences) return data;
        
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

  // ========== TEAMS ==========
  
  getTeams() {
    // Sportradar teams endpoint
    return apiService.fetchWithCache(`${NFL_API_BASE}/league/hierarchy.json`, {
      ttl: 86400000, // 24 hours
      params: { api_key: NFL_API_KEY, format: 'json' },
      cacheKey: 'nfl_teams_hierarchy',
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
        return teams;
      }
    });
  },

  getTeamDetails(teamId) {
    return apiService.fetchWithCache(`${NFL_API_BASE}/teams/${teamId}/profile.json`, {
      ttl: 86400000,
      params: { api_key: NFL_API_KEY, format: 'json' },
      cacheKey: `nfl_team_${teamId}`
    });
  },

  // ========== PLAYERS & STATS ==========
  
  getPlayers(position = null, team = null, season = '2024') {
    // Using RapidAPI for player stats
    return apiService.fetchWithCache(`${RAPIDAPI_BASE}/players`, {
      ttl: 300000, // 5 minutes
      params: {
        league: '1', // NFL ID
        season: season,
        ...(position && { position }),
        ...(team && { team: this._getTeamIdForRapidAPI(team) })
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY_PLAYER_PROPS,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      },
      cacheKey: `nfl_players_${position || 'all'}_${team || 'all'}_${season}`
    });
  },

  getPlayerStats(playerId, season = '2024') {
    return apiService.fetchWithCache(`${RAPIDAPI_BASE}/players`, {
      ttl: 300000,
      params: {
        id: playerId,
        season: season
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY_PLAYER_PROPS,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      },
      cacheKey: `nfl_player_stats_${playerId}_${season}`
    });
  },

  // ========== ODDS & BETTING ==========
  
  getOdds(region = 'us', market = 'h2h', oddsFormat = 'american') {
    // Using The Odds API
    return apiService.fetchWithCache(`${ODDS_API_BASE}/odds`, {
      ttl: 60000, // 1 minute for odds (changes rapidly)
      params: {
        apiKey: THE_ODDS_API_KEY,
        regions: region,
        markets: market,
        oddsFormat: oddsFormat
      },
      cacheKey: `nfl_odds_${region}_${market}`,
      headers: {
        'Accept': 'application/json'
      }
    });
  },

  getPlayerProps(gameId, playerName = null) {
    // RapidAPI for player props
    return apiService.fetchWithCache(`${RAPIDAPI_BASE}/odds`, {
      ttl: 60000,
      params: {
        game: gameId,
        bookmaker: '1', // Example bookmaker ID
        bet: 'player_points',
        ...(playerName && { player: playerName })
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY_PLAYER_PROPS,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      },
      cacheKey: `nfl_player_props_${gameId}_${playerName || 'all'}`
    });
  },

  // ========== PREDICTIONS ==========
  
  getPredictions(gameId = null) {
    // Using RapidAPI predictions service
    const params = gameId ? { fixture: gameId } : {};
    
    return apiService.fetchWithCache(`${RAPIDAPI_BASE}/predictions`, {
      ttl: 300000, // 5 minutes for predictions
      params,
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY_PREDICTIONS,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      },
      cacheKey: `nfl_predictions_${gameId || 'all'}`
    });
  },

  // ========== NEWS ==========
  
  getNews(limit = 20) {
    // ESPN news endpoint
    return apiService.fetchWithCache(`${ESPN_API_BASE}/news`, {
      ttl: 300000, // 5 minutes
      params: { limit },
      cacheKey: `nfl_news_${limit}`
    });
  },

  // ========== ANALYTICS ==========
  
  getAnalytics(gameId = null) {
    if (gameId) {
      // Game-specific analytics
      return apiService.fetchWithCache(`${ESPN_API_BASE}/summary`, {
        ttl: 60000,
        params: { event: gameId },
        cacheKey: `nfl_analytics_game_${gameId}`,
        transform: (data) => {
          // Extract key analytics from game summary
          return {
            gameId,
            advancedStats: data.boxscore?.teams || [],
            playerMetrics: data.players || [],
            teamMetrics: data.teamMetrics || {}
          };
        }
      });
    }
    
    // League-wide analytics
    return apiService.fetchWithCache(`${ESPN_API_BASE}/statistics`, {
      ttl: 60000,
      cacheKey: 'nfl_analytics_league'
    });
  },

  // ========== SCHEDULE ==========
  
  getSchedule(season = '2024') {
    // Sportradar schedule endpoint
    return apiService.fetchWithCache(`${NFL_API_BASE}/games/${season}/REG/schedule.json`, {
      ttl: 3600000, // 1 hour
      params: { api_key: NFL_API_KEY, format: 'json' },
      cacheKey: `nfl_schedule_${season}`,
      transform: (data) => {
        // Transform to more usable format
        if (!data || !data.weeks) return { weeks: [] };
        
        const weeks = data.weeks.map(week => ({
          weekNumber: week.sequence,
          games: week.games || [],
          startDate: week.startDate,
          endDate: week.endDate
        }));
        
        return {
          season: data.season.year,
          seasonType: data.type,
          weeks
        };
      }
    });
  },

  // ========== HELPER METHODS ==========
  
  _getTeamIdForRapidAPI(teamName) {
    // Map team names/abbreviations to RapidAPI team IDs
    const teamMap = {
      'ARI': '22', 'ATL': '1', 'BAL': '33', 'BUF': '2',
      'CAR': '29', 'CHI': '3', 'CIN': '4', 'CLE': '5',
      'DAL': '6', 'DEN': '7', 'DET': '8', 'GB': '9',
      'HOU': '34', 'IND': '11', 'JAX': '30', 'KC': '12',
      'LV': '13', 'LAC': '24', 'LAR': '14', 'MIA': '15',
      'MIN': '16', 'NE': '17', 'NO': '18', 'NYG': '19',
      'NYJ': '20', 'PHI': '21', 'PIT': '23', 'SF': '25',
      'SEA': '26', 'TB': '27', 'TEN': '10', 'WAS': '28'
    };
    
    return teamMap[teamName.toUpperCase()] || teamName;
  },

  // ========== CACHE MANAGEMENT ==========
  
  refreshGames() {
    apiService.clearCache(/^nfl_games/);
    apiService.clearCache(/^nfl_live/);
    console.log('🔄 NFL games cache cleared');
    return true;
  },

  refreshStandings() {
    apiService.clearCache(/^nfl_standings/);
    console.log('🔄 NFL standings cache cleared');
    return true;
  },

  refreshAll() {
    apiService.clearCache(/^nfl_/);
    console.log('🗑️  All NFL cache cleared');
    return true;
  },

  // ========== API HEALTH CHECK ==========
  
  async checkApiHealth() {
    const endpoints = [
      { name: 'Sportradar NFL', url: `${NFL_API_BASE}/games/2024/REG/1/schedule.json`, key: NFL_API_KEY },
      { name: 'ESPN', url: `${ESPN_API_BASE}/scoreboard` },
      { name: 'The Odds API', url: `${ODDS_API_BASE}/odds`, key: THE_ODDS_API_KEY }
    ];

    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const params = endpoint.key ? { api_key: endpoint.key, format: 'json' } : {};
        const response = await axios.get(endpoint.url, { params, timeout: 5000 });
        results.push({
          name: endpoint.name,
          status: response.status === 200 ? '✅ Healthy' : '⚠️ Issues',
          statusCode: response.status,
          latency: response.headers['x-response-time'] || 'N/A'
        });
      } catch (error) {
        results.push({
          name: endpoint.name,
          status: '❌ Unavailable',
          error: error.message
        });
      }
    }
    
    return results;
  }
};

export default NFLService;
