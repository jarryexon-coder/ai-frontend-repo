import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
  RefreshControl,
  FlatList,
  SafeAreaView,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchBar from '../components/SearchBar';
import { useSearch } from '../providers/SearchProvider';
import { useSportsData } from '../hooks/useSportsData';

const { width } = Dimensions.get('window');

// Firebase Analytics helper function
const logAnalyticsEvent = async (eventName, eventParams = {}) => {
  try {
    const eventData = {
      event: eventName,
      params: eventParams,
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
    };

    console.log(`📊 Player Analytics Event: ${eventName}`, eventParams);

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const firebaseApp = await import('firebase/app');
        const firebaseAnalytics = await import('firebase/analytics');
        
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
        
        const analytics = firebaseAnalytics.getAnalytics(app);
        if (analytics) {
          await firebaseAnalytics.logEvent(analytics, eventName, eventParams);
        }
      } catch (firebaseError) {
        console.warn('Firebase analytics error:', firebaseError.message);
      }
    }
    
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

// Enhanced AI Prompt Generator Component
const AIPromptGenerator = ({ playerData, sport }) => {
  const [suggestedPrompts, setSuggestedPrompts] = useState([]);
  const [customPrompt, setCustomPrompt] = useState('');

  useEffect(() => {
    generateSuggestedPrompts();
  }, [playerData, sport]);

  const generateSuggestedPrompts = () => {
    const sportSpecificPrompts = {
      NBA: [
        `Analyze ${playerData?.name}'s fantasy value for next week`,
        `Compare ${playerData?.name}'s performance with similar players`,
        `Predict ${playerData?.name}'s stats for the upcoming game`,
        `What are ${playerData?.name}'s strengths and weaknesses?`,
        `Should I start ${playerData?.name} in my fantasy lineup?`,
        `How does ${playerData?.name} match up against tonight's opponent?`,
        `What is ${playerData?.name}'s injury risk and recovery status?`
      ],
      NFL: [
        `Analyze ${playerData?.name}'s fantasy projection for next week`,
        `How does ${playerData?.name}'s matchup affect his value?`,
        `Predict ${playerData?.name}'s passing/rushing yards`,
        `Should I start ${playerData?.name} in my fantasy lineup?`,
        `What is ${playerData?.name}'s target share percentage?`
      ],
      NHL: [
        `Analyze ${playerData?.name}'s ice time and power play usage`,
        `Predict ${playerData?.name}'s goals and assists`,
        `How does ${playerData?.name}'s line affect his production?`,
        `Should I start ${playerData?.name} in my fantasy lineup?`,
        `What is ${playerData?.name}'s shooting percentage trend?`
      ],
      MLB: [
        `Analyze ${playerData?.name}'s batting average and OPS`,
        `Predict ${playerData?.name}'s home runs and RBIs`,
        `How does ${playerData?.name}'s ballpark affect his stats?`,
        `Should I start ${playerData?.name} in my fantasy lineup?`,
        `What is ${playerData?.name}'s strikeout to walk ratio?`
      ]
    };

    const prompts = sportSpecificPrompts[sport] || sportSpecificPrompts.NBA;
    setSuggestedPrompts(prompts);
  };

  const handlePromptSelect = async (prompt) => {
    await logAnalyticsEvent('ai_prompt_selected', {
      player_name: playerData?.name,
      sport: sport,
      prompt_type: 'suggested',
      prompt_text: prompt,
    });
    console.log('AI Prompt selected:', prompt);
    // Here you would typically trigger the AI analysis with the selected prompt
  };

  const handleCustomPromptSubmit = async () => {
    if (customPrompt.trim()) {
      await logAnalyticsEvent('ai_prompt_submitted', {
        player_name: playerData?.name,
        sport: sport,
        prompt_type: 'custom',
        prompt_text: customPrompt,
      });
      setCustomPrompt('');
      console.log('Custom AI Prompt:', customPrompt);
      // Here you would typically trigger the AI analysis with the custom prompt
    }
  };

  const getSportIcon = () => {
    switch(sport) {
      case 'NBA': return '🏀';
      case 'NFL': return '🏈';
      case 'NHL': return '🏒';
      case 'MLB': return '⚾';
      default: return '🤖';
    }
  };

  return (
    <View style={styles.aiPromptContainer}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.aiPromptGradient}
      >
        <View style={styles.aiPromptHeader}>
          <View style={styles.aiPromptTitleContainer}>
            <Text style={styles.aiPromptTitle}>
              {getSportIcon()} AI Assistant
            </Text>
            <View style={styles.sportBadge}>
              <Text style={styles.sportBadgeText}>{sport}</Text>
            </View>
          </View>
          <Text style={styles.aiPromptSubtitle}>Get personalized insights about this player</Text>
        </View>
      </LinearGradient>
      
      <View style={styles.aiPromptContent}>
        <Text style={styles.promptSectionTitle}>💡 Suggested Questions:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptScroll}>
          {suggestedPrompts.map((prompt, index) => (
            <TouchableOpacity
              key={index}
              style={styles.promptChip}
              onPress={() => handlePromptSelect(prompt)}
            >
              <Ionicons name="sparkles" size={14} color="#667eea" />
              <Text style={styles.promptChipText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <Text style={styles.promptTipsTitle}>✨ Tips for best results:</Text>
        <View style={styles.tipsContainer}>
          <View style={styles.tipItem}>
            <Ionicons name="bulb" size={16} color="#f59e0b" />
            <Text style={styles.tipText}>Ask specific questions about stats or matchups</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="stats-chart" size={16} color="#10b981" />
            <Text style={styles.tipText}>Include timeframes (next game, this week, season)</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="people" size={16} color="#8b5cf6" />
            <Text style={styles.tipText}>Request comparisons with other players</Text>
          </View>
        </View>
        
        <View style={styles.customPromptContainer}>
          <Text style={styles.customPromptLabel}>Ask your own question:</Text>
          <View style={styles.customPromptInput}>
            <Ionicons name="chatbubble-outline" size={20} color="#6b7280" style={styles.promptIcon} />
            <TextInput
              style={styles.customPromptTextInput}
              placeholder={`e.g., How will ${playerData?.name} perform against ${playerData?.team === 'LAL' ? 'GSW' : 'LAL'}?`}
              placeholderTextColor="#9ca3af"
              value={customPrompt}
              onChangeText={setCustomPrompt}
              multiline
              maxLength={200}
            />
            <TouchableOpacity
              style={[styles.submitButton, !customPrompt.trim() && styles.submitButtonDisabled]}
              onPress={handleCustomPromptSubmit}
              disabled={!customPrompt.trim()}
            >
              <Ionicons name="arrow-up" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

// AI Analysis Component - Now Free for All Users
const AIAnalysisSection = ({ playerData, playerStats, sport, navigation }) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🤖 AI Analysis</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={async () => {
            await logAnalyticsEvent('ai_analysis_refresh', {
              player_name: playerData?.name,
              sport: sport,
            });
            // Refresh AI analysis data here
          }}
        >
          <Ionicons name="refresh" size={18} color="#667eea" />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      
      {playerStats?.aiAnalysis ? (
        <View style={styles.analysisCard}>
          <View style={styles.analysisHeader}>
            <Ionicons name="analytics" size={20} color="#667eea" />
            <Text style={styles.analysisTitle}>Tonight's Projection</Text>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>{playerStats.aiAnalysis.confidence}% Confidence</Text>
            </View>
          </View>
          
          <Text style={styles.analysisText}>
            {playerStats.aiAnalysis.projection}
          </Text>
          
          <View style={styles.analysisMetrics}>
            <View style={styles.analysisMetric}>
              <Text style={styles.analysisMetricLabel}>Matchup Rating</Text>
              <Text style={styles.analysisMetricValue}>{playerStats.aiAnalysis.matchupRating}/10</Text>
            </View>
            <View style={styles.analysisMetric}>
              <Text style={styles.analysisMetricLabel}>Fantasy Value</Text>
              <Text style={styles.analysisMetricValue}>{playerStats.aiAnalysis.fantasyValue}/10</Text>
            </View>
            <View style={styles.analysisMetric}>
              <Text style={styles.analysisMetricLabel}>Injury Risk</Text>
              <Text style={[styles.analysisMetricValue, { color: '#10b981' }]}>Low</Text>
            </View>
          </View>

          <View style={styles.keyInsightsContainer}>
            <Text style={styles.keyInsightsTitle}>Key Insights:</Text>
            {playerStats.aiAnalysis.keyInsights.map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>

          <View style={styles.lastUpdatedContainer}>
            <Ionicons name="time-outline" size={14} color="#6b7280" />
            <Text style={styles.lastUpdatedText}>
              Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.noAnalysisContainer}>
          <Ionicons name="analytics-outline" size={48} color="#d1d5db" />
          <Text style={styles.noAnalysisText}>No AI analysis available</Text>
          <Text style={styles.noAnalysisSubtext}>
            AI analysis will be generated before the next game
          </Text>
        </View>
      )}
    </View>
  );
};

// Sport Selector Component for NBA, NFL, NHL, MLB
const SportSelector = ({ activeSport, onSportChange }) => {
  const sports = [
    { id: 'NBA', label: 'NBA', icon: '🏀', color: '#667eea' },
    { id: 'NFL', label: 'NFL', icon: '🏈', color: '#3b82f6' },
    { id: 'NHL', label: 'NHL', icon: '🏒', color: '#8b5cf6' },
    { id: 'MLB', label: 'MLB', icon: '⚾', color: '#ef4444' },
  ];

  return (
    <View style={styles.sportSelectorContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sportSelectorScroll}
      >
        {sports.map((sport) => (
          <TouchableOpacity
            key={sport.id}
            style={[
              styles.sportButton,
              activeSport === sport.id && styles.sportButtonActive,
              { backgroundColor: activeSport === sport.id ? sport.color : '#f8fafc' }
            ]}
            onPress={() => onSportChange(sport.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.sportIcon}>{sport.icon}</Text>
            <Text style={[
              styles.sportLabel,
              activeSport === sport.id && styles.sportLabelActive
            ]}>
              {sport.label}
            </Text>
            {activeSport === sport.id && (
              <View style={styles.activeIndicator} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default function PlayerProfileScreen({ route, navigation }) {
  const { playerData, sport = 'NBA' } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [playerStats, setPlayerStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResultsInfo, setSearchResultsInfo] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeSport, setActiveSport] = useState(sport);
  
  const { searchHistory, addToSearchHistory } = useSearch();
  const { data: sportsData } = useSportsData();

  // Sample players data - IMPORTANT: This should be replaced with actual data from your API/database
  // Adding Tom Brady and other popular players
  const samplePlayers = {
    NFL: [
      { 
        id: 'tom-brady', 
        name: 'Tom Brady', 
        team: 'TB', 
        position: 'QB', 
        number: '12', 
        sport: 'NFL',
        stats: { 
          passingYards: 4752, 
          touchdowns: 40, 
          interceptions: 12, 
          rating: 97.0,
          games: 17 
        },
        fantasyPoints: 285,
        trend: 'stable',
        points: 28.5,
        rebounds: 0,
        assists: 0,
        height: "6'4\"",
        weight: '225 lbs',
        age: '46',
        college: 'Michigan',
        experience: '23rd Season'
      },
      { 
        id: 'patrick-mahomes', 
        name: 'Patrick Mahomes', 
        team: 'KC', 
        position: 'QB', 
        number: '15', 
        sport: 'NFL',
        stats: { passingYards: 5250, touchdowns: 41, interceptions: 12 },
        fantasyPoints: 305,
        trend: 'up'
      },
      { 
        id: 'aaron-rodgers', 
        name: 'Aaron Rodgers', 
        team: 'GB', 
        position: 'QB', 
        number: '12', 
        sport: 'NFL',
        stats: { passingYards: 4115, touchdowns: 37, interceptions: 4 },
        fantasyPoints: 275,
        trend: 'stable'
      },
      { 
        id: 'justin-jefferson', 
        name: 'Justin Jefferson', 
        team: 'MIN', 
        position: 'WR', 
        number: '18', 
        sport: 'NFL',
        stats: { receivingYards: 1809, touchdowns: 8, receptions: 128 },
        fantasyPoints: 240,
        trend: 'up'
      },
      { 
        id: 'travis-kelce', 
        name: 'Travis Kelce', 
        team: 'KC', 
        position: 'TE', 
        number: '87', 
        sport: 'NFL',
        stats: { receivingYards: 1338, touchdowns: 12, receptions: 110 },
        fantasyPoints: 220,
        trend: 'up'
      }
    ],
    NHL: [
      { 
        id: 'connor-mcdavid', 
        name: 'Connor McDavid', 
        team: 'EDM', 
        position: 'C', 
        number: '97', 
        sport: 'NHL',
        stats: { goals: 64, assists: 89, points: 153, shots: 352 },
        fantasyPoints: 350,
        trend: 'up'
      },
      { 
        id: 'auston-matthews', 
        name: 'Auston Matthews', 
        team: 'TOR', 
        position: 'C', 
        number: '34', 
        sport: 'NHL',
        stats: { goals: 60, assists: 46, points: 106, shots: 348 },
        fantasyPoints: 280,
        trend: 'up'
      },
      { 
        id: 'crosby', 
        name: 'Sidney Crosby', 
        team: 'PIT', 
        position: 'C', 
        number: '87', 
        sport: 'NHL',
        stats: { goals: 31, assists: 53, points: 84, shots: 224 },
        fantasyPoints: 220,
        trend: 'stable'
      },
      { 
        id: 'ovechkin', 
        name: 'Alex Ovechkin', 
        team: 'WSH', 
        position: 'LW', 
        number: '8', 
        sport: 'NHL',
        stats: { goals: 42, assists: 33, points: 75, shots: 371 },
        fantasyPoints: 235,
        trend: 'stable'
      },
      { 
        id: 'mackinnon', 
        name: 'Nathan MacKinnon', 
        team: 'COL', 
        position: 'C', 
        number: '29', 
        sport: 'NHL',
        stats: { goals: 42, assists: 69, points: 111, shots: 336 },
        fantasyPoints: 290,
        trend: 'up'
      }
    ],
    MLB: [
      { 
        id: 'ohtani', 
        name: 'Shohei Ohtani', 
        team: 'LAA', 
        position: 'P/DH', 
        number: '17', 
        sport: 'MLB',
        stats: { homeRuns: 34, RBIs: 95, battingAvg: .286, ERA: 3.18, strikeouts: 219 },
        fantasyPoints: 380,
        trend: 'up'
      },
      { 
        id: 'judge', 
        name: 'Aaron Judge', 
        team: 'NYY', 
        position: 'RF', 
        number: '99', 
        sport: 'MLB',
        stats: { homeRuns: 62, RBIs: 131, battingAvg: .311 },
        fantasyPoints: 320,
        trend: 'up'
      },
      { 
        id: 'trout', 
        name: 'Mike Trout', 
        team: 'LAA', 
        position: 'CF', 
        number: '27', 
        sport: 'MLB',
        stats: { homeRuns: 40, RBIs: 80, battingAvg: .283 },
        fantasyPoints: 270,
        trend: 'stable'
      },
      { 
        id: 'harper', 
        name: 'Bryce Harper', 
        team: 'PHI', 
        position: 'RF', 
        number: '3', 
        sport: 'MLB',
        stats: { homeRuns: 18, RBIs: 65, battingAvg: .286 },
        fantasyPoints: 230,
        trend: 'up'
      },
      { 
        id: 'betts', 
        name: 'Mookie Betts', 
        team: 'LAD', 
        position: 'RF', 
        number: '50', 
        sport: 'MLB',
        stats: { homeRuns: 35, RBIs: 82, battingAvg: .269 },
        fantasyPoints: 290,
        trend: 'up'
      }
    ]
  };

  // Combine all players from all sports including sample data
  const getAllPlayers = () => {
    const players = [];
    
    // Add NBA players from sportsData
    if (sportsData.nba?.players) {
      players.push(...sportsData.nba.players.map(p => ({...p, sport: 'NBA'})));
    }
    
    // Add NFL players - combine from sportsData and sample
    if (sportsData.nfl?.players) {
      players.push(...sportsData.nfl.players.map(p => ({...p, sport: 'NFL'})));
    } else {
      // Use sample NFL players if no data available
      players.push(...samplePlayers.NFL);
    }
    
    // Add NHL players - combine from sportsData and sample
    if (sportsData.nhl?.players) {
      players.push(...sportsData.nhl.players.map(p => ({...p, sport: 'NHL'})));
    } else {
      // Use sample NHL players if no data available
      players.push(...samplePlayers.NHL);
    }
    
    // Add MLB players - combine from sportsData and sample
    if (sportsData.mlb?.players) {
      players.push(...sportsData.mlb.players.map(p => ({...p, sport: 'MLB'})));
    } else {
      // Use sample MLB players if no data available
      players.push(...samplePlayers.MLB);
    }
    
    console.log(`Total players available: ${players.length}`);
    console.log(`NFL players: ${players.filter(p => p.sport === 'NFL').length}`);
    console.log(`NHL players: ${players.filter(p => p.sport === 'NHL').length}`);
    console.log(`MLB players: ${players.filter(p => p.sport === 'MLB').length}`);
    
    return players;
  };

  const handlePlayerSearch = useCallback((query) => {
    setSearchQuery(query);
    addToSearchHistory(query);
    
    if (!query.trim()) {
      setShowSearchResults(false);
      setFilteredData([]);
      setSearchResultsInfo('');
      return;
    }
    
    const allPlayers = getAllPlayers();
    console.log(`Searching for "${query}" in ${allPlayers.length} total players`);
    
    const results = allPlayers.filter(player =>
      (player.name || '').toLowerCase().includes(query.toLowerCase()) ||
      (player.team || '').toLowerCase().includes(query.toLowerCase()) ||
      (player.position || '').toLowerCase().includes(query.toLowerCase()) ||
      (player.sport || '').toLowerCase().includes(query.toLowerCase())
    );
    
    console.log(`Found ${results.length} results for "${query}"`);
    
    setFilteredData(results);
    setShowSearchResults(true);
    
    if (results.length === 0) {
      setSearchResultsInfo(`No players found for "${query}"`);
    } else {
      const sportCounts = {};
      results.forEach(player => {
        sportCounts[player.sport] = (sportCounts[player.sport] || 0) + 1;
      });
      const sportInfo = Object.entries(sportCounts).map(([sport, count]) => `${count} ${sport}`).join(', ');
      setSearchResultsInfo(`${results.length} players (${sportInfo}) match "${query}"`);
    }
    
    logAnalyticsEvent('player_profile_search', {
      search_query: query,
      results_count: results.length,
      total_players: allPlayers.length,
      current_player: playerData?.name || 'Unknown',
      current_sport: sport,
    });
  }, [sportsData, addToSearchHistory, playerData, sport]);

  const handleSelectPlayer = (player) => {
    logAnalyticsEvent('player_profile_search_select', {
      selected_player: player.name,
      selected_sport: player.sport,
      previous_player: playerData?.name || 'Unknown',
      previous_sport: sport,
    });
    
    setShowSearchResults(false);
    setSearchQuery('');
    setSearchResultsInfo('');
    setActiveSport(player.sport);
    
    navigation.replace('PlayerProfile', { 
      playerData: player,
      playerName: player.name,
      playerTeam: player.team,
      playerPosition: player.position,
      playerNumber: player.number,
      playerAge: player.age,
      playerHeight: player.height,
      playerWeight: player.weight,
      playerStats: player.stats,
      playerSalary: player.salary,
      playerContract: player.contract,
      playerFantasyPoints: player.fantasyPoints,
      playerHighlights: player.highlights,
      playerTrend: player.trend,
      sport: player.sport || 'NBA',
      playerEfficiency: calculateEfficiency(player.stats, player.sport),
      playerValueScore: calculateValueScore(player, player.sport)
    });
  };

  const calculateEfficiency = (stats, sportType = 'NBA') => {
    if (!stats) return 0;
    
    switch(sportType) {
      case 'NBA':
        return ((stats.points || 0) + (stats.rebounds || 0) + (stats.assists || 0) + 
                (stats.steals || 0) + (stats.blocks || 0)) / (stats.games || 1);
      case 'NFL':
        return ((stats.passingYards || 0) + (stats.rushingYards || 0) + 
                ((stats.touchdowns || 0) * 6)) / (stats.games || 1);
      case 'NHL':
        return ((stats.goals || 0) + (stats.assists || 0) + (stats.shots || 0)) / (stats.games || 1);
      case 'MLB':
        return ((stats.homeRuns || 0) + (stats.RBIs || 0) + (stats.runs || 0)) / (stats.games || 1);
      default:
        return 0;
    }
  };

  const calculateValueScore = (player, sportType = 'NBA') => {
    let score = 0;
    if (player.stats) {
      switch(sportType) {
        case 'NBA':
          score += (player.stats.points || 0) * 2;
          score += (player.stats.rebounds || 0) * 1.2;
          score += (player.stats.assists || 0) * 1.5;
          score += (player.stats.steals || 0) * 3;
          score += (player.stats.blocks || 0) * 3;
          break;
        case 'NFL':
          score += (player.stats.passingYards || 0) * 0.04;
          score += (player.stats.rushingYards || 0) * 0.1;
          score += (player.stats.touchdowns || 0) * 6;
          break;
        case 'NHL':
          score += (player.stats.goals || 0) * 3;
          score += (player.stats.assists || 0) * 2;
          score += (player.stats.shots || 0) * 0.5;
          break;
        case 'MLB':
          score += (player.stats.homeRuns || 0) * 4;
          score += (player.stats.RBIs || 0) * 2;
          score += (player.stats.runs || 0) * 1.5;
          score += (player.stats.stolenBases || 0) * 2;
          break;
      }
    }
    if (player.fantasyPoints) score += player.fantasyPoints * 0.5;
    if (player.trend === 'up') score += 10;
    else if (player.trend === 'down') score -= 5;
    
    return Math.round(score);
  };

  const enhancedPlayerData = {
    name: playerData?.name || 'LeBron James',
    team: playerData?.team || 'LAL',
    position: playerData?.position || 'SF',
    number: playerData?.number || '23',
    height: playerData?.height || "6'9\"",
    weight: playerData?.weight || '250 lbs',
    age: playerData?.age || '39',
    college: playerData?.college || 'St. Vincent-St. Mary HS',
    experience: playerData?.experience || '21st Season',
    points: playerData?.points || playerData?.stats?.points || 25.5,
    rebounds: playerData?.rebounds || playerData?.stats?.rebounds || 7.2,
    assists: playerData?.assists || playerData?.stats?.assists || 6.8,
    steals: playerData?.steals || 1.2,
    blocks: playerData?.blocks || 0.8,
    fgPercentage: playerData?.fgPercentage || 48.5,
    threePercentage: playerData?.threePercentage || 36.8,
    ftPercentage: playerData?.ftPercentage || 75.2,
    efficiency: playerData?.efficiency || calculateEfficiency(playerData?.stats, sport),
    salary: playerData?.salary || '$47.6M',
    contract: playerData?.contract || '2 years',
    fantasyPoints: playerData?.fantasyPoints || 42,
    trend: playerData?.trend || 'stable',
    highlights: playerData?.highlights || ['4x NBA Champion', '4x MVP'],
  };

  useEffect(() => {
    const logScreenView = async () => {
      await logAnalyticsEvent('player_profile_view', {
        player_name: enhancedPlayerData.name,
        player_team: enhancedPlayerData.team,
        player_position: enhancedPlayerData.position,
        sport: sport,
        screen_name: 'PlayerProfileScreen',
        timestamp: new Date().toISOString(),
      });
    };
    
    logScreenView();
    loadPlayerStats();
  }, []);

  const loadPlayerStats = async () => {
    try {
      setLoading(true);
      await logAnalyticsEvent('player_profile_load_stats', {
        player_name: enhancedPlayerData.name,
        sport: sport,
      });
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const stats = {
        seasonAverages: {
          points: enhancedPlayerData.points,
          rebounds: enhancedPlayerData.rebounds,
          assists: enhancedPlayerData.assists,
          steals: enhancedPlayerData.steals,
          blocks: enhancedPlayerData.blocks,
        },
        recentGames: [
          { date: 'Yesterday', opponent: 'vs GSW', points: 28, rebounds: 8, assists: 7, result: 'W' },
          { date: 'Mar 15', opponent: '@ SAC', points: 24, rebounds: 6, assists: 9, result: 'L' },
          { date: 'Mar 13', opponent: 'vs MIL', points: 31, rebounds: 5, assists: 5, result: 'W' },
          { date: 'Mar 10', opponent: '@ MIN', points: 26, rebounds: 9, assists: 8, result: 'L' },
          { date: 'Mar 8', opponent: 'vs PHX', points: 29, rebounds: 7, assists: 6, result: 'W' },
        ],
        aiAnalysis: {
          projection: 'Strong matchup against weak defensive team. Expect above-average scoring.',
          confidence: 82,
          keyInsights: [
            'Excellent in transition offense',
            'Strong finisher at the rim (75% FG within 5ft)',
            'High usage rate leads to consistent production',
            'Veteran leadership boosts team performance in close games'
          ],
          matchupRating: 8.5,
          fantasyValue: 9.2,
        },
        trends: [
          { label: 'Scoring Trend', value: '+2.1', direction: 'up' },
          { label: 'Assist Trend', value: '+0.8', direction: 'up' },
          { label: 'Rebound Trend', value: '-0.3', direction: 'down' },
          { label: 'Efficiency', value: '+1.2', direction: 'up' },
        ]
      };
      
      setPlayerStats(stats);
      setLastUpdated(new Date());
      
      await logAnalyticsEvent('player_profile_stats_loaded', {
        player_name: enhancedPlayerData.name,
        sport: sport,
        stats_count: stats.recentGames.length,
      });
    } catch (error) {
      console.error('Error loading player stats:', error);
      await logAnalyticsEvent('player_profile_load_error', {
        error: error.message,
        player_name: enhancedPlayerData.name,
        sport: sport,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await logAnalyticsEvent('player_profile_refresh', {
      player_name: enhancedPlayerData.name,
      sport: sport,
    });
    await loadPlayerStats();
    setRefreshing(false);
  };

  const handleBackPress = async () => {
    await logAnalyticsEvent('player_profile_back', {
      player_name: enhancedPlayerData.name,
      sport: sport,
      time_spent: Math.floor((new Date() - new Date(lastUpdated)) / 1000) + 's',
    });
    navigation.goBack();
  };

  const toggleFavorite = async () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    await logAnalyticsEvent('player_profile_favorite_toggle', {
      player_name: enhancedPlayerData.name,
      sport: sport,
      is_favorite: newFavoriteState,
    });
  };

  const handleSportChange = (newSport) => {
    setActiveSport(newSport);
    logAnalyticsEvent('player_profile_sport_change', {
      from_sport: activeSport,
      to_sport: newSport,
      player_name: enhancedPlayerData.name,
    });
  };

  const renderSearchBar = () => (
    <View style={styles.searchSection}>
      <SearchBar
        placeholder="Search players from NBA, NFL, NHL, MLB..."
        onSearch={handlePlayerSearch}
        searchHistory={searchHistory}
        value={searchQuery}
        style={styles.homeSearchBar}
      />
      
      {searchQuery.trim() && (
        <View style={styles.searchResultsInfo}>
          <Text style={styles.searchResultsText}>
            {searchResultsInfo}
          </Text>
          <TouchableOpacity 
            onPress={() => {
              setSearchQuery('');
              setShowSearchResults(false);
              setSearchResultsInfo('');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.clearSearchText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderSearchResults = () => {
    if (!showSearchResults) return null;

    return (
      <View style={styles.searchResultsContainer}>
        <View style={styles.searchResultsHeader}>
          <Text style={styles.searchResultsTitle}>
            Search Results ({filteredData.length})
          </Text>
          <TouchableOpacity 
            onPress={() => {
              setShowSearchResults(false);
              setSearchQuery('');
              setSearchResultsInfo('');
            }}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        {filteredData.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={48} color="#ccc" />
            <Text style={styles.noResultsText}>No players found</Text>
            <Text style={styles.noResultsSubtext}>
              Try searching by name, team, or sport
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item, index) => `${item.sport}-${item.id || index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.playerResultItem}
                onPress={() => handleSelectPlayer(item)}
                activeOpacity={0.7}
              >
                <View style={styles.playerResultInfo}>
                  <View style={styles.playerResultHeader}>
                    <Text style={styles.playerResultName}>{item.name}</Text>
                    <View style={[styles.sportBadgeSmall, 
                      { backgroundColor: getSportColor(item.sport) + '20' }]}>
                      <Text style={[styles.sportBadgeTextSmall, 
                        { color: getSportColor(item.sport) }]}>
                        {item.sport}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.playerResultDetails}>
                    {item.team} • {item.position} • {item.stats?.points || item.points || 'N/A'} {getStatUnit(item.sport)}
                  </Text>
                </View>
                <View style={styles.playerResultStats}>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.searchResultsList}
          />
        )}
      </View>
    );
  };

  const getSportColor = (sportType) => {
    switch(sportType) {
      case 'NBA': return '#667eea';
      case 'NFL': return '#3b82f6';
      case 'NHL': return '#8b5cf6';
      case 'MLB': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getHeaderGradient = () => {
    switch(activeSport) {
      case 'NBA': return ['#667eea', '#764ba2'];
      case 'NFL': return ['#3b82f6', '#1e40af'];
      case 'NHL': return ['#8b5cf6', '#7c3aed'];
      case 'MLB': return ['#ef4444', '#dc2626'];
      default: return ['#667eea', '#764ba2'];
    }
  };

  const renderHeader = () => {
    const gradientColors = getHeaderGradient();
    return (
      <View style={[styles.headerContainer, { backgroundColor: gradientColors[0] }]}>
        <LinearGradient
          colors={gradientColors}
          style={styles.headerGradient}
        >
          <SafeAreaView>
            <View style={styles.headerTop}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBackPress}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.sportHeaderBadge}>
                <Text style={styles.sportHeaderBadgeText}>{activeSport}</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={async () => {
                    await logAnalyticsEvent('player_profile_share', {
                      player_name: enhancedPlayerData.name,
                      sport: activeSport,
                    });
                  }}
                >
                  <Ionicons name="share-outline" size={22} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={toggleFavorite}
                >
                  <Ionicons 
                    name={isFavorite ? "star" : "star-outline"} 
                    size={22} 
                    color={isFavorite ? "#fbbf24" : "white"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.playerInfo}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{enhancedPlayerData.name.charAt(0)}</Text>
                </View>
                <View style={styles.playerNumber}>
                  <Text style={styles.playerNumberText}>{enhancedPlayerData.number}</Text>
                </View>
              </View>
              
              <Text style={styles.playerName}>{enhancedPlayerData.name}</Text>
              <Text style={styles.playerTeam}>
                {enhancedPlayerData.team} • {enhancedPlayerData.position} • #{enhancedPlayerData.number}
              </Text>
              
              <View style={styles.playerDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="body" size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.detailText}>{enhancedPlayerData.height} | {enhancedPlayerData.weight}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar" size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.detailText}>{enhancedPlayerData.age} yrs | {enhancedPlayerData.experience}</Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  };

  const renderTabNavigation = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'overview' && styles.tabButtonActive]}
        onPress={() => setActiveTab('overview')}
      >
        <Ionicons 
          name="stats-chart" 
          size={16} 
          color={activeTab === 'overview' ? 'white' : getSportColor(activeSport)} 
        />
        <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
          Overview
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'stats' && styles.tabButtonActive]}
        onPress={() => setActiveTab('stats')}
      >
        <Ionicons 
          name="basketball" 
          size={16} 
          color={activeTab === 'stats' ? 'white' : getSportColor(activeSport)} 
        />
        <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
          Stats
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'trends' && styles.tabButtonActive]}
        onPress={() => setActiveTab('trends')}
      >
        <Ionicons 
          name="trending-up" 
          size={16} 
          color={activeTab === 'trends' ? 'white' : getSportColor(activeSport)} 
        />
        <Text style={[styles.tabText, activeTab === 'trends' && styles.tabTextActive]}>
          Trends
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStatsContent = () => (
    <>
      {/* Sport Selector - New Component */}
      <SportSelector activeSport={activeSport} onSportChange={handleSportChange} />
      
      {/* AI Prompt Generator - Now enhanced with multi-sport support */}
      <AIPromptGenerator playerData={enhancedPlayerData} sport={activeSport} />
      
      {/* Season Stats */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>📊 Season Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={[styles.statBoxContent, { backgroundColor: '#667eea20' }]}>
              <Text style={styles.statValue}>{enhancedPlayerData.points}</Text>
              <Text style={styles.statLabel}>Points</Text>
              <View style={styles.statTrend}>
                <Ionicons name="trending-up" size={14} color="#10b981" />
                <Text style={styles.statTrendText}>+2.1</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.statBox}>
            <View style={[styles.statBoxContent, { backgroundColor: '#667eea20' }]}>
              <Text style={styles.statValue}>{enhancedPlayerData.rebounds}</Text>
              <Text style={styles.statLabel}>Rebounds</Text>
              <View style={styles.statTrend}>
                <Ionicons name="trending-down" size={14} color="#ef4444" />
                <Text style={styles.statTrendText}>-0.3</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.statBox}>
            <View style={[styles.statBoxContent, { backgroundColor: '#667eea20' }]}>
              <Text style={styles.statValue}>{enhancedPlayerData.assists}</Text>
              <Text style={styles.statLabel}>Assists</Text>
              <View style={styles.statTrend}>
                <Ionicons name="trending-up" size={14} color="#10b981" />
                <Text style={styles.statTrendText}>+0.8</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.statBox}>
            <View style={[styles.statBoxContent, { backgroundColor: '#667eea20' }]}>
              <Text style={styles.statValue}>{enhancedPlayerData.efficiency}</Text>
              <Text style={styles.statLabel}>Efficiency</Text>
              <View style={styles.statTrend}>
                <Ionicons name="trending-up" size={14} color="#10b981" />
                <Text style={styles.statTrendText}>+1.2</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.additionalStats}>
          {renderAdditionalStat('FG%', `${enhancedPlayerData.fgPercentage}%`)}
          {renderAdditionalStat('3P%', `${enhancedPlayerData.threePercentage}%`)}
          {renderAdditionalStat('FT%', `${enhancedPlayerData.ftPercentage}%`)}
          {renderAdditionalStat('STL', enhancedPlayerData.steals)}
          {renderAdditionalStat('BLK', enhancedPlayerData.blocks)}
        </View>
      </View>

      {/* AI Analysis - Now Free for All Users */}
      <AIAnalysisSection 
        playerData={enhancedPlayerData} 
        playerStats={playerStats}
        sport={activeSport}
        navigation={navigation}
      />

      {/* Recent Games */}
      {playerStats?.recentGames && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📈 Recent Games</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={async () => {
                await logAnalyticsEvent('player_profile_view_all_games', {
                  player_name: enhancedPlayerData.name,
                  sport: activeSport,
                });
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={getSportColor(activeSport)} />
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.performanceScroll}>
            {playerStats.recentGames.map((game, index) => (
              <View key={index} style={styles.performanceItem}>
                <View style={styles.performanceHeader}>
                  <View>
                    <Text style={styles.performanceDate}>{game.date}</Text>
                    <Text style={styles.performanceOpponent}>{game.opponent}</Text>
                  </View>
                  <View style={[
                    styles.gameResult, 
                    { backgroundColor: game.result === 'W' ? '#10b98120' : '#ef444420' }
                  ]}>
                    <Text style={[
                      styles.gameResultText, 
                      { color: game.result === 'W' ? '#10b981' : '#ef4444' }
                    ]}>
                      {game.result}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.performanceStats}>
                  <View style={styles.statColumn}>
                    <Text style={styles.statColumnLabel}>PTS</Text>
                    <Text style={styles.statColumnValue}>{game.points}</Text>
                  </View>
                  <View style={styles.statColumn}>
                    <Text style={styles.statColumnLabel}>REB</Text>
                    <Text style={styles.statColumnValue}>{game.rebounds}</Text>
                  </View>
                  <View style={styles.statColumn}>
                    <Text style={styles.statColumnLabel}>AST</Text>
                    <Text style={styles.statColumnValue}>{game.assists}</Text>
                  </View>
                  <View style={styles.statColumn}>
                    <Text style={styles.statColumnLabel}>+/-</Text>
                    <Text style={[styles.statColumnValue, { color: game.result === 'W' ? '#10b981' : '#ef4444' }]}>
                      {game.result === 'W' ? '+12' : '-5'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </>
  );

  const renderAdditionalStat = (label, value) => (
    <View style={styles.additionalStat}>
      <View style={[styles.additionalStatContent, { backgroundColor: '#f8fafc' }]}>
        <Text style={styles.additionalStatLabel}>{label}</Text>
        <Text style={styles.additionalStatValue}>{value}</Text>
      </View>
    </View>
  );

  if (loading && !playerStats) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={getSportColor(activeSport)} />
        <Text style={styles.loadingText}>Loading player profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      {renderSearchBar()}
      
      {showSearchResults ? (
        renderSearchResults()
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[getSportColor(activeSport)]}
              tintColor={getSportColor(activeSport)}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderTabNavigation()}
          {renderStatsContent()}
          
          <View style={styles.disclaimer}>
            <Ionicons name="information-circle" size={14} color="#6b7280" />
            <Text style={styles.disclaimerText}>
              Data updates in real-time. AI predictions are for informational purposes only.
              Available for NBA, NFL, NHL, and MLB players. Tom Brady and other players are now included.
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden', // Important for shadow on gradient
  },
  headerGradient: {
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sportHeaderBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  sportHeaderBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#667eea',
  },
  playerNumber: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#ef4444',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  playerNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  playerTeam: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.95)',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  playerDetails: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.95)',
    marginLeft: 10,
    fontWeight: '500',
  },
  searchSection: {
    backgroundColor: '#f8f9fa',
  },
  homeSearchBar: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  searchResultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchResultsText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  clearSearchText: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '600',
  },
  searchResultsContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  searchResultsList: {
    paddingBottom: 20,
  },
  playerResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  playerResultInfo: {
    flex: 1,
    marginRight: 12,
  },
  playerResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  playerResultName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginRight: 8,
  },
  sportBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sportBadgeTextSmall: {
    fontSize: 10,
    fontWeight: '700',
  },
  playerResultDetails: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  playerResultStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6b7280',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  // Sport Selector Styles
  sportSelectorContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: 'transparent',
  },
  sportSelectorScroll: {
    paddingVertical: 8,
  },
  sportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 90,
    position: 'relative',
    backgroundColor: '#f8fafc', // Explicit background color
  },
  sportButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sportIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sportLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
  },
  sportLabelActive: {
    color: 'white',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    marginLeft: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: '#667eea',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
  },
  tabTextActive: {
    color: 'white',
  },
  aiPromptContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  aiPromptGradient: {
    padding: 24,
    backgroundColor: '#667eea', // Fallback color
  },
  aiPromptHeader: {
    alignItems: 'center',
  },
  aiPromptTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 10,
  },
  aiPromptTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
  },
  sportBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  sportBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },
  aiPromptSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  aiPromptContent: {
    padding: 24,
    backgroundColor: 'white',
  },
  promptSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  promptScroll: {
    marginBottom: 24,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  promptChipText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    maxWidth: 250,
    fontWeight: '500',
  },
  promptTipsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  tipsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
    fontWeight: '500',
  },
  customPromptContainer: {
    marginTop: 8,
  },
  customPromptLabel: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 12,
    fontWeight: '600',
  },
  customPromptInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  promptIcon: {
    marginRight: 12,
  },
  customPromptTextInput: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    minHeight: 40,
    maxHeight: 80,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#667eea',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  refreshText: {
    fontSize: 14,
    color: '#667eea',
    marginLeft: 6,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  viewAllText: {
    fontSize: 14,
    color: '#667eea',
    marginRight: 4,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    backgroundColor: 'white', // Added solid background
  },
  statBoxContent: {
    padding: 24,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#667eea',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 16,
    fontWeight: '600',
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(102,126,234,0.1)',
  },
  statTrendText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
    fontWeight: '600',
  },
  additionalStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  additionalStat: {
    width: '18%',
    alignItems: 'center',
    marginBottom: 8,
  },
  additionalStatContent: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: '100%',
  },
  additionalStatLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 6,
    fontWeight: '600',
  },
  additionalStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1f2937',
  },
  analysisCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    marginLeft: 12,
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  confidenceText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '700',
  },
  analysisText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 26,
    marginBottom: 24,
    fontWeight: '500',
  },
  analysisMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 28,
  },
  analysisMetric: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 16,
    flex: 1,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  analysisMetricLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '600',
  },
  analysisMetricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#667eea',
  },
  keyInsightsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  keyInsightsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 15,
    color: '#4b5563',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
    fontWeight: '500',
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  lastUpdatedText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  noAnalysisContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  noAnalysisText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6b7280',
    marginTop: 20,
  },
  noAnalysisSubtext: {
    fontSize: 15,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  performanceScroll: {
    marginTop: 8,
  },
  performanceItem: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    minWidth: 280,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  performanceDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  performanceOpponent: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 4,
    fontWeight: '500',
  },
  gameResult: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  gameResultText: {
    fontSize: 14,
    fontWeight: '700',
  },
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statColumn: {
    alignItems: 'center',
  },
  statColumnLabel: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 8,
    fontWeight: '600',
  },
  statColumnValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 40,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'flex-start',
  },
  disclaimerText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
    marginLeft: 12,
    lineHeight: 22,
    fontWeight: '500',
  },
});

// Helper function to get stat unit based on sport
const getStatUnit = (sport) => {
  switch(sport) {
    case 'NBA': return 'PPG';
    case 'NFL': return 'YPG';
    case 'NHL': return 'PTS';
    case 'MLB': return 'AVG';
    default: return '';
  }
};
