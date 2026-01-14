import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import apiService from '../services/api-service';
import usePremiumAccess from '../hooks/usePremiumAccess';
import PremiumAccessPaywall from './PremiumAccessPaywall';

const { width } = Dimensions.get('window');

const AnalyticsScreen = () => {
  const { hasAccess, loading: accessLoading } = usePremiumAccess();
  const [showPaywall, setShowPaywall] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('NBA');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  
  const [sportsData, setSportsData] = useState({
    NBA: {
      overview: {
        totalGames: 1230,
        avgPoints: 112.4,
        homeWinRate: '58.2%',
        avgMargin: 11.8,
        overUnder: '54% Over',
        keyTrend: 'Points up +3.2% from last season',
      },
      teams: {
        bestOffense: 'Milwaukee Bucks (118.3 PPG)',
        bestDefense: 'Cleveland Cavaliers (106.9 PPG)',
        mostImproved: 'Oklahoma City Thunder (+12 wins)',
        surpriseTeam: 'Orlando Magic',
      },
      players: {
        scoringLeader: 'Luka Dončić (34.6 PPG)',
        efficiencyLeader: 'Nikola Jokić (32.8 PER)',
        clutchPlayer: 'Stephen Curry (58% FG in clutch)',
        risingStar: 'Anthony Edwards',
      },
      trends: [
        { name: '3-Point Attempts', value: 35.2, change: '+4.8%', direction: 'up' },
        { name: 'Free Throw Rate', value: 0.218, change: '-2.1%', direction: 'down' },
        { name: 'Pace', value: 99.3, change: '+1.2%', direction: 'up' },
        { name: 'Turnovers', value: 13.8, change: '-0.8%', direction: 'down' },
      ],
      predictions: [
        { game: 'Lakers vs Warriors', prediction: 'Warriors -4.5', confidence: 72 },
        { game: 'Celtics vs Heat', prediction: 'Over 215.5', confidence: 68 },
        { game: 'Nuggets vs Suns', prediction: 'Nuggets ML', confidence: 81 },
      ],
    },
    NFL: {
      overview: {
        totalGames: 272,
        avgPoints: 43.8,
        homeWinRate: '55.1%',
        avgMargin: 10.2,
        overUnder: '48% Over',
        keyTrend: 'Passing yards up +7.1%',
      },
      teams: {
        bestOffense: 'Miami Dolphins (29.9 PPG)',
        bestDefense: 'Baltimore Ravens (16.1 PPG)',
        mostImproved: 'Houston Texans (+7 wins)',
        surpriseTeam: 'Detroit Lions',
      },
      players: {
        passingLeader: 'Dak Prescott (4,516 yards)',
        rushingLeader: 'Christian McCaffrey (1,459 yards)',
        receivingLeader: 'Tyreek Hill (1,799 yards)',
        defensivePlayer: 'Myles Garrett (14 sacks)',
      },
      trends: [
        { name: 'Pass Attempts', value: 34.8, change: '+3.2%', direction: 'up' },
        { name: 'Run Rate', value: 42.1, change: '-1.8%', direction: 'down' },
        { name: 'Red Zone Efficiency', value: '55.2%', change: '+2.4%', direction: 'up' },
        { name: 'Turnovers', value: 1.9, change: '-0.3%', direction: 'down' },
      ],
      predictions: [
        { game: 'Chiefs vs Bills', prediction: 'Bills +2.5', confidence: 65 },
        { game: '49ers vs Cowboys', prediction: 'Under 48.5', confidence: 71 },
        { game: 'Eagles vs Seahawks', prediction: 'Eagles -3', confidence: 69 },
      ],
    },
    NHL: {
      overview: {
        totalGames: 1312,
        avgGoals: 6.1,
        homeWinRate: '53.8%',
        avgMargin: 2.4,
        overUnder: '52% Over',
        keyTrend: 'Power play success up +2.8%',
      },
      teams: {
        bestOffense: 'Colorado Avalanche (3.68 GPG)',
        bestDefense: 'Boston Bruins (2.12 GAA)',
        mostImproved: 'New Jersey Devils (+22 points)',
        surpriseTeam: 'Seattle Kraken',
      },
      players: {
        scoringLeader: 'Connor McDavid (153 points)',
        goalLeader: 'Auston Matthews (69 goals)',
        assistLeader: 'Leon Draisaitl (86 assists)',
        goalieLeader: 'Linus Ullmark (.938 SV%)',
      },
      trends: [
        { name: 'Power Play %', value: '22.7%', change: '+2.8%', direction: 'up' },
        { name: 'Penalty Kill %', value: '82.1%', change: '+1.2%', direction: 'up' },
        { name: 'Shots per Game', value: 31.4, change: '+0.8%', direction: 'up' },
        { name: 'Hits per Game', value: 21.8, change: '-1.1%', direction: 'down' },
      ],
      predictions: [
        { game: 'Maple Leafs vs Canadiens', prediction: 'Maple Leafs -1.5', confidence: 75 },
        { game: 'Bruins vs Rangers', prediction: 'Over 6.0', confidence: 63 },
        { game: 'Oilers vs Golden Knights', prediction: 'Oilers ML', confidence: 70 },
      ],
    },
  });

  const sports = ['NBA', 'NFL', 'NHL', 'MLB'];
  const metrics = ['overview', 'teams', 'players', 'trends', 'predictions'];

  const loadData = async () => {
    try {
      console.log(`📈 Loading ${selectedSport} analytics...`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
    } catch (error) {
      console.log('Error loading analytics:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      loadData();
    }
  }, [selectedSport, hasAccess]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Premium Access Check
  if (accessLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#14b8a6" />
        <Text style={styles.loadingText}>Checking access...</Text>
      </View>
    );
  }

  if (!hasAccess) {
    return (
      <View style={styles.accessDenied}>
        <Ionicons name="lock-closed" size={60} color="#14b8a6" />
        <Text style={styles.accessTitle}>Premium Access Required</Text>
        <Text style={styles.accessDescription}>
          Advanced analytics are part of our Premium Access subscription.
        </Text>
        <Text style={styles.accessFeatures}>
          Get access to analytics along with NFL, Fantasy, News & Live Games
        </Text>
        <TouchableOpacity 
          style={styles.upgradeButton}
          onPress={() => setShowPaywall(true)}
        >
          <Text style={styles.upgradeButtonText}>Unlock Premium Access</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.restoreButton}
          onPress={async () => {
            const result = await revenueCatService.restorePurchases();
            if (result.success && result.restoredEntitlements.includes('premium_access')) {
              Alert.alert('Success', 'Premium Access restored!');
            } else {
              Alert.alert('No Premium Found', 'No active Premium Access subscription found.');
            }
          }}
        >
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>
        
        <PremiumAccessPaywall 
          visible={showPaywall} 
          onClose={() => setShowPaywall(false)} 
        />
      </View>
    );
  }

  // Original Analytics Screen content continues here...
  const renderHeader = () => (
    <LinearGradient
      colors={['#0f766e', '#14b8a6']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={styles.title}>Sports Analytics Pro</Text>
        <Text style={styles.subtitle}>Advanced metrics & performance insights</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.sportsScroll}
      >
        {sports.map((sport) => (
          <TouchableOpacity
            key={sport}
            style={[
              styles.sportButton,
              selectedSport === sport && styles.activeSportButton
            ]}
            onPress={() => {
              setSelectedSport(sport);
              setSelectedMetric('overview');
            }}
          >
            <Text style={[
              styles.sportText,
              selectedSport === sport && styles.activeSportText
            ]}>
              {sport}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );

  const renderMetricTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.metricsScroll}
    >
      {metrics.map((metric) => (
        <TouchableOpacity
          key={metric}
          style={[
            styles.metricTab,
            selectedMetric === metric && styles.activeMetricTab
          ]}
          onPress={() => setSelectedMetric(metric)}
        >
          <Text style={[
            styles.metricText,
            selectedMetric === metric && styles.activeMetricText
          ]}>
            {metric.charAt(0).toUpperCase() + metric.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderOverview = () => {
    const data = sportsData[selectedSport]?.overview || {};
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{selectedSport} Season Overview</Text>
        <View style={styles.overviewGrid}>
          <View style={styles.overviewCard}>
            <Ionicons name="stats-chart" size={24} color="#3b82f6" />
            <Text style={styles.overviewNumber}>{data.totalGames || 0}</Text>
            <Text style={styles.overviewLabel}>Total Games</Text>
          </View>
          
          <View style={styles.overviewCard}>
            <Ionicons name="trending-up" size={24} color="#10b981" />
            <Text style={styles.overviewNumber}>{data.avgPoints || '0'}</Text>
            <Text style={styles.overviewLabel}>Avg Points</Text>
          </View>
          
          <View style={styles.overviewCard}>
            <Ionicons name="home" size={24} color="#f59e0b" />
            <Text style={styles.overviewNumber}>{data.homeWinRate || '0%'}</Text>
            <Text style={styles.overviewLabel}>Home Win %</Text>
          </View>
          
          <View style={styles.overviewCard}>
            <Ionicons name="pulse" size={24} color="#ef4444" />
            <Text style={styles.overviewNumber}>{data.avgMargin || '0'}</Text>
            <Text style={styles.overviewLabel}>Avg Margin</Text>
          </View>
        </View>
        
        <View style={styles.keyTrendCard}>
          <Ionicons name="bulb" size={20} color="#fbbf24" />
          <Text style={styles.keyTrendText}>{data.keyTrend || 'No trend data'}</Text>
        </View>
        
        <View style={styles.overUnderCard}>
          <Text style={styles.overUnderTitle}>Over/Under Performance</Text>
          <View style={styles.overUnderBar}>
            <View style={[styles.overBar, { width: `${parseInt(data.overUnder || '50%')}%` }]}>
              <Text style={styles.overBarText}>Over</Text>
            </View>
            <View style={[styles.underBar, { width: `${100 - parseInt(data.overUnder || '50%')}%` }]}>
              <Text style={styles.underBarText}>Under</Text>
            </View>
          </View>
          <Text style={styles.overUnderResult}>{data.overUnder || '50% Over'}</Text>
        </View>
      </View>
    );
  };

  const renderTeams = () => {
    const data = sportsData[selectedSport]?.teams || {};
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Team Performance</Text>
        
        <View style={styles.teamCard}>
          <View style={styles.teamRow}>
            <Ionicons name="trophy" size={20} color="#f59e0b" />
            <View style={styles.teamInfo}>
              <Text style={styles.teamLabel}>Best Offense</Text>
              <Text style={styles.teamValue}>{data.bestOffense || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.teamRow}>
            <Ionicons name="shield" size={20} color="#3b82f6" />
            <View style={styles.teamInfo}>
              <Text style={styles.teamLabel}>Best Defense</Text>
              <Text style={styles.teamValue}>{data.bestDefense || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.teamRow}>
            <Ionicons name="trending-up" size={20} color="#10b981" />
            <View style={styles.teamInfo}>
              <Text style={styles.teamLabel}>Most Improved</Text>
              <Text style={styles.teamValue}>{data.mostImproved || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.teamRow}>
            <Ionicons name="star" size={20} color="#8b5cf6" />
            <View style={styles.teamInfo}>
              <Text style={styles.teamLabel}>Surprise Team</Text>
              <Text style={styles.teamValue}>{data.surpriseTeam || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderPlayers = () => {
    const data = sportsData[selectedSport]?.players || {};
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Player Leaders</Text>
        
        <View style={styles.playersGrid}>
          {Object.entries(data).map(([key, value]) => (
            <View key={key} style={styles.playerCard}>
              <Text style={styles.playerLabel}>
                {key.split(/(?=[A-Z])/).join(' ')}
              </Text>
              <Text style={styles.playerValue}>{value}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderTrends = () => {
    const trends = sportsData[selectedSport]?.trends || [];
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Trends & Metrics</Text>
        
        {trends.map((trend, index) => (
          <View key={index} style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.trendName}>{trend.name}</Text>
              <View style={[
                styles.trendChange,
                { backgroundColor: trend.direction === 'up' ? '#d1fae5' : '#fee2e2' }
              ]}>
                <Ionicons 
                  name={trend.direction === 'up' ? 'trending-up' : 'trending-down'} 
                  size={12} 
                  color={trend.direction === 'up' ? '#065f46' : '#991b1b'} 
                />
                <Text style={[
                  styles.trendChangeText,
                  { color: trend.direction === 'up' ? '#065f46' : '#991b1b' }
                ]}>
                  {trend.change}
                </Text>
              </View>
            </View>
            
            <View style={styles.trendValueContainer}>
              <Progress.Bar 
                progress={typeof trend.value === 'number' ? trend.value / 100 : 0.5}
                width={width - 60}
                height={8}
                color={trend.direction === 'up' ? '#10b981' : '#ef4444'}
                unfilledColor="#e5e7eb"
                borderWidth={0}
              />
              <Text style={styles.trendValue}>
                {typeof trend.value === 'number' ? trend.value.toFixed(1) : trend.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderPredictions = () => {
    const predictions = sportsData[selectedSport]?.predictions || [];
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Game Predictions</Text>
        
        {predictions.map((prediction, index) => (
          <View key={index} style={styles.predictionCard}>
            <Text style={styles.predictionGame}>{prediction.game}</Text>
            <View style={styles.predictionDetails}>
              <View style={styles.predictionBadge}>
                <Text style={styles.predictionText}>{prediction.prediction}</Text>
              </View>
              <View style={styles.confidenceMeter}>
                <View style={[
                  styles.confidenceFill,
                  { width: `${prediction.confidence}%` }
                ]} />
                <Text style={styles.confidenceText}>{prediction.confidence}% confidence</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    switch(selectedMetric) {
      case 'overview':
        return renderOverview();
      case 'teams':
        return renderTeams();
      case 'players':
        return renderPlayers();
      case 'trends':
        return renderTrends();
      case 'predictions':
        return renderPredictions();
      default:
        return renderOverview();
    }
  };

  const renderInsights = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Analytics Insights</Text>
      <LinearGradient
        colors={['#1e293b', '#334155']}
        style={styles.insightsCard}
      >
        <Ionicons name="analytics" size={32} color="#14b8a6" />
        <Text style={styles.insightsTitle}>🏆 {selectedSport} Trend Analysis</Text>
        <Text style={styles.insightsText}>
          {selectedSport === 'NBA' && 'Three-point shooting continues to dominate offensive strategy, with teams averaging 35+ attempts per game.'}
          {selectedSport === 'NFL' && 'Pass-heavy offenses are becoming the norm, with quarterbacks averaging career-high passing yardage.'}
          {selectedSport === 'NHL' && 'Special teams efficiency is at an all-time high, driving scoring and game outcomes.'}
          {selectedSport === 'MLB' && 'Home run rates continue to climb while strikeout rates reach historic levels.'}
        </Text>
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#14b8a6" />
        <Text style={styles.loadingText}>Loading Sports Analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderMetricTabs()}
        {renderContent()}
        {renderInsights()}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Data updates in real-time. Last refreshed: {new Date().toLocaleTimeString()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdfa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  accessTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 10,
  },
  accessDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  accessFeatures: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#14b8a6',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  restoreButton: {
    padding: 12,
  },
  restoreButtonText: {
    color: '#14b8a6',
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    padding: 25,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 20,
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
    opacity: 0.9,
    marginTop: 5,
    textAlign: 'center',
  },
  sportsScroll: {
    marginTop: 10,
  },
  sportButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeSportButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  sportText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  activeSportText: {
    color: 'white',
  },
  metricsScroll: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  metricTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeMetricTab: {
    backgroundColor: '#14b8a6',
  },
  metricText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeMetricText: {
    color: 'white',
  },
  section: {
    margin: 15,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overviewCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overviewNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginVertical: 5,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  keyTrendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  keyTrendText: {
    fontSize: 14,
    color: '#92400e',
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  overUnderCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overUnderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  overUnderBar: {
    flexDirection: 'row',
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 8,
  },
  overBar: {
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overBarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  underBar: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  underBarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  overUnderResult: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  teamCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  teamInfo: {
    marginLeft: 10,
    flex: 1,
  },
  teamLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  teamValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  playerCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playerLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 5,
    textTransform: 'capitalize',
  },
  playerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  trendCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  trendName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  trendChange: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  trendChangeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 3,
  },
  trendValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 10,
  },
  predictionCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  predictionGame: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  predictionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  predictionBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  predictionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  confidenceMeter: {
    width: 120,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#14b8a6',
    borderRadius: 10,
  },
  confidenceText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    lineHeight: 20,
  },
  insightsCard: {
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  insightsText: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default AnalyticsScreen;
