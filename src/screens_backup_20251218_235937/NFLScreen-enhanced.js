import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/api-service';
import usePremiumAccess from '../hooks/usePremiumAccess';
import PremiumAccessPaywall from './PremiumAccessPaywall';

const NFLScreen = () => {
  const { hasAccess, loading: accessLoading } = usePremiumAccess();
  const [showPaywall, setShowPaywall] = useState(false);
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
  });

  const loadData = async () => {
    try {
      console.log('🏈 Loading enhanced NFL data...');
      
      const [gamesResponse, standingsResponse, newsResponse] = await Promise.all([
        apiService.getNFLGames(),
        apiService.getNFLStandings(),
        apiService.getNFLNews(),
      ]);
      
      const gamesData = gamesResponse.games || [];
      const standingsData = standingsResponse.data || [];
      const newsData = newsResponse.data || [];
      
      // Calculate analytics
      const avgPoints = gamesData.length > 0 ? 
        (gamesData.reduce((sum, game) => sum + (game.awayScore || 0) + (game.homeScore || 0), 0) / gamesData.length).toFixed(1) : 0;
      
      setGames(gamesData);
      setStandings(standingsData.slice(0, 8)); // Top 8 teams
      setNews(newsData.slice(0, 3)); // Top 3 news
      setAnalytics({
        totalGames: gamesData.length,
        avgPoints,
        passingYards: '265',
        rushingYards: '112',
      });
      
    } catch (error) {
      console.log('Error loading NFL data:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      loadData();
    }
  }, [hasAccess]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Premium Access Check
  if (accessLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Checking access...</Text>
      </View>
    );
  }

  if (!hasAccess) {
    return (
      <View style={styles.accessDenied}>
        <Ionicons name="lock-closed" size={60} color="#3b82f6" />
        <Text style={styles.accessTitle}>Premium Access Required</Text>
        <Text style={styles.accessDescription}>
          NFL insights are part of our Premium Access subscription.
        </Text>
        <Text style={styles.accessFeatures}>
          Get access to NFL analytics along with Fantasy, News, Analytics & Live Games
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

  // Original NFL Screen content continues here...
  const renderHeader = () => (
    <LinearGradient
      colors={['#0c4a6e', '#0369a1']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={styles.title}>NFL Gridiron Analytics</Text>
        <Text style={styles.subtitle}>Stats, scores & team analysis</Text>
      </View>
      
      <View style={styles.viewTabs}>
        {['games', 'standings', 'news'].map((view) => (
          <TouchableOpacity
            key={view}
            style={[
              styles.viewTab,
              selectedView === view && styles.activeViewTab
            ]}
            onPress={() => setSelectedView(view)}
          >
            <Text style={[
              styles.viewTabText,
              selectedView === view && styles.activeViewTabText
            ]}>
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );

  const renderAnalytics = () => (
    <View style={styles.analyticsContainer}>
      <Text style={styles.analyticsTitle}>League Metrics</Text>
      <View style={styles.analyticsGrid}>
        <View style={styles.metricCard}>
          <Ionicons name="american-football" size={20} color="#f59e0b" />
          <Text style={styles.metricValue}>{analytics.totalGames}</Text>
          <Text style={styles.metricLabel}>Games Today</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="stats-chart" size={20} color="#3b82f6" />
          <Text style={styles.metricValue}>{analytics.avgPoints}</Text>
          <Text style={styles.metricLabel}>Avg Points</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="trending-up" size={20} color="#10b981" />
          <Text style={styles.metricValue}>{analytics.passingYards}</Text>
          <Text style={styles.metricLabel}>Pass Yds/G</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="flash" size={20} color="#ef4444" />
          <Text style={styles.metricValue}>{analytics.rushingYards}</Text>
          <Text style={styles.metricLabel}>Rush Yds/G</Text>
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
            <View style={styles.gameTeams}>
              <View style={styles.teamInfo}>
                <Text style={styles.teamAbbrev}>{game.away}</Text>
                <Text style={styles.teamType}>Away</Text>
              </View>
              <View style={styles.gameCenter}>
                <Text style={styles.gameTime}>{game.time}</Text>
                <View style={styles.scoreContainer}>
                  <Text style={styles.score}>{game.awayScore || '0'}</Text>
                  <Text style={styles.scoreDivider}>-</Text>
                  <Text style={styles.score}>{game.homeScore || '0'}</Text>
                </View>
              </View>
              <View style={styles.teamInfo}>
                <Text style={styles.teamAbbrev}>{game.home}</Text>
                <Text style={styles.teamType}>Home</Text>
              </View>
            </View>
            <View style={styles.gameStatus}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {game.time ? 'Upcoming' : 'Final'}
                </Text>
              </View>
              <Text style={styles.gameChannel}>TV: {game.tv || 'FOX'}</Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No games scheduled today</Text>
      )}
    </View>
  );

  const renderStandings = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Division Standings</Text>
      <View style={styles.standingsContainer}>
        <View style={styles.standingsHeader}>
          <Text style={[styles.standingsCol, { flex: 2 }]}>Team</Text>
          <Text style={styles.standingsCol}>W</Text>
          <Text style={styles.standingsCol}>L</Text>
          <Text style={styles.standingsCol}>T</Text>
          <Text style={[styles.standingsCol, { color: '#0ea5e9' }]}>PTS</Text>
        </View>
        
        {standings.map((team, index) => (
          <View key={team.id || index} style={styles.standingsRow}>
            <View style={[styles.standingsCell, { flex: 2 }]}>
              <Text style={styles.teamRank}>#{index + 1}</Text>
              <Text style={styles.teamNameCell}>{team.name}</Text>
            </View>
            <Text style={[styles.standingsCell, styles.winCell]}>{team.wins || 0}</Text>
            <Text style={[styles.standingsCell, styles.lossCell]}>{team.losses || 0}</Text>
            <Text style={styles.standingsCell}>{team.ties || 0}</Text>
            <Text style={[styles.standingsCell, styles.pointsCell]}>{team.points || 0}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderNews = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Latest News</Text>
      {news.length > 0 ? (
        news.map((item, index) => (
          <View key={index} style={styles.newsCard}>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsCategory}>{item.category}</Text>
            <Text style={styles.newsExcerpt} numberOfLines={2}>
              Get the latest updates on NFL teams, players, and upcoming games...
            </Text>
            <View style={styles.newsFooter}>
              <Text style={styles.newsTime}>3h ago</Text>
              <View style={styles.newsStats}>
                <Ionicons name="eye" size={12} color="#6b7280" />
                <Text style={styles.newsViews}>1.2K views</Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No news available</Text>
      )}
    </View>
  );

  const renderPlayerSpotlight = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Player Spotlight</Text>
      <LinearGradient
        colors={['#1e293b', '#334155']}
        style={styles.spotlightCard}
      >
        <View style={styles.spotlightHeader}>
          <Text style={styles.spotlightName}>Patrick Mahomes</Text>
          <Text style={styles.spotlightTeam}>Kansas City Chiefs • QB</Text>
        </View>
        <View style={styles.spotlightStats}>
          <View style={styles.playerStat}>
            <Text style={styles.statLabel}>YARDS</Text>
            <Text style={styles.statValue}>4,298</Text>
          </View>
          <View style={styles.playerStat}>
            <Text style={styles.statLabel}>TD</Text>
            <Text style={styles.statValue}>32</Text>
          </View>
          <View style={styles.playerStat}>
            <Text style={styles.statLabel}>INT</Text>
            <Text style={styles.statValue}>8</Text>
          </View>
          <View style={styles.playerStat}>
            <Text style={styles.statLabel}>QBR</Text>
            <Text style={styles.statValue}>108.3</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderInsights = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Week 16 Insights</Text>
      <View style={styles.insightCard}>
        <Ionicons name="warning" size={20} color="#f59e0b" />
        <View style={styles.insightContent}>
          <Text style={styles.insightTitle}>Injury Watch</Text>
          <Text style={styles.insightText}>
            Key defensive players questionable for Sunday's matchups
          </Text>
        </View>
      </View>
      <View style={styles.insightCard}>
        <Ionicons name="trending-up" size={20} color="#10b981" />
        <View style={styles.insightContent}>
          <Text style={styles.insightTitle}>Hot Streak</Text>
          <Text style={styles.insightText}>
            49ers defense allowing only 14.2 points per game in last 5
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
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
      
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderAnalytics()}
        
        {selectedView === 'games' && renderGames()}
        {selectedView === 'standings' && renderStandings()}
        {selectedView === 'news' && renderNews()}
        
        {renderPlayerSpotlight()}
        {renderInsights()}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            NFL data updates in real-time. Tap refresh for latest scores.
          </Text>
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
    backgroundColor: '#3b82f6',
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
    color: '#3b82f6',
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
  viewTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  viewTab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeViewTab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  viewTabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  activeViewTabText: {
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
  gameTeams: {
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
  teamType: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  gameCenter: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  gameTime: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 5,
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
  scoreDivider: {
    fontSize: 20,
    color: '#9ca3af',
    marginHorizontal: 10,
  },
  gameStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statusBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: '#4f46e5',
    fontWeight: '600',
  },
  gameChannel: {
    fontSize: 11,
    color: '#6b7280',
  },
  standingsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  standingsCell: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamRank: {
    fontSize: 12,
    color: '#9ca3af',
    marginRight: 8,
  },
  teamNameCell: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  winCell: {
    color: '#10b981',
    fontWeight: '600',
  },
  lossCell: {
    color: '#ef4444',
    fontWeight: '600',
  },
  pointsCell: {
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  newsCard: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 5,
  },
  newsCategory: {
    fontSize: 11,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  newsExcerpt: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    marginBottom: 10,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  newsStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsViews: {
    fontSize: 11,
    color: '#9ca3af',
    marginLeft: 4,
  },
  section: {
    margin: 15,
    marginTop: 10,
  },
  spotlightCard: {
    padding: 20,
    borderRadius: 15,
  },
  spotlightHeader: {
    marginBottom: 15,
  },
  spotlightName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  spotlightTeam: {
    fontSize: 14,
    color: '#cbd5e1',
    marginTop: 5,
  },
  spotlightStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  playerStat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  insightCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightContent: {
    marginLeft: 10,
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  emptyText: {
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
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

export default NFLScreen;
