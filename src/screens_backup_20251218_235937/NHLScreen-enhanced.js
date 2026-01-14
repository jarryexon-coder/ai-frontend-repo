import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/api-service';

const NHLScreen = () => {
  const [games, setGames] = useState([]);
  const [standings, setStandings] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('games');
  const [analytics, setAnalytics] = useState({
    totalGoals: 0,
    avgGoals: 0,
    powerPlay: '22%',
    penaltyKill: '85%',
  });

  const loadData = async () => {
    try {
      console.log('🏒 Loading enhanced NHL data...');
      
      const [gamesResponse, standingsResponse, playersResponse] = await Promise.all([
        apiService.getNHLGames(),
        apiService.getNHLStandings(),
        apiService.getNHLPlayers(),
      ]);
      
      const gamesData = gamesResponse.games || [];
      const standingsData = standingsResponse.data || [];
      const playersData = playersResponse.data || [];
      
      // Calculate analytics
      const totalGoals = gamesData.reduce((sum, game) => sum + (game.awayScore || 0) + (game.homeScore || 0), 0);
      const avgGoals = gamesData.length > 0 ? (totalGoals / gamesData.length).toFixed(1) : 0;
      
      setGames(gamesData);
      setStandings(standingsData.slice(0, 10)); // Top 10 teams
      setPlayers(playersData.slice(0, 5)); // Top 5 players
      setAnalytics({
        totalGoals,
        avgGoals,
        powerPlay: '22%',
        penaltyKill: '85%',
      });
      
    } catch (error) {
      console.log('Error loading NHL data:', error.message);
    } finally {
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

  const renderHeader = () => (
    <LinearGradient
      colors={['#0ea5e9', '#0369a1']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={styles.title}>NHL Analytics Center</Text>
        <Text style={styles.subtitle}>Ice-cold stats & real-time tracking</Text>
      </View>
      
      <View style={styles.tabContainer}>
        {['games', 'standings', 'players'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              selectedTab === tab && styles.activeTab
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[
              styles.tabText,
              selectedTab === tab && styles.activeTabText
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );

  const renderAnalytics = () => (
    <View style={styles.analyticsContainer}>
      <Text style={styles.analyticsTitle}>Key Metrics</Text>
      <View style={styles.analyticsGrid}>
        <View style={styles.metricCard}>
          <Ionicons name="flame" size={20} color="#ef4444" />
          <Text style={styles.metricValue}>{analytics.avgGoals}</Text>
          <Text style={styles.metricLabel}>Avg Goals/Game</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="flash" size={20} color="#f59e0b" />
          <Text style={styles.metricValue}>{analytics.powerPlay}</Text>
          <Text style={styles.metricLabel}>Power Play %</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="shield" size={20} color="#10b981" />
          <Text style={styles.metricValue}>{analytics.penaltyKill}</Text>
          <Text style={styles.metricLabel}>Penalty Kill %</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="stats-chart" size={20} color="#3b82f6" />
          <Text style={styles.metricValue}>{games.length}</Text>
          <Text style={styles.metricLabel}>Live Games</Text>
        </View>
      </View>
    </View>
  );

  const renderGames = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Today's Matchups</Text>
      {games.length > 0 ? (
        games.map((game, index) => (
          <View key={index} style={styles.gameCard}>
            <View style={styles.gameHeader}>
              <View style={styles.teamInfo}>
                <Text style={styles.teamAbbrev}>{game.away}</Text>
                <Text style={styles.teamName}>Away</Text>
              </View>
              <View style={styles.vsContainer}>
                <Text style={styles.vsText}>@</Text>
                <Text style={styles.gameTime}>{game.time}</Text>
              </View>
              <View style={styles.teamInfo}>
                <Text style={styles.teamAbbrev}>{game.home}</Text>
                <Text style={styles.teamName}>Home</Text>
              </View>
            </View>
            <View style={styles.gameStatus}>
              <View style={styles.statusIndicator} />
              <Text style={styles.statusText}>Puck Drop: {game.time}</Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No games scheduled</Text>
      )}
    </View>
  );

  const renderStandings = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Division Leaders</Text>
      <View style={styles.standingsHeader}>
        <Text style={styles.standingsCol}>Team</Text>
        <Text style={styles.standingsCol}>GP</Text>
        <Text style={styles.standingsCol}>W</Text>
        <Text style={styles.standingsCol}>PTS</Text>
      </View>
      {standings.map((team, index) => (
        <View key={team.id || index} style={styles.standingsRow}>
          <View style={styles.teamCell}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <Text style={styles.teamNameCell}>{team.name}</Text>
          </View>
          <Text style={styles.standingsCell}>{team.gamesPlayed || 0}</Text>
          <Text style={styles.standingsCell}>{team.wins || 0}</Text>
          <Text style={[styles.standingsCell, styles.pointsCell]}>{team.points || 0}</Text>
        </View>
      ))}
    </View>
  );

  const renderPlayers = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Top Performers</Text>
      {players.map((player, index) => (
        <View key={player.id || index} style={styles.playerCard}>
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.playerTeam}>{player.team} • {player.position}</Text>
          </View>
          <View style={styles.playerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>GP</Text>
              <Text style={styles.statValue}>{player.gamesPlayed || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>G</Text>
              <Text style={styles.statValue}>{player.goals || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>A</Text>
              <Text style={styles.statValue}>{player.assists || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>PTS</Text>
              <Text style={styles.statValue}>{player.points || 0}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Loading NHL Analytics...</Text>
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
        {renderAnalytics()}
        
        {selectedTab === 'games' && renderGames()}
        {selectedTab === 'standings' && renderStandings()}
        {selectedTab === 'players' && renderPlayers()}
        
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Team Insights</Text>
          <View style={styles.insightCard}>
            <Ionicons name="snow" size={24} color="#0ea5e9" />
            <Text style={styles.insightTitle}>Cold Streak Alert</Text>
            <Text style={styles.insightText}>
              Bruins have lost 3 consecutive away games, scoring only 5 goals total
            </Text>
          </View>
          <View style={styles.insightCard}>
            <Ionicons name="trending-up" size={24} color="#10b981" />
            <Text style={styles.insightTitle}>Hot Offense</Text>
            <Text style={styles.insightText}>
              Avalanche averaging 4.2 goals per game in their last 5 home games
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  analyticsContainer: {
    margin: 15,
    marginTop: 20,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
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
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginVertical: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  contentSection: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  gameCard: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  teamName: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  vsContainer: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  vsText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  gameTime: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  gameStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#6b7280',
  },
  standingsHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 10,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  teamCell: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    fontSize: 12,
    color: '#9ca3af',
    marginRight: 10,
  },
  teamNameCell: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  standingsCell: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  pointsCell: {
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  playerCard: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
  },
  playerInfo: {
    marginBottom: 10,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  playerTeam: {
    fontSize: 12,
    color: '#6b7280',
  },
  playerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  insightsSection: {
    margin: 15,
    marginTop: 10,
  },
  insightCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 10,
    flex: 1,
  },
  insightText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 10,
    flex: 1,
    lineHeight: 16,
  },
  emptyText: {
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
});

export default NHLScreen;
