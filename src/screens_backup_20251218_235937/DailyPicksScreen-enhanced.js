import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Modal,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import apiService from '../services/api-service';
import useDailyLocks from '../hooks/useDailyLocks';

// Daily Locks Paywall Component
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
                <Text style={styles.premiumTitle}>Daily Locks Pro Active!</Text>
                <Text style={styles.premiumSubtitle}>You have full access to premium picks</Text>
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
                  <Text style={styles.featureTitle}>Premium Expert Picks</Text>
                  <Text style={styles.featureDescription}>Daily selections from top analysts</Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="trending-up-outline" size={24} color="#10b981" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>84%+ Accuracy</Text>
                  <Text style={styles.featureDescription}>Proven track record of success</Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="time-outline" size={24} color="#f59e0b" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Daily Updates</Text>
                  <Text style={styles.featureDescription}>Fresh picks every morning</Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="checkmark-circle-outline" size={24} color="#3b82f6" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Profit Guarantee</Text>
                  <Text style={styles.featureDescription}>Positive ROI or your money back</Text>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.pricingContainer}>
              <TouchableOpacity style={styles.manageButton} onPress={onClose}>
                <Text style={styles.manageButtonText}>View Today's Picks</Text>
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
              <Text style={styles.premiumTitle}>Daily Locks Pro</Text>
              <Text style={styles.premiumSubtitle}>Unlock premium expert picks</Text>
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
                <Text style={styles.featureTitle}>84%+ Accuracy</Text>
                <Text style={styles.featureDescription}>Proven track record</Text>
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
              <Text style={styles.premiumButtonText}>GET DAILY LOCKS PRO - $29.99/week</Text>
              <Text style={styles.premiumButtonSubtext}>Premium expert picks</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.monthlyButton}
              onPress={() => purchaseMoreLocks('monthly')}
            >
              <Text style={styles.monthlyButtonText}>$99.99/month (Save 15%)</Text>
            </TouchableOpacity>
            
            <Text style={styles.pricingNote}>Highest accuracy picks. Cancel anytime.</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const DailyPicksScreen = () => {
  const [picks, setPicks] = useState([]);
  const [aiPredictions, setAiPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showPaywall, setShowPaywall] = useState(false);

  // Use the daily locks hook to check access
  const { hasAccess, loading: accessLoading } = useDailyLocks();

  const loadData = async () => {
    try {
      console.log('🎯 Loading enhanced Daily Picks...');
      
      const [picksResponse, predictionsResponse] = await Promise.all([
        apiService.getDailyPicks(),
        apiService.getAiPredictions(),
      ]);
      
      const picksData = picksResponse.data || picksResponse.picks || [];
      const predictionsData = predictionsResponse.data || predictionsResponse.predictions || [];
      
      // If API returns empty, use mock data
      if (picksData.length === 0) {
        console.log('ℹ️ Expert picks endpoint not implemented, using mock data');
        setPicks([
          {
            id: 1,
            sport: 'NBA',
            type: 'Player Prop',
            player: 'Stephen Curry',
            pick: 'Over 28.5 Points',
            confidence: 84,
            odds: '-150',
            reasoning: 'High usage rate in recent games, favorable matchup against weak perimeter defense.',
            expert: 'Mike Johnson',
            expertAccuracy: 78,
            timestamp: '2 hours ago',
          },
          {
            id: 2,
            sport: 'NBA',
            type: 'Moneyline',
            team: 'Denver Nuggets',
            pick: 'Win',
            confidence: 72,
            odds: '+110',
            reasoning: 'Home court advantage and Jokic dominance in paint.',
            expert: 'Sarah Chen',
            expertAccuracy: 82,
            timestamp: '4 hours ago',
          },
          {
            id: 3,
            sport: 'NBA',
            type: 'Spread',
            team: 'Miami Heat',
            pick: '+4.5',
            confidence: 68,
            odds: '+105',
            reasoning: 'Strong defensive team, likely to keep game close.',
            expert: 'David Lee',
            expertAccuracy: 71,
            timestamp: '6 hours ago',
          },
        ]);
      } else {
        setPicks(picksData);
      }
      
      if (predictionsData.length === 0) {
        console.log('ℹ️ AI predictions endpoint not implemented, using mock data');
        setAiPredictions([
          {
            id: 1,
            sport: 'NBA',
            game: 'LAL @ BOS',
            prediction: 'Lakers ML',
            confidence: 74,
            edge: 3.2,
            model: 'Neural Network v4',
            factors: ['Defensive efficiency', 'Home/away splits', 'Player injuries'],
            timestamp: 'Updated 1 hour ago',
          },
          {
            id: 2,
            sport: 'NBA',
            game: 'GSW @ PHX',
            prediction: 'Over 228.5',
            confidence: 81,
            edge: 5.7,
            model: 'Ensemble Learning',
            factors: ['Pace of play', 'Three-point volume', 'Recent totals'],
            timestamp: 'Updated 2 hours ago',
          },
          {
            id: 3,
            sport: 'NBA',
            game: 'MIL @ NYK',
            prediction: 'Giannis Over 31.5 PTS',
            confidence: 79,
            edge: 4.8,
            model: 'Player Prop AI',
            factors: ['Usage rate', 'Matchup analysis', 'Minutes projection'],
            timestamp: 'Updated 3 hours ago',
          },
        ]);
      } else {
        setAiPredictions(predictionsData);
      }
      
    } catch (error) {
      console.log('Error loading daily picks:', error.message);
      // Use mock data on error
      setPicks([
        {
          id: 1,
          sport: 'NBA',
          type: 'Player Prop',
          player: 'Stephen Curry',
          pick: 'Over 28.5 Points',
          confidence: 84,
          odds: '-150',
          reasoning: 'High usage rate in recent games.',
          expert: 'Mike Johnson',
          expertAccuracy: 78,
          timestamp: '2 hours ago',
        },
      ]);
      setAiPredictions([
        {
          id: 1,
          sport: 'NBA',
          game: 'LAL @ BOS',
          prediction: 'Lakers ML',
          confidence: 74,
          edge: 3.2,
          model: 'Neural Network v4',
          factors: ['Defensive efficiency', 'Home/away splits'],
          timestamp: 'Updated 1 hour ago',
        },
      ]);
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

  const filterPicks = (type) => {
    setSelectedFilter(type);
    // In a real app, you would filter the data here
  };

  const renderExpertPick = (pick) => (
    <View key={pick.id} style={styles.expertPickCard}>
      <LinearGradient
        colors={['#1e40af', '#3b82f6']}
        style={styles.pickHeader}
      >
        <View style={styles.pickHeaderContent}>
          <View style={styles.pickBadge}>
            <Text style={styles.pickBadgeText}>{pick.sport}</Text>
          </View>
          <View style={styles.pickType}>
            <Ionicons name="flash-outline" size={14} color="#fff" />
            <Text style={styles.pickTypeText}>{pick.type}</Text>
          </View>
        </View>
        
        <View style={styles.pickMain}>
          <View>
            <Text style={styles.playerName}>{pick.player || pick.team}</Text>
            <Text style={styles.pickText}>{pick.pick}</Text>
          </View>
          <View style={styles.oddsContainer}>
            <Text style={styles.oddsText}>{pick.odds}</Text>
          </View>
        </View>
      </LinearGradient>
      
      <View style={styles.pickBody}>
        <View style={styles.confidenceContainer}>
          <Progress.Bar 
            progress={pick.confidence / 100} 
            width={200} 
            height={8}
            color="#10b981"
            unfilledColor="#e5e7eb"
            borderWidth={0}
          />
          <View style={styles.confidenceTextContainer}>
            <Text style={styles.confidenceLabel}>Confidence</Text>
            <Text style={styles.confidenceValue}>{pick.confidence}%</Text>
          </View>
        </View>
        
        <Text style={styles.reasoningText}>{pick.reasoning}</Text>
        
        <View style={styles.expertInfo}>
          <View style={styles.expertAvatar}>
            <Ionicons name="person-circle-outline" size={30} color="#3b82f6" />
          </View>
          <View style={styles.expertDetails}>
            <Text style={styles.expertName}>{pick.expert}</Text>
            <View style={styles.expertStats}>
              <Ionicons name="trending-up-outline" size={12} color="#10b981" />
              <Text style={styles.expertAccuracy}>{pick.expertAccuracy}% accuracy</Text>
            </View>
          </View>
          <Text style={styles.timestamp}>{pick.timestamp}</Text>
        </View>
      </View>
    </View>
  );

  const renderAiPrediction = (prediction) => (
    <View key={prediction.id} style={styles.aiPredictionCard}>
      <LinearGradient
        colors={['#7c3aed', '#8b5cf6']}
        style={styles.aiHeader}
      >
        <View style={styles.aiHeaderContent}>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={16} color="#fff" />
            <Text style={styles.aiBadgeText}>AI PREDICTION</Text>
          </View>
          <Text style={styles.gameText}>{prediction.game}</Text>
        </View>
        
        <View style={styles.predictionMain}>
          <Text style={styles.predictionText}>{prediction.prediction}</Text>
          <View style={styles.edgeContainer}>
            <Ionicons name="trending-up" size={16} color="#fff" />
            <Text style={styles.edgeText}>+{prediction.edge}% edge</Text>
          </View>
        </View>
      </LinearGradient>
      
      <View style={styles.predictionBody}>
        <View style={styles.aiConfidence}>
          <View style={styles.aiConfidenceBar}>
            <View 
              style={[
                styles.aiConfidenceFill, 
                { width: `${prediction.confidence}%` }
              ]} 
            />
          </View>
          <Text style={styles.aiConfidenceText}>AI Confidence: {prediction.confidence}%</Text>
        </View>
        
        <View style={styles.modelInfo}>
          <Ionicons name="hardware-chip-outline" size={16} color="#7c3aed" />
          <Text style={styles.modelText}>{prediction.model}</Text>
        </View>
        
        <View style={styles.factorsContainer}>
          <Text style={styles.factorsTitle}>Key Factors:</Text>
          {prediction.factors.map((factor, index) => (
            <View key={index} style={styles.factorItem}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#10b981" />
              <Text style={styles.factorText}>{factor}</Text>
            </View>
          ))}
        </View>
        
        <Text style={styles.timestamp}>{prediction.timestamp}</Text>
      </View>
    </View>
  );

  // Show access denied screen if user doesn't have access
  if (!hasAccess && !accessLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.accessDeniedContainer}
        >
          <View style={styles.accessDenied}>
            <Ionicons name="lock-closed" size={60} color="#8b5cf6" />
            <Text style={styles.accessTitle}>Daily Locks Pro Required</Text>
            <Text style={styles.accessDescription}>
              Access to premium expert picks requires a Daily Locks Pro subscription.
              Our picks have an 84%+ win rate with proven track record.
            </Text>
            <Text style={styles.accessPricing}>
              Starting at $29.99/week or $99.99/month
            </Text>
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={() => setShowPaywall(true)}
            >
              <Text style={styles.upgradeButtonText}>Unlock Daily Locks Pro</Text>
            </TouchableOpacity>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.featureText}>84%+ Accuracy Rate</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.featureText}>Daily Expert Picks</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.featureText}>Money-Back Guarantee</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.featureText}>24/7 Customer Support</Text>
              </View>
            </View>
          </View>
        </ScrollView>
        
        <DailyLocksPaywall 
          visible={showPaywall} 
          onClose={() => setShowPaywall(false)} 
        />
      </SafeAreaView>
    );
  }

  if (loading || accessLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Daily Picks...</Text>
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
        {/* Header */}
        <LinearGradient
          colors={['#8b5cf6', '#7c3aed']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="sparkles" size={32} color="#fff" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Daily Picks</Text>
              <Text style={styles.subtitle}>AI-powered predictions & expert analysis</Text>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>87%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>+24.5%</Text>
              <Text style={styles.statLabel}>ROI</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>42</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Filter Buttons */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          <TouchableOpacity 
            style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
            onPress={() => filterPicks('all')}
          >
            <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
              All Picks
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, selectedFilter === 'nba' && styles.filterButtonActive]}
            onPress={() => filterPicks('nba')}
          >
            <Text style={[styles.filterText, selectedFilter === 'nba' && styles.filterTextActive]}>
              NBA
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, selectedFilter === 'ai' && styles.filterButtonActive]}
            onPress={() => filterPicks('ai')}
          >
            <Text style={[styles.filterText, selectedFilter === 'ai' && styles.filterTextActive]}>
              AI Predictions
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, selectedFilter === 'expert' && styles.filterButtonActive]}
            onPress={() => filterPicks('expert')}
          >
            <Text style={[styles.filterText, selectedFilter === 'expert' && styles.filterTextActive]}>
              Expert Picks
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, selectedFilter === 'props' && styles.filterButtonActive]}
            onPress={() => filterPicks('props')}
          >
            <Text style={[styles.filterText, selectedFilter === 'props' && styles.filterTextActive]}>
              Player Props
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* AI Predictions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="sparkles" size={20} color="#8b5cf6" />
              <Text style={styles.sectionTitle}>AI Predictions</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View All →</Text>
            </TouchableOpacity>
          </View>
          
          {aiPredictions.length > 0 ? (
            aiPredictions.map(prediction => renderAiPrediction(prediction))
          ) : (
            <Text style={styles.emptyText}>No AI predictions available</Text>
          )}
        </View>

        {/* Expert Picks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="trophy-outline" size={20} color="#f59e0b" />
              <Text style={styles.sectionTitle}>Expert Picks</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View All →</Text>
            </TouchableOpacity>
          </View>
          
          {picks.length > 0 ? (
            picks.map(pick => renderExpertPick(pick))
          ) : (
            <Text style={styles.emptyText}>No expert picks available</Text>
          )}
        </View>

        {/* Premium Banner (only show if user has access) */}
        {hasAccess && (
          <TouchableOpacity style={styles.premiumBanner} onPress={() => setShowPaywall(true)}>
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              style={styles.premiumBannerGradient}
            >
              <Ionicons name="lock-open" size={28} color="#fff" />
              <View style={styles.premiumBannerText}>
                <Text style={styles.premiumBannerTitle}>Daily Locks Pro Active</Text>
                <Text style={styles.premiumBannerSubtitle}>View your subscription details</Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
      
      {/* Paywall Modal */}
      <DailyLocksPaywall 
        visible={showPaywall} 
        onClose={() => setShowPaywall(false)} 
      />
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
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  // Access Denied Styles
  accessDeniedContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  accessDenied: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  accessTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  accessDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  accessPricing: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 30,
    textAlign: 'center',
  },
  upgradeButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 15,
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuresList: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 10,
    fontWeight: '500',
  },
  // Existing styles from original file...
  header: {
    padding: 25,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 20,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 15,
    borderRadius: 15,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
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
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  seeAll: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  expertPickCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pickHeader: {
    padding: 20,
  },
  pickHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  pickBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pickBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  pickType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pickTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  pickMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  pickText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  oddsContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  oddsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  pickBody: {
    padding: 20,
  },
  confidenceContainer: {
    marginBottom: 15,
  },
  confidenceTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  reasoningText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 15,
  },
  expertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 15,
  },
  expertAvatar: {
    marginRight: 12,
  },
  expertDetails: {
    flex: 1,
  },
  expertName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  expertStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  expertAccuracy: {
    fontSize: 12,
    color: '#10b981',
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#9ca3af',
  },
  aiPredictionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  aiHeader: {
    padding: 20,
  },
  aiHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  gameText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  predictionMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  predictionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  edgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  edgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  predictionBody: {
    padding: 20,
  },
  aiConfidence: {
    marginBottom: 15,
  },
  aiConfidenceBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  aiConfidenceFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
  },
  aiConfidenceText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  modelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  modelText: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '600',
    marginLeft: 6,
  },
  factorsContainer: {
    marginBottom: 15,
  },
  factorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  factorText: {
    fontSize: 13,
    color: '#4b5563',
    marginLeft: 6,
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
    marginBottom: 30,
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
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
    backgroundColor: '#8b5cf6',
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
  monthlyButton: {
    backgroundColor: '#7c3aed',
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

export default DailyPicksScreen;
