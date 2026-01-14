import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Switch,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/api-service';

const { width } = Dimensions.get('window');

const FantasyScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState('NBA');
  const [showProjections, setShowProjections] = useState(true);
  
  const [fantasyData, setFantasyData] = useState({
    myTeam: {
      name: 'Fantasy Elite',
      rank: 1,
      points: 1520,
      trend: '+3',
      players: [
        { id: 1, name: 'LeBron James', position: 'SF/PF', points: 42.5, trend: 'up', status: 'Active', projection: 45.2, value: 0.85 },
        { id: 2, name: 'Nikola Jokić', position: 'C', points: 38.7, trend: 'up', status: 'Active', projection: 40.1, value: 0.77 },
        { id: 3, name: 'Stephen Curry', position: 'PG', points: 35.9, trend: 'up', status: 'Active', projection: 37.5, value: 0.72 },
        { id: 4, name: 'Giannis Antetokounmpo', position: 'PF', points: 41.2, trend: 'down', status: 'Active', projection: 39.8, value: 0.82 },
        { id: 5, name: 'Luka Dončić', position: 'PG/SG', points: 39.8, trend: 'up', status: 'Active', projection: 41.5, value: 0.80 },
      ]
    },
    leagueStats: {
      totalTeams: 12,
      avgPoints: 1450,
      topScore: 1620,
      activeTrades: 8,
    },
    trends: [
      { player: 'Anthony Davis', trend: 'rising', change: '+12.5%', reason: 'Increased minutes' },
      { player: 'Kevin Durant', trend: 'falling', change: '-5.2%', reason: 'Rest day scheduled' },
      { player: 'Jayson Tatum', trend: 'rising', change: '+8.7%', reason: 'Favorable matchup' },
    ],
    advice: [
      { category: 'Start', players: ['Joel Embiid', 'Damian Lillard'], reason: 'High usage expected' },
      { category: 'Sit', players: ['James Harden'], reason: 'Back-to-back game' },
      { category: 'Add', players: ['Tyrese Maxey'], reason: 'Hot streak, 25+ points last 3 games' },
    ]
  });

  // Chart data for performance chart
  const [chartData] = useState({
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    heights: [65, 80, 75, 90, 85, 95, 70] // percentages
  });

  const leagues = ['NBA', 'NFL', 'NHL', 'MLB'];

  const loadData = async () => {
    try {
      // // Load fantasy advice from API
      const adviceResponse = await apiService.getFantasyAdvice();
      
      // Update with API data if available
      if (adviceResponse.data && !adviceResponse.isMock) {
        setFantasyData(prev => ({
          ...prev,
          advice: adviceResponse.data.must_starts?.map(item => ({
            category: 'Start',
            players: [item.player],
            reason: item.reason
          })) || prev.advice
        }));
      }
      
    } catch (error) {
      // } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Custom Progress Bar Component
  const CustomProgressBar = ({ progress, width = 60, height = 8, color = '#3b82f6', backgroundColor = '#e5e7eb' }) => {
    return (
      <View style={[styles.progressBarContainer, { width, height, backgroundColor }]}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#059669', '#10b981']}
      style={styles.header}
    >
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.teamName}>{fantasyData.myTeam.name}</Text>
          <Text style={styles.teamRank}>Rank #{fantasyData.myTeam.rank} Overall</Text>
        </View>
        <View style={styles.pointsContainer}>
          <Text style={styles.points}>{fantasyData.myTeam.points}</Text>
          <Text style={styles.pointsLabel}>
            Total Points <Text style={styles.trend}>↑ {fantasyData.myTeam.trend}</Text>
          </Text>
        </View>
      </View>
      
      <View style={styles.leagueFilter}>
        {leagues.map((league, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.leagueButton,
              selectedLeague === league && styles.activeLeagueButton
            ]}
            onPress={() => setSelectedLeague(league)}
          >
            <Text style={[
              styles.leagueText,
              selectedLeague === league && styles.activeLeagueText
            ]}>
              {league}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );

  const renderLeagueStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>League Analytics</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color="#f59e0b" />
          <Text style={styles.statNumber}>{fantasyData.leagueStats.totalTeams}</Text>
          <Text style={styles.statLabel}>Total Teams</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="stats-chart" size={24} color="#3b82f6" />
          <Text style={styles.statNumber}>{fantasyData.leagueStats.avgPoints}</Text>
          <Text style={styles.statLabel}>Avg Points</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={24} color="#10b981" />
          <Text style={styles.statNumber}>{fantasyData.leagueStats.topScore}</Text>
          <Text style={styles.statLabel}>Top Score</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="swap-horizontal" size={24} color="#8b5cf6" />
          <Text style={styles.statNumber}>{fantasyData.leagueStats.activeTrades}</Text>
          <Text style={styles.statLabel}>Active Trades</Text>
        </View>
      </View>
    </View>
  );

  const renderPlayerCard = (player) => (
    <View key={player.id} style={styles.playerCard}>
      <View style={styles.playerHeader}>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{player.name}</Text>
          <Text style={styles.playerPosition}>{player.position}</Text>
        </View>
        <View style={styles.playerStatus}>
          <View style={[
            styles.statusDot,
            player.status === 'Active' ? styles.activeDot : styles.inactiveDot
          ]} />
          <Text style={styles.statusText}>{player.status}</Text>
        </View>
      </View>
      
      <View style={styles.playerStats}>
        <View style={styles.statColumn}>
          <Text style={styles.statLabelSmall}>Current</Text>
          <Text style={styles.statValue}>{player.points}</Text>
        </View>
        <View style={styles.statColumn}>
          <Text style={styles.statLabelSmall}>Trend</Text>
          <View style={styles.trendContainer}>
            <Ionicons 
              name={player.trend === 'up' ? 'caret-up' : 'caret-down'} 
              size={16} 
              color={player.trend === 'up' ? '#10b981' : '#ef4444'} 
            />
            <Text style={[
              styles.trendText,
              { color: player.trend === 'up' ? '#10b981' : '#ef4444' }
            ]}>
              {player.trend === 'up' ? '+3.2' : '-1.5'}
            </Text>
          </View>
        </View>
        {showProjections && (
          <View style={styles.statColumn}>
            <Text style={styles.statLabelSmall}>Projection</Text>
            <Text style={styles.statValue}>{player.projection}</Text>
          </View>
        )}
        <View style={styles.statColumn}>
          <Text style={styles.statLabelSmall}>Value</Text>
          <CustomProgressBar progress={player.value} />
        </View>
      </View>
    </View>
  );

  const renderTrends = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Market Trends</Text>
        <Text style={styles.sectionSubtitle}>Last 24 hours</Text>
      </View>
      
      {fantasyData.trends.map((trend, index) => (
        <View key={index} style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <Text style={styles.trendPlayer}>{trend.player}</Text>
            <View style={[
              styles.trendBadge,
              { backgroundColor: trend.trend === 'rising' ? '#d1fae5' : '#fee2e2' }
            ]}>
              <Text style={[
                styles.trendBadgeText,
                { color: trend.trend === 'rising' ? '#065f46' : '#991b1b' }
              ]}>
                {trend.trend === 'rising' ? '↑ Rising' : '↓ Falling'} {trend.change}
              </Text>
            </View>
          </View>
          <Text style={styles.trendReason}>{trend.reason}</Text>
        </View>
      ))}
    </View>
  );

  const renderAdvice = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Expert Advice</Text>
        <TouchableOpacity style={styles.controls}>
          <Text style={styles.controlLabel}>Projections</Text>
          <Switch
            value={showProjections}
            onValueChange={setShowProjections}
            trackColor={{ false: '#d1d5db', true: '#a7f3d0' }}
            thumbColor={showProjections ? '#10b981' : '#f3f4f6'}
          />
        </TouchableOpacity>
      </View>
      
      {fantasyData.advice.map((item, index) => (
        <View key={index} style={styles.adviceCard}>
          <View style={[
            styles.adviceHeader,
            { backgroundColor: 
              item.category === 'Start' ? '#d1fae5' : 
              item.category === 'Sit' ? '#fee2e2' : '#fef3c7'
            }
          ]}>
            <Text style={[
              styles.adviceCategory,
              { color: 
                item.category === 'Start' ? '#065f46' : 
                item.category === 'Sit' ? '#991b1b' : '#92400e'
              }
            ]}>
              {item.category}
            </Text>
          </View>
          <View style={styles.adviceContent}>
            <Text style={styles.advicePlayers}>
              {item.players.join(', ')}
            </Text>
            <Text style={styles.adviceReason}>{item.reason}</Text>
            <View style={styles.adviceMetrics}>
              <View style={styles.metric}>
                <Ionicons name="flame" size={12} color="#ef4444" />
                <Text style={styles.metricText}>High Impact</Text>
              </View>
              <View style={styles.metric}>
                <Ionicons name="time" size={12} color="#f59e0b" />
                <Text style={styles.metricText}>Tonight's Game</Text>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderPerformanceChart = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Team Performance</Text>
      <View style={styles.chartContainer}>
        <View style={styles.chartLabels}>
          {chartData.days.map((day, index) => (
            <Text key={index} style={styles.chartLabel}>{day}</Text>
          ))}
        </View>
        <View style={styles.chartBars}>
          {chartData.heights.map((height, index) => (
            <View key={index} style={styles.chartBarContainer}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={[styles.chartBar, { height: `${height}%` }]}
              />
            </View>
          ))}
        </View>
      </View>
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendText}>Your Team</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
          <Text style={styles.legendText}>League Avg</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading Fantasy Analytics...</Text>
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
        {renderLeagueStats()}
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Roster</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Manage →</Text>
            </TouchableOpacity>
          </View>
          
          {fantasyData.myTeam.players.map(player => renderPlayerCard(player))}
        </View>

        {renderPerformanceChart()}
        {renderTrends()}
        {renderAdvice()}
        
        <View style={styles.footerSection}>
          <Text style={styles.footerTitle}>🎯 Pro Strategy</Text>
          <Text style={styles.footerText}>
            Monitor player trends and injury reports daily. Consider streaming players 
            with favorable matchups on light game days to maximize points.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
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
  header: {
    padding: 25,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  teamRank: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  points: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  pointsLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  trend: {
    color: '#d1fae5',
    fontWeight: 'bold',
  },
  leagueFilter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  leagueButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeLeagueButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  leagueText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  activeLeagueText: {
    color: 'white',
  },
  statsContainer: {
    margin: 15,
    marginTop: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
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
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 10,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  sectionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  seeAll: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 8,
  },
  playerCard: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  playerPosition: {
    fontSize: 12,
    color: '#6b7280',
  },
  playerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  activeDot: {
    backgroundColor: '#10b981',
  },
  inactiveDot: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 12,
    color: '#6b7280',
  },
  playerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statColumn: {
    alignItems: 'center',
  },
  statLabelSmall: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  // Progress Bar Styles
  progressBarContainer: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  chartContainer: {
    height: 200,
    flexDirection: 'row',
    marginBottom: 20,
  },
  chartLabels: {
    justifyContent: 'space-between',
    paddingVertical: 20,
    marginRight: 10,
  },
  chartLabel: {
    fontSize: 11,
    color: '#9ca3af',
    height: 20,
    textAlign: 'center',
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  chartBarContainer: {
    width: '12%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    borderRadius: 4,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  trendCard: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendPlayer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  trendReason: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  adviceCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  adviceHeader: {
    padding: 10,
  },
  adviceCategory: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  adviceContent: {
    padding: 15,
  },
  advicePlayers: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 5,
  },
  adviceReason: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
    lineHeight: 16,
  },
  adviceMetrics: {
    flexDirection: 'row',
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  metricText: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 3,
  },
  footerSection: {
    backgroundColor: '#d1fae5',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 13,
    color: '#065f46',
    lineHeight: 18,
  },
});

export default FantasyScreen;
