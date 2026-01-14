// src/screens/NFLScreen-enhanced.js - COMPLETELY FIXED VERSION WITH ENHANCED SEARCH
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Platform,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchBar from '../components/SearchBar';
import { useSearch } from '../providers/SearchProvider';
import { useSportsData } from '../hooks/useSportsData';

// NEW: Import navigation helper
import { useAppNavigation } from '../navigation/NavigationHelper';

const { width } = Dimensions.get('window');

// UPDATED: Simplified analytics function that works everywhere (same as AnalyticsScreen)
const logAnalyticsEvent = async (eventName, eventParams = {}) => {
  try {
    // Always create the event data
    const eventData = {
      event: eventName,
      params: eventParams,
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
    };

    // Only log to console in development mode
    if (__DEV__) {
      // }

    // Only use Firebase analytics on web in production mode
    if (Platform.OS === 'web' && !__DEV__ && typeof window !== 'undefined') {
      try {
        // Dynamically import Firebase only on web in production
        const firebaseApp = await import('firebase/app');
        const firebaseAnalytics = await import('firebase/analytics');
        
        // Get or initialize Firebase app
        let app;
        if (firebaseApp.getApps().length === 0) {
          const firebaseConfig = {
            apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyCi7YQ-vawFT3sIr1i8yuhhx-1vSplAneA",
            authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "nba-fantasy-ai.firebaseapp.com",
            projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "nba-fantasy-ai",
            storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "nba-fantasy-ai.appspot.com",
            messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "718718403866",
            appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:718718403866:web:e26e10994d62799a048379",
            measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-BLTPX9LJ7K"
          };
          
          app = firebaseApp.initializeApp(firebaseConfig);
        } else {
          app = firebaseApp.getApp();
        }
        
        // Get analytics and log event
        const analytics = firebaseAnalytics.getAnalytics(app);
        if (analytics) {
          await firebaseAnalytics.logEvent(analytics, eventName, eventParams);
        }
      } catch (firebaseError) {
        // Silently fail for Firebase errors in production
        // }
    }
    
    // Always log to AsyncStorage for debugging (both dev and prod)
    try {
      const existingEvents = JSON.parse(await AsyncStorage.getItem('analytics_events') || '[]');
      existingEvents.push(eventData);
      if (existingEvents.length > 100) {
        existingEvents.splice(0, existingEvents.length - 100);
      }
      await AsyncStorage.setItem('analytics_events', JSON.stringify(existingEvents));
    } catch (storageError) {
      // Non-critical error, just log it
      // }
  } catch (error) {
    // Non-critical analytics failure
    // }
};

// Custom Progress Bar component to replace react-native-progress
const CustomProgressBar = ({ 
  progress, 
  width: barWidth = 200, 
  height = 10, 
  color = '#f59e0b',
  unfilledColor = '#e5e7eb',
  borderRadius = 5
}) => {
  return (
    <View style={[styles.customProgressBar, { 
      width: barWidth, 
      height, 
      backgroundColor: unfilledColor,
      borderRadius 
    }]}>
      <View 
        style={[styles.customProgressBarFill, { 
          width: `${progress * 100}%`, 
          height: '100%', 
          backgroundColor: color,
          borderRadius 
        }]} 
      />
    </View>
  );
};

const NFLScreen = () => {
  // NEW: Use the app navigation helper instead of regular useNavigation
  const navigation = useAppNavigation();
  
  const { searchHistory, addToSearchHistory } = useSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [games, setGames] = useState([]);
  const [standings, setStandings] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState('games');
  const [analytics, setAnalytics] = useState({
    totalGames: 0,
    avgPoints: 0,
    passingYards: '265',
    rushingYards: '112',
    playoffRace: '12 teams',
    injuryReports: 8,
  });
  const [depthChartData, setDepthChartData] = useState(null);
  const [fantasyData, setFantasyData] = useState([]);
  const [socialComments, setSocialComments] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('Kansas City Chiefs');
  const [liveScores, setLiveScores] = useState([]);
  const [statsLeaders, setStatsLeaders] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [searchResults, setSearchResults] = useState({
    games: [],
    standings: [],
    players: [],
    news: [],
  });

  // Use sports data hook
  const { 
    data: { nfl },
    isLoading: isSportsDataLoading,
    refreshAllData
  } = useSportsData({
    autoRefresh: true,
    refreshInterval: 30000
  });

  const teams = [
    'Kansas City Chiefs', 'Philadelphia Eagles', 'San Francisco 49ers',
    'Buffalo Bills', 'Dallas Cowboys', 'Baltimore Ravens',
    'Miami Dolphins', 'Detroit Lions', 'Los Angeles Rams'
  ];

  const views = ['games', 'standings', 'depth', 'fantasy', 'social', 'stats'];

  // NEW: Navigation helper functions
  const handleNavigateToPlayerStats = (player) => {
    navigation.goToPlayerStats();
    logAnalyticsEvent('nfl_navigate_player_stats', {
      player_name: player?.name || 'Unknown',
      screen_name: 'NFL Screen',
      view_type: selectedView
    });
  };

  const handleNavigateToGameDetails = (game) => {
    navigation.goToGameDetails();
    logAnalyticsEvent('nfl_navigate_game_details', {
      game_id: game?.id || 'Unknown',
      teams: `${game?.awayTeam?.name || 'Away'} vs ${game?.homeTeam?.name || 'Home'}`,
      screen_name: 'NFL Screen'
    });
  };

  const handleNavigateToFantasy = () => {
    navigation.goToFantasy();
    logAnalyticsEvent('nfl_navigate_fantasy', {
      screen_name: 'NFL Screen'
    });
  };

  const handleNavigateToAnalytics = () => {
    navigation.goToAnalytics();
    logAnalyticsEvent('nfl_navigate_analytics', {
      screen_name: 'NFL Screen'
    });
  };

  const handleNavigateToPredictions = () => {
    navigation.goToPredictions();
    logAnalyticsEvent('nfl_navigate_predictions', {
      screen_name: 'NFL Screen'
    });
  };

  const handleNavigateToDailyPicks = () => {
    navigation.goToDailyPicks();
    logAnalyticsEvent('nfl_navigate_daily_picks', {
      screen_name: 'NFL Screen'
    });
  };

  const handleNavigateToSportsNewsHub = () => {
    navigation.goToSportsNewsHub();
    logAnalyticsEvent('nfl_navigate_sports_news', {
      screen_name: 'NFL Screen'
    });
  };

  // NEW: Navigation menu component
  const renderNavigationMenu = () => (
    <View style={styles.navigationMenu}>
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => handleNavigateToFantasy()}
        activeOpacity={0.7}
      >
        <Ionicons name="stats-chart" size={20} color="#ef4444" />
        <Text style={styles.navButtonText}>Fantasy</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => handleNavigateToAnalytics()}
        activeOpacity={0.7}
      >
        <Ionicons name="analytics" size={20} color="#ef4444" />
        <Text style={styles.navButtonText}>Analytics</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => handleNavigateToPredictions()}
        activeOpacity={0.7}
      >
        <Ionicons name="trending-up" size={20} color="#ef4444" />
        <Text style={styles.navButtonText}>AI Predict</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => handleNavigateToDailyPicks()}
        activeOpacity={0.7}
      >
        <Ionicons name="trophy" size={20} color="#ef4444" />
        <Text style={styles.navButtonText}>Daily Picks</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => handleNavigateToSportsNewsHub()}
        activeOpacity={0.7}
      >
        <Ionicons name="newspaper" size={20} color="#ef4444" />
        <Text style={styles.navButtonText}>Sports News</Text>
      </TouchableOpacity>
    </View>
  );

  // NEW: Enhanced header with navigation menu
  const renderHeader = () => (
    <LinearGradient
      colors={['#0c4a6e', '#0369a1']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>NFL Gridiron Analytics</Text>
            <Text style={styles.subtitle}>Real-time stats, scores & team analysis</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        
        {renderSearchBar()}
        
        <View style={styles.viewTabs}>
          {views.map((view, index) => (
            <TouchableOpacity
              key={view}
              style={[
                styles.viewTab,
                selectedView === view && styles.activeViewTab
              ]}
              onPress={() => handleViewChange(view)}
            >
              <Ionicons 
                name={
                  view === 'games' ? 'football' :
                  view === 'standings' ? 'trophy' :
                  view === 'depth' ? 'people' :
                  view === 'fantasy' ? 'stats-chart' :
                  view === 'social' ? 'chatbubbles' :
                  'analytics'
                } 
                size={16} 
                color={selectedView === view ? 'white' : 'rgba(255,255,255,0.7)'} 
                style={styles.viewTabIcon}
              />
              <Text style={[
                styles.viewTabText,
                selectedView === view && styles.activeViewTabText
              ]}>
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* NEW: Navigation menu in header */}
        {!searchQuery.trim() && (
          <View style={styles.navigationMenuContainer}>
            {renderNavigationMenu()}
          </View>
        )}
      </View>
    </LinearGradient>
  );

  // Extract data from hook
  useEffect(() => {
    if (nfl) {
      const gamesData = nfl?.games || [];
      const standingsData = nfl?.standings || [];
      const newsData = nfl?.news || [];
      const playersData = nfl?.players || [];

      setGames(gamesData);
      setStandings(standingsData);
      setNews(newsData);

      // Calculate analytics from actual data
      const avgPoints = gamesData.length > 0 ? 
        (gamesData.reduce((sum, game) => {
          const awayScore = game.awayScore || 0;
          const homeScore = game.homeScore || 0;
          return sum + awayScore + homeScore;
        }, 0) / gamesData.length).toFixed(1) : 0;

      setAnalytics(prev => ({
        ...prev,
        totalGames: gamesData.length,
        avgPoints,
      }));

      loadDepthChartData();
      loadFantasyData();
      loadSocialComments();

      // Create live scores from games
      const liveScoresData = gamesData
        .filter(game => game.status === 'live' || game.status === 'Live')
        .map(game => ({
          id: game.id,
          teams: `${game.awayTeam?.name || 'Away'} vs ${game.homeTeam?.name || 'Home'}`,
          score: `${game.awayScore || 0}-${game.homeScore || 0}`,
          time: game.period || 'Live',
          status: 'LIVE'
        }));
      setLiveScores(liveScoresData);

      // Create stats leaders from players
      const statsLeadersData = playersData.slice(0, 5).map((player, index) => ({
        id: player.id || index.toString(),
        name: player.name,
        stat: player.stats?.yards ? `${player.stats.yards}` : `${player.stats?.touchdowns || 0}`,
        label: player.stats?.yards ? 'Passing Yards' : 'Touchdowns',
        team: player.team,
        rank: index + 1
      }));
      setStatsLeaders(statsLeadersData);
    }
  }, [nfl]);

  // Handle search functionality
  const handleNFTSearch = useCallback((query) => {
    setSearchQuery(query);
    addToSearchHistory(query);
    
    if (!query.trim()) {
      setSearchResults({ games: [], standings: [], players: [], news: [] });
      setFilteredData([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    // Search across all NFL data
    const filteredGames = games.filter(game => 
      (game.homeTeam?.name || '').toLowerCase().includes(lowerQuery) ||
      (game.awayTeam?.name || '').toLowerCase().includes(lowerQuery) ||
      (game.venue || '').toLowerCase().includes(lowerQuery) ||
      (game.broadcast || '').toLowerCase().includes(lowerQuery)
    );
    
    const filteredStandings = standings.filter(team => 
      (team.name || '').toLowerCase().includes(lowerQuery)
    );
    
    const filteredPlayers = (nfl?.players || []).filter(player => 
      (player.name || '').toLowerCase().includes(lowerQuery) ||
      (player.team || '').toLowerCase().includes(lowerQuery) ||
      (player.position || '').toLowerCase().includes(lowerQuery)
    );
    
    const filteredNews = news.filter(newsItem => 
      (newsItem.title || '').toLowerCase().includes(lowerQuery) ||
      (newsItem.description || '').toLowerCase().includes(lowerQuery) ||
      (newsItem.source || '').toLowerCase().includes(lowerQuery)
    );
    
    setSearchResults({
      games: filteredGames,
      standings: filteredStandings,
      players: filteredPlayers,
      news: filteredNews,
    });
    
    // Combine all results for FlatList
    const combinedResults = [
      ...filteredGames.map(item => ({ ...item, type: 'game' })),
      ...filteredStandings.map(item => ({ ...item, type: 'standing' })),
      ...filteredPlayers.map(item => ({ ...item, type: 'player' })),
      ...filteredNews.map(item => ({ ...item, type: 'news' }))
    ];
    
    setFilteredData(combinedResults);
  }, [games, standings, news, nfl?.players, addToSearchHistory]);

  const loadData = async () => {
    try {
      // setLoading(true);
      
      // Log analytics event
      await logAnalyticsEvent('nfl_screen_view', {
        screen_name: 'NFL Screen',
        view_type: selectedView,
        refresh_type: 'manual'
      });
      
      // Refresh data from hook
      await refreshAllData();
      
      setLoading(false);
      setRefreshing(false);
      setLastUpdated(new Date());
      
      // Log data load completion
      logAnalyticsEvent('nfl_data_loaded', {
        games_count: games.length,
        standings_count: standings.length,
        news_count: news.length
      });
      
    } catch (error) {
      // logAnalyticsEvent('nfl_data_error', {
        error_message: error.message,
        screen_name: 'NFL Screen'
      });
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadDepthChartData = () => {
    const depthChart = {
      team: 'Kansas City Chiefs',
      offense: {
        QB: ['Patrick Mahomes', 'Blaine Gabbert', 'Shane Buechele'],
        RB: ['Isiah Pacheco', 'Clyde Edwards-Helaire', 'Jerick McKinnon'],
        WR: ['Travis Kelce (TE)', 'Rashee Rice', 'Skyy Moore', 'Kadarius Toney', 'Marquez Valdes-Scantling'],
        OL: ['Donovan Smith (LT)', 'Joe Thuney (LG)', 'Creed Humphrey (C)', 'Trey Smith (RG)', 'Jawaan Taylor (RT)'],
      },
      defense: {
        DL: ['Chris Jones', 'George Karlaftis', 'Mike Danna', 'Charles Omenihu'],
        LB: ['Nick Bolton', 'Willie Gay Jr.', 'Leo Chenal', 'Drue Tranquill'],
        DB: ["L'Jarius Sneed", "Trent McDuffie", "Justin Reid", "Bryan Cook", "Mike Edwards"],
      },
      specialTeams: {
        K: 'Harrison Butker',
        P: 'Tommy Townsend',
        KR: 'Richie James',
        PR: 'Kadarius Toney',
        LS: 'James Winchester',
      },
      injuries: ['Creed Humphrey (Questionable)', 'L\'Jarius Sneed (Probable)'],
    };
    setDepthChartData(depthChart);
  };

  const loadFantasyData = () => {
    const fantasyPlayers = [
      {
        id: 1,
        name: 'Patrick Mahomes',
        position: 'QB',
        team: 'KC',
        fantasyPoints: 24.8,
        rank: 1,
        matchup: 'vs LV',
        projected: 25.2,
        status: 'Must Start',
        trend: 'up',
        value: 95,
      },
      {
        id: 2,
        name: 'Christian McCaffrey',
        position: 'RB',
        team: 'SF',
        fantasyPoints: 22.4,
        rank: 1,
        matchup: '@ SEA',
        projected: 21.8,
        status: 'Elite',
        trend: 'stable',
        value: 98,
      },
      {
        id: 3,
        name: 'Tyreek Hill',
        position: 'WR',
        team: 'MIA',
        fantasyPoints: 20.7,
        rank: 1,
        matchup: 'vs NE',
        projected: 19.5,
        status: 'Must Start',
        trend: 'up',
        value: 97,
      },
      {
        id: 4,
        name: 'Travis Kelce',
        position: 'TE',
        team: 'KC',
        fantasyPoints: 18.9,
        rank: 1,
        matchup: 'vs LV',
        projected: 17.8,
        status: 'Elite',
        trend: 'stable',
        value: 96,
      },
      {
        id: 5,
        name: 'Justin Jefferson',
        position: 'WR',
        team: 'MIN',
        fantasyPoints: 19.2,
        rank: 2,
        matchup: '@ GB',
        projected: 18.5,
        status: 'Must Start',
        trend: 'up',
        value: 94,
      },
      {
        id: 6,
        name: 'Jalen Hurts',
        position: 'QB',
        team: 'PHI',
        fantasyPoints: 23.5,
        rank: 2,
        matchup: 'vs DAL',
        projected: 24.1,
        status: 'Must Start',
        trend: 'up',
        value: 93,
      },
    ];
    setFantasyData(fantasyPlayers);
  };

  const loadSocialComments = () => {
    const comments = [
      {
        id: 1,
        user: 'NFLFan42',
        avatar: '👤',
        text: 'Chiefs defense looking strong this season! Chris Jones is a monster.',
        likes: 24,
        time: '2h ago',
        replies: 3,
        verified: true,
      },
      {
        id: 2,
        user: 'FootballExpert',
        avatar: '🧠',
        text: 'Mahomes MVP season incoming with these weapons. That connection with Kelce is unstoppable.',
        likes: 18,
        time: '4h ago',
        replies: 2,
        verified: true,
      },
      {
        id: 3,
        user: 'FantasyGuru',
        avatar: '🏆',
        text: 'McCaffrey is carrying my fantasy team right now. 30+ points every week!',
        likes: 32,
        time: '6h ago',
        replies: 5,
        verified: false,
      },
      {
        id: 4,
        user: 'RavensFan',
        avatar: '🦅',
        text: 'Lamar Jackson back to his MVP form. Ravens looking dangerous for playoffs!',
        likes: 15,
        time: '1h ago',
        replies: 1,
        verified: false,
      },
    ];
    setSocialComments(comments);
  };

  useEffect(() => {
    loadData();
    
    // Log screen view on mount
    logAnalyticsEvent('screen_view', {
      screen_name: 'NFL Screen',
      screen_class: 'NFLScreen'
    });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    
    // Log refresh analytics
    await logAnalyticsEvent('nfl_screen_refresh', {
      screen_name: 'NFL Screen',
      view_type: selectedView
    });
    
    await loadData();
    
    setRefreshing(false);
  };

  const handleViewChange = async (view) => {
    await logAnalyticsEvent('nfl_view_changed', {
      from_view: selectedView,
      to_view: view,
      screen_name: 'NFL Screen'
    });
    setSelectedView(view);
  };

  const handleTeamSelect = async (team) => {
    await logAnalyticsEvent('nfl_team_selected', {
      team_name: team,
      screen_name: 'NFL Screen',
      view_type: selectedView
    });
    setSelectedTeam(team);
  };

  const renderSearchBar = () => (
    <View style={styles.searchSection}>
      <SearchBar
        placeholder="Search teams, players, games..."
        onSearch={handleNFTSearch}
        searchHistory={searchHistory}
        style={styles.homeSearchBar}
      />
      
      {searchQuery.trim() && (
        <View style={styles.searchResultsInfo}>
          <Text style={styles.searchResultsText}>
            {(() => {
              if (selectedView === 'games') return `${searchResults.games.length} of ${games.length} games match "${searchQuery}"`;
              if (selectedView === 'standings') return `${searchResults.standings.length} of ${standings.length} teams match "${searchQuery}"`;
              if (selectedView === 'fantasy') return `${searchResults.players.length} of ${(nfl?.players || []).length} players match "${searchQuery}"`;
              if (selectedView === 'social') return `${searchResults.news.length} of ${news.length} news items match "${searchQuery}"`;
              if (selectedView === 'stats') return `${searchResults.players.length} of ${(nfl?.players || []).length} players match "${searchQuery}"`;
              return `${filteredData.length} total items match "${searchQuery}"`;
            })()}
          </Text>
          <TouchableOpacity 
            onPress={() => {
              setSearchQuery('');
              handleNFTSearch('');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.clearSearchText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.analyticsContainer}>
      <Text style={styles.analyticsTitle}>League Metrics</Text>
      <View style={styles.analyticsGrid}>
        <View style={styles.metricCard}>
          <Ionicons name="football-outline" size={20} color="#f59e0b" />
          <Text style={styles.metricValue}>{analytics.totalGames}</Text>
          <Text style={styles.metricLabel}>Games Today</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="stats-chart-outline" size={20} color="#3b82f6" />
          <Text style={styles.metricValue}>{analytics.avgPoints}</Text>
          <Text style={styles.metricLabel}>Avg Points</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="trending-up-outline" size={20} color="#10b981" />
          <Text style={styles.metricValue}>{analytics.passingYards}</Text>
          <Text style={styles.metricLabel}>Pass Yds/G</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="pulse-outline" size={20} color="#ef4444" />
          <Text style={styles.metricValue}>{analytics.injuryReports}</Text>
          <Text style={styles.metricLabel}>Injuries</Text>
        </View>
      </View>
    </View>
  );

  const renderLiveScores = () => (
    <View style={styles.liveScoresContainer}>
      <View style={styles.liveScoresHeader}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveIndicatorDot} />
          <Text style={styles.liveIndicatorText}>Live Scores</Text>
        </View>
        <Text style={styles.liveScoresTime}>Last Updated: Now</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {liveScores.map((score, index) => (
          <View key={`live-score-${score.id}-${index}`} style={styles.liveScoreCard}>
            <Text style={styles.liveScoreTeams}>{score.teams}</Text>
            <Text style={styles.liveScore}>{score.score}</Text>
            <View style={[
              styles.liveStatusBadge,
              score.status === 'LIVE' && styles.liveStatusActive
            ]}>
              <Text style={styles.liveStatusText}>{score.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderGames = () => {
    const gamesToRender = searchQuery.trim() ? searchResults.games : games;
    
    if (gamesToRender.length === 0) {
      return (
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>
            {searchQuery.trim() ? 'Search Results' : "Today's Matchups"}
          </Text>
          <View style={styles.emptyData}>
            <Ionicons name="football-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {searchQuery.trim() ? 'No games found' : 'No NFL games scheduled'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery.trim() 
                ? 'Try a different search term'
                : 'Check back soon for upcoming NFL games'}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.contentSection}>
        <Text style={styles.sectionTitle}>
          {searchQuery.trim() ? 'Search Results' : "Today's Matchups"} ({gamesToRender.length})
        </Text>
        
        {liveScores.length > 0 && !searchQuery.trim() && (
          <View style={styles.liveSection}>
            {renderLiveScores()}
          </View>
        )}
        
        {gamesToRender.map((game, index) => {
          const awayTeam = game.awayTeam?.name || 'Away';
          const homeTeam = game.homeTeam?.name || 'Home';
          const awayScore = game.awayScore || 0;
          const homeScore = game.homeScore || 0;
          const status = game.status || 'scheduled';
          const broadcast = game.broadcast || 'TBD';
          const period = game.period || '';
          
          return (
            <TouchableOpacity 
              key={`game-${game.id}-${index}`} 
              style={styles.gameCard}
              activeOpacity={0.7}
              onPress={async () => {
                await logAnalyticsEvent('nfl_game_selected', {
                  game_id: game.id,
                  teams: `${awayTeam} vs ${homeTeam}`,
                  screen_name: 'NFL Screen'
                });
                // NEW: Navigate to game details
                handleNavigateToGameDetails(game);
              }}
            >
              <View style={styles.gameTeams}>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamAbbrev}>{awayTeam.substring(0, 3).toUpperCase()}</Text>
                  <Text style={styles.teamType}>Away</Text>
                </View>
                <View style={styles.gameCenter}>
                  <View style={[
                    styles.gameStatusBadge,
                    status === 'final' && styles.gameStatusFinal,
                    status === 'live' && styles.gameStatusLive
                  ]}>
                    <Text style={styles.gameStatusText}>
                      {status === 'final' ? 'FINAL' : period || status}
                    </Text>
                  </View>
                  <View style={styles.scoreContainer}>
                    <Text style={[
                      styles.score,
                      (parseInt(awayScore) > parseInt(homeScore)) && styles.winningScore
                    ]}>{awayScore}</Text>
                    <Text style={styles.scoreDivider}>-</Text>
                    <Text style={[
                      styles.score,
                      (parseInt(homeScore) > parseInt(awayScore)) && styles.winningScore
                    ]}>{homeScore}</Text>
                  </View>
                  <Text style={styles.gameSpread}>
                    {awayTeam.substring(0, 3)} vs {homeTeam.substring(0, 3)}
                  </Text>
                </View>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamAbbrev}>{homeTeam.substring(0, 3).toUpperCase()}</Text>
                  <Text style={styles.teamType}>Home</Text>
                </View>
              </View>
              <View style={styles.gameFooter}>
                <View style={styles.gameChannel}>
                  <Ionicons name="tv-outline" size={12} color="#6b7280" />
                  <Text style={styles.gameChannelText}>{broadcast}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.gameStatsButton}
                  activeOpacity={0.7}
                  onPress={async () => {
                    await logAnalyticsEvent('nfl_stats_viewed', {
                      game_id: game.id,
                      teams: `${awayTeam} vs ${homeTeam}`,
                      screen_name: 'NFL Screen'
                    });
                    // NEW: Navigate to player stats
                    handleNavigateToPlayerStats(game);
                  }}
                >
                  <Text style={styles.gameStatsText}>View Stats →</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderStandings = () => {
    const standingsToRender = searchQuery.trim() ? searchResults.standings : standings;
    
    if (standingsToRender.length === 0) {
      return (
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>
            {searchQuery.trim() ? 'Search Results' : 'League Standings'}
          </Text>
          <View style={styles.emptyData}>
            <Ionicons name="trophy-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {searchQuery.trim() ? 'No teams found' : 'No standings data'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery.trim()
                ? 'Try a different search term'
                : 'NFL standings will be updated soon'}
            </Text>
          </View>
        </View>
      );
    }

    // Helper function to calculate win percentage
    const calculateWinPercentage = (team) => {
      const totalGames = (team.wins || 0) + (team.losses || 0);
      if (totalGames === 0) return "0.000";
      const winPercentage = (team.wins || 0) / totalGames;
      return winPercentage.toFixed(3);
    };

    return (
      <View style={styles.contentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {searchQuery.trim() ? 'Search Results' : 'League Standings'} ({standingsToRender.length})
          </Text>
          {!searchQuery.trim() && (
            <View style={styles.conferenceTabs}>
              <TouchableOpacity 
                style={[styles.conferenceTab, styles.conferenceTabActive]}
                activeOpacity={0.7}
                onPress={async () => {
                  await logAnalyticsEvent('nfl_conference_selected', {
                    conference: 'AFC',
                    screen_name: 'NFL Screen'
                  });
                }}
              >
                <Text style={styles.conferenceTabText}>AFC</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.conferenceTab}
                activeOpacity={0.7}
                onPress={async () => {
                  await logAnalyticsEvent('nfl_conference_selected', {
                    conference: 'NFC',
                    screen_name: 'NFL Screen'
                  });
                }}
              >
                <Text style={styles.conferenceTabText}>NFC</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={styles.standingsContainer}>
          <View style={styles.standingsHeader}>
            <Text style={[styles.standingsCol, { flex: 2 }]}>Team</Text>
            <Text style={styles.standingsCol}>W</Text>
            <Text style={styles.standingsCol}>L</Text>
            <Text style={styles.standingsCol}>T</Text>
            <Text style={[styles.standingsCol, { color: '#0ea5e9' }]}>PCT</Text>
            <Text style={[styles.standingsCol, { color: '#10b981' }]}>PTS</Text>
          </View>
          
          {standingsToRender.map((team, index) => (
            <TouchableOpacity 
              key={`team-${team.id || index}`} 
              style={styles.standingsRow}
              activeOpacity={0.7}
              onPress={async () => {
                await logAnalyticsEvent('nfl_team_standings_selected', {
                  team_name: team.name,
                  rank: index + 1,
                  screen_name: 'NFL Screen'
                });
                // NEW: Navigate to game details for the team
                handleNavigateToGameDetails({ homeTeam: { name: team.name } });
              }}
            >
              <View style={[styles.teamCell, { flex: 2 }]}>
                <View style={styles.teamRankBadge}>
                  <Text style={[
                    styles.teamRank,
                    index < 4 && styles.topTeamRank
                  ]}>
                    #{index + 1}
                  </Text>
                </View>
                <View style={styles.teamNameContainer}>
                  <Text style={styles.teamNameCell}>{team.name}</Text>
                  <Text style={styles.teamConference}>
                    {(team.conference || '')} • {(team.division || '')}
                  </Text>
                </View>
              </View>
              <Text style={[styles.standingsCell, styles.winCell]}>{team.wins || 0}</Text>
              <Text style={[styles.standingsCell, styles.lossCell]}>{team.losses || 0}</Text>
              <Text style={styles.standingsCell}>{team.ties || 0}</Text>
              <Text style={[styles.standingsCell, styles.pctCell]}>
                {calculateWinPercentage(team)}
              </Text>
              <Text style={[styles.standingsCell, styles.pointsCell]}>{team.pointsFor || 0}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {!searchQuery.trim() && (
          <View style={styles.playoffIndicator}>
            <View style={styles.playoffMarker}>
              <View style={styles.playoffDot} />
              <Text style={styles.playoffText}>Playoff Position</Text>
            </View>
            <Text style={styles.playoffNote}>Top 7 in each conference</Text>
          </View>
        )}
      </View>
    );
  };

  const renderStatsLeaders = () => {
    const playersToRender = searchQuery.trim() ? searchResults.players : (nfl?.players || []).slice(0, 5);
    
    if (playersToRender.length === 0) {
      return (
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>
            {searchQuery.trim() ? 'Search Results' : 'Stat Leaders'}
          </Text>
          <View style={styles.emptyData}>
            <Ionicons name="stats-chart-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {searchQuery.trim() ? 'No players found' : 'No player stats available'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery.trim()
                ? 'Try a different search term'
                : 'Player statistics will be updated soon'}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.contentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {searchQuery.trim() ? 'Search Results' : 'Stat Leaders'} ({playersToRender.length})
          </Text>
          {!searchQuery.trim() && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              activeOpacity={0.7}
              onPress={async () => {
                await logAnalyticsEvent('nfl_all_stats_viewed', {
                  screen_name: 'NFL Screen',
                  stats_count: playersToRender.length
                });
                // NEW: Navigate to player stats
                handleNavigateToPlayerStats();
              }}
            >
              <Text style={styles.viewAllText}>All Stats →</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
          {playersToRender.map((player, index) => (
            <TouchableOpacity 
              key={`leader-${player.id || index}`} 
              style={styles.leaderCard}
              activeOpacity={0.7}
              onPress={async () => {
                await logAnalyticsEvent('nfl_player_selected', {
                  player_name: player.name || `Player ${index + 1}`,
                  screen_name: 'NFL Screen'
                });
                // NEW: Navigate to player stats
                handleNavigateToPlayerStats(player);
              }}
            >
              <View style={styles.leaderHeader}>
                <View style={styles.leaderRank}>
                  <Text style={styles.leaderRankNumber}>#{index + 1}</Text>
                </View>
                {!searchQuery.trim() && (
                  <View style={styles.leaderBadge}>
                    <Text style={styles.leaderBadgeText}>LEADER</Text>
                  </View>
                )}
              </View>
              <Text style={styles.leaderName}>{player.name || `Player ${index + 1}`}</Text>
              <Text style={styles.leaderStat}>{player.stats?.yards || player.stats?.touchdowns || '0'}</Text>
              <Text style={styles.leaderLabel}>{player.stats?.yards ? 'Passing Yards' : 'Touchdowns'}</Text>
              <View style={styles.leaderTeam}>
                <Text style={styles.leaderTeamText}>{player.team || 'Unknown Team'}</Text>
              </View>
              <View style={styles.leaderProgress}>
                <CustomProgressBar 
                  progress={0.85 + (Math.random() * 0.1)}
                  width={120}
                  height={4}
                  color={index === 0 ? '#f59e0b' : '#3b82f6'}
                  unfilledColor="#e5e7eb"
                />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderDepthChart = () => {
    if (searchQuery.trim()) {
      // If searching, show search results instead
      const filteredTeams = teams.filter(team => 
        team.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (filteredTeams.length === 0) {
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Search Results</Text>
            <View style={styles.emptyData}>
              <Ionicons name="people-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No teams found</Text>
              <Text style={styles.emptySubtext}>
                Try a different search term
              </Text>
            </View>
          </View>
        );
      }
      
      return (
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Search Results ({filteredTeams.length})</Text>
          {filteredTeams.map((team, index) => (
            <TouchableOpacity
              key={`search-team-${index}`}
              style={styles.searchResultCard}
              onPress={() => {
                setSelectedTeam(team);
                setSearchQuery('');
                handleNFTSearch('');
              }}
            >
              <View style={styles.searchResultHeader}>
                <Ionicons name="people" size={16} color="#10b981" />
                <Text style={styles.searchResultType}>Team</Text>
              </View>
              <Text style={styles.searchResultTitle}>{team}</Text>
              <Text style={styles.searchResultSubtext}>View depth chart</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }
    
    return (
      <View style={styles.contentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Team Depth Chart</Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            activeOpacity={0.7}
            onPress={async () => {
              await logAnalyticsEvent('nfl_depth_chart_viewed', {
                team_name: selectedTeam,
                screen_name: 'NFL Screen'
              });
              // NEW: Navigate to game details for the team
              handleNavigateToGameDetails({ homeTeam: { name: selectedTeam } });
            }}
          >
            <Text style={styles.viewAllText}>Full Chart →</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.teamSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {teams.map((team, index) => (
              <TouchableOpacity
                key={`team-option-${index}`}
                style={[
                  styles.teamOption,
                  selectedTeam === team && styles.teamOptionActive
                ]}
                activeOpacity={0.7}
                onPress={() => handleTeamSelect(team)}
              >
                <Text style={[
                  styles.teamOptionText,
                  selectedTeam === team && styles.teamOptionTextActive
                ]}>
                  {team.split(' ').pop()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {depthChartData && (
          <View style={styles.depthChartPreview}>
            <View style={styles.depthChartTeam}>
              <Text style={styles.depthChartTeamName}>{selectedTeam}</Text>
              <View style={styles.teamRecord}>
                <Text style={styles.teamRecordText}>12-5 • 1st in AFC West</Text>
              </View>
            </View>
            
            <View style={styles.depthChartSections}>
              <View style={styles.depthChartSection}>
                <Text style={styles.depthChartSectionTitle}>Offense</Text>
                <View style={styles.depthChartPosition}>
                  <Text style={styles.positionLabel}>QB:</Text>
                  <View style={styles.playerList}>
                    <TouchableOpacity 
                      style={styles.starterContainer}
                      activeOpacity={0.7}
                      onPress={() => handleNavigateToPlayerStats({ name: 'Patrick Mahomes' })}
                    >
                      <Text style={styles.starterPlayer}>Patrick Mahomes</Text>
                      <View style={styles.starterTag}>STARTER</View>
                    </TouchableOpacity>
                    <Text style={styles.backupPlayer}>Blaine Gabbert</Text>
                  </View>
                </View>
                <View style={styles.depthChartPosition}>
                  <Text style={styles.positionLabel}>RB:</Text>
                  <View style={styles.playerList}>
                    <TouchableOpacity 
                      style={styles.starterContainer}
                      activeOpacity={0.7}
                      onPress={() => handleNavigateToPlayerStats({ name: 'Isiah Pacheco' })}
                    >
                      <Text style={styles.starterPlayer}>Isiah Pacheco</Text>
                      <View style={styles.starterTag}>STARTER</View>
                    </TouchableOpacity>
                    <Text style={styles.backupPlayer}>Clyde Edwards-Helaire</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.depthChartSection}>
                <Text style={styles.depthChartSectionTitle}>Defense</Text>
                <View style={styles.depthChartPosition}>
                  <Text style={styles.positionLabel}>DL:</Text>
                  <View style={styles.playerList}>
                    <TouchableOpacity 
                      style={styles.starterContainer}
                      activeOpacity={0.7}
                      onPress={() => handleNavigateToPlayerStats({ name: 'Chris Jones' })}
                    >
                      <Text style={styles.starterPlayer}>Chris Jones</Text>
                      <View style={styles.starterTag}>STARTER</View>
                    </TouchableOpacity>
                    <Text style={styles.backupPlayer}>George Karlaftis</Text>
                  </View>
                </View>
              </View>
            </View>
            
            {depthChartData.injuries && depthChartData.injuries.length > 0 && (
              <View style={styles.injuryReport}>
                <Text style={styles.injuryTitle}>Injury Report</Text>
                {depthChartData.injuries.map((injury, index) => (
                  <Text key={`injury-${index}`} style={styles.injuryText}>• {injury}</Text>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderFantasyIntegration = () => {
    const playersToRender = searchQuery.trim() ? searchResults.players : fantasyData;
    
    if (playersToRender.length === 0) {
      return (
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>
            {searchQuery.trim() ? 'Search Results' : 'Fantasy Football'}
          </Text>
          <View style={styles.emptyData}>
            <Ionicons name="stats-chart-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {searchQuery.trim() ? 'No players found' : 'No fantasy data available'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery.trim()
                ? 'Try a different search term'
                : 'Fantasy statistics will be updated soon'}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.contentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {searchQuery.trim() ? 'Search Results' : 'Fantasy Football'} ({playersToRender.length})
          </Text>
          {!searchQuery.trim() && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              activeOpacity={0.7}
              onPress={async () => {
                await logAnalyticsEvent('nfl_fantasy_viewed', {
                  player_count: playersToRender.length,
                  screen_name: 'NFL Screen'
                });
                // NEW: Navigate to fantasy screen
                handleNavigateToFantasy();
              }}
            >
              <Text style={styles.viewAllText}>All Players →</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {!searchQuery.trim() && <Text style={styles.fantasySubtitle}>Top Fantasy Performers</Text>}
        
        <View style={styles.fantasyGrid}>
          {playersToRender.map((player, index) => (
            <TouchableOpacity 
              key={`fantasy-player-${player.id || index}`} 
              style={styles.fantasyCard}
              activeOpacity={0.7}
              onPress={async () => {
                await logAnalyticsEvent('nfl_fantasy_player_selected', {
                  player_name: player.name,
                  position: player.position,
                  rank: player.rank,
                  screen_name: 'NFL Screen'
                });
                // NEW: Navigate to player stats
                handleNavigateToPlayerStats(player);
              }}
            >
              <View style={styles.fantasyHeader}>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerPosition}>{player.position} • {player.team} • {player.matchup}</Text>
                </View>
                {!searchQuery.trim() && (
                  <View style={[
                    styles.fantasyRank,
                    { backgroundColor: player.rank <= 3 ? '#fef3c7' : '#f1f5f9' }
                  ]}>
                    <Text style={[
                      styles.fantasyRankText,
                      { color: player.rank <= 3 ? '#92400e' : '#6b7280' }
                    ]}>
                      #{player.rank}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.fantasyStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>FPTS</Text>
                  <Text style={styles.statValue}>{player.fantasyPoints || 'N/A'}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>PROJ</Text>
                  <Text style={styles.statValue}>{player.projected || 'N/A'}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>VALUE</Text>
                  <Text style={styles.statValue}>{player.value || 'N/A'}/100</Text>
                </View>
              </View>
              
              {!searchQuery.trim() && (
                <View style={styles.fantasyStatus}>
                  <View style={[
                    styles.statusBadge,
                    { 
                      backgroundColor: player.status === 'Must Start' ? '#d1fae5' : 
                                      player.status === 'Elite' ? '#fef3c7' : '#f1f5f9'
                    }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { 
                        color: player.status === 'Must Start' ? '#065f46' : 
                               player.status === 'Elite' ? '#92400e' : '#6b7280'
                      }
                    ]}>
                      {player.status || 'N/A'}
                    </Text>
                  </View>
                  <Ionicons 
                    name={player.trend === 'up' ? 'trending-up-outline' : 
                          player.trend === 'down' ? 'trending-down-outline' : 'remove-outline'}
                    size={16} 
                    color={player.trend === 'up' ? '#10b981' : 
                           player.trend === 'down' ? '#ef4444' : '#6b7280'} 
                  />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {!searchQuery.trim() && (
          <View style={styles.fantasyTips}>
            <Ionicons name="bulb-outline" size={16} color="#f59e0b" />
            <Text style={styles.fantasyTipsText}>
              Start players with favorable matchups. Monitor injury reports for last-minute changes.
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderSocialFeatures = () => {
    const commentsToRender = searchQuery.trim() ? searchResults.news : socialComments;
    
    if (commentsToRender.length === 0) {
      return (
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>
            {searchQuery.trim() ? 'Search Results' : 'Community Talk'}
          </Text>
          <View style={styles.emptyData}>
            <Ionicons name="chatbubbles-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {searchQuery.trim() ? 'No content found' : 'No comments available'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery.trim()
                ? 'Try a different search term'
                : 'Be the first to comment!'}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.contentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {searchQuery.trim() ? 'Search Results' : 'Community Talk'} ({commentsToRender.length})
          </Text>
          {!searchQuery.trim() && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              activeOpacity={0.7}
              onPress={async () => {
                await logAnalyticsEvent('nfl_social_viewed', {
                  screen_name: 'NFL Screen',
                  comment_count: commentsToRender.length
                });
                // NEW: Navigate to sports news hub
                handleNavigateToSportsNewsHub();
              }}
            >
              <Text style={styles.viewAllText}>Join Discussion →</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.socialPreview}>
          {commentsToRender.map((item, index) => {
            if (searchQuery.trim()) {
              // Render news items in search results
              return (
                <TouchableOpacity 
                  key={`search-news-${index}`} 
                  style={styles.searchResultCard}
                  onPress={() => {
                    // NEW: Navigate to sports news hub
                    handleNavigateToSportsNewsHub();
                  }}
                >
                  <View style={styles.searchResultHeader}>
                    <Ionicons name="newspaper" size={16} color="#3b82f6" />
                    <Text style={styles.searchResultType}>News</Text>
                  </View>
                  <Text style={styles.searchResultTitle}>{item.title}</Text>
                  <Text style={styles.searchResultSubtext}>
                    {item.source} • {item.time}
                  </Text>
                </TouchableOpacity>
              );
            } else {
              // Render social comments
              return (
                <View key={`comment-${item.id}-${index}`} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <View style={styles.userInfo}>
                      <View style={styles.userAvatarContainer}>
                        <Text style={styles.userAvatar}>{item.avatar}</Text>
                        {item.verified && (
                          <Ionicons name="checkmark-circle" size={12} color="#3b82f6" style={styles.verifiedBadge} />
                        )}
                      </View>
                      <View>
                        <View style={styles.usernameContainer}>
                          <Text style={styles.username}>{item.user}</Text>
                          {item.verified && (
                            <Text style={styles.verifiedText}>Verified</Text>
                          )}
                        </View>
                        <Text style={styles.commentTime}>{item.time}</Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.likeButton}
                      activeOpacity={0.7}
                      onPress={async () => {
                        await logAnalyticsEvent('nfl_comment_liked', {
                          comment_id: item.id,
                          screen_name: 'NFL Screen'
                        });
                      }}
                    >
                      <Ionicons name="heart-outline" size={16} color="#ef4444" />
                      <Text style={styles.likeCount}>{item.likes}</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.commentText}>{item.text}</Text>
                  <View style={styles.commentFooter}>
                    <TouchableOpacity 
                      style={styles.replyButton}
                      activeOpacity={0.7}
                      onPress={async () => {
                        await logAnalyticsEvent('nfl_comment_reply', {
                          comment_id: item.id,
                          screen_name: 'NFL Screen'
                        });
                      }}
                    >
                      <Ionicons name="chatbubble-outline" size={14} color="#6b7280" />
                      <Text style={styles.replyText}>{item.replies} replies</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.shareButton}
                      activeOpacity={0.7}
                      onPress={async () => {
                        await logAnalyticsEvent('nfl_comment_shared', {
                          comment_id: item.id,
                          screen_name: 'NFL Screen'
                        });
                      }}
                    >
                      <Ionicons name="share-outline" size={14} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }
          })}
        </View>
        
        {!searchQuery.trim() && (
          <TouchableOpacity 
            style={styles.addCommentButton}
            activeOpacity={0.7}
            onPress={async () => {
              await logAnalyticsEvent('nfl_add_comment_clicked', {
                screen_name: 'NFL Screen'
              });
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color="#3b82f6" />
            <Text style={styles.addCommentText}>Add your comment</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSelectedView = () => {
    if (searchQuery.trim()) {
      // Show search results across all data types
      const totalResults = filteredData.length;
      
      if (totalResults === 0) {
        return (
          <View style={styles.searchResultsContainer}>
            <View style={styles.searchResultsHeader}>
              <Text style={styles.searchResultsTitle}>
                Search Results
              </Text>
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={48} color="#d1d5db" />
              <Text style={styles.noResultsText}>
                No results found for "{searchQuery}"
              </Text>
              <Text style={styles.noResultsSubtext}>
                Try searching for teams, players, or games
              </Text>
            </View>
          </View>
        );
      }

      return (
        <View style={styles.searchResultsContainer}>
          <View style={styles.searchResultsHeader}>
            <Text style={styles.searchResultsTitle}>
              Search Results ({totalResults})
            </Text>
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={filteredData}
            renderItem={({ item }) => {
              if (item.type === 'game') {
                return (
                  <TouchableOpacity 
                    style={styles.searchResultCard}
                    onPress={() => handleNavigateToGameDetails(item)}
                  >
                    <View style={styles.searchResultHeader}>
                      <Ionicons name="football" size={16} color="#f59e0b" />
                      <Text style={styles.searchResultType}>Game</Text>
                    </View>
                    <Text style={styles.searchResultTitle}>
                      {item.awayTeam?.name || 'Away'} @ {item.homeTeam?.name || 'Home'}
                    </Text>
                    <Text style={styles.searchResultSubtext}>
                      {item.status === 'final' ? 'Final' : 'Scheduled'} • {item.venue}
                    </Text>
                  </TouchableOpacity>
                );
              } else if (item.type === 'player') {
                return (
                  <TouchableOpacity 
                    style={styles.searchResultCard}
                    onPress={() => handleNavigateToPlayerStats(item)}
                  >
                    <View style={styles.searchResultHeader}>
                      <Ionicons name="person" size={16} color="#10b981" />
                      <Text style={styles.searchResultType}>Player</Text>
                    </View>
                    <Text style={styles.searchResultTitle}>
                      {item.name} • {item.team}
                    </Text>
                    <Text style={styles.searchResultSubtext}>
                      {item.position} • {item.stats?.yards || 0} YDS
                    </Text>
                  </TouchableOpacity>
                );
              } else if (item.type === 'standing') {
                return (
                  <TouchableOpacity 
                    style={styles.searchResultCard}
                    onPress={() => handleNavigateToGameDetails({ homeTeam: { name: item.name } })}
                  >
                    <View style={styles.searchResultHeader}>
                      <Ionicons name="trophy" size={16} color="#f59e0b" />
                      <Text style={styles.searchResultType}>Team</Text>
                    </View>
                    <Text style={styles.searchResultTitle}>{item.name}</Text>
                    <Text style={styles.searchResultSubtext}>
                      {item.wins || 0}-{item.losses || 0} • {item.pointsFor || 0} PTS
                    </Text>
                  </TouchableOpacity>
                );
              } else if (item.type === 'news') {
                return (
                  <TouchableOpacity 
                    style={styles.searchResultCard}
                    onPress={() => handleNavigateToSportsNewsHub()}
                  >
                    <View style={styles.searchResultHeader}>
                      <Ionicons name="newspaper" size={16} color="#3b82f6" />
                      <Text style={styles.searchResultType}>News</Text>
                    </View>
                    <Text style={styles.searchResultTitle}>{item.title}</Text>
                    <Text style={styles.searchResultSubtext}>
                      {item.source} • {item.time}
                    </Text>
                  </TouchableOpacity>
                );
              }
              return null;
            }}
            keyExtractor={(item, index) => `${item.type}-${index}`}
            scrollEnabled={false}
            style={styles.searchResultsList}
          />
        </View>
      );
    }

    switch(selectedView) {
      case 'games':
        return renderGames();
      case 'standings':
        return renderStandings();
      case 'depth':
        return renderDepthChart();
      case 'fantasy':
        return renderFantasyIntegration();
      case 'social':
        return renderSocialFeatures();
      case 'stats':
        return renderStatsLeaders();
      default:
        return renderGames();
    }
  };

  const renderRefreshIndicator = () => (
    <View style={styles.refreshIndicator}>
      <Ionicons name="time" size={14} color="#6b7280" />
      <Text style={styles.refreshText}>
        Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
      <TouchableOpacity onPress={onRefresh} activeOpacity={0.7}>
        <Ionicons name="refresh" size={16} color="#0ea5e9" style={styles.refreshIcon} />
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Loading NFL Analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderRefreshIndicator()}
      
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#0ea5e9']}
            tintColor="#0ea5e9"
          />
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!searchQuery.trim() && renderAnalytics()}
        {renderSelectedView()}
        
        {!searchQuery.trim() && (
          <>
            <View style={styles.newsSection}>
              <Text style={styles.newsTitle}>Latest News</Text>
              {news.map((item, index) => (
                <TouchableOpacity 
                  key={`news-${item.id}-${index}`} 
                  style={styles.newsCard}
                  activeOpacity={0.7}
                  onPress={async () => {
                    await logAnalyticsEvent('nfl_news_selected', {
                      news_id: item.id,
                      source: item.source,
                      screen_name: 'NFL Screen'
                    });
                    // NEW: Navigate to sports news hub
                    handleNavigateToSportsNewsHub();
                  }}
                >
                  <View style={styles.newsContent}>
                    <Text style={styles.newsHeadline}>{item.title}</Text>
                    <View style={styles.newsMeta}>
                      <Text style={styles.newsSource}>{item.source}</Text>
                      <Text style={styles.newsTime}>{item.time}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.footer}>
              <Ionicons name="information-circle-outline" size={16} color="#6b7280" />
              <Text style={styles.footerText}>
                NFL data updates in real-time. Tap refresh for latest scores and stats.
              </Text>
            </View>
          </>
        )}
        
        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerContent: {
    marginTop: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginRight: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  searchSection: {
    marginBottom: 12,
  },
  homeSearchBar: {
    marginBottom: 8,
  },
  searchResultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginTop: 4,
  },
  searchResultsText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  clearSearchText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  refreshText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  refreshIcon: {
    marginLeft: 10,
  },
  viewTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 4,
  },
  viewTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  activeViewTab: {
    backgroundColor: 'white',
  },
  viewTabIcon: {
    marginBottom: 4,
  },
  viewTabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeViewTabText: {
    color: '#0369a1',
  },
  // NEW: Navigation menu styles
  navigationMenuContainer: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 8,
  },
  navigationMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  navButton: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  navButtonText: {
    color: 'white',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  searchResultsContainer: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  searchResultsList: {
    maxHeight: 400,
  },
  searchResultCard: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  searchResultType: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  searchResultTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  searchResultSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noResultsText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  analyticsContainer: {
    margin: 16,
    marginTop: 20,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginVertical: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  contentSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  viewAllButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  viewAllText: {
    color: '#0ea5e9',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyData: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  liveScoresContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  liveScoresHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 6,
  },
  liveIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  liveScoresTime: {
    fontSize: 11,
    color: '#6b7280',
  },
  liveScoreCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  liveScoreTeams: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  liveScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  liveStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  liveStatusActive: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
  },
  liveStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  gameCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  gameTeams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamInfo: {
    alignItems: 'center',
    flex: 1,
  },
  teamAbbrev: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  teamType: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  gameCenter: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  gameStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  gameStatusFinal: {
    backgroundColor: '#e5e7eb',
  },
  gameStatusLive: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
  },
  gameStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    minWidth: 30,
    textAlign: 'center',
  },
  winningScore: {
    color: '#10b981',
  },
  scoreDivider: {
    fontSize: 20,
    color: '#9ca3af',
    marginHorizontal: 10,
  },
  gameSpread: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 6,
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  gameChannel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameChannelText: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 4,
  },
  gameStatsButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  gameStatsText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  conferenceTabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    padding: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  conferenceTab: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: 'transparent',
  },
  conferenceTabActive: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  conferenceTabText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  standingsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  standingsHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  standingsCol: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  standingsRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  teamCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  standingsCell: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  teamRankBadge: {
    width: 30,
  },
  teamRank: {
    fontSize: 12,
    color: '#9ca3af',
  },
  topTeamRank: {
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  teamNameContainer: {
    flex: 1,
    marginLeft: 8,
  },
  teamNameCell: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  teamConference: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  winCell: {
    color: '#10b981',
    fontWeight: '600',
  },
  lossCell: {
    color: '#ef4444',
    fontWeight: '600',
  },
  pctCell: {
    fontWeight: '500',
    color: '#0ea5e9',
  },
  pointsCell: {
    fontWeight: 'bold',
    color: '#10b981',
  },
  playoffIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  playoffMarker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playoffDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  playoffText: {
    fontSize: 12,
    color: '#065f46',
    fontWeight: '500',
  },
  playoffNote: {
    fontSize: 11,
    color: '#6b7280',
  },
  statsScroll: {
    marginHorizontal: -5,
    paddingVertical: 5,
  },
  leaderCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    width: 150,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  leaderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  leaderRank: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  leaderRankNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  leaderBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  leaderBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#92400e',
  },
  leaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  leaderStat: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginBottom: 4,
  },
  leaderLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  leaderTeam: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  leaderTeamText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369a1',
  },
  leaderProgress: {
    width: '100%',
    alignItems: 'center',
  },
  teamSelector: {
    marginBottom: 15,
    paddingVertical: 5,
  },
  teamOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  teamOptionActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  teamOptionText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  teamOptionTextActive: {
    color: 'white',
  },
  depthChartPreview: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  depthChartTeam: {
    alignItems: 'center',
    marginBottom: 20,
  },
  depthChartTeamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  teamRecord: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  teamRecordText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '500',
  },
  depthChartSections: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  depthChartSection: {
    flex: 1,
    marginRight: 10,
  },
  depthChartSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  depthChartPosition: {
    marginBottom: 15,
  },
  positionLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 6,
  },
  playerList: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  starterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  starterPlayer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  starterTag: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#10b981',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  backupPlayer: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  injuryReport: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  injuryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 6,
  },
  injuryText: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
  },
  fantasySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
  },
  fantasyGrid: {
    marginBottom: 15,
  },
  fantasyCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fantasyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  playerPosition: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  fantasyRank: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fantasyRankText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fantasyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  fantasyStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  fantasyTips: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  fantasyTipsText: {
    fontSize: 13,
    color: '#92400e',
    marginLeft: 8,
    flex: 1,
  },
  socialPreview: {
    marginTop: 10,
  },
  commentCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  userAvatar: {
    fontSize: 24,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'white',
    borderRadius: 6,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  verifiedText: {
    fontSize: 10,
    color: '#3b82f6',
    marginLeft: 4,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  commentTime: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    fontSize: 12,
    color: '#ef4444',
    marginLeft: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 10,
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  shareButton: {
    padding: 4,
  },
  addCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addCommentText: {
    fontSize: 14,
    color: '#3b82f6',
    marginLeft: 8,
    fontWeight: '500',
  },
  newsSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  newsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  newsContent: {
    flex: 1,
  },
  newsHeadline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    lineHeight: 18,
  },
  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: 12,
    color: '#0ea5e9',
    marginRight: 10,
  },
  newsTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
    marginLeft: 8,
  },
  // Custom Progress Bar Styles
  customProgressBar: {
    overflow: 'hidden',
  },
  customProgressBarFill: {
    height: '100%',
  },
  liveSection: {
    marginBottom: 15,
  },
  spacer: {
    height: 20,
  },
});

export default NFLScreen;
