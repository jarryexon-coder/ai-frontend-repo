import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/api-service';
import usePremiumAccess from '../hooks/usePremiumAccess';
import PremiumAccessPaywall from './PremiumAccessPaywall';

const { width } = Dimensions.get('window');

const SportsNewsHub = () => {
  const { hasAccess, loading: accessLoading } = usePremiumAccess();
  const [showPaywall, setShowPaywall] = useState(false);
  const [news, setNews] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('beat-writers');
  
  const categories = [
    { id: 'beat-writers', name: 'Beat Writers', icon: 'newspaper' },
    { id: 'injuries', name: 'Injury News', icon: 'medical' },
    { id: 'rosters', name: 'Rosters', icon: 'people' },
    { id: 'analytics', name: 'Analytics', icon: 'analytics' },
    { id: 'trades', name: 'Trades', icon: 'swap-horizontal' },
    { id: 'draft', name: 'Draft', icon: 'school' },
    { id: 'free-agency', name: 'Free Agency', icon: 'briefcase' },
    { id: 'advanced-stats', name: 'Advanced Stats', icon: 'stats-chart' },
  ];

  // Helper functions moved INSIDE the component
  const getCategoryColors = (category) => {
    switch(category) {
      case 'analytics': return ['#0f766e', '#14b8a6'];
      case 'injuries': return ['#7c2d12', '#ea580c'];
      case 'trades': return ['#3730a3', '#4f46e5'];
      default: return ['#1e293b', '#334155'];
    }
  };

  const getCategoryName = (category) => {
    return categories.find(c => c.id === category)?.name || category.toUpperCase();
  };

  const loadData = async () => {
    try {
      console.log('📰 Loading enhanced News data...');
      
      const newsResponse = await apiService.getNewsAll();
      const newsData = newsResponse.news || {};
      
      // Enhanced trending stories focused on analytics and beat writers
      const trending = [
        {
          id: 1,
          title: 'Advanced Metrics: Which Teams Are Over/Underperforming?',
          category: 'analytics',
          time: '1h ago',
          views: '18.2K',
          trending: true,
          image: '📊',
          type: 'ANALYSIS',
          writer: 'Sarah Johnson'
        },
        {
          id: 2,
          title: 'Injury Report: Key Players Sidelined This Week',
          category: 'injuries',
          time: '2h ago',
          views: '24.5K',
          trending: true,
          image: '🏥',
          type: 'BREAKING',
          writer: 'Team Doctors'
        },
        {
          id: 3,
          title: 'Trade Rumors: Latest from League Insiders',
          category: 'trades',
          time: '4h ago',
          views: '15.7K',
          trending: true,
          image: '📝',
          type: 'RUMOR',
          writer: 'Multiple Sources'
        },
      ];
      
      setNews(newsData);
      setTrendingStories(trending);
      
    } catch (error) {
      console.log('Error loading news:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const [trendingStories, setTrendingStories] = useState([]);

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
          In-depth sports analysis and beat writer insights are part of our Premium Access subscription.
        </Text>
        <Text style={styles.accessFeatures}>
          Get access to injury reports, roster analysis, advanced stats & beat writer coverage
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

  const renderHeader = () => (
    <LinearGradient
      colors={['#1e40af', '#3b82f6']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={styles.title}>Sports Intelligence Hub</Text>
        <Text style={styles.subtitle}>Beat writers, analytics & roster insights</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="analytics" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statText}>Advanced Metrics</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="person" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statText}>Beat Writer Reports</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="time" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statText}>Real-time Updates</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderCategoryTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoriesScroll}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryTab,
            selectedCategory === category.id && styles.activeCategoryTab
          ]}
          onPress={() => setSelectedCategory(category.id)}
        >
          <Ionicons 
            name={category.icon} 
            size={16} 
            color={selectedCategory === category.id ? '#3b82f6' : '#6b7280'} 
          />
          <Text style={[
            styles.categoryText,
            selectedCategory === category.id && styles.activeCategoryText
          ]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderTrendingSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📈 Trending Analysis</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {trendingStories.map((story) => (
          <TouchableOpacity key={story.id} style={styles.trendingCard}>
            <LinearGradient
              colors={getCategoryColors(story.category)}
              style={styles.trendingImage}
            >
              <Text style={styles.trendingEmoji}>{story.image}</Text>
              <View style={styles.storyTypeBadge}>
                <Text style={styles.storyTypeText}>{story.type}</Text>
              </View>
            </LinearGradient>
            <View style={styles.trendingContent}>
              <View style={styles.writerInfo}>
                <Ionicons name="person-circle" size={12} color="#6b7280" />
                <Text style={styles.writerName}>{story.writer}</Text>
              </View>
              <Text style={styles.trendingTitle} numberOfLines={2}>
                {story.title}
              </Text>
              <View style={styles.trendingFooter}>
                <Text style={styles.trendingCategory}>{getCategoryName(story.category)}</Text>
                <View style={styles.trendingStats}>
                  <Ionicons name="eye" size={12} color="#9ca3af" />
                  <Text style={styles.trendingViews}>{story.views}</Text>
                  <Text style={styles.trendingTime}>{story.time}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderBeatWriters = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📝 Beat Writer Reports</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>All Writers →</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.writersGrid}>
        {[
          { id: 1, name: 'Woj', team: 'NBA Insider', status: 'Active', recent: 'Trade Rumors' },
          { id: 2, name: 'Schefter', team: 'NFL Insider', status: 'Breaking', recent: 'Injury Report' },
          { id: 3, name: 'Passan', team: 'MLB Insider', status: 'Active', recent: 'Roster Moves' },
          { id: 4, name: 'Friedell', team: 'ESPN NBA', status: 'Analyzing', recent: 'Team Dynamics' },
        ].map((writer) => (
          <TouchableOpacity key={writer.id} style={styles.writerCard}>
            <View style={styles.writerHeader}>
              <View style={styles.writerAvatar}>
                <Text style={styles.writerInitial}>{writer.name.charAt(0)}</Text>
              </View>
              <View style={styles.writerInfo}>
                <Text style={styles.writerName}>{writer.name}</Text>
                <Text style={styles.writerTeam}>{writer.team}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: writer.status === 'Breaking' ? '#fee2e2' : '#d1fae5' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: writer.status === 'Breaking' ? '#dc2626' : '#065f46' }
                ]}>
                  {writer.status}
                </Text>
              </View>
            </View>
            <Text style={styles.writerRecent}>Recently: {writer.recent}</Text>
            <View style={styles.writerStats}>
              <View style={styles.writerStat}>
                <Ionicons name="time" size={12} color="#6b7280" />
                <Text style={styles.writerStatText}>Updated 30m ago</Text>
              </View>
              <View style={styles.writerStat}>
                <Ionicons name="checkmark-circle" size={12} color="#10b981" />
                <Text style={styles.writerStatText}>96% Accuracy</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderInjuryReport = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🏥 Injury Report</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Full Report →</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.injuryGrid}>
        {[
          { id: 1, player: 'LeBron James', team: 'LAL', injury: 'Ankle', status: 'Questionable', impact: 'High' },
          { id: 2, player: 'Patrick Mahomes', team: 'KC', injury: 'Knee', status: 'Probable', impact: 'Medium' },
          { id: 3, player: 'Mike Trout', team: 'LAA', injury: 'Hamstring', status: 'Out', impact: 'High' },
          { id: 4, player: 'Connor McDavid', team: 'EDM', injury: 'Upper Body', status: 'Game-time', impact: 'Critical' },
        ].map((injury) => (
          <View key={injury.id} style={styles.injuryCard}>
            <View style={styles.injuryHeader}>
              <Text style={styles.injuryPlayer}>{injury.player}</Text>
              <View style={[
                styles.injuryStatus,
                { backgroundColor: 
                  injury.status === 'Out' ? '#fee2e2' : 
                  injury.status === 'Questionable' ? '#fef3c7' : 
                  '#d1fae5'
                }
              ]}>
                <Text style={[
                  styles.injuryStatusText,
                  { color: 
                    injury.status === 'Out' ? '#dc2626' : 
                    injury.status === 'Questionable' ? '#92400e' : 
                    '#065f46'
                  }
                ]}>
                  {injury.status}
                </Text>
              </View>
            </View>
            <Text style={styles.injuryTeam}>{injury.team} • {injury.injury}</Text>
            <View style={styles.injuryDetails}>
              <View style={styles.injuryDetail}>
                <Text style={styles.detailLabel}>Impact</Text>
                <View style={styles.impactIndicator}>
                  <View style={[
                    styles.impactBar,
                    { 
                      width: injury.impact === 'High' ? '80%' : 
                            injury.impact === 'Critical' ? '100%' : '60%',
                      backgroundColor: injury.impact === 'Critical' ? '#ef4444' : 
                                      injury.impact === 'High' ? '#f59e0b' : '#10b981'
                    }
                  ]} />
                </View>
                <Text style={styles.impactText}>{injury.impact}</Text>
              </View>
              <View style={styles.injuryDetail}>
                <Text style={styles.detailLabel}>Return</Text>
                <Text style={styles.returnDate}>
                  {injury.status === 'Out' ? '1-2 weeks' : 
                   injury.status === 'Questionable' ? 'Game-time' : 'Expected'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderRosterAnalysis = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📊 Roster Analysis</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Full Analysis →</Text>
        </TouchableOpacity>
      </View>
      
      {[
        {
          id: 1,
          team: 'Golden State Warriors',
          analysis: 'Rotation changes expected with recent bench performance metrics',
          metrics: [
            { label: 'Bench +/-', value: '+4.2', trend: 'up' },
            { label: 'Player Efficiency', value: '18.7', trend: 'stable' },
            { label: 'Usage Rate', value: '22.4%', trend: 'down' },
          ]
        },
        {
          id: 2,
          team: 'Kansas City Chiefs',
          analysis: 'Depth chart adjustments based on injury recovery timelines',
          metrics: [
            { label: 'Depth Score', value: 'B+', trend: 'up' },
            { label: 'Injury Risk', value: 'Low', trend: 'stable' },
            { label: 'Chemistry', value: '92%', trend: 'up' },
          ]
        },
      ].map((analysis) => (
        <View key={analysis.id} style={styles.rosterCard}>
          <View style={styles.rosterHeader}>
            <Text style={styles.rosterTeam}>{analysis.team}</Text>
            <Text style={styles.rosterUpdate}>Updated Today</Text>
          </View>
          <Text style={styles.rosterAnalysis}>{analysis.analysis}</Text>
          <View style={styles.rosterMetrics}>
            {analysis.metrics.map((metric, index) => (
              <View key={index} style={styles.metricItem}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <View style={styles.metricValueRow}>
                  <Text style={styles.metricValue}>{metric.value}</Text>
                  <Ionicons 
                    name={metric.trend === 'up' ? 'trending-up' : 
                          metric.trend === 'down' ? 'trending-down' : 'remove'}
                    size={14} 
                    color={metric.trend === 'up' ? '#10b981' : 
                           metric.trend === 'down' ? '#ef4444' : '#6b7280'} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderAdvancedStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🧮 Advanced Statistics</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={24} color="#10b981" />
          <Text style={styles.statNumber}>+12.4%</Text>
          <Text style={styles.statLabel}>Team Efficiency</Text>
          <Text style={styles.statSubtext}>Last 10 Games</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="bar-chart" size={24} color="#3b82f6" />
          <Text style={styles.statNumber}>18.7</Text>
          <Text style={styles.statLabel}>Avg PER</Text>
          <Text style={styles.statSubtext}>Player Efficiency</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="speedometer" size={24} color="#f59e0b" />
          <Text style={styles.statNumber}>4.2</Text>
          <Text style={styles.statLabel}>Net Rating</Text>
          <Text style={styles.statSubtext}>Off/Def Differential</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="pulse" size={24} color="#ef4444" />
          <Text style={styles.statNumber}>68%</Text>
          <Text style={styles.statLabel}>Win Probability</Text>
          <Text style={styles.statSubtext}>Based on Models</Text>
        </View>
      </View>
    </View>
  );

  const renderFeaturedAnalytics = () => (
    <TouchableOpacity style={styles.featuredCard}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.featuredContent}
      >
        <View style={styles.featuredBadge}>
          <Ionicons name="analytics" size={14} color="#60a5fa" />
          <Text style={styles.featuredBadgeText}>ADVANCED ANALYSIS</Text>
        </View>
        <Text style={styles.featuredTitle}>
          The Impact of Advanced Analytics on Modern Roster Construction
        </Text>
        <Text style={styles.featuredExcerpt}>
          How teams are using data science, machine learning models, and predictive analytics 
          to optimize lineups, manage player health, and gain competitive advantages.
        </Text>
        <View style={styles.featuredFooter}>
          <View style={styles.authorInfo}>
            <View style={styles.authorAvatar}>
              <Ionicons name="person" size={16} color="#cbd5e1" />
            </View>
            <View>
              <Text style={styles.authorName}>Dr. Michael Chen</Text>
              <Text style={styles.authorRole}>Sports Data Scientist</Text>
            </View>
          </View>
          <View style={styles.articleMetrics}>
            <View style={styles.metricItemSmall}>
              <Ionicons name="stats-chart" size={12} color="#94a3b8" />
              <Text style={styles.metricText}>15 Models</Text>
            </View>
            <View style={styles.metricItemSmall}>
              <Ionicons name="time" size={12} color="#94a3b8" />
              <Text style={styles.metricText}>8 min read</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderNewsByCategory = () => {
    const categoryNews = {
      'beat-writers': [
        { title: 'Exclusive: Inside the Lakers\' Front Office Strategy', writer: 'Ramona Shelburne' },
        { title: 'What NFL GMs are Sending About the Draft', writer: 'Peter King' },
        { title: 'MLB Trade Deadline: Behind-the-Scenes Intel', writer: 'Ken Rosenthal' },
      ],
      'injuries': [
        { title: 'Comprehensive Injury Report: Week 16 Updates', severity: 'High' },
        { title: 'Recovery Timelines: Key Players Returning Soon', severity: 'Medium' },
        { title: 'Prevention Strategies Teams are Implementing', severity: 'Low' },
      ],
      'rosters': [
        { title: 'Depth Chart Analysis: NFC Contenders', metrics: '15 teams analyzed' },
        { title: 'Rotation Optimization Using Player Tracking Data', metrics: 'AI-powered insights' },
        { title: 'Contract Value vs Performance Analysis', metrics: 'Salary cap impact' },
      ],
      'analytics': [
        { title: 'Win Probability Models: How Accurate Are They?', models: '7 different models' },
        { title: 'Player Impact Plus-Minus: New Metric Explained', models: 'Advanced stat' },
        { title: 'Predicting Breakout Seasons Using Machine Learning', models: 'ML algorithms' },
      ],
    };

    const articles = categoryNews[selectedCategory] || [];

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {categories.find(c => c.id === selectedCategory)?.name}
          </Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>More →</Text>
          </TouchableOpacity>
        </View>
        
        {articles.map((article, index) => (
          <TouchableOpacity key={index} style={styles.newsCard}>
            <View style={styles.newsHeader}>
              <View style={styles.newsCategoryBadge}>
                <Text style={styles.newsCategoryText}>
                  {selectedCategory.toUpperCase().replace('-', ' ')}
                </Text>
              </View>
              <Text style={styles.newsTime}>Today</Text>
            </View>
            
            <Text style={styles.newsTitle}>{article.title}</Text>
            
            {article.writer && (
              <View style={styles.byline}>
                <Ionicons name="person" size={12} color="#6b7280" />
                <Text style={styles.bylineText}>By {article.writer}</Text>
              </View>
            )}
            
            {article.severity && (
              <View style={styles.severity}>
                <View style={[
                  styles.severityDot,
                  { backgroundColor: 
                    article.severity === 'High' ? '#ef4444' : 
                    article.severity === 'Medium' ? '#f59e0b' : '#10b981'
                  }
                ]} />
                <Text style={styles.severityText}>Impact: {article.severity}</Text>
              </View>
            )}
            
            {article.metrics && (
              <View style={styles.metricsPreview}>
                <Ionicons name="analytics" size={12} color="#6b7280" />
                <Text style={styles.metricsText}>{article.metrics}</Text>
              </View>
            )}
            
            <View style={styles.newsFooter}>
              <View style={styles.newsStats}>
                <View style={styles.statItem}>
                  <Ionicons name="analytics" size={12} color="#3b82f6" />
                  <Text style={styles.statCount}>Data-Driven</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="checkmark-circle" size={12} color="#10b981" />
                  <Text style={styles.statCount}>Verified</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.bookmarkButton}>
                <Ionicons name="bookmark-outline" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Sports Intelligence...</Text>
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
        {renderCategoryTabs()}
        {renderTrendingSection()}
        {renderBeatWriters()}
        {renderInjuryReport()}
        {renderAdvancedStats()}
        {renderRosterAnalysis()}
        {renderFeaturedAnalytics()}
        {renderNewsByCategory()}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Premium sports intelligence powered by beat writers, data scientists, 
            and league insiders. Real-time updates on injuries, rosters, and analytics.
          </Text>
          <Text style={styles.footerSubtext}>
            Updated every 15 minutes • 98% accuracy rate
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

// Styles remain outside the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
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
  categoriesScroll: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeCategoryTab: {
    backgroundColor: '#3b82f6',
  },
  categoryText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeCategoryText: {
    color: 'white',
  },
  section: {
    margin: 15,
    marginTop: 0,
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
  trendingCard: {
    width: width * 0.7,
    backgroundColor: 'white',
    borderRadius: 15,
    marginRight: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendingImage: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  trendingEmoji: {
    fontSize: 48,
  },
  storyTypeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  storyTypeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  trendingContent: {
    padding: 15,
  },
  writerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  writerName: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 4,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 18,
  },
  trendingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingCategory: {
    fontSize: 10,
    color: '#3b82f6',
    fontWeight: '600',
  },
  trendingStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingViews: {
    fontSize: 10,
    color: '#9ca3af',
    marginHorizontal: 4,
  },
  trendingTime: {
    fontSize: 10,
    color: '#9ca3af',
  },
  writersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  writerCard: {
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
  writerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  writerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  writerInitial: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  writerInfo: {
    flex: 1,
  },
  writerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  writerTeam: {
    fontSize: 11,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
  },
  writerRecent: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 10,
    lineHeight: 16,
  },
  writerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  writerStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  writerStatText: {
    fontSize: 10,
    color: '#6b7280',
    marginLeft: 3,
  },
  injuryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  injuryCard: {
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
  injuryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  injuryPlayer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  injuryStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  injuryStatusText: {
    fontSize: 9,
    fontWeight: '600',
  },
  injuryTeam: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
  },
  injuryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  injuryDetail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 4,
  },
  impactIndicator: {
    width: 40,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  impactBar: {
    height: '100%',
    borderRadius: 3,
  },
  impactText: {
    fontSize: 10,
    fontWeight: '600',
  },
  returnDate: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1f2937',
  },
  rosterCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rosterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rosterTeam: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  rosterUpdate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  rosterAnalysis: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 15,
    lineHeight: 18,
  },
  rosterMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 4,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 4,
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
  statSubtext: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 2,
  },
  featuredCard: {
    margin: 15,
    marginTop: 0,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  featuredContent: {
    padding: 25,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 15,
  },
  featuredBadgeText: {
    fontSize: 10,
    color: '#60a5fa',
    fontWeight: '600',
    marginLeft: 4,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    lineHeight: 24,
  },
  featuredExcerpt: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 20,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#475569',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  authorRole: {
    fontSize: 10,
    color: '#94a3b8',
  },
  articleMetrics: {
    flexDirection: 'row',
  },
  metricItemSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  metricText: {
    fontSize: 11,
    color: '#94a3b8',
    marginLeft: 3,
  },
  newsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  newsCategoryBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  newsCategoryText: {
    fontSize: 10,
    color: '#4f46e5',
    fontWeight: '600',
  },
  newsTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
    lineHeight: 20,
  },
  byline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bylineText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  severity: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  severityText: {
    fontSize: 12,
    color: '#6b7280',
  },
  metricsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  metricsText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsStats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statCount: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  bookmarkButton: {
    padding: 6,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    marginTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default SportsNewsHub;
