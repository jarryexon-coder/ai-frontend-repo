import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  TextInput,
  Modal,
  Platform,
  Alert,
  Clipboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Firebase Analytics
import { logAnalyticsEvent, logScreenView } from '../services/firebase';

// Import navigation helper
import { useAppNavigation } from '../navigation/NavigationHelper';
import SearchBar from '../components/SearchBar';
import { useSearch } from '../providers/SearchProvider';
import useDailyLocks from '../hooks/useDailyLocks';
import Purchases from 'react-native-purchases';

const { width } = Dimensions.get('window');

// Analytics Box Component
const AnalyticsBox = () => {
  const [analyticsEvents, setAnalyticsEvents] = useState([]);
  const [showAnalyticsBox, setShowAnalyticsBox] = useState(false);

  useEffect(() => {
    loadAnalyticsEvents();
    // Set up interval to refresh analytics every 10 seconds
    const interval = setInterval(loadAnalyticsEvents, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsEvents = async () => {
    try {
      const eventsString = await AsyncStorage.getItem('analytics_events');
      if (eventsString) {
        const events = JSON.parse(eventsString);
        // Get only the 10 most recent events
        setAnalyticsEvents(events.slice(-10).reverse());
      }
    } catch (error) {
      console.error('Failed to load analytics events', error);
    }
  };

  const clearAnalyticsEvents = async () => {
    try {
      await AsyncStorage.removeItem('analytics_events');
      setAnalyticsEvents([]);
      Alert.alert('Analytics Cleared', 'All analytics events have been cleared.');
    } catch (error) {
      console.error('Failed to clear analytics events', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!showAnalyticsBox) {
    return (
      <TouchableOpacity 
        style={[analyticsStyles.floatingButton, {backgroundColor: '#3b82f6'}]}
        onPress={() => {
          setShowAnalyticsBox(true);
          logAnalyticsEvent('analytics_box_opened', {
            screen: 'daily_picks',
            event_count: analyticsEvents.length
          });
        }}
      >
        <LinearGradient
          colors={['#3b82f6', '#1d4ed8']}
          style={analyticsStyles.floatingButtonGradient}
        >
          <Ionicons name="analytics" size={20} color="white" />
          <Text style={analyticsStyles.floatingButtonText}>Analytics</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[analyticsStyles.container, {backgroundColor: '#1e293b'}]}>
      <LinearGradient
        colors={['#1e293b', '#0f172a']}
        style={analyticsStyles.gradient}
      >
        <View style={analyticsStyles.header}>
          <View style={analyticsStyles.headerLeft}>
            <Ionicons name="analytics" size={24} color="#3b82f6" />
            <Text style={analyticsStyles.title}>Analytics Debug</Text>
          </View>
          <View style={analyticsStyles.headerRight}>
            <TouchableOpacity 
              style={analyticsStyles.iconButton}
              onPress={() => {
                clearAnalyticsEvents();
                logAnalyticsEvent('analytics_cleared', { screen: 'daily_picks' });
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={analyticsStyles.iconButton}
              onPress={() => setShowAnalyticsBox(false)}
            >
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={analyticsStyles.statsContainer}>
          <View style={analyticsStyles.statItem}>
            <Text style={analyticsStyles.statValue}>{analyticsEvents.length}</Text>
            <Text style={analyticsStyles.statLabel}>Total Events</Text>
          </View>
          <View style={analyticsStyles.statItem}>
            <Text style={analyticsStyles.statValue}>
              {analyticsEvents.filter(e => e.event.includes('click')).length}
            </Text>
            <Text style={analyticsStyles.statLabel}>Clicks</Text>
          </View>
          <View style={analyticsStyles.statItem}>
            <Text style={analyticsStyles.statValue}>
              {analyticsEvents.filter(e => e.event.includes('view')).length}
            </Text>
            <Text style={analyticsStyles.statLabel}>Views</Text>
          </View>
        </View>

        <View style={analyticsStyles.eventsContainer}>
          <Text style={analyticsStyles.eventsTitle}>Recent Events</Text>
          <ScrollView style={analyticsStyles.eventsList}>
            {analyticsEvents.length === 0 ? (
              <View style={analyticsStyles.emptyEvents}>
                <Ionicons name="analytics-outline" size={40} color="#475569" />
                <Text style={analyticsStyles.emptyText}>No analytics events recorded</Text>
              </View>
            ) : (
              analyticsEvents.map((event, index) => (
                <View key={index} style={analyticsStyles.eventItem}>
                  <View style={analyticsStyles.eventHeader}>
                    <View style={[
                      analyticsStyles.eventTypeBadge,
                      event.event.includes('error') ? analyticsStyles.errorBadge :
                      event.event.includes('success') ? analyticsStyles.successBadge :
                      analyticsStyles.infoBadge
                    ]}>
                      <Ionicons 
                        name={
                          event.event.includes('error') ? 'warning' :
                          event.event.includes('success') ? 'checkmark-circle' :
                          'information-circle'
                        } 
                        size={12} 
                        color="white" 
                      />
                      <Text style={analyticsStyles.eventTypeText}>
                        {event.event.split('_').slice(0, 2).join(' ')}
                      </Text>
                    </View>
                    <Text style={analyticsStyles.eventTime}>{formatTimestamp(event.timestamp)}</Text>
                  </View>
                  <Text style={analyticsStyles.eventName}>{event.event}</Text>
                  {Object.keys(event.params).length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <Text style={analyticsStyles.eventParams}>
                        {JSON.stringify(event.params)}
                      </Text>
                    </ScrollView>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>

        <TouchableOpacity 
          style={analyticsStyles.copyButton}
          onPress={async () => {
            try {
              await Clipboard.setString(JSON.stringify(analyticsEvents, null, 2));
              Alert.alert('Copied!', 'Analytics data copied to clipboard.');
            } catch (error) {
              Alert.alert('Error', 'Failed to copy analytics data.');
            }
          }}
        >
          <Text style={analyticsStyles.copyButtonText}>Copy All Data</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

// Analytics Box Styles
const analyticsStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: width * 0.9,
    maxWidth: 400,
    height: 400,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  floatingButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    backgroundColor: 'transparent',
  },
  iconButton: {
    padding: 4,
    marginLeft: 8,
    backgroundColor: 'transparent',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
    backgroundColor: 'transparent',
  },
  eventsContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  eventsTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  eventsList: {
    flex: 1,
  },
  emptyEvents: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  eventItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  eventTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  infoBadge: {
    backgroundColor: '#3b82f6',
  },
  successBadge: {
    backgroundColor: '#10b981',
  },
  errorBadge: {
    backgroundColor: '#ef4444',
  },
  eventTypeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
    backgroundColor: 'transparent',
  },
  eventTime: {
    color: '#94a3b8',
    fontSize: 10,
    backgroundColor: 'transparent',
  },
  eventName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  eventParams: {
    color: '#cbd5e1',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: 'transparent',
  },
  copyButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  copyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'transparent',
  },
});

// Daily Reset Implementation
const useDailyReset = () => {
  const [lastResetDate, setLastResetDate] = useState(null);
  const [hasResetToday, setHasResetToday] = useState(false);

  useEffect(() => {
    checkAndResetDaily();
  }, []);

  const checkAndResetDaily = async () => {
    try {
      const today = new Date().toDateString();
      const lastDate = await AsyncStorage.getItem('@daily_reset_date');
      
      if (lastDate !== today) {
        // New day - reset AI generated picks
        await resetAIGeneratedPicks();
        await AsyncStorage.setItem('@daily_reset_date', today);
        setLastResetDate(today);
        setHasResetToday(true);
        
        console.log('🎯 Daily reset completed for AI generated picks');
      } else {
        setHasResetToday(false);
      }
      
      setLastResetDate(lastDate);
    } catch (error) {
      console.error('Error in daily reset:', error);
    }
  };

  const resetAIGeneratedPicks = async () => {
    try {
      // Remove AI generated picks from storage
      await AsyncStorage.removeItem('@ai_generated_picks');
      
      // You can also reset other daily limits here
      const today = new Date().toDateString();
      await AsyncStorage.setItem('@daily_reset_date', today);
      
      console.log('🧹 AI generated picks cleared for new day');
      
      return true;
    } catch (error) {
      console.error('Error resetting AI picks:', error);
      return false;
    }
  };

  return { hasResetToday, resetAIGeneratedPicks, lastResetDate };
};

// Generate Counter Hook
const useGenerateCounter = () => {
  const [remainingGenerations, setRemainingGenerations] = useState(2);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  
  useEffect(() => {
    loadGenerateCounter();
  }, []);
  
  const loadGenerateCounter = async () => {
    try {
      const today = new Date().toDateString();
      const lastDate = await AsyncStorage.getItem('@generate_last_date');
      let remaining = 2; // Start with 2 free generations
      
      // Only use stored count if it's the same day
      if (lastDate === today) {
        const storedCount = await AsyncStorage.getItem('@generate_remaining');
        remaining = parseInt(storedCount) || 2;
      } else {
        // New day - reset counter
        await AsyncStorage.setItem('@generate_last_date', today);
        await AsyncStorage.setItem('@generate_remaining', '2');
      }
      
      // Check for premium access
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        if (customerInfo.entitlements.active?.success_metrics_access) {
          setHasPremiumAccess(true);
        }
      } catch (purchaseError) {
        console.log('No premium access detected');
      }
      
      setRemainingGenerations(remaining);
    } catch (error) {
      console.error('Error loading generate counter:', error);
    }
  };
  
  const useGeneration = async () => {
    try {
      // Check if user has premium access
      const customerInfo = await Purchases.getCustomerInfo();
      if (customerInfo.entitlements.active?.success_metrics_access) {
        setHasPremiumAccess(true);
        return { 
          allowed: true, 
          reason: 'premium_access',
          message: 'Premium access: Unlimited generations!',
          remaining: -1 // -1 indicates unlimited
        };
      }
      
      const today = new Date().toDateString();
      const lastDate = await AsyncStorage.getItem('@generate_last_date');
      let remaining = 2;
      
      // Reset if new day
      if (lastDate !== today) {
        await AsyncStorage.setItem('@generate_last_date', today);
        await AsyncStorage.setItem('@generate_remaining', '2');
        remaining = 2;
      } else {
        const storedCount = await AsyncStorage.getItem('@generate_remaining');
        remaining = parseInt(storedCount) || 2;
      }
      
      // Check if any free generations left
      if (remaining > 0) {
        // Use one generation
        remaining--;
        await AsyncStorage.setItem('@generate_remaining', remaining.toString());
        setRemainingGenerations(remaining);
        
        return { 
          allowed: true, 
          remaining,
          reason: 'free',
          message: `Picks generated! ${remaining} free generations left today.`
        };
      } else {
        // No free generations left
        return { 
          allowed: false, 
          remaining: 0,
          reason: 'limit_reached',
          message: 'You\'ve used all 2 free generations today.'
        };
      }
    } catch (error) {
      console.error('Error checking generate counter:', error);
      return { 
        allowed: false, 
        reason: 'error',
        message: 'Error checking generation availability.'
      };
    }
  };
  
  const purchaseGenerationPack = async () => {
    try {
      const { customerInfo } = await Purchases.purchaseProduct('generation_pack');
      // Check if purchase was successful
      if (customerInfo.entitlements.active?.generation_access) {
        // For now, assume success and add 10 more generations
        await AsyncStorage.setItem('@generate_remaining', '10');
        setRemainingGenerations(10);
        return { success: true, message: 'Purchased 10 additional generations!' };
      }
      return { success: false, message: 'Purchase failed. Please try again.' };
    } catch (error) {
      if (!error.userCancelled) {
        return { success: false, message: 'Purchase failed. Please try again.' };
      }
      return { success: false, message: 'Purchase cancelled.' };
    }
  };
  
  const resetCounter = async () => {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem('@generate_last_date', today);
      await AsyncStorage.setItem('@generate_remaining', '2');
      setRemainingGenerations(2);
    } catch (error) {
      console.error('Error resetting counter:', error);
    }
  };
  
  return { 
    remainingGenerations, 
    hasPremiumAccess,
    useGeneration, 
    purchaseGenerationPack,
    resetCounter 
  };
};

// Visual Metrics Card Component
const VisualMetricsCard = ({ stats }) => {
  const progress = (stats.hitRate - 70) / 30; // Normalize between 70-100%
  
  return (
    <View style={[visualMetricsStyles.container, {backgroundColor: '#1e293b'}]}>
      <LinearGradient
        colors={['#1e293b', '#0f172a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={visualMetricsStyles.gradient}
      >
        <View style={visualMetricsStyles.header}>
          <Ionicons name="analytics" size={24} color="#8b5cf6" />
          <Text style={visualMetricsStyles.title}>AI Performance Insights</Text>
        </View>
        
        {/* Progress bar for hit rate */}
        <View style={visualMetricsStyles.progressSection}>
          <View style={visualMetricsStyles.progressHeader}>
            <Text style={visualMetricsStyles.progressLabel}>Hit Rate Accuracy</Text>
            <Text style={visualMetricsStyles.progressValue}>{stats.hitRate}</Text>
          </View>
          <View style={visualMetricsStyles.progressBarContainer}>
            <View style={visualMetricsStyles.progressBarBackground}>
              <View 
                style={[
                  visualMetricsStyles.progressBarFill,
                  { width: `${progress * 100}%` }
                ]}
              />
            </View>
            <View style={visualMetricsStyles.progressLabels}>
              <Text style={visualMetricsStyles.progressMin}>70%</Text>
              <Text style={visualMetricsStyles.progressMax}>100%</Text>
            </View>
          </View>
        </View>
        
        <View style={visualMetricsStyles.statsGrid}>
          <View style={visualMetricsStyles.statItem}>
            <View style={visualMetricsStyles.statIconContainer}>
              <Ionicons name="trending-up" size={20} color="#10b981" />
            </View>
            <Text style={visualMetricsStyles.statValue}>{stats.roi}</Text>
            <Text style={visualMetricsStyles.statLabel}>ROI</Text>
          </View>
          
          <View style={visualMetricsStyles.statItem}>
            <View style={visualMetricsStyles.statIconContainer}>
              <Ionicons name="flame" size={20} color="#f59e0b" />
            </View>
            <Text style={visualMetricsStyles.statValue}>{stats.streak}</Text>
            <Text style={visualMetricsStyles.statLabel}>Streak</Text>
          </View>
          
          <View style={visualMetricsStyles.statItem}>
            <View style={visualMetricsStyles.statIconContainer}>
              <Ionicons name="star" size={20} color="#8b5cf6" />
            </View>
            <Text style={visualMetricsStyles.statValue}>{stats.avgEdge}</Text>
            <Text style={visualMetricsStyles.statLabel}>Avg Edge</Text>
          </View>
          
          <View style={visualMetricsStyles.statItem}>
            <View style={visualMetricsStyles.statIconContainer}>
              <Ionicons name="shield-checkmark" size={20} color="#3b82f6" />
            </View>
            <Text style={visualMetricsStyles.statValue}>{stats.confidence}</Text>
            <Text style={visualMetricsStyles.statLabel}>Confidence</Text>
          </View>
        </View>
        
        <View style={visualMetricsStyles.footer}>
          <Ionicons name="information-circle" size={14} color="#64748b" />
          <Text style={visualMetricsStyles.footerText}>
            Powered by GPT-4 insights and real-time analytics
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

// Visual Metrics Styles
const visualMetricsStyles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
    backgroundColor: 'transparent',
  },
  progressSection: {
    marginBottom: 25,
    backgroundColor: 'transparent',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  progressLabel: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '600',
    backgroundColor: 'transparent',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8b5cf6',
    backgroundColor: 'transparent',
  },
  progressBarContainer: {
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  progressMin: {
    fontSize: 12,
    color: '#64748b',
    backgroundColor: 'transparent',
  },
  progressMax: {
    fontSize: 12,
    color: '#64748b',
    backgroundColor: 'transparent',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    backgroundColor: 'transparent',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    backgroundColor: 'transparent',
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 8,
    backgroundColor: 'transparent',
  },
});

// Gradient Wrapper Component for fixing shadow warnings
const GradientWrapper = ({ colors, style, children, gradientStyle }) => {
  const firstColor = colors?.[0] || '#8b5cf6';
  return (
    <View style={[style, { backgroundColor: firstColor }]}>
      <LinearGradient
        colors={colors}
        style={gradientStyle || StyleSheet.absoluteFillObject}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

// Main Component
export default function DailyPicksScreen() {
  const navigation = useAppNavigation();
  const { searchHistory, addToSearchHistory } = useSearch();
  const daily = useDailyLocks();
  const generateCounter = useGenerateCounter();
  const { hasResetToday } = useDailyReset();
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [picks, setPicks] = useState([]);
  const [filteredPicks, setFilteredPicks] = useState([]);
  const [selectedSport, setSelectedSport] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showGeneratingModal, setShowGeneratingModal] = useState(false);
  
  // Mock data
  const mockPicks = [
    {
      id: '1',
      player: 'Stephen Curry',
      team: 'GSW',
      sport: 'NBA',
      pick: 'Over 31.5 Points',
      confidence: 92,
      odds: '-120',
      edge: '+5.2%',
      analysis: 'Advanced: Averaging 34.2 points (115% of prop) in last 5 games.',
      timestamp: 'Today, 2:30 PM',
      category: 'High Probability',
      probability: '92%',
      roi: '+24%',
      units: '2.5',
      requiresPremium: false,
    },
    {
      id: '2',
      player: 'Patrick Mahomes',
      team: 'KC',
      sport: 'NFL',
      pick: 'Over 285.5 Passing Yards',
      confidence: 88,
      odds: '-110',
      edge: '+4.8%',
      analysis: 'Advanced: Defense allows 280.3 passing YPG (29th).',
      timestamp: 'Today, 1:45 PM',
      category: 'Value Bet',
      probability: '88%',
      roi: '+18%',
      units: '2.0',
      requiresPremium: true,
    },
  ];

  // Log screen view on mount
  useEffect(() => {
    logScreenView('DailyPicksScreen');
    loadPicks();
  }, []);

  const loadPicks = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const filtered = selectedSport === 'All' 
        ? mockPicks 
        : mockPicks.filter(pick => pick.sport === selectedSport);
      
      setPicks(filtered);
      setFilteredPicks(filtered);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error loading picks:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPicks();
    logAnalyticsEvent('daily_picks_refresh');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    addToSearchHistory(query);
    
    if (!query.trim()) {
      setFilteredPicks(picks);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = picks.filter(pick =>
      (pick.player || '').toLowerCase().includes(lowerQuery) ||
      (pick.team || '').toLowerCase().includes(lowerQuery) ||
      (pick.sport || '').toLowerCase().includes(lowerQuery) ||
      (pick.pick || '').toLowerCase().includes(lowerQuery)
    );
    
    setFilteredPicks(filtered);
    logAnalyticsEvent('daily_picks_search', { query, results: filtered.length });
  };

  const generatePicks = async (prompt) => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt to generate picks');
      return;
    }

    // Check generation counter
    const result = await generateCounter.useGeneration();
    
    if (result.allowed) {
      setGenerating(true);
      setShowGeneratingModal(true);
      
      logAnalyticsEvent('daily_picks_generation_start', { prompt });
      
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate generated picks
        const generatedPicks = [{
          id: `gen-${Date.now()}`,
          player: 'AI Generated',
          team: 'AI',
          sport: 'NBA',
          pick: 'AI Generated Prediction',
          confidence: 85,
          odds: '+150',
          edge: '+3.5%',
          analysis: 'Generated by AI based on your prompt.',
          timestamp: 'Just now',
          category: 'AI Generated',
          probability: '85%',
          roi: '+15%',
          units: '1.5',
          generatedFrom: prompt,
          requiresPremium: false,
        }];
        
        const updatedPicks = [...generatedPicks, ...picks];
        setPicks(updatedPicks);
        setFilteredPicks(updatedPicks);
        
        logAnalyticsEvent('daily_picks_generation_success', {
          prompt,
          remaining: result.remaining
        });
        
        setTimeout(() => {
          setShowGeneratingModal(false);
          setGenerating(false);
          setCustomPrompt('');
        }, 2000);
        
      } catch (error) {
        console.error('Error generating picks:', error);
        logAnalyticsEvent('daily_picks_generation_error', { error: error.message });
        Alert.alert('Error', 'Failed to generate picks');
        setGenerating(false);
        setShowGeneratingModal(false);
      }
    } else {
      if (result.reason === 'limit_reached') {
        setShowUpgradeModal(true);
      } else {
        Alert.alert('Error', result.message);
      }
    }
  };

  const renderPickItem = ({ item }) => {
    const isPremiumLocked = item.requiresPremium && !daily.hasAccess;
    
    const getSportBadgeStyle = () => {
      switch (item.sport) {
        case 'NBA': return [styles.sportBadgeNBA, styles.sportTextNBA];
        case 'NFL': return [styles.sportBadgeNFL, styles.sportTextNFL];
        case 'NHL': return [styles.sportBadgeNHL, styles.sportTextNHL];
        case 'MLB': return [styles.sportBadgeMLB, styles.sportTextMLB];
        default: return [styles.sportBadgeDefault, styles.sportTextDefault];
      }
    };

    const getCategoryStyle = () => {
      switch (item.category) {
        case 'High Probability': return [styles.categoryBadgeHigh, styles.categoryTextHigh];
        case 'AI Generated': return [styles.categoryBadgeAI, styles.categoryTextAI];
        case 'Value Bet': return [styles.categoryBadgeValue, styles.categoryTextValue];
        default: return [styles.categoryBadgeDefault, styles.categoryTextDefault];
      }
    };

    const getConfidenceStyle = () => {
      if (item.confidence >= 90) return styles.confidenceBadgeHigh;
      if (item.confidence >= 80) return styles.confidenceBadgeMedium;
      if (item.confidence >= 70) return styles.confidenceBadgeLow;
      return styles.confidenceBadgeVeryLow;
    };

    const [badgeStyle, textStyle] = getSportBadgeStyle();
    const [categoryBadgeStyle, categoryTextStyle] = getCategoryStyle();
    const confidenceStyle = getConfidenceStyle();

    return (
      <View style={styles.pickCard}>
        <View style={styles.pickCardContent}>
          <View style={styles.pickHeader}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{item.player}</Text>
              <View style={styles.pickSubheader}>
                <Text style={styles.teamText}>{item.team}</Text>
                <View style={[styles.sportBadge, styles.sportBadgeInner, badgeStyle]}>
                  <Text style={[styles.sportText, textStyle]}>{item.sport}</Text>
                </View>
              </View>
              {item.category && (
                <View style={styles.categoryContainer}>
                  <View style={[styles.categoryBadge, categoryBadgeStyle]}>
                    <Text style={[styles.categoryText, categoryTextStyle]}>{item.category}</Text>
                  </View>
                </View>
              )}
            </View>
            <View style={[styles.confidenceBadge, styles.confidenceBadgeInner, confidenceStyle]}>
              <Text style={styles.confidenceText}>{item.confidence}%</Text>
            </View>
          </View>
          
          <View style={styles.pickDetails}>
            <Text style={[styles.pickValue, isPremiumLocked && styles.premiumLockedText]}>
              {item.pick}
            </Text>
            <View style={styles.pickMeta}>
              <View style={styles.oddsContainer}>
                <Text style={styles.oddsLabel}>Odds:</Text>
                <Text style={styles.oddsText}>{item.odds}</Text>
              </View>
              <View style={styles.edgeContainer}>
                <Ionicons name="trending-up" size={14} color="#10b981" />
                <Text style={styles.edgeText}>{item.edge} edge</Text>
              </View>
            </View>
          </View>
          
          {item.probability && (
            <View style={styles.probabilityMetrics}>
              <View style={styles.metricItem}>
                <Ionicons name="stats-chart" size={14} color="#8b5cf6" />
                <Text style={styles.metricLabel}>Win Chance</Text>
                <Text style={styles.metricValue}>{item.probability}</Text>
              </View>
              <View style={styles.metricItem}>
                <Ionicons name="cash" size={14} color="#10b981" />
                <Text style={styles.metricLabel}>Projected ROI</Text>
                <Text style={styles.metricValue}>{item.roi}</Text>
              </View>
              <View style={styles.metricItem}>
                <Ionicons name="trophy" size={14} color="#f59e0b" />
                <Text style={styles.metricLabel}>Units</Text>
                <Text style={styles.metricValue}>{item.units}</Text>
              </View>
            </View>
          )}
          
          <View style={styles.analysisContainer}>
            <Ionicons name="analytics" size={20} color="#f59e0b" />
            <Text style={[styles.analysisText, isPremiumLocked && styles.premiumLockedText]}>
              {isPremiumLocked ? '🔒 Premium analysis available with upgrade' : item.analysis}
            </Text>
          </View>
          
          {item.generatedFrom && (
            <View style={styles.generatedInfo}>
              <Ionicons name="sparkles" size={12} color="#8b5cf6" />
              <Text style={styles.generatedText}>
                Generated from: "{item.generatedFrom.substring(0, 50)}..."
              </Text>
            </View>
          )}
          
          <View style={styles.footer}>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
            <TouchableOpacity 
              style={styles.trackButton}
              onPress={() => {
                if (isPremiumLocked) {
                  Alert.alert(
                    'Premium Pick',
                    'This pick requires premium access.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Upgrade', onPress: () => navigation.goToSuccessMetrics() }
                    ]
                  );
                  return;
                }
                
                logAnalyticsEvent('daily_pick_track', {
                  player: item.player,
                  pick: item.pick,
                  confidence: item.confidence,
                });
                Alert.alert('Tracking Started', 'Pick added to tracked picks.');
              }}
            >
              <GradientWrapper
                colors={['#8b5cf6', '#7c3aed']}
                style={styles.trackButtonGradient}
              >
                <Ionicons name="bookmark-outline" size={16} color="white" />
                <Text style={styles.trackButtonText}>Track</Text>
              </GradientWrapper>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderSearchBar = () => {
    if (!showSearch) return null;

    return (
      <>
        <SearchBar
          placeholder="Search daily picks by player, team, or sport..."
          onSearch={handleSearch}
          searchHistory={searchHistory}
          style={styles.homeSearchBar}
          onClose={() => {
            setShowSearch(false);
            setSearchQuery('');
          }}
        />
        
        {searchQuery.trim() && picks.length !== filteredPicks.length && (
          <View style={styles.searchResultsInfo}>
            <Text style={styles.searchResultsText}>
              {filteredPicks.length} of {picks.length} picks match "{searchQuery}"
            </Text>
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              activeOpacity={0.7}
            >
              <Text style={styles.clearSearchText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  };

  const sports = [
    { id: 'All', name: 'All Sports', icon: 'grid', gradient: ['#8b5cf6', '#7c3aed'] },
    { id: 'NBA', name: 'NBA', icon: 'basketball', gradient: ['#ef4444', '#dc2626'] },
    { id: 'NFL', name: 'NFL', icon: 'american-football', gradient: ['#3b82f6', '#1d4ed8'] },
    { id: 'NHL', name: 'NHL', icon: 'ice-cream', gradient: ['#1e40af', '#1e3a8a'] },
    { id: 'MLB', name: 'MLB', icon: 'baseball', gradient: ['#10b981', '#059669'] },
  ];

  const prompts = [
    "Generate top 3 high probability NBA player props for tonight",
    "Show me NFL picks with over 85% confidence",
    "Best MLB value bets with positive expected value",
    "Create a 3-leg parlay with highest probability",
    "Easy wins for tonight's basketball games",
  ];

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading Daily Picks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header - FIXED WITH SOLID BACKGROUND WRAPPER */}
      <View style={[styles.header, {backgroundColor: '#8b5cf6'}]}>
        <LinearGradient
          colors={['#8b5cf6', '#7c3aed']}
          style={[StyleSheet.absoluteFillObject, styles.headerOverlay]}
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
              onPress={() => {
                setShowSearch(true);
                logAnalyticsEvent('daily_picks_search_open');
              }}
            >
              <Ionicons name="search-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerMain}>
            <View style={styles.headerIcon}>
              <Ionicons name="calendar" size={32} color="white" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Daily Picks</Text>
              <Text style={styles.headerSubtitle}>AI-curated selections updated daily</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Generate Counter */}
      <View style={styles.counterContainer}>
        <View style={styles.counterHeader}>
          <Ionicons name="flash" size={20} color="#8b5cf6" />
          <Text style={styles.counterTitle}>Daily Generation Limit</Text>
        </View>
        
        <View style={styles.counterContent}>
          {generateCounter.hasPremiumAccess ? (
            <GradientWrapper
              colors={['#10b981', '#059669']}
              style={styles.premiumBadge}
              gradientStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 10}}
            >
              <Ionicons name="infinite" size={20} color="white" />
              <Text style={styles.premiumText}>Premium: Unlimited Generations</Text>
            </GradientWrapper>
          ) : (
            <>
              <View style={styles.counterInfo}>
                <Text style={styles.counterLabel}>Free generations remaining:</Text>
                <View style={styles.counterDisplay}>
                  <Text style={styles.counterNumber}>{generateCounter.remainingGenerations}</Text>
                  <Text style={styles.counterTotal}>/2</Text>
                </View>
              </View>
              
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(generateCounter.remainingGenerations / 2) * 100}%` }
                  ]} 
                />
              </View>
              
              <Text style={styles.counterHint}>
                Resets daily at midnight. Upgrade for unlimited generations.
              </Text>
            </>
          )}
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8b5cf6']}
            tintColor="#8b5cf6"
          />
        }
      >
        {renderSearchBar()}
        
        {/* Sport Selector */}
        <View style={styles.sportSelector}>
          {sports.map((sport) => (
            <TouchableOpacity
              key={sport.id}
              style={[
                styles.sportButton,
                selectedSport === sport.id && styles.sportButtonActive,
              ]}
              onPress={() => {
                setSelectedSport(sport.id);
                logAnalyticsEvent('daily_picks_sport_filter', { sport: sport.id });
              }}
            >
              {selectedSport === sport.id ? (
                <GradientWrapper
                  colors={sport.gradient}
                  style={styles.sportButtonGradient}
                  gradientStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 15}}
                >
                  <Ionicons name={sport.icon} size={20} color="#fff" />
                  <Text style={styles.sportButtonTextActive}>{sport.name}</Text>
                </GradientWrapper>
              ) : (
                <>
                  <Ionicons name={sport.icon} size={20} color="#6b7280" />
                  <Text style={styles.sportButtonText}>{sport.name}</Text>
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Visual Metrics Card */}
        <VisualMetricsCard 
          stats={{
            hitRate: '87.3%',
            roi: '+24.8%',
            streak: '15-3',
            avgEdge: '4.2⭐',
            confidence: '92%'
          }} 
        />

        {/* Generate Picks Section */}
        <View style={styles.promptsSection}>
          <View style={styles.promptsHeader}>
            <GradientWrapper
              colors={['#8b5cf6', '#7c3aed']}
              style={styles.promptsTitleGradient}
              gradientStyle={{paddingHorizontal: 20, paddingVertical: 12, borderRadius: 15, alignItems: 'center'}}
            >
              <Text style={styles.promptsTitle}>🚀 Generate Daily Picks</Text>
            </GradientWrapper>
            <Text style={styles.promptsSubtitle}>
              {hasResetToday ? '🎯 Fresh picks for a new day!' : 'Use AI to generate custom picks'}
            </Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.promptsScroll}
          >
            {prompts.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.promptChip}
                onPress={() => generatePicks(prompt)}
                disabled={generating}
              >
                <GradientWrapper
                  colors={['#8b5cf6', '#7c3aed']}
                  style={[styles.promptChipGradient, generating && styles.promptChipDisabled]}
                  gradientStyle={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 20, minWidth: 220}}
                >
                  <Ionicons name="sparkles" size={14} color="#fff" />
                  <Text style={styles.promptChipText}>{prompt}</Text>
                </GradientWrapper>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.customPromptContainer}>
            <View style={styles.promptInputContainer}>
              <Ionicons name="create" size={20} color="#8b5cf6" />
              <TextInput
                style={styles.promptInput}
                placeholder="Or type your own prompt (e.g., 'NBA parlay for tonight')"
                placeholderTextColor="#94a3b8"
                value={customPrompt}
                onChangeText={setCustomPrompt}
                multiline
                numberOfLines={2}
                editable={!generating}
              />
            </View>
            <TouchableOpacity
              style={[styles.generateButton, (!customPrompt.trim() || generating) && styles.generateButtonDisabled]}
              onPress={() => customPrompt.trim() && generatePicks(customPrompt)}
              disabled={!customPrompt.trim() || generating}
            >
              <GradientWrapper
                colors={['#8b5cf6', '#7c3aed']}
                style={styles.generateButtonGradient}
                gradientStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 15, borderRadius: 15}}
              >
                {generating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="rocket" size={16} color="white" />
                    <Text style={styles.generateButtonText}>Generate</Text>
                  </>
                )}
              </GradientWrapper>
            </TouchableOpacity>
          </View>
          
          <View style={styles.promptsFooter}>
            <Ionicons name="information-circle" size={14} color="#8b5cf6" />
            <Text style={styles.promptsFooterText}>
              Uses advanced AI to analyze trends and generate high probability picks
            </Text>
          </View>
        </View>

        {/* Today's Picks */}
        <View style={styles.picksSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 Today's Daily Picks</Text>
            <View style={styles.pickCountBadge}>
              <Text style={styles.pickCount}>
                {filteredPicks.length} picks • {generateCounter.remainingGenerations} free gens
              </Text>
            </View>
          </View>
          
          {filteredPicks.length > 0 ? (
            <FlatList
              data={filteredPicks}
              renderItem={renderPickItem}
              keyExtractor={item => `pick-${item.id}-${item.sport}`}
              scrollEnabled={false}
              contentContainerStyle={styles.picksList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#8b5cf6" />
              {searchQuery.trim() ? (
                <>
                  <Text style={styles.emptyText}>No picks found</Text>
                  <Text style={styles.emptySubtext}>Try a different search term or sport</Text>
                </>
              ) : (
                <>
                  <Text style={styles.emptyText}>No picks available</Text>
                  <Text style={styles.emptySubtext}>Generate some picks above!</Text>
                </>
              )}
              <TouchableOpacity 
                style={styles.generateEmptyButton}
                onPress={() => generatePicks('Generate daily picks for me')}
                disabled={generating}
              >
                <GradientWrapper
                  colors={['#8b5cf6', '#7c3aed']}
                  style={styles.generateEmptyButtonGradient}
                  gradientStyle={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingVertical: 14, borderRadius: 15}}
                >
                  <Ionicons name="sparkles" size={16} color="white" />
                  <Text style={styles.generateEmptyButtonText}>
                    {generating ? 'Generating...' : 'Generate Picks'}
                  </Text>
                </GradientWrapper>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Upgrade Modal */}
      <Modal
        transparent={true}
        visible={showUpgradeModal}
        animationType="slide"
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalOverlay}>
            <View style={[styles.upgradeModalContent, {backgroundColor: '#8b5cf6'}]}>
              <LinearGradient
                colors={['#8b5cf6', '#7c3aed']}
                style={StyleSheet.absoluteFillObject}
              >
                <View style={styles.upgradeModalHeader}>
                  <Ionicons name="lock-closed" size={40} color="white" />
                  <Text style={styles.upgradeModalTitle}>Daily Limit Reached</Text>
                </View>
                
                <View style={styles.upgradeModalBody}>
                  <Text style={styles.upgradeModalText}>
                    You've used all 2 free generations today.
                  </Text>
                  
                  <View style={styles.upgradeFeatures}>
                    {['Unlimited daily generations', 'Premium picks & analysis', 'Advanced AI models', 'No daily limits'].map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.upgradeOptions}>
                    <TouchableOpacity 
                      style={styles.upgradeOption}
                      onPress={() => {
                        setShowUpgradeModal(false);
                        generateCounter.purchaseGenerationPack();
                      }}
                    >
                      <GradientWrapper
                        colors={['#10b981', '#059669']}
                        style={styles.upgradeOptionGradient}
                        gradientStyle={{padding: 20, borderRadius: 15, alignItems: 'center'}}
                      >
                        <Text style={styles.upgradeOptionTitle}>Generation Pack</Text>
                        <Text style={styles.upgradeOptionPrice}>$3.99</Text>
                        <Text style={styles.upgradeOptionDesc}>10 extra generations</Text>
                      </GradientWrapper>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.upgradeOption}
                      onPress={() => {
                        setShowUpgradeModal(false);
                        navigation.goToSuccessMetrics();
                      }}
                    >
                      <GradientWrapper
                        colors={['#8b5cf6', '#7c3aed']}
                        style={styles.upgradeOptionGradient}
                        gradientStyle={{padding: 20, borderRadius: 15, alignItems: 'center'}}
                      >
                        <Text style={styles.upgradeOptionTitle}>Full Access</Text>
                        <Text style={styles.upgradeOptionPrice}>$14.99/mo</Text>
                        <Text style={styles.upgradeOptionDesc}>Unlimited everything</Text>
                      </GradientWrapper>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.upgradeCancelButton}
                    onPress={() => setShowUpgradeModal(false)}
                  >
                    <Text style={styles.upgradeCancelText}>Not Now</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Generating Modal */}
      <Modal
        transparent={true}
        visible={showGeneratingModal}
        animationType="fade"
        onRequestClose={() => setShowGeneratingModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {generating ? (
                <>
                  <ActivityIndicator size="large" color="#8b5cf6" />
                  <Text style={styles.modalTitle}>Generating AI Picks...</Text>
                  <Text style={styles.modalText}>Analyzing data and finding high probability picks</Text>
                </>
              ) : (
                <>
                  <View style={[styles.successIconContainer, { backgroundColor: '#10b981' }]}>
                    <Ionicons name="checkmark-circle" size={40} color="white" />
                  </View>
                  <Text style={styles.modalTitle}>Picks Generated!</Text>
                  <Text style={styles.modalText}>
                    {generateCounter.hasPremiumAccess 
                      ? 'Premium: Unlimited generations available' 
                      : `${generateCounter.remainingGenerations} free generations left today`
                    }
                  </Text>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setShowGeneratingModal(false)}
                  >
                    <Text style={styles.modalButtonText}>View Results</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
      
      {!showSearch && (
        <TouchableOpacity
          style={[styles.floatingSearchButton, {backgroundColor: '#8b5cf6'}]}
          onPress={() => {
            setShowSearch(true);
            logAnalyticsEvent('daily_picks_search_toggle');
          }}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#8b5cf6', '#7c3aed']}
            style={styles.floatingSearchContent}
          >
            <Ionicons name="search" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      )}
      
      <AnalyticsBox />
    </View>
  );
}

const styles = StyleSheet.create({
  // Updated bold styles with solid backgrounds to fix shadow warnings
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: '#cbd5e1',
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  
  // Header styles
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
  },
  
  headerOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  
  headerContent: {
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerSearchButton: {
    padding: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  
  headerIcon: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    padding: 15,
    borderRadius: 25,
    marginRight: 15,
  },
  
  headerText: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    backgroundColor: 'transparent',
  },
  
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginTop: 5,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },

  // Navigation menu styles
  navigationMenuContainer: {
    marginTop: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  
  navigationMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
  },
  
  navButton: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: 'transparent',
  },
  
  navButtonGradient: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 15,
    alignItems: 'center',
    width: '100%',
  },
  
  navButtonText: {
    color: 'white',
    fontSize: 11,
    marginTop: 4,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },

  // Counter styles
  counterContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  
  counterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  
  counterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginLeft: 10,
    backgroundColor: 'transparent',
  },
  
  counterContent: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
  },
  
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  
  premiumText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 10,
    backgroundColor: 'transparent',
  },
  
  counterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  
  counterLabel: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '600',
    backgroundColor: 'transparent',
  },
  
  counterDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'transparent',
  },
  
  counterNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8b5cf6',
    backgroundColor: 'transparent',
  },
  
  counterTotal: {
    fontSize: 18,
    color: '#64748b',
    marginLeft: 4,
    backgroundColor: 'transparent',
  },
  
  progressBar: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 3,
  },
  
  counterHint: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: 'transparent',
  },

  // Upgrade Modal Styles
  upgradeModalContent: {
    borderRadius: 25,
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  
  upgradeModalHeader: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  
  upgradeModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
    backgroundColor: 'transparent',
  },
  
  upgradeModalBody: {
    backgroundColor: 'white',
    padding: 25,
  },
  
  upgradeModalText: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
    backgroundColor: 'transparent',
  },
  
  upgradeFeatures: {
    marginBottom: 25,
    backgroundColor: 'transparent',
  },
  
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
  },
  
  featureText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    marginLeft: 12,
    backgroundColor: 'transparent',
  },
  
  upgradeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  
  upgradeOption: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: 'transparent',
  },
  
  upgradeOptionGradient: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    overflow: 'hidden',
  },
  
  upgradeOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    backgroundColor: 'transparent',
  },
  
  upgradeOptionPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    backgroundColor: 'transparent',
  },
  
  upgradeOptionDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    backgroundColor: 'transparent',
  },
  
  upgradeCancelButton: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'transparent',
  },
  
  upgradeCancelText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
    backgroundColor: 'transparent',
  },

  // Search bar styles
  homeSearchBar: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  
  searchResultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  
  searchResultsText: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  
  clearSearchText: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  
  floatingSearchButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 1000,
    overflow: 'hidden',
  },
  
  floatingSearchContent: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  
  modalSubtitle: {
    fontSize: 16,
    color: '#8b5cf6',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  
  modalText: {
    fontSize: 15,
    color: '#475569',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
    backgroundColor: 'transparent',
  },
  
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 15,
    marginTop: 25,
  },
  
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'transparent',
  },

  // Processing steps
  processingSteps: {
    marginTop: 25,
    marginBottom: 15,
    backgroundColor: 'transparent',
  },

  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e2e8f0',
  },

  stepLine: {
    width: 25,
    height: 3,
    backgroundColor: '#e2e8f0',
  },

  stepActive: {
    backgroundColor: '#8b5cf6',
  },

  // Sport Selector
  sportSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 20,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 10,
  },
  
  sportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
    marginHorizontal: 5,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  
  sportButtonActive: {
    backgroundColor: 'transparent',
  },
  
  sportButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
    width: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  
  sportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginLeft: 8,
    backgroundColor: 'transparent',
  },
  
  sportButtonTextActive: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
    backgroundColor: 'transparent',
  },

  // Prompts section
  promptsSection: {
    marginHorizontal: 20,
    marginBottom: 25,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  
  promptsHeader: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  
  promptsTitleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    marginBottom: 10,
    overflow: 'hidden',
  },
  
  promptsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  
  promptsSubtitle: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  
  promptsStats: {
    backgroundColor: '#f3e8ff',
    padding: 12,
    borderRadius: 12,
  },
  
  promptsScroll: {
    marginVertical: 15,
    backgroundColor: 'transparent',
  },
  
  promptChip: {
    marginRight: 15,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  
  promptChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 220,
    overflow: 'hidden',
  },

  promptChipDisabled: {
    opacity: 0.6,
  },
  
  promptChipText: {
    fontSize: 13,
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
    backgroundColor: 'transparent',
  },
  
  customPromptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  
  promptInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginRight: 15,
  },
  
  promptInput: {
    flex: 1,
    fontSize: 15,
    color: '#f1f5f9',
    marginLeft: 10,
    maxHeight: 60,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  
  generateButton: {
    borderRadius: 15,
    minWidth: 140,
    backgroundColor: 'transparent',
  },
  
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  
  generateButtonDisabled: {
    opacity: 0.7,
  },
  
  generateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
    backgroundColor: 'transparent',
  },
  
  promptsFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    backgroundColor: 'transparent',
  },
  
  promptsFooterText: {
    fontSize: 13,
    color: '#cbd5e1',
    flex: 1,
    marginLeft: 10,
    lineHeight: 18,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },

  // Sport badge styles
  sportBadge: {
    marginLeft: 10,
    backgroundColor: 'transparent',
  },

  sportBadgeInner: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  sportBadgeNBA: {
    backgroundColor: '#ef444420',
  },
  sportBadgeNFL: {
    backgroundColor: '#3b82f620',
  },
  sportBadgeNHL: {
    backgroundColor: '#1e40af20',
  },
  sportBadgeMLB: {
    backgroundColor: '#10b98120',
  },
  sportBadgeDefault: {
    backgroundColor: '#6b728020',
  },
  
  // Sport text styles
  sportText: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  sportTextNBA: {
    color: '#ef4444',
  },
  sportTextNFL: {
    color: '#3b82f6',
  },
  sportTextNHL: {
    color: '#1e40af',
  },
  sportTextMLB: {
    color: '#10b981',
  },
  sportTextDefault: {
    color: '#6b7280',
  },

  // Category badge styles
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },

  categoryBadgeHigh: {
    backgroundColor: '#10b98120',
    borderWidth: 1,
    borderColor: '#10b98140',
  },
  categoryBadgeAI: {
    backgroundColor: '#8b5cf620',
    borderWidth: 1,
    borderColor: '#8b5cf640',
  },
  categoryBadgeValue: {
    backgroundColor: '#f59e0b20',
    borderWidth: 1,
    borderColor: '#f59e0b40',
  },
  categoryBadgeDefault: {
    backgroundColor: '#6b728020',
  },

  // Category text styles
  categoryText: {
    fontWeight: 'bold',
    fontSize: 11,
    backgroundColor: 'transparent',
  },
  categoryTextHigh: {
    color: '#10b981',
  },
  categoryTextAI: {
    color: '#8b5cf6',
  },
  categoryTextValue: {
    color: '#f59e0b',
  },
  categoryTextDefault: {
    color: '#6b7280',
  },

  // Confidence badge styles
  confidenceBadge: {
    marginLeft: 10,
    backgroundColor: 'transparent',
  },

  confidenceBadgeInner: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },

  confidenceBadgeHigh: {
    backgroundColor: '#10b981',
  },
  confidenceBadgeMedium: {
    backgroundColor: '#3b82f6',
  },
  confidenceBadgeLow: {
    backgroundColor: '#f59e0b',
  },
  confidenceBadgeVeryLow: {
    backgroundColor: '#ef4444',
  },
  
  confidenceText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },

  // Pick card styles - UPDATED WITH SOLID BACKGROUNDS
  pickCard: {
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  pickCardContent: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
  },

  picksSection: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f1f5f9',
    backgroundColor: 'transparent',
  },
  
  pickCountBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  
  pickCount: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  
  picksList: {
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  
  pickHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  
  playerInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  
  playerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    backgroundColor: 'transparent',
  },
  
  pickSubheader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    backgroundColor: 'transparent',
  },
  
  teamText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  
  categoryContainer: {
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  
  pickDetails: {
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  
  pickValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f766e',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  
  premiumLockedText: {
    color: '#6b7280',
    opacity: 0.7,
    backgroundColor: 'transparent',
  },
  
  pickMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  
  oddsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  
  oddsLabel: {
    fontSize: 15,
    color: '#475569',
    marginRight: 6,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  
  oddsText: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  
  edgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10b98130',
  },
  
  edgeText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: 'bold',
    marginLeft: 6,
    backgroundColor: 'transparent',
  },
  
  probabilityMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  metricItem: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  
  metricLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 3,
    backgroundColor: 'transparent',
  },
  
  analysisContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fffbeb',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f59e0b30',
  },
  
  analysisText: {
    fontSize: 15,
    color: '#92400e',
    flex: 1,
    marginLeft: 10,
    lineHeight: 22,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  
  generatedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#8b5cf630',
  },
  
  generatedText: {
    fontSize: 12,
    color: '#5b21b6',
    flex: 1,
    marginLeft: 8,
    fontStyle: 'italic',
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  
  timestamp: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  
  trackButton: {
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  
  trackButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  trackButtonText: {
    fontSize: 13,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 6,
    backgroundColor: 'transparent',
  },
  
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#334155',
  },
  
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  
  emptySubtext: {
    fontSize: 16,
    color: '#475569',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  
  generateEmptyButton: {
    borderRadius: 15,
    marginTop: 25,
    backgroundColor: 'transparent',
  },
  
  generateEmptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 15,
    overflow: 'hidden',
  },
  
  generateEmptyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
    backgroundColor: 'transparent',
  },
});
