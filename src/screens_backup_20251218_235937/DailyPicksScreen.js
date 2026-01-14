// src/screens/DailyPicksScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SectionList,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';

const { width } = Dimensions.get('window');

export default function DailyPicksScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('NBA');
  const [timeFilter, setTimeFilter] = useState('today');
  const [picks, setPicks] = useState([]);
  const [aiPredictions, setAiPredictions] = useState([]);
  const [expertPicks, setExpertPicks] = useState([]);
  const [lockStreak, setLockStreak] = useState(0);
  const [successRate, setSuccessRate] = useState(72);

  const sports = ['NBA', 'NHL', 'NFL'];
  const timeFilters = [
    { id: 'today', label: 'Today' },
    { id: 'tomorrow', label: 'Tomorrow' },
    { id: 'week', label: 'This Week' },
  ];

  useEffect(() => {
    loadDailyPicks();
  }, [selectedSport, timeFilter]);

  const loadDailyPicks = async () => {
    try {
      setLoading(true);
      
      // In production, this would call your backend API
      // For now, we'll use mock data
      const mockPicks = getMockPicks();
      const mockAiPredictions = getMockAiPredictions();
      const mockExpertPicks = getMockExpertPicks();
      
      setPicks(mockPicks);
      setAiPredictions(mockAiPredictions);
      setExpertPicks(mockExpertPicks);
      
      // Simulate loading delay
      setTimeout(() => {
        setLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error loading picks:', error);
      setLoading(false);
    }
  };

  const getMockPicks = () => [
    {
      id: 1,
      type: 'player',
      sport: 'NBA',
      name: 'Nikola Jokic',
      team: 'DEN',
      position: 'C',
      opponent: 'vs LAL',
      projection: '32.5 PTS, 12.5 REB, 9.8 AST',
      confidence: 92,
      reasoning: 'Dominant matchup vs Lakers weak interior defense',
      status: 'pending',
      value: '+120',
      last5: ['W', 'W', 'L', 'W', 'W'],
    },
    {
      id: 2,
      type: 'team',
      sport: 'NBA',
      name: 'Boston Celtics',
      opponent: '@ MIA',
      projection: 'Celtics -6.5',
      confidence: 85,
      reasoning: 'Heat missing key players, Celtics on 5-game win streak',
      status: 'pending',
      value: '-110',
      last5: ['W', 'W', 'W', 'L', 'W'],
    },
    {
      id: 3,
      type: 'player',
      sport: 'NFL',
      name: 'Patrick Mahomes',
      team: 'KC',
      position: 'QB',
      opponent: 'vs BUF',
      projection: '285 YDS, 3 TD, 0 INT',
      confidence: 88,
      reasoning: 'Prime time game at home, favorable matchup',
      status: 'pending',
      value: '+150',
      last5: ['W', 'L', 'W', 'W', 'W'],
    },
    {
      id: 4,
      type: 'player',
      sport: 'NHL',
      name: 'Connor McDavid',
      team: 'EDM',
      position: 'C',
      opponent: 'vs TOR',
      projection: '2.5 PTS, 1 GOAL, 1.5 AST',
      confidence: 90,
      reasoning: 'Toronto weak penalty kill, McDavid hot streak',
      status: 'pending',
      value: '+180',
      last5: ['W', 'W', 'W', 'W', 'L'],
    },
    {
      id: 5,
      type: 'team',
      sport: 'NFL',
      name: 'San Francisco 49ers',
      opponent: 'vs SEA',
      projection: '49ers -7.5',
      confidence: 82,
      reasoning: 'Home field advantage, Seattle struggling on road',
      status: 'pending',
      value: '-125',
      last5: ['W', 'W', 'L', 'W', 'W'],
    },
  ];

  const getMockAiPredictions = () => [
    {
      id: 101,
      name: 'Luka Doncic',
      stat: 'Over 34.5 Points',
      probability: 78,
      aiModel: 'Deep Learning v3',
      edge: 'High',
      historical: '12-3 in last 15',
    },
    {
      id: 102,
      name: 'LeBron James',
      stat: 'Double-Double',
      probability: 72,
      aiModel: 'Neural Network v2',
      edge: 'Medium',
      historical: '8-2 in last 10',
    },
    {
      id: 103,
      name: 'Giannis Antetokounmpo',
      stat: 'Over 30 PTS + 10 REB',
      probability: 81,
      aiModel: 'Ensemble Model',
      edge: 'Very High',
      historical: '10-1 in last 11',
    },
  ];

  const getMockExpertPicks = () => [
    {
      id: 201,
      expert: 'ESPN Analytics',
      pick: 'Bucks -4.5',
      confidence: 88,
      record: '64-36',
      analysis: 'Mathematical model shows 72% chance of covering',
    },
    {
      id: 202,
      expert: 'CBS Sports',
      pick: 'Nuggets ML',
      confidence: 85,
      record: '58-42',
      analysis: 'Home court advantage key factor',
    },
    {
      id: 203,
      expert: 'The Athletic',
      pick: 'Warriors Over 118.5',
      confidence: 79,
      record: '61-39',
      analysis: 'Warriors pace favors high scoring',
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDailyPicks();
    setRefreshing(false);
  };

  const lockPick = (pick) => {
    Alert.alert(
      'Lock Pick',
      `Confirm locking ${pick.type === 'player' ? pick.name : pick.name} as your pick?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Lock It',
          style: 'default',
          onPress: () => {
            Alert.alert('Pick Locked!', 'Good luck!');
            // In production: Save to user's locked picks
          },
        },
      ]
    );
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 85) return '#34C759';
    if (confidence >= 75) return '#FFD60A';
    return '#FF3B30';
  };

  const getValueColor = (value) => {
    if (value.startsWith('+')) return '#34C759';
    return '#FF3B30';
  };

  const getEdgeBadge = (edge) => {
    switch (edge) {
      case 'Very High': return '#34C759';
      case 'High': return '#8CD97F';
      case 'Medium': return '#FFD60A';
      case 'Low': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  const renderPickItem = ({ item }) => (
    <View style={styles.pickCard}>
      {/* Header */}
      <View style={styles.pickHeader}>
        <View style={styles.pickTitle}>
          <View style={[styles.sportBadge, { backgroundColor: getSportColor(item.sport) }]}>
            <Text style={styles.sportBadgeText}>{item.sport}</Text>
          </View>
          <View style={styles.pickType}>
            <Ionicons
              name={item.type === 'player' ? 'person' : 'people'}
              size={14}
              color="#8E8E93"
            />
            <Text style={styles.pickTypeText}>
              {item.type === 'player' ? 'PLAYER' : 'TEAM'} LOCK
            </Text>
          </View>
        </View>
        <View style={styles.confidenceCircle}>
          <Text style={[styles.confidenceText, { color: getConfidenceColor(item.confidence) }]}>
            {item.confidence}%
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.pickContent}>
        <View style={styles.pickMain}>
          <Text style={styles.pickName}>{item.name}</Text>
          {item.type === 'player' ? (
            <Text style={styles.pickDetails}>
              {item.position} • {item.team} • {item.opponent}
            </Text>
          ) : (
            <Text style={styles.pickDetails}>{item.opponent}</Text>
          )}
          <Text style={styles.pickProjection}>{item.projection}</Text>
        </View>
        
        <View style={styles.valueContainer}>
          <Text style={[styles.valueText, { color: getValueColor(item.value) }]}>
            {item.value}
          </Text>
          <Text style={styles.valueLabel}>VALUE</Text>
        </View>
      </View>

      {/* Reasoning */}
      <View style={styles.reasoningContainer}>
        <Ionicons name="bulb-outline" size={16} color="#FFD60A" />
        <Text style={styles.reasoningText}>{item.reasoning}</Text>
      </View>

      {/* Stats & Action */}
      <View style={styles.pickFooter}>
        <View style={styles.streakContainer}>
          <Text style={styles.streakLabel}>Last 5:</Text>
          <View style={styles.streakIcons}>
            {item.last5.map((result, idx) => (
              <View
                key={idx}
                style={[
                  styles.streakIcon,
                  { backgroundColor: result === 'W' ? '#34C759' : '#FF3B30' },
                ]}
              >
                <Text style={styles.streakIconText}>{result}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.lockButton}
          onPress={() => lockPick(item)}
        >
          <Ionicons name="lock-closed" size={16} color="#fff" />
          <Text style={styles.lockButtonText}>LOCK PICK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAiPrediction = ({ item }) => (
    <View style={styles.aiCard}>
      <View style={styles.aiHeader}>
        <View>
          <Text style={styles.aiName}>{item.name}</Text>
          <Text style={styles.aiStat}>{item.stat}</Text>
        </View>
        <View style={styles.probabilityBadge}>
          <Text style={styles.probabilityText}>{item.probability}%</Text>
        </View>
      </View>
      
      <View style={styles.aiDetails}>
        <View style={styles.aiModel}>
          <Text style={styles.aiModelLabel}>AI Model:</Text>
          <Text style={styles.aiModelValue}>{item.aiModel}</Text>
        </View>
        
        <View style={[styles.edgeBadge, { backgroundColor: getEdgeBadge(item.edge) }]}>
          <Text style={styles.edgeText}>{item.edge} Edge</Text>
        </View>
      </View>
      
      <Text style={styles.aiHistorical}>{item.historical}</Text>
    </View>
  );

  const renderExpertPick = ({ item }) => (
    <View style={styles.expertCard}>
      <View style={styles.expertHeader}>
        <View style={styles.expertInfo}>
          <Text style={styles.expertName}>{item.expert}</Text>
          <Text style={styles.expertRecord}>{item.record} Season Record</Text>
        </View>
        <View style={styles.expertConfidence}>
          <Text style={styles.expertConfidenceText}>{item.confidence}%</Text>
        </View>
      </View>
      
      <Text style={styles.expertPick}>{item.pick}</Text>
      <Text style={styles.expertAnalysis}>{item.analysis}</Text>
      
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>Follow This Expert</Text>
      </TouchableOpacity>
    </View>
  );

  const getSportColor = (sport) => {
    switch (sport) {
      case 'NBA': return '#1D428A';
      case 'NFL': return '#013369';
      case 'NHL': return '#FF4C00';
      default: return '#8E8E93';
    }
  };

  const StatsHeader = () => (
    <View style={styles.statsHeader}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{successRate}%</Text>
        <Text style={styles.statLabel}>Success Rate</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{lockStreak}</Text>
        <Text style={styles.statLabel}>Win Streak</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>+12.4U</Text>
        <Text style={styles.statLabel}>Net Profit</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="stats-chart" size={64} color="#007AFF" />
          <Text style={styles.loadingText}>Loading Daily Picks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔒 Daily Picks</Text>
          <Text style={styles.headerSubtitle}>AI-Powered High-Probability Locks</Text>
        </View>

        {/* Stats Overview */}
        <StatsHeader />

        {/* Sport Selection */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sportFilter}
        >
          {sports.map((sport) => (
            <TouchableOpacity
              key={sport}
              style={[
                styles.sportButton,
                selectedSport === sport && styles.sportButtonActive,
              ]}
              onPress={() => setSelectedSport(sport)}
            >
              <Text
                style={[
                  styles.sportButtonText,
                  selectedSport === sport && styles.sportButtonTextActive,
                ]}
              >
                {sport}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Time Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.timeFilter}
        >
          {timeFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.timeButton,
                timeFilter === filter.id && styles.timeButtonActive,
              ]}
              onPress={() => setTimeFilter(filter.id)}
            >
              <Text
                style={[
                  styles.timeButtonText,
                  timeFilter === filter.id && styles.timeButtonTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Locks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Top Locks of the Day</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {picks
            .filter(pick => pick.sport === selectedSport)
            .map(pick => (
              <View key={pick.id}>
                {renderPickItem({ item: pick })}
              </View>
            ))}
        </View>

        {/* AI Predictions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🤖 AI Model Predictions</Text>
            <Ionicons name="sparkles" size={20} color="#FFD60A" />
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {aiPredictions.map(prediction => (
              <View key={prediction.id} style={styles.horizontalCard}>
                {renderAiPrediction({ item: prediction })}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Expert Consensus */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 Expert Consensus</Text>
            <Text style={styles.expertCount}>3 Experts</Text>
          </View>
          
          {expertPicks.map(expert => (
            <View key={expert.id}>
              {renderExpertPick({ item: expert })}
            </View>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Ionicons name="trending-up" size={24} color="#34C759" />
            <Text style={styles.quickStatNumber}>78%</Text>
            <Text style={styles.quickStatLabel}>Avg. Confidence</Text>
          </View>
          <View style={styles.quickStat}>
            <Ionicons name="time" size={24} color="#FF9500" />
            <Text style={styles.quickStatNumber}>14-6</Text>
            <Text style={styles.quickStatLabel}>Last 20 Picks</Text>
          </View>
          <View style={styles.quickStat}>
            <Ionicons name="trophy" size={24} color="#FFD60A" />
            <Text style={styles.quickStatNumber}>#1</Text>
            <Text style={styles.quickStatLabel}>Community Rank</Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ These are predictions, not guarantees. Please gamble responsibly.
            Must be 21+ to participate where legal.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    fontSize: 18,
    color: '#8E8E93',
    marginTop: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  statsHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E5E5EA',
    marginHorizontal: 10,
  },
  sportFilter: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sportButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#E5E5EA',
    borderRadius: 20,
    marginRight: 10,
  },
  sportButtonActive: {
    backgroundColor: '#007AFF',
  },
  sportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  sportButtonTextActive: {
    color: '#fff',
  },
  timeFilter: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  timeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  timeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  timeButtonTextActive: {
    color: '#fff',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  seeAll: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  pickCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pickHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  sportBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  pickType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8E93',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  confidenceCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  pickContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickMain: {
    flex: 1,
  },
  pickName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  pickDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  pickProjection: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  valueContainer: {
    alignItems: 'center',
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  valueLabel: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 2,
  },
  reasoningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  reasoningText: {
    fontSize: 13,
    color: '#8A6800',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  pickFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginRight: 8,
  },
  streakIcons: {
    flexDirection: 'row',
  },
  streakIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  streakIconText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  lockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  lockButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  aiCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: width * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  aiStat: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  probabilityBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  probabilityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  aiDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiModel: {
    flex: 1,
  },
  aiModelLabel: {
    fontSize: 10,
    color: '#8E8E93',
    marginBottom: 2,
  },
  aiModelValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  edgeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  edgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  aiHistorical: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  horizontalScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  horizontalCard: {
    marginRight: 12,
  },
  expertCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  expertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expertInfo: {
    flex: 1,
  },
  expertName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  expertRecord: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  expertConfidence: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  expertConfidenceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  expertPick: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  expertAnalysis: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 12,
  },
  followButton: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 8,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  disclaimer: {
    backgroundColor: '#FFF2F2',
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD1D1',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#D32F2F',
    textAlign: 'center',
    lineHeight: 16,
  },
  expertCount: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
});
