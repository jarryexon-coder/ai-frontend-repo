// src/screens/ParlayBuilderScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Share,
  TextInput,
  FlatList,
  Modal,
  SafeAreaView,
} from 'react-native';
import ProgressBar from 'react-native-animated-progress';
import CircularProgress from '../components/CircularProgress';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api-service';
import { useSportsData } from '../hooks/useSportsData';
import SearchBar from '../components/SearchBar';
import { useSearch } from '../providers/SearchProvider';

// NEW: Import navigation helper
import { useAppNavigation } from '../navigation/NavigationHelper';

const { width } = Dimensions.get('window');

// Analytics helper function
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
    }

    // Only use Firebase analytics on web in production mode
    if (Platform.OS === 'web' && !__DEV__ && typeof window !== 'undefined') {
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
        // Firebase analytics error - fail silently in production
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
      // Storage error - fail silently
    }
  } catch (error) {
    // General error - fail silently
  }
};

const ParlayBuilderScreen = () => {
  // NEW: Use the app navigation helper instead of regular useNavigation
  const navigation = useAppNavigation();
  
  const { searchHistory, addToSearchHistory } = useSearch();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [parlays, setParlays] = useState([]);
  const [selectedGames, setSelectedGames] = useState([]);
  const [totalOdds, setTotalOdds] = useState(1.0);
  const [potentialPayout, setPotentialPayout] = useState(0);
  const [wagerAmount, setWagerAmount] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGames, setFilteredGames] = useState([]);

  // Use sports data hook for real-time data
  const { data: sportsData, refreshAllData } = useSportsData({
    autoRefresh: true,
    refreshInterval: 60000
  });

  // NEW: Navigation helper functions
  const handleNavigateToPlayerStats = (player) => {
    navigation.goToPlayerStats();
    logAnalyticsEvent('parlay_navigate_player_stats', {
      player_name: player?.name || 'Unknown',
      screen_name: 'Parlay Builder'
    });
  };

  const handleNavigateToAnalytics = () => {
    navigation.goToAnalytics();
    logAnalyticsEvent('parlay_navigate_analytics', {
      screen_name: 'Parlay Builder'
    });
  };

  const handleNavigateToPredictions = () => {
    navigation.goToPredictions();
    logAnalyticsEvent('parlay_navigate_predictions', {
      screen_name: 'Parlay Builder'
    });
  };

  const handleNavigateToFantasy = () => {
    navigation.goToFantasy();
    logAnalyticsEvent('parlay_navigate_fantasy', {
      screen_name: 'Parlay Builder'
    });
  };

  const handleNavigateToGameDetails = (gameId) => {
    navigation.goToGameDetails(gameId);
    logAnalyticsEvent('parlay_navigate_game_details', {
      game_id: gameId,
      screen_name: 'Parlay Builder'
    });
  };

  const handleNavigateToDailyPicks = () => {
    navigation.goToDailyPicks();
    logAnalyticsEvent('parlay_navigate_daily_picks', {
      screen_name: 'Parlay Builder'
    });
  };

  const handleNavigateToSportsNews = () => {
    navigation.goToSportsNews();
    logAnalyticsEvent('parlay_navigate_sports_news', {
      screen_name: 'Parlay Builder'
    });
  };

  // NEW: Navigation menu component
  const renderNavigationMenu = () => (
    <View style={styles.navigationMenu}>
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => handleNavigateToPlayerStats({ name: 'Player Stats' })}
        activeOpacity={0.7}
      >
        <Ionicons name="stats-chart" size={20} color="#3b82f6" />
        <Text style={styles.navButtonText}>Player Stats</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => handleNavigateToAnalytics()}
        activeOpacity={0.7}
      >
        <Ionicons name="analytics" size={20} color="#3b82f6" />
        <Text style={styles.navButtonText}>Analytics</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => handleNavigateToPredictions()}
        activeOpacity={0.7}
      >
        <Ionicons name="trending-up" size={20} color="#3b82f6" />
        <Text style={styles.navButtonText}>AI Predict</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => handleNavigateToFantasy()}
        activeOpacity={0.7}
      >
        <Ionicons name="trophy" size={20} color="#3b82f6" />
        <Text style={styles.navButtonText}>Fantasy</Text>
      </TouchableOpacity>
    </View>
  );

  // Mock data for games
  const mockGames = [
    { id: 1, homeTeam: 'Lakers', awayTeam: 'Warriors', homeOdds: -150, awayOdds: +130, type: 'NBA', startTime: '7:30 PM ET' },
    { id: 2, homeTeam: 'Chiefs', awayTeam: '49ers', homeOdds: -120, awayOdds: +100, type: 'NFL', startTime: '8:20 PM ET' },
    { id: 3, homeTeam: 'Yankees', awayTeam: 'Red Sox', homeOdds: -110, awayOdds: -110, type: 'MLB', startTime: '7:05 PM ET' },
    { id: 4, homeTeam: 'Bruins', awayTeam: 'Maple Leafs', homeOdds: +120, awayOdds: -140, type: 'NHL', startTime: '7:00 PM ET' },
    { id: 5, homeTeam: 'Heat', awayTeam: 'Celtics', homeOdds: +150, awayOdds: -180, type: 'NBA', startTime: '8:00 PM ET' },
  ];

  // Mock parlay history
  const mockParlays = [
    { id: 1, games: ['Lakers vs Warriors', 'Chiefs vs 49ers'], odds: '+450', stake: 10, potentialPayout: 55, status: 'win' },
    { id: 2, games: ['Heat vs Celtics', 'Yankees vs Red Sox'], odds: '+320', stake: 20, potentialPayout: 84, status: 'loss' },
    { id: 3, games: ['Bruins vs Maple Leafs'], odds: '+120', stake: 15, potentialPayout: 33, status: 'pending' },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get real sports data from hook
      const nbaGames = sportsData?.nba?.games || [];
      const nflGames = sportsData?.nfl?.games || [];
      
      // Combine and process games data
      const combinedGames = [...mockGames];
      setFilteredGames(combinedGames);
      
      // Load parlay history
      setParlays(mockParlays);
      
      // Log screen load
      await logAnalyticsEvent('parlay_builder_screen_view', {
        platform: Platform.OS,
        num_games: combinedGames.length,
        num_parlays: mockParlays.length
      });
      
    } catch (error) {
      Alert.alert('Error', 'Failed to load parlay data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Calculate total odds and potential payout
    const newTotalOdds = selectedGames.reduce((acc, game) => acc * game.odds, 1.0);
    setTotalOdds(newTotalOdds);
    setPotentialPayout(wagerAmount * newTotalOdds);
  }, [selectedGames, wagerAmount]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAllData();
    await loadData();
    
    await logAnalyticsEvent('parlay_refresh', {
      num_selected_games: selectedGames.length,
    });
    
    setRefreshing(false);
  };

  const handleGameSelect = (game) => {
    const isSelected = selectedGames.some(g => g.id === game.id);
    let newSelectedGames;
    
    if (isSelected) {
      newSelectedGames = selectedGames.filter(g => g.id !== game.id);
    } else {
      if (selectedGames.length >= 5) {
        Alert.alert('Limit Reached', 'You can select up to 5 games per parlay.');
        return;
      }
      newSelectedGames = [...selectedGames, { ...game, odds: 1.5 }]; // Mock odds conversion
    }
    
    setSelectedGames(newSelectedGames);
    
    logAnalyticsEvent('parlay_game_select', {
      game_id: game.id,
      game_type: game.type,
      selected_count: newSelectedGames.length,
      action: isSelected ? 'remove' : 'add'
    });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    addToSearchHistory(query);
    
    if (!query.trim()) {
      setFilteredGames(mockGames);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = mockGames.filter(game =>
      game.homeTeam.toLowerCase().includes(lowerQuery) ||
      game.awayTeam.toLowerCase().includes(lowerQuery) ||
      game.type.toLowerCase().includes(lowerQuery)
    );
    
    setFilteredGames(filtered);
  };

  const handlePlaceParlay = () => {
    if (selectedGames.length === 0) {
      Alert.alert('No Games Selected', 'Please select at least one game for your parlay.');
      return;
    }

    Alert.alert(
      'Confirm Parlay',
      `Place $${wagerAmount} on ${selectedGames.length} game(s) with potential payout of $${potentialPayout.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            // Here you would typically make an API call
            const newParlay = {
              id: parlays.length + 1,
              games: selectedGames.map(g => `${g.homeTeam} vs ${g.awayTeam}`),
              odds: `+${Math.round((totalOdds - 1) * 100)}`,
              stake: wagerAmount,
              potentialPayout: Math.round(potentialPayout),
              status: 'pending'
            };
            
            setParlays([newParlay, ...parlays]);
            setSelectedGames([]);
            setWagerAmount(10);
            
            logAnalyticsEvent('parlay_placed', {
              num_games: selectedGames.length,
              total_odds: totalOdds.toFixed(2),
              wager_amount: wagerAmount,
              potential_payout: potentialPayout.toFixed(2)
            });
            
            Alert.alert('Success', 'Your parlay has been placed!');
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#1e40af', '#3b82f6']}
      style={styles.header}
    >
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerSearchButton}
          onPress={async () => {
            await logAnalyticsEvent('parlay_search_toggle', {
              action: 'open_search',
            });
            setSearchModalVisible(true);
          }}
        >
          <Ionicons name="search-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.headerContent}>
        <Text style={styles.title}>Parlay Architect</Text>
        <Text style={styles.subtitle}>Build custom parlays with advanced tools</Text>
        <View style={styles.statsRow}>
          <TouchableOpacity 
            style={styles.stat}
            onPress={() => setShowAnalyticsModal(true)}
          >
            <Ionicons name="analytics" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statText}>Advanced Analytics</Text>
          </TouchableOpacity>
          <View style={styles.stat}>
            <Ionicons name="calculator" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statText}>Live Odds</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="shield-checkmark" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statText}>Risk Management</Text>
          </View>
        </View>
      </View>

      {/* NEW: Add navigation menu to header */}
      <View style={styles.navigationMenuContainer}>
        {renderNavigationMenu()}
      </View>
    </LinearGradient>
  );

  const renderGameCard = (game) => {
    const isSelected = selectedGames.some(g => g.id === game.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.gameCard,
          isSelected && styles.selectedGameCard
        ]}
        onPress={() => handleGameSelect(game)}
        activeOpacity={0.7}
      >
        <View style={styles.gameHeader}>
          <View style={styles.gameTypeBadge}>
            <Text style={styles.gameTypeText}>{game.type}</Text>
          </View>
          <Text style={styles.gameTime}>{game.startTime}</Text>
        </View>
        
        <View style={styles.teamsContainer}>
          <View style={styles.team}>
            <Text style={styles.teamName}>{game.homeTeam}</Text>
            <Text style={[
              styles.odds,
              game.homeOdds > 0 ? styles.positiveOdds : styles.negativeOdds
            ]}>
              {game.homeOdds > 0 ? '+' : ''}{game.homeOdds}
            </Text>
          </View>
          
          <Text style={styles.vsText}>vs</Text>
          
          <View style={styles.team}>
            <Text style={styles.teamName}>{game.awayTeam}</Text>
            <Text style={[
              styles.odds,
              game.awayOdds > 0 ? styles.positiveOdds : styles.negativeOdds
            ]}>
              {game.awayOdds > 0 ? '+' : ''}{game.awayOdds}
            </Text>
          </View>
        </View>
        
        <View style={styles.gameFooter}>
          {isSelected ? (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.selectedText}>Selected</Text>
            </View>
          ) : (
            <Text style={styles.selectText}>Tap to select</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderParlayBuilder = () => (
    <View style={styles.parlayBuilderCard}>
      <View style={styles.cardHeader}>
        <Ionicons name="build" size={24} color="#f59e0b" />
        <Text style={styles.cardTitle}>Parlay Builder</Text>
      </View>
      
      <Text style={styles.cardText}>
        Select games to build your parlay. Up to 5 games per parlay.
      </Text>
      
      {selectedGames.length > 0 && (
        <View style={styles.selectedGamesSection}>
          <Text style={styles.selectedGamesTitle}>Selected Games ({selectedGames.length})</Text>
          {selectedGames.map((game, index) => (
            <View key={game.id} style={styles.selectedGameItem}>
              <Text style={styles.selectedGameText}>
                {game.homeTeam} vs {game.awayTeam}
              </Text>
              <TouchableOpacity 
                onPress={() => handleGameSelect(game)}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.parlayCalculator}>
        <Text style={styles.calculatorTitle}>Parlay Calculator</Text>
        
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Wager Amount: $</Text>
          <TextInput
            style={styles.amountInput}
            value={wagerAmount.toString()}
            onChangeText={(text) => setWagerAmount(Number(text) || 0)}
            keyboardType="numeric"
            placeholder="10"
          />
        </View>
        
        <View style={styles.calculationRow}>
          <View style={styles.calculationItem}>
            <Text style={styles.calculationLabel}>Total Odds</Text>
            <Text style={styles.calculationValue}>
              {totalOdds.toFixed(2)}x
            </Text>
          </View>
          
          <View style={styles.calculationItem}>
            <Text style={styles.calculationLabel}>Potential Payout</Text>
            <Text style={styles.calculationValue}>
              ${potentialPayout.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.placeButton,
          selectedGames.length === 0 && styles.placeButtonDisabled
        ]}
        onPress={handlePlaceParlay}
        disabled={selectedGames.length === 0}
      >
        <Text style={styles.placeButtonText}>
          {selectedGames.length === 0 ? 'Select Games First' : `Place Parlay ($${wagerAmount})`}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderParlayHistory = () => (
    <View style={styles.historyCard}>
      <Text style={styles.sectionTitle}>Recent Parlays</Text>
      
      {parlays.map((parlay) => (
        <View key={parlay.id} style={styles.parlayItem}>
          <View style={styles.parlayInfo}>
            <View style={styles.parlayHeader}>
              <Text style={styles.parlayText}>
                {parlay.games.length} game parlay
              </Text>
              <View style={[
                styles.statusBadge,
                parlay.status === 'win' && styles.statusWin,
                parlay.status === 'loss' && styles.statusLoss,
                parlay.status === 'pending' && styles.statusPending
              ]}>
                <Text style={styles.statusText}>{parlay.status.toUpperCase()}</Text>
              </View>
            </View>
            
            <View style={styles.parlayDetails}>
              <Text style={styles.parlayOdds}>Odds: {parlay.odds}</Text>
              <Text style={styles.parlayStake}>Stake: ${parlay.stake}</Text>
              <Text style={styles.parlayPayout}>
                Payout: ${parlay.potentialPayout}
              </Text>
            </View>
          </View>
          
          <View style={styles.parlayGames}>
            {parlay.games.map((game, index) => (
              <Text key={index} style={styles.gameListItem}>
                • {game}
              </Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderAnalyticsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showAnalyticsModal}
      onRequestClose={() => setShowAnalyticsModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#1e40af', '#3b82f6']}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>Parlay Analytics Dashboard</Text>
            <TouchableOpacity 
              onPress={() => setShowAnalyticsModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.analyticsSection}>
              <Text style={styles.sectionTitle}>📊 Parlay Performance</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{parlays.length}</Text>
                  <Text style={styles.metricLabel}>Total Parlays</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>
                    {parlays.filter(p => p.status === 'win').length}
                  </Text>
                  <Text style={styles.metricLabel}>Wins</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>
                    {parlays.filter(p => p.status === 'loss').length}
                  </Text>
                  <Text style={styles.metricLabel}>Losses</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>
                    {parlays.filter(p => p.status === 'pending').length}
                  </Text>
                  <Text style={styles.metricLabel}>Pending</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.analyticsSection}>
              <Text style={styles.sectionTitle}>🎯 Quick Navigation</Text>
              <View style={styles.quickNavigation}>
                <TouchableOpacity 
                  style={styles.quickNavButton}
                  onPress={() => {
                    setShowAnalyticsModal(false);
                    handleNavigateToAnalytics();
                  }}
                >
                  <Ionicons name="analytics" size={20} color="#3b82f6" />
                  <Text style={styles.quickNavText}>Analytics</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickNavButton}
                  onPress={() => {
                    setShowAnalyticsModal(false);
                    handleNavigateToPredictions();
                  }}
                >
                  <Ionicons name="trending-up" size={20} color="#3b82f6" />
                  <Text style={styles.quickNavText}>AI Predict</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickNavButton}
                  onPress={() => {
                    setShowAnalyticsModal(false);
                    handleNavigateToFantasy();
                  }}
                >
                  <Ionicons name="trophy" size={20} color="#3b82f6" />
                  <Text style={styles.quickNavText}>Fantasy</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickNavButton}
                  onPress={() => {
                    setShowAnalyticsModal(false);
                    handleNavigateToSportsNews();
                  }}
                >
                  <Ionicons name="newspaper" size={20} color="#3b82f6" />
                  <Text style={styles.quickNavText}>News Hub</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.analyticsSection}>
              <Text style={styles.sectionTitle}>💰 Risk Management Tips</Text>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.tipText}>
                    Never bet more than 5% of your bankroll on a single parlay
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.tipText}>
                    Consider limiting parlays to 3-4 games maximum
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.tipText}>
                    Research each game individually before adding to parlay
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowAnalyticsModal(false)}
            >
              <Text style={styles.modalButtonText}>Close Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderSearchModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={searchModalVisible}
      onRequestClose={() => setSearchModalVisible(false)}
    >
      <View style={styles.searchModalContainer}>
        <View style={styles.searchModalHeader}>
          <TouchableOpacity 
            onPress={() => setSearchModalVisible(false)}
            style={styles.modalBackButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Search Games</Text>
        </View>

        <SearchBar
          placeholder="Search teams, leagues..."
          onSearch={handleSearch}
          searchHistory={searchHistory}
          style={styles.gameSearchBar}
        />

        <FlatList
          data={filteredGames}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.searchResultItem}
              onPress={() => {
                handleGameSelect(item);
                setSearchModalVisible(false);
              }}
            >
              <View style={styles.searchResultIcon}>
                <Ionicons name="football" size={20} color="#3b82f6" />
              </View>
              <View style={styles.searchResultContent}>
                <Text style={styles.searchResultTitle}>
                  {item.homeTeam} vs {item.awayTeam}
                </Text>
                <Text style={styles.searchResultSubtitle}>
                  {item.type} • {item.startTime}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.noResults}>
              <Ionicons name="search-outline" size={48} color="#ccc" />
              <Text style={styles.noResultsText}>
                {searchQuery ? 'No games found' : 'Search for games to add to parlay'}
              </Text>
            </View>
          }
        />
      </View>
    </Modal>
  );

  if (loading && filteredGames.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Parlay Builder...</Text>
        <Text style={styles.loadingSubtext}>Fetching live odds and games</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {renderParlayBuilder()}
          
          <View style={styles.gamesSection}>
            <Text style={styles.sectionTitle}>Available Games</Text>
            <Text style={styles.sectionSubtitle}>
              Select up to 5 games for your parlay
            </Text>
            
            {filteredGames.map((game) => renderGameCard(game))}
          </View>
          
          {renderParlayHistory()}
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Odds update in real-time. Gamble responsibly.
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {renderAnalyticsModal()}
      {renderSearchModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  loadingSubtext: {
    marginTop: 5,
    color: '#9ca3af',
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerSearchButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 5,
  },
  navigationMenuContainer: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
  },
  parlayBuilderCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 12,
  },
  cardText: {
    color: '#6b7280',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  selectedGamesSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  selectedGamesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  selectedGameItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  selectedGameText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  parlayCalculator: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  calculatorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: '#4b5563',
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calculationItem: {
    alignItems: 'center',
    flex: 1,
  },
  calculationLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  calculationValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  placeButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  placeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gamesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
  },
  gameCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedGameCard: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  gameTypeBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  gameTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  gameTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  team: {
    alignItems: 'center',
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  vsText: {
    fontSize: 14,
    color: '#9ca3af',
    marginHorizontal: 20,
  },
  odds: {
    fontSize: 16,
    fontWeight: '600',
  },
  positiveOdds: {
    color: '#10b981',
  },
  negativeOdds: {
    color: '#ef4444',
  },
  gameFooter: {
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 6,
  },
  selectText: {
    fontSize: 14,
    color: '#6b7280',
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  parlayItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  parlayInfo: {
    marginBottom: 10,
  },
  parlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  parlayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusWin: {
    backgroundColor: '#d1fae5',
  },
  statusLoss: {
    backgroundColor: '#fee2e2',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  parlayDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  parlayOdds: {
    fontSize: 14,
    color: '#6b7280',
  },
  parlayStake: {
    fontSize: 14,
    color: '#6b7280',
  },
  parlayPayout: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  parlayGames: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  gameListItem: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  modalButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  analyticsSection: {
    marginBottom: 25,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  quickNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  quickNavButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    minWidth: 80,
  },
  quickNavText: {
    fontSize: 12,
    color: '#3b82f6',
    marginTop: 4,
    fontWeight: '500',
  },
  tipsList: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 15,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  searchModalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalBackButton: {
    marginRight: 16,
  },
  gameSearchBar: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchResultIcon: {
    marginRight: 12,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  searchResultSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  noResultsText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
});

export default ParlayBuilderScreen;
