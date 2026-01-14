import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, FlatList, ActivityIndicator, RefreshControl
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';
// Import the SocketService for real-time updates
import SocketService from '../services/socketService';

const FantasyScreen = () => {
  const [fantasyData, setFantasyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('NBA');

  // Placeholder function for update notifications
  const showUpdateNotification = (message) => {
    console.log('Update Notification:', message);
    // TODO: Replace with your actual notification logic (e.g., expo-notifications, a toast, etc.)
    // For example, using an alert for now:
    alert(`🔔 ${message}`);
  };

  useEffect(() => {
    // Initial load
    loadFantasyData();
    
    // Set up auto-refresh every 15 minutes
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing fantasy data...');
      loadFantasyData();
    }, 15 * 60 * 1000);
    
    // WebSocket for real-time updates
    const unsubscribe = SocketService.subscribe('fantasy-update', (data) => {
      if (data.sport === selectedSport) {
        setFantasyData(data.recommendations);
        showUpdateNotification('New fantasy recommendations available!');
      }
    });
    
    // Cleanup function to clear interval and unsubscribe from WebSocket
    return () => {
      clearInterval(refreshInterval);
      unsubscribe();
    };
  }, [selectedSport]);

  const loadFantasyData = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getFantasyAdvice();
      setFantasyData(response.data);
    } catch (error) {
      console.log('Error loading fantasy data:', error);
      // Fallback data
      setFantasyData({
        must_starts: [
          {
            player: 'LeBron James',
            team: 'LAL',
            position: 'SF/PF',
            projection: '58.5',
            value: 'Elite',
            injury: 'Probable',
            matchup: 'vs GSW',
            reasoning: 'High usage with AD questionable, Warriors rank 28th vs SF'
          },
          {
            player: 'Nikola Jokic',
            team: 'DEN',
            position: 'C',
            projection: '62.3',
            value: 'Super Elite',
            injury: '',
            matchup: 'vs PHX',
            reasoning: 'Triple-double machine, Suns weak interior defense'
          }
        ],
        sleepers: [
          {
            player: 'Jalen Green',
            team: 'HOU',
            position: 'SG',
            projection: '42.5',
            value: 'Value',
            salary: '$7,200',
            reasoning: 'Starting SG with increased minutes, great pace matchup'
          }
        ],
        avoids: [
          {
            player: 'Chris Paul',
            team: 'GSW',
            position: 'PG',
            reasoning: 'Limited minutes restriction, high ownership'
          }
        ]
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFantasyData();
  };

  const renderPlayerCard = (player, type) => {
    const cardColors = {
      must_starts: ['#4A00E0', '#8E2DE2'],
      sleepers: ['#00b09b', '#96c93d'],
      avoids: ['#FF416C', '#FF4B2B']
    };

    return (
      <LinearGradient
        colors={cardColors[type] || ['#667eea', '#764ba2']}
        style={styles.playerCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.playerHeader}>
          <View>
            <Text style={styles.playerName}>{player.player}</Text>
            <Text style={styles.playerDetails}>
              {player.team} • {player.position}
              {player.matchup && ` • ${player.matchup}`}
            </Text>
          </View>
          {player.injury && (
            <View style={styles.injuryBadge}>
              <Ionicons name="medical" size={16} color="#fff" />
              <Text style={styles.injuryText}>{player.injury}</Text>
            </View>
          )}
        </View>

        {player.projection && (
          <View style={styles.projectionContainer}>
            <Text style={styles.projectionLabel}>Projection</Text>
            <Text style={styles.projectionValue}>{player.projection} FPTS</Text>
            <View style={styles.valueBadge}>
              <Text style={styles.valueText}>{player.value}</Text>
            </View>
          </View>
        )}

        <Text style={styles.reasoningText}>{player.reasoning}</Text>

        {player.salary && (
          <View style={styles.salaryContainer}>
            <Ionicons name="cash-outline" size={16} color="#fff" />
            <Text style={styles.salaryText}>{player.salary}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>
            {type === 'must_starts' ? 'START' : type === 'sleepers' ? 'ADD' : 'AVOID'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading fantasy advice...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={['#1a2980', '#26d0ce']}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>🎮 Fantasy Assistant</Text>
        <Text style={styles.headerSubtitle}>AI-powered lineup optimization</Text>
      </LinearGradient>

      {/* Sport Selector */}
      <View style={styles.sportSelector}>
        {['NBA', 'NFL', 'NHL'].map(sport => (
          <TouchableOpacity
            key={sport}
            style={[
              styles.sportButton,
              selectedSport === sport && styles.sportButtonActive
            ]}
            onPress={() => setSelectedSport(sport)}
          >
            <Text style={[
              styles.sportButtonText,
              selectedSport === sport && styles.sportButtonTextActive
            ]}>
              {sport}
            </Text>
          </TouchableOpacity>
        )));;
      </View>

      {/* Must Starts Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="star" size={24} color="#FFD700" />
          <Text style={styles.sectionTitle}>Must Starts</Text>
          <Text style={styles.sectionSubtitle}>Elite plays with highest ceiling</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {fantasyData?.must_starts?.map((player, index) => (
            <View key={index} style={styles.horizontalCard}>
              {renderPlayerCard(player, 'must_starts')}
            </View>
          )));;
        </ScrollView>
      </View>

      {/* Sleepers Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="moon" size={24} color="#8E2DE2" />
          <Text style={styles.sectionTitle}>Value Sleepers</Text>
          <Text style={styles.sectionSubtitle}>Low ownership, high upside</Text>
        </View>
        {fantasyData?.sleepers?.map((player, index) => (
          <View key={index} style={styles.verticalCard}>
            {renderPlayerCard(player, 'sleepers')}
          </View>
        )));;
      </View>

      {/* Avoids Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="warning" size={24} color="#FF416C" />
          <Text style={styles.sectionTitle}>Fade Alert</Text>
          <Text style={styles.sectionSubtitle}>Players to avoid this slate</Text>
        </View>
        {fantasyData?.avoids?.map((player, index) => (
          <View key={index} style={styles.avoidCard}>
            <View style={styles.avoidHeader}>
              <Text style={styles.avoidName}>{player.player}</Text>
              <Text style={styles.avoidDetails}>{player.team} • {player.position}</Text>
            </View>
            <Text style={styles.avoidReasoning}>{player.reasoning}</Text>
          </View>
        )));;
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>92%</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>+$4.2K</Text>
          <Text style={styles.statLabel}>Profit</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>156</Text>
          <Text style={styles.statLabel}>Lineups</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  headerGradient: {
    padding: 25,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  sportSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  sportButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
  },
  sportButtonActive: {
    backgroundColor: '#007AFF',
  },
  sportButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  sportButtonTextActive: {
    color: 'white',
  },
  section: {
    marginHorizontal: 15,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    marginTop: 2,
  },
  horizontalCard: {
    width: 300,
    marginRight: 15,
  },
  verticalCard: {
    marginBottom: 15,
  },
  playerCard: {
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  playerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  playerDetails: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  injuryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,65,108,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  injuryText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 5,
    fontWeight: '600',
  },
  projectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  projectionLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginRight: 10,
  },
  projectionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 15,
  },
  valueBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  valueText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reasoningText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  salaryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  avoidCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#FF416C',
  },
  avoidHeader: {
    marginBottom: 10,
  },
  avoidName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  avoidDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  avoidReasoning: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
});

export default FantasyScreen;
