// src/screens/LiveGamesScreen.js - FIXED AND ENHANCED
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Alert,
  SafeAreaView,
  FlatList,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../components/SearchBar';
import { useSearch } from '../providers/SearchProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Analytics helper function
const logAnalyticsEvent = async (eventName, eventParams = {}) => {
  try {
    const eventData = {
      event: eventName,
      params: eventParams,
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
    };

    if (__DEV__) {
      console.log(`📊 Analytics Event: ${eventName}`, eventParams);
    }
    
    // For now, just log to console and AsyncStorage
    try {
      const existingEvents = JSON.parse(await AsyncStorage.getItem('analytics_events') || '[]');
      existingEvents.push(eventData);
      if (existingEvents.length > 100) {
        existingEvents.splice(0, existingEvents.length - 100);
      }
      await AsyncStorage.setItem('analytics_events', JSON.stringify(existingEvents));
    } catch (storageError) {
      console.warn('Could not save analytics event locally:', storageError.message);
    }
  } catch (error) {
    console.warn('Analytics event failed:', error.message);
  }
};

// Helper functions for safe data extraction
const getTeamName = (team) => {
  if (!team) return 'TBD';
  if (typeof team === 'string') return team;
  if (typeof team === 'object' && team.name) return String(team.name);
  return 'TBD';
};

const getTeamScore = (team) => {
  if (!team) return '0';
  if (typeof team === 'object' && team.score !== undefined) return String(team.score);
  if (typeof team === 'number') return String(team);
  return '0';
};

const getGameStatus = (game) => {
  if (game.status === 'Live' || game.status === 'In Progress' || game.status === 'live') return 'live';
  if (game.status === 'Final' || game.status === 'Finished' || game.status === 'final') return 'final';
  if (game.status === 'Scheduled' || game.status === 'Upcoming') return 'upcoming';
  if (game.status === 'Delayed' || game.status === 'Postponed') return 'delayed';
  return 'live'; // Default to live for better UX
};

export default function LiveGamesScreen({ navigation }) {
  const [selectedSport, setSelectedSport] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [liveGames, setLiveGames] = useState([]);
  const [gameStats, setGameStats] = useState({});
  const [liveUpdates, setLiveUpdates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGames, setFilteredGames] = useState([]);
  
  const { searchHistory, addToSearchHistory } = useSearch();
  const sports = ['all', 'NBA', 'NFL', 'NHL', 'MLB'];

  // Enhanced mock data with more realistic live games for each sport
  const mockGamesData = {
    all: [],
    NBA: [
      {
        id: 1,
        sport: 'NBA',
        awayTeam: 'Golden State Warriors',
        homeTeam: 'Los Angeles Lakers',
        awayScore: 105,
        homeScore: 108,
        period: '4th',
        timeRemaining: '2:15',
        status: 'live',
        quarter: '4th',
        channel: 'TNT',
        lastPlay: 'LeBron James makes 3-pointer',
        awayColor: '#1d428a',
        homeColor: '#552583',
        awayRecord: '42-38',
        homeRecord: '43-37',
        arena: 'Crypto.com Arena',
        attendance: '18,997',
        gameClock: '2:15',
        broadcast: { network: 'TNT', stream: 'NBA League Pass' },
        bettingLine: { spread: 'LAL -2.5', total: '225.5' }
      },
      {
        id: 2,
        sport: 'NBA',
        awayTeam: 'Boston Celtics',
        homeTeam: 'Miami Heat',
        awayScore: 112,
        homeScore: 98,
        period: 'Final',
        timeRemaining: '0:00',
        status: 'final',
        quarter: '4th',
        channel: 'ESPN',
        lastPlay: 'Game ended',
        awayColor: '#007a33',
        homeColor: '#98002e',
        awayRecord: '57-25',
        homeRecord: '44-38',
        arena: 'FTX Arena',
        attendance: '19,600',
        gameClock: '0:00',
        broadcast: { network: 'ESPN', stream: 'NBA League Pass' },
        bettingLine: { spread: 'BOS -4.5', total: '218.5' }
      },
      {
        id: 3,
        sport: 'NBA',
        awayTeam: 'Phoenix Suns',
        homeTeam: 'Denver Nuggets',
        awayScore: 95,
        homeScore: 97,
        period: '3rd',
        timeRemaining: '3:45',
        status: 'live',
        quarter: '3rd',
        channel: 'ABC',
        lastPlay: 'Nikola Jokić makes layup',
        awayColor: '#e56020',
        homeColor: '#0e2240',
        awayRecord: '45-37',
        homeRecord: '53-29',
        arena: 'Ball Arena',
        attendance: '19,520',
        gameClock: '3:45',
        broadcast: { network: 'ABC', stream: 'NBA League Pass' },
        bettingLine: { spread: 'DEN -3.5', total: '230.5' }
      },
    ],
    NFL: [
      {
        id: 4,
        sport: 'NFL',
        awayTeam: 'Kansas City Chiefs',
        homeTeam: 'Baltimore Ravens',
        awayScore: 24,
        homeScore: 17,
        period: '4th',
        timeRemaining: '2:34',
        status: 'live',
        quarter: '4th',
        channel: 'CBS',
        lastPlay: 'Patrick Mahomes 15-yard pass',
        awayColor: '#e31837',
        homeColor: '#241773',
        awayRecord: '14-3',
        homeRecord: '13-4',
        stadium: 'M&T Bank Stadium',
        attendance: '71,008',
        gameClock: '2:34',
        broadcast: { network: 'CBS', stream: 'Paramount+' },
        bettingLine: { spread: 'KC -2.5', total: '48.5' },
        possession: 'KC',
        downDistance: '3rd & 7',
        fieldPosition: 'BAL 45'
      },
      {
        id: 5,
        sport: 'NFL',
        awayTeam: 'San Francisco 49ers',
        homeTeam: 'Detroit Lions',
        awayScore: 31,
        homeScore: 28,
        period: 'Final',
        timeRemaining: '0:00',
        status: 'final',
        quarter: 'Final',
        channel: 'FOX',
        lastPlay: 'Game ended',
        awayColor: '#aa0000',
        homeColor: '#0076b6',
        awayRecord: '13-4',
        homeRecord: '12-5',
        stadium: 'Ford Field',
        attendance: '65,000',
        gameClock: '0:00',
        broadcast: { network: 'FOX', stream: 'Fox Sports' },
        bettingLine: { spread: 'SF -3.5', total: '50.5' }
      },
    ],
    NHL: [
      {
        id: 6,
        sport: 'NHL',
        awayTeam: 'Toronto Maple Leafs',
        homeTeam: 'Boston Bruins',
        awayScore: 2,
        homeScore: 1,
        period: '2nd',
        timeRemaining: '8:45',
        status: 'live',
        period: '2nd',
        channel: 'ESPN+',
        lastPlay: 'Auston Matthews goal',
        awayColor: '#003e7e',
        homeColor: '#fcb514',
        awayRecord: '46-26-10',
        homeRecord: '65-12-5',
        arena: 'TD Garden',
        attendance: '17,850',
        gameClock: '8:45',
        broadcast: { network: 'ESPN+', stream: 'ESPN+' },
        bettingLine: { spread: 'BOS -1.5', total: '6.5' },
        powerPlay: { away: false, home: false }
      },
    ],
    MLB: [
      {
        id: 7,
        sport: 'MLB',
        awayTeam: 'New York Yankees',
        homeTeam: 'Boston Red Sox',
        awayScore: 3,
        homeScore: 2,
        inning: '7th',
        status: 'live',
        period: '7th',
        channel: 'MLB Network',
        lastPlay: 'Aaron Judge single',
        awayColor: '#003087',
        homeColor: '#bd3039',
        awayRecord: '82-80',
        homeRecord: '78-84',
        stadium: 'Fenway Park',
        attendance: '37,755',
        gameClock: 'Top 7th',
        broadcast: { network: 'MLB Network', stream: 'MLB.TV' },
        bettingLine: { spread: 'NYY -1.5', total: '8.5' }
      },
    ]
  };

  // Initialize all games
  useEffect(() => {
    const allGames = [];
    ['NBA', 'NFL', 'NHL', 'MLB'].forEach(sport => {
      allGames.push(...mockGamesData[sport]);
    });
    mockGamesData.all = allGames;
  }, []);

  // Get live updates for each sport
  const getLiveUpdatesForSport = (sport) => {
    const updates = [
      { id: 1, sport, time: 'Just now', text: `🔥 Exciting action in ${sport === 'all' ? 'sports' : sport} right now! Check out the live scores.` },
      { id: 2, sport, time: '2 min ago', text: `⚡ Big play just happened in one of the ${sport === 'all' ? 'games' : sport + ' games'}!` },
      { id: 3, sport, time: '5 min ago', text: `🏆 Close game alert in ${sport === 'all' ? 'multiple sports' : sport}! Scores are tight.` },
    ];
    return updates;
  };

  useEffect(() => {
    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Log screen view
    logAnalyticsEvent('live_games_screen_view', {
      sport: selectedSport,
      platform: Platform.OS,
    });

    // Generate initial live updates
    setLiveUpdates(getLiveUpdatesForSport(selectedSport));

    // Simulate live updates every 30 seconds
    const updateInterval = setInterval(() => {
      if (!loading) {
        const newUpdate = {
          id: Date.now(),
          sport: selectedSport,
          time: 'Just now',
          text: `📊 Live stats updated for ${selectedSport === 'all' ? 'all sports' : selectedSport + ' games'}`
        };
        setLiveUpdates(prev => [newUpdate, ...prev.slice(0, 2)]);
      }
    }, 30000);

    return () => clearInterval(updateInterval);
  }, [selectedSport]);

  const loadLiveGames = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get games based on selected sport
      let games = mockGamesData[selectedSport] || [];
      
      setLiveGames(games);
      setFilteredGames(games);
      
      // Calculate game statistics
      const liveGamesCount = games.filter(game => getGameStatus(game) === 'live').length;
      const finalGamesCount = games.filter(game => getGameStatus(game) === 'final').length;
      const totalPoints = games.reduce((sum, game) => 
        sum + (parseInt(getTeamScore(game.awayScore)) || 0) + (parseInt(getTeamScore(game.homeScore)) || 0), 0);
      const averageScore = games.length > 0 ? Math.round(totalPoints / games.length) : 0;

      setGameStats({
        liveCount: liveGamesCount,
        finalCount: finalGamesCount,
        totalGames: games.length,
        totalPoints,
        averageScore
      });
      
    } catch (error) {
      console.error('Error loading live games:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedSport]);

  useEffect(() => {
    loadLiveGames();
  }, [loadLiveGames]);

  // Handle search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    addToSearchHistory(query);
    
    if (!query.trim()) {
      setFilteredGames(liveGames);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = liveGames.filter(game => {
      return (
        (game.awayTeam || '').toLowerCase().includes(lowerQuery) ||
        (game.homeTeam || '').toLowerCase().includes(lowerQuery) ||
        (game.arena || game.stadium || '').toLowerCase().includes(lowerQuery) ||
        (game.channel || '').toLowerCase().includes(lowerQuery) ||
        (game.broadcast?.network || '').toLowerCase().includes(lowerQuery) ||
        (game.sport || '').toLowerCase().includes(lowerQuery)
      );
    });
    
    setFilteredGames(filtered);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await logAnalyticsEvent('live_games_refresh', {
      sport: selectedSport,
      num_games: liveGames.length,
    });
    
    try {
      await loadLiveGames(true);
      // Add a new live update
      const newUpdate = {
        id: Date.now(),
        sport: selectedSport,
        time: 'Just now',
        text: `🔄 Live games refreshed for ${selectedSport === 'all' ? 'all sports' : selectedSport}`
      };
      setLiveUpdates(prev => [newUpdate, ...prev.slice(0, 2)]);
    } catch (error) {
      console.error('Refresh error:', error);
    }
  }, [loadLiveGames, selectedSport, liveGames.length]);

  const handleSportChange = async (sport) => {
    setSelectedSport(sport);
    setSearchQuery('');
    setFilteredGames(mockGamesData[sport] || []);
    
    // Update live updates for new sport
    setLiveUpdates(getLiveUpdatesForSport(sport));
    
    await logAnalyticsEvent('live_games_sport_change', {
      from_sport: selectedSport,
      to_sport: sport,
    });
  };

  const renderGameStatusBadge = (game) => {
    const status = getGameStatus(game);
    const badgeConfig = {
      live: { text: 'LIVE', color: '#ef4444', bgColor: '#fee2e2' },
      final: { text: 'FINAL', color: '#059669', bgColor: '#d1fae5' },
      upcoming: { text: 'UPCOMING', color: '#3b82f6', bgColor: '#dbeafe' },
      delayed: { text: 'DELAYED', color: '#f59e0b', bgColor: '#fef3c7' }
    }[status] || { text: 'LIVE', color: '#ef4444', bgColor: '#fee2e2' };

    return (
      <View style={[styles.statusBadge, { backgroundColor: badgeConfig.bgColor }]}>
        <Text style={[styles.statusBadgeText, { color: badgeConfig.color }]}>
          {badgeConfig.text}
        </Text>
      </View>
    );
  };

  const renderGameItem = ({ item }) => {
    const status = getGameStatus(item);
    const isLive = status === 'live';
    
    return (
      <TouchableOpacity 
        style={styles.gameCard}
        onPress={() => navigation.navigate('GameDetails', { game: item })}
      >
        <View style={styles.gameHeader}>
          <View style={styles.sportBadge}>
            <Text style={styles.sportText}>{item.sport}</Text>
          </View>
          {renderGameStatusBadge(item)}
        </View>
        
        <View style={styles.teamsContainer}>
          <View style={styles.team}>
            <View style={styles.teamInfo}>
              <View style={[styles.teamLogo, { backgroundColor: item.awayColor || '#1d428a' }]} />
              <View style={styles.teamNameContainer}>
                <Text style={styles.teamName} numberOfLines={2}>
                  {getTeamName(item.awayTeam)}
                </Text>
                <Text style={styles.teamRecord}>
                  {item.awayRecord || '0-0'}
                </Text>
              </View>
            </View>
            <Text style={styles.teamScore}>{getTeamScore(item.awayScore)}</Text>
          </View>
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>@</Text>
          </View>
          <View style={styles.team}>
            <View style={styles.teamInfo}>
              <View style={[styles.teamLogo, { backgroundColor: item.homeColor || '#552583' }]} />
              <View style={styles.teamNameContainer}>
                <Text style={styles.teamName} numberOfLines={2}>
                  {getTeamName(item.homeTeam)}
                </Text>
                <Text style={styles.teamRecord}>
                  {item.homeRecord || '0-0'}
                </Text>
              </View>
            </View>
            <Text style={styles.teamScore}>{getTeamScore(item.homeScore)}</Text>
          </View>
        </View>
        
        <View style={styles.gameInfo}>
          <Text style={styles.period}>
            {item.period || item.quarter || item.inning || 'Q1'}
            {isLive && item.timeRemaining && ` • ${item.timeRemaining}`}
          </Text>
          <Text style={styles.arena}>{item.arena || item.stadium || 'Arena'}</Text>
          <Text style={styles.channel}>
            📺 {item.broadcast?.network || item.channel || 'TBD'}
          </Text>
        </View>
        
        {isLive && (
          <View style={styles.liveDetails}>
            {item.lastPlay && (
              <View style={styles.detailRow}>
                <Ionicons name="play-circle" size={14} color="#3b82f6" />
                <Text style={styles.lastPlay} numberOfLines={1}>
                  Last Play: {item.lastPlay}
                </Text>
              </View>
            )}
            
            {item.bettingLine && (
              <View style={styles.bettingInfo}>
                <Text style={styles.bettingText}>
                  📊 {item.bettingLine.spread} • O/U {item.bettingLine.total}
                </Text>
              </View>
            )}
          </View>
        )}
        
        {/* FIXED: Larger, more readable action buttons */}
        <View style={styles.gameFooter}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('GameDetails', { game: item })}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="stats-chart" size={20} color="#3b82f6" />
              <Text style={styles.actionText}>Stats</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.actionDivider} />
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Watch', `Watch ${item.awayTeam} vs ${item.homeTeam} live on ${item.broadcast?.network || item.channel}`)}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="play-circle" size={20} color="#ef4444" />
              <Text style={styles.actionText}>Watch</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.actionDivider} />
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Highlights', `View highlights for ${item.awayTeam} vs ${item.homeTeam}`)}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="videocam" size={20} color="#10b981" />
              <Text style={styles.actionText}>Highlights</Text>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderLiveStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>📈 Live Stats Summary</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{gameStats.liveCount || 0}</Text>
          <Text style={styles.statLabel}>Games Live</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{gameStats.totalPoints || 0}</Text>
          <Text style={styles.statLabel}>Total Points</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{gameStats.averageScore || 0}</Text>
          <Text style={styles.statLabel}>Avg Points</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{gameStats.finalCount || 0}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>
    </View>
  );

  const renderLiveUpdates = () => (
    <View style={styles.updatesContainer}>
      <View style={styles.updatesHeader}>
        <Text style={styles.updatesTitle}>🔄 Live Updates</Text>
        <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
          <View style={styles.refreshButtonSmall}>
            <Ionicons 
              name="refresh" 
              size={16} 
              color={refreshing ? "#94a3b8" : "#3b82f6"} 
            />
            <Text style={[styles.seeAll, { marginLeft: 4 }]}>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={liveUpdates}
        renderItem={({ item }) => (
          <View style={styles.updateCard}>
            <View style={styles.updateHeader}>
              <View style={styles.updateSportBadge}>
                <Text style={styles.updateSportText}>{item.sport === 'all' ? 'ALL' : item.sport}</Text>
              </View>
              <Text style={styles.updateTime}>{item.time}</Text>
            </View>
            <Text style={styles.updateText}>{item.text}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="sad-outline" size={64} color="#94a3b8" />
      <Text style={styles.emptyTitle}>No Games Found</Text>
      <Text style={styles.emptySubtitle}>
        There are no {selectedSport === 'all' ? '' : selectedSport + ' '}games happening right now.
      </Text>
      <Text style={styles.emptyMessage}>
        Check back later or switch to another sport.
      </Text>
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={onRefresh}
        disabled={refreshing}
      >
        <Ionicons name="refresh" size={20} color="white" />
        <Text style={styles.refreshButtonText}>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>Loading Live Games...</Text>
          <Text style={styles.loadingSubtext}>Fetching real-time data</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.liveIndicatorContainer}>
              <Animated.View style={[styles.liveIndicator, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.liveText}>LIVE NOW</Text>
            </View>
            <Text style={styles.headerTitle}>Live Sports Games</Text>
            <Text style={styles.headerSubtitle}>Real-time scores, stats & updates</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Search games, teams, arenas..."
            onSearch={handleSearch}
            searchHistory={searchHistory}
            style={styles.searchBar}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* FIXED: Sport Filters - Better styling for buttons */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Filter by Sport</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.filterScroll}
            contentContainerStyle={styles.filterScrollContent}
          >
            {sports.map((sport) => {
              const liveCount = mockGamesData[sport]?.filter(g => getGameStatus(g) === 'live').length || 0;
              return (
                <TouchableOpacity
                  key={sport}
                  style={[
                    styles.filterButton,
                    selectedSport === sport && styles.activeFilterButton
                  ]}
                  onPress={() => handleSportChange(sport)}
                  activeOpacity={0.7}
                >
                  <View style={styles.filterButtonContent}>
                    <Text style={[
                      styles.filterButtonText,
                      selectedSport === sport && styles.activeFilterButtonText
                    ]}>
                      {sport === 'all' ? 'All Sports' : sport}
                    </Text>
                    {liveCount > 0 && (
                      <View style={styles.liveCountBadge}>
                        <Text style={styles.liveCountText}>{liveCount}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Search Results Info */}
        {searchQuery.trim() && liveGames.length !== filteredGames.length && (
          <View style={styles.searchResultsInfo}>
            <Text style={styles.searchResultsText}>
              {filteredGames.length} of {liveGames.length} games match "{searchQuery}"
            </Text>
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                setFilteredGames(liveGames);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.clearSearchText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ef4444"
              colors={['#ef4444']}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {renderLiveStats()}
          
          <View style={styles.gamesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedSport === 'all' ? 'All Sports' : selectedSport} Games
              </Text>
              <Text style={styles.liveCountDisplay}>
                {gameStats.liveCount || 0} LIVE
              </Text>
            </View>
            
            {filteredGames.length > 0 ? (
              <FlatList
                data={filteredGames}
                renderItem={renderGameItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.gameSeparator} />}
              />
            ) : (
              renderEmptyState()
            )}
          </View>

          {renderLiveUpdates()}
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Data updates every 30 seconds • Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 8,
    color: '#94a3b8',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 32, // Account for back button width
    marginRight: 32, // Account for potential right button
  },
  liveIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 8,
  },
  liveText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1,
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0f172a',
  },
  searchBar: {
    width: '100%',
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  filterSectionTitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
    fontWeight: '500',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterScrollContent: {
    paddingRight: 16,
  },
  filterButton: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: 100,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  liveCountBadge: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveCountText: {
    color: '#0f172a',
    fontSize: 10,
    fontWeight: 'bold',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  searchResultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    marginHorizontal: 16,
    marginTop: 16,
  },
  searchResultsText: {
    fontSize: 14,
    color: '#cbd5e1',
    flex: 1,
  },
  clearSearchText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginLeft: 10,
  },
  statsContainer: {
    margin: 16,
    marginTop: 16,
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 5,
    textAlign: 'center',
  },
  gamesSection: {
    margin: 16,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f8fafc',
  },
  liveCountDisplay: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: 'bold',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gameSeparator: {
    height: 12,
  },
  gameCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sportBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sportText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  team: {
    flex: 1,
    alignItems: 'center',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  teamLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  teamNameContainer: {
    flex: 1,
  },
  teamName: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  teamRecord: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  teamScore: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  vsContainer: {
    paddingHorizontal: 8,
  },
  vsText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: 'bold',
  },
  gameInfo: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    marginBottom: 12,
  },
  period: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
    marginBottom: 4,
  },
  arena: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  channel: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  liveDetails: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lastPlay: {
    fontSize: 13,
    color: '#cbd5e1',
    marginLeft: 8,
    flex: 1,
  },
  bettingInfo: {
    backgroundColor: '#1e293b',
    padding: 8,
    borderRadius: 6,
  },
  bettingText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
  },
  // FIXED: Game footer with larger, more readable buttons
  gameFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 16,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#cbd5e1',
    marginLeft: 8,
    fontWeight: '500',
  },
  actionDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#334155',
    marginHorizontal: 8,
  },
  emptyContainer: {
    backgroundColor: '#1e293b',
    padding: 40,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyTitle: {
    fontSize: 20,
    color: '#f8fafc',
    marginTop: 20,
    marginBottom: 10,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  updatesContainer: {
    margin: 16,
    marginTop: 10,
  },
  updatesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  updatesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
  },
  refreshButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAll: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  updateCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    borderWidth: 1,
    borderColor: '#334155',
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  updateSportBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  updateSportText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  updateTime: {
    fontSize: 10,
    color: '#94a3b8',
  },
  updateText: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});

