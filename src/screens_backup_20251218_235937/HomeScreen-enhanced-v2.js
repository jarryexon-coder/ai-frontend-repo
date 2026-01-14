import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import apiService from '../services/api-service';
import usePremiumAccess from '../hooks/usePremiumAccess';
import useDailyLocks from '../hooks/useDailyLocks';

// Simple Settings Screen Component
const SettingsModal = ({ visible, onClose }) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Settings</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.settingsList}>
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="notifications-outline" size={22} color="#374151" />
            <Text style={styles.settingText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="moon-outline" size={22} color="#374151" />
            <Text style={styles.settingText}>Dark Mode</Text>
            <View style={styles.switchContainer}>
              <View style={styles.switch} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="stats-chart-outline" size={22} color="#374151" />
            <Text style={styles.settingText}>Data Preferences</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="help-circle-outline" size={22} color="#374151" />
            <Text style={styles.settingText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="information-circle-outline" size={22} color="#374151" />
            <Text style={styles.settingText}>About</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.settingItem, { marginTop: 20 }]}>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            <Text style={[styles.settingText, { color: '#ef4444' }]}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
        
        <View style={styles.modalFooter}>
          <Text style={styles.versionText}>Sports Analytics v1.0.0</Text>
        </View>
      </View>
    </View>
  </Modal>
);

// Simple Premium Access Paywall Component
const PremiumAccessPaywall = ({ visible, onClose }) => {
  const { hasAccess, purchasePremium, startFreeTrial } = usePremiumAccess();

  if (hasAccess) {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.premiumContent}>
            <LinearGradient
              colors={['#3b82f6', '#1e40af']}
              style={styles.premiumHeader}
            >
              <View style={styles.premiumHeaderContent}>
                <Ionicons name="trophy" size={40} color="#fff" />
                <Text style={styles.premiumTitle}>Already Premium!</Text>
                <Text style={styles.premiumSubtitle}>You have full access</Text>
              </View>
            </LinearGradient>
            
            <TouchableOpacity style={styles.closePremiumButton} onPress={onClose}>
              <Ionicons name="close-outline" size={24} color="#374151" />
            </TouchableOpacity>
            
            <View style={styles.pricingContainer}>
              <TouchableOpacity style={styles.manageButton} onPress={onClose}>
                <Text style={styles.manageButtonText}>Manage Subscription</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.premiumContent}>
          <LinearGradient
            colors={['#3b82f6', '#1e40af']}
            style={styles.premiumHeader}
          >
            <View style={styles.premiumHeaderContent}>
              <Ionicons name="trophy" size={40} color="#fff" />
              <Text style={styles.premiumTitle}>Premium Access</Text>
              <Text style={styles.premiumSubtitle}>Unlock all premium features</Text>
            </View>
          </LinearGradient>
          
          <TouchableOpacity style={styles.closePremiumButton} onPress={onClose}>
            <Ionicons name="close-outline" size={24} color="#374151" />
          </TouchableOpacity>
          
          <ScrollView style={styles.premiumFeatures}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="analytics-outline" size={24} color="#3b82f6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Advanced Analytics</Text>
                <Text style={styles.featureDescription}>Deep insights & predictions</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="trophy-outline" size={24} color="#10b981" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Fantasy Tools</Text>
                <Text style={styles.featureDescription}>Player projections & lineups</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="newspaper-outline" size={24} color="#8b5cf6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Premium News</Text>
                <Text style={styles.featureDescription}>Exclusive analysis & reports</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="american-football-outline" size={24} color="#ef4444" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>NFL Insights</Text>
                <Text style={styles.featureDescription}>Advanced football analytics</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="tv-outline" size={24} color="#f59e0b" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Live Games</Text>
                <Text style={styles.featureDescription}>Real-time updates & stats</Text>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.pricingContainer}>
            <TouchableOpacity 
              style={styles.premiumButton}
              onPress={() => purchasePremium('weekly')}
            >
              <Text style={styles.premiumButtonText}>GET PREMIUM - $5.99/week</Text>
              <Text style={styles.premiumButtonSubtext}>Billed weekly</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => startFreeTrial()}
            >
              <Text style={styles.secondaryButtonText}>Try 7 Days Free</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.monthlyButton}
              onPress={() => purchasePremium('monthly')}
            >
              <Text style={styles.monthlyButtonText}>$19.99/month (Save 30%)</Text>
            </TouchableOpacity>
            
            <Text style={styles.pricingNote}>Cancel anytime. No commitment.</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Simple Daily Locks Paywall Component
const DailyLocksPaywall = ({ visible, onClose }) => {
  const { hasAccess: hasLocksAccess, purchaseMoreLocks } = useDailyLocks();

  if (hasLocksAccess) {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.premiumContent}>
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              style={styles.premiumHeader}
            >
              <View style={styles.premiumHeaderContent}>
                <Ionicons name="lock-open" size={40} color="#fff" />
                <Text style={styles.premiumTitle}>Daily Locks Active!</Text>
                <Text style={styles.premiumSubtitle}>You have access to premium picks</Text>
              </View>
            </LinearGradient>
            
            <TouchableOpacity style={styles.closePremiumButton} onPress={onClose}>
              <Ionicons name="close-outline" size={24} color="#374151" />
            </TouchableOpacity>
            
            <View style={styles.pricingContainer}>
              <TouchableOpacity style={styles.manageButton} onPress={onClose}>
                <Text style={styles.manageButtonText}>View Daily Picks</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.premiumContent}>
          <LinearGradient
            colors={['#8b5cf6', '#7c3aed']}
            style={styles.premiumHeader}
          >
            <View style={styles.premiumHeaderContent}>
              <Ionicons name="lock-open" size={40} color="#fff" />
              <Text style={styles.premiumTitle}>Daily Locks</Text>
              <Text style={styles.premiumSubtitle}>Premium expert picks</Text>
            </View>
          </LinearGradient>
          
          <TouchableOpacity style={styles.closePremiumButton} onPress={onClose}>
            <Ionicons name="close-outline" size={24} color="#374151" />
          </TouchableOpacity>
          
          <ScrollView style={styles.premiumFeatures}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="trophy-outline" size={24} color="#8b5cf6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Expert Analysis</Text>
                <Text style={styles.featureDescription}>Hand-picked by top analysts</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="trending-up-outline" size={24} color="#10b981" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Proven Track Record</Text>
                <Text style={styles.featureDescription}>Consistent performance</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="time-outline" size={24} color="#f59e0b" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Daily Updates</Text>
                <Text style={styles.featureDescription}>Fresh picks every day</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#3b82f6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Money-Back Guarantee</Text>
                <Text style={styles.featureDescription}>Profit or your money back</Text>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.pricingContainer}>
            <TouchableOpacity 
              style={styles.premiumButton}
              onPress={() => purchaseMoreLocks('weekly')}
            >
              <Text style={styles.premiumButtonText}>GET DAILY LOCKS - $29.99/week</Text>
              <Text style={styles.premiumButtonSubtext}>Premium expert picks</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.monthlyButton}
              onPress={() => purchaseMoreLocks('monthly')}
            >
              <Text style={styles.monthlyButtonText}>$99.99/month (Save 15%)</Text>
            </TouchableOpacity>
            
            <Text style={styles.pricingNote}>Premium picks. Cancel anytime.</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Main HomeScreen Component
const HomeScreen = () => {
  const [games, setGames] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalGames: 0,
    liveGames: 0,
    upcomingGames: 0,
    avgScore: 0,
  });
  
  // Modal states
  const [showSettings, setShowSettings] = useState(false);
  const [showPremiumPaywall, setShowPremiumPaywall] = useState(false);
  const [showDailyLocksPaywall, setShowDailyLocksPaywall] = useState(false);

  // Premium hooks
  const { hasAccess: hasPremiumAccess } = usePremiumAccess();
  const { hasAccess: hasDailyLocks } = useDailyLocks();

  const loadData = async () => {
    try {
      console.log('🏀 Loading NBA data...');
      
      const [gamesResponse, newsResponse] = await Promise.all([
        apiService.getGames(),
        apiService.getNewsAll(),
      ]);
      
      const gameData = gamesResponse.data || [];
      const newsData = newsResponse.news?.nba || [];
      
      // Calculate analytics
      const liveGames = gameData.filter(g => g.status === 'Live').length;
      const upcomingGames = gameData.filter(g => g.status === 'Upcoming').length;
      const totalScores = gameData.reduce((sum, game) => sum + (game.awayScore || 0) + (game.homeScore || 0), 0);
      const avgScore = gameData.length > 0 ? (totalScores / gameData.length).toFixed(1) : 0;
      
      setGames(gameData);
      setNews(newsData);
      setStats({
        totalGames: gameData.length,
        liveGames,
        upcomingGames,
        avgScore,
      });
      
    } catch (error) {
      console.log('Error loading data:', error.message);
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
      colors={['#1e3a8a', '#3b82f6']}
      style={styles.header}
    >
      <View style={styles.headerTopRow}>
        <TouchableOpacity 
          style={styles.headerIconButton} 
          onPress={() => setShowSettings(true)}
        >
          {/* Solid settings icon */}
          <Ionicons name="settings" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.title}>NBA Analytics Hub</Text>
          <Text style={styles.subtitle}>Real-time insights & predictions</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.premiumIconButton} 
          onPress={() => setShowPremiumPaywall(true)}
        >
          {/* Outline star icon */}
          <Ionicons name="star-outline" size={24} color="#fbbf24" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.dateBadge}>
        <Ionicons name="calendar-outline" size={14} color="#fff" />
        <Text style={styles.dateText}>Today, {new Date().toLocaleDateString()}</Text>
      </View>
    </LinearGradient>
  );

  const renderStatsCard = () => (
    <LinearGradient
      colors={['#1e40af', '#3b82f6']}
      style={styles.statsCard}
    >
      <Text style={styles.statsTitle}>Today's Analytics</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.totalGames}</Text>
          <Text style={styles.statLabel}>Total Games</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.liveGames}</Text>
          <Text style={styles.statLabel}>Live Now</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.upcomingGames}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.avgScore}</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>
      </View>
    </LinearGradient>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading NBA Analytics...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderHeader()}
        {renderStatsCard()}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live & Upcoming Games</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          
          {games.length > 0 ? (
            games.slice(0, 3).map((game, index) => (
              <View key={game.id || index} style={styles.gameCard}>
                <View style={styles.gameTeams}>
                  <View style={styles.team}>
                    <View style={[styles.teamLogo, { backgroundColor: '#ef4444' }]} />
                    <Text style={styles.teamName}>{game.away_team}</Text>
                  </View>
                  <View style={styles.vsContainer}>
                    <Text style={styles.vsText}>VS</Text>
                    <Text style={styles.gameTime}>{game.time}</Text>
                  </View>
                  <View style={styles.team}>
                    <View style={[styles.teamLogo, { backgroundColor: '#3b82f6' }]} />
                    <Text style={styles.teamName}>{game.home_team}</Text>
                  </View>
                </View>
                
                <View style={styles.gameDetails}>
                  <View style={styles.scoreContainer}>
                    <Text style={styles.score}>{game.awayScore || '0'}</Text>
                    <Text style={styles.scoreDivider}>-</Text>
                    <Text style={styles.score}>{game.homeScore || '0'}</Text>
                  </View>
                  
                  <View style={styles.statusBadge}>
                    <Text style={[
                      styles.statusText,
                      game.status === 'Live' ? styles.liveBadge : 
                      game.status === 'Final' ? styles.finalBadge : styles.upcomingBadge
                    ]}>
                      {game.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No games scheduled for today</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top News & Analysis</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          
          {news.length > 0 ? (
            news.slice(0, 3).map((item, index) => (
              <TouchableOpacity key={index} style={styles.newsCard}>
                <View style={styles.newsContent}>
                  <View style={styles.newsHeader}>
                    <Text style={styles.newsCategory}>{item.category || 'Analysis'}</Text>
                    <Text style={styles.newsTime}>2h ago</Text>
                  </View>
                  <Text style={styles.newsTitle}>{item.title}</Text>
                  <Text style={styles.newsExcerpt} numberOfLines={2}>
                    Get the latest insights and predictions for today's matchups...
                  </Text>
                </View>
                <View style={styles.newsAnalytics}>
                  <View style={styles.analyticsBadge}>
                    <Ionicons name="trending-up-outline" size={12} color="#10b981" />
                    <Text style={styles.analyticsBadgeText}>+24% views</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No news available</Text>
          )}
        </View>
        
        {/* Premium Access Banner */}
        {!hasPremiumAccess && (
          <TouchableOpacity 
            style={styles.premiumBanner}
            onPress={() => setShowPremiumPaywall(true)}
          >
            <LinearGradient
              colors={['#3b82f6', '#1e40af']}
              style={styles.premiumBannerGradient}
            >
              <Ionicons name="trophy" size={28} color="#fff" />
              <View style={styles.premiumBannerText}>
                <Text style={styles.premiumBannerTitle}>Premium Access</Text>
                <Text style={styles.premiumBannerSubtitle}>
                  Analytics, Fantasy, News, NFL & Live Games
                </Text>
                <Text style={styles.premiumBannerPrice}>From $5.99/week</Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Daily Locks Banner */}
        {!hasDailyLocks && (
          <TouchableOpacity 
            style={styles.dailyLocksBanner}
            onPress={() => setShowDailyLocksPaywall(true)}
          >
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              style={styles.dailyLocksBannerGradient}
            >
              <Ionicons name="lock-open" size={28} color="#fff" />
              <View style={styles.dailyLocksBannerText}>
                <Text style={styles.dailyLocksBannerTitle}>Daily Locks</Text>
                <Text style={styles.dailyLocksBannerSubtitle}>
                  Premium expert picks
                </Text>
                <Text style={styles.dailyLocksBannerPrice}>From $29.99/week</Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
      
      {/* Modals */}
      <SettingsModal 
        visible={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
      <PremiumAccessPaywall 
        visible={showPremiumPaywall} 
        onClose={() => setShowPremiumPaywall(false)} 
      />
      <DailyLocksPaywall 
        visible={showDailyLocksPaywall} 
        onClose={() => setShowDailyLocksPaywall(false)} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
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
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
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
  headerIconButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  premiumIconButton: {
    padding: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 20,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'center',
  },
  dateText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 5,
  },
  statsCard: {
    margin: 15,
    marginTop: -30,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  statsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  statNumber: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 5,
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
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  seeAll: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  gameCard: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  gameTeams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  team: {
    alignItems: 'center',
    flex: 1,
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5,
  },
  teamName: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
  vsContainer: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  vsText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  gameTime: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  gameDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    minWidth: 40,
    textAlign: 'center',
  },
  scoreDivider: {
    fontSize: 24,
    color: '#9ca3af',
    marginHorizontal: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  liveBadge: {
    color: '#dc2626',
  },
  finalBadge: {
    color: '#374151',
  },
  upcomingBadge: {
    color: '#059669',
  },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  newsContent: {
    flex: 1,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  newsCategory: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  newsTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 5,
  },
  newsExcerpt: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
  newsAnalytics: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  analyticsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  analyticsBadgeText: {
    fontSize: 10,
    color: '#065f46',
    marginLeft: 3,
    fontWeight: '500',
  },
  emptyText: {
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
  premiumBanner: {
    margin: 15,
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  premiumBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  premiumBannerText: {
    flex: 1,
    marginLeft: 15,
  },
  premiumBannerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  premiumBannerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 2,
  },
  premiumBannerPrice: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  dailyLocksBanner: {
    margin: 15,
    marginTop: 0,
    marginBottom: 30,
    borderRadius: 15,
    overflow: 'hidden',
  },
  dailyLocksBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  dailyLocksBannerText: {
    flex: 1,
    marginLeft: 15,
  },
  dailyLocksBannerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dailyLocksBannerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 2,
  },
  dailyLocksBannerPrice: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  settingsList: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    marginLeft: 15,
  },
  switchContainer: {
    width: 50,
    height: 28,
    backgroundColor: '#d1d5db',
    borderRadius: 14,
    justifyContent: 'center',
    padding: 2,
  },
  switch: {
    width: 24,
    height: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  // Premium Modal Styles
  premiumContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
  },
  premiumHeader: {
    padding: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  premiumHeaderContent: {
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
  },
  premiumSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
  },
  closePremiumButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  premiumFeatures: {
    padding: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  featureIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#f3f4f6',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    marginLeft: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  pricingContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  premiumButton: {
    backgroundColor: '#f59e0b',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  premiumButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  premiumButtonSubtext: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
    marginTop: 2,
  },
  secondaryButton: {
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f59e0b',
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: '600',
  },
  monthlyButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  monthlyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  manageButton: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  manageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6b7280',
  },
  closeButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  pricingNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 10,
  },
});

export default HomeScreen;
