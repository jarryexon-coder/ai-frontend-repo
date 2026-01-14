import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import apiService from '../services/api-service';

const { width } = Dimensions.get('window');

const PlayerStatsScreen = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('NBA');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [statsSummary, setStatsSummary] = useState({
    avgPoints: 0,
    avgRebounds: 0,
    avgAssists: 0,
    topScorer: '',
  });

  const sports = ['NBA', 'NFL', 'NHL', 'MLB'];

  const samplePlayers = {
    NBA: [
      {
        id: 1,
        name: 'LeBron James',
        team: 'Los Angeles Lakers',
        position: 'SF/PF',
        number: 23,
        age: 39,
        height: "6'9\"",
        weight: '250 lbs',
        stats: {
          games: 55,
          points: 28.9,
          rebounds: 8.3,
          assists: 6.8,
          steals: 1.3,
          blocks: 0.6,
          fgPercentage: 54.2,
          threePercentage: 40.5,
        },
        trend: 'up',
        fantasyPoints: 45.2,
        salary: '$44.5M',
        contract: '2 years',
        highlights: ['Triple-double in last game', 'Season-high 42 points'],
      },
      {
        id: 2,
        name: 'Stephen Curry',
        team: 'Golden State Warriors',
        position: 'PG',
        number: 30,
        age: 35,
        height: "6'2\"",
        weight: '185 lbs',
        stats: {
          games: 58,
          points: 26.8,
          rebounds: 4.5,
          assists: 6.1,
          steals: 0.9,
          blocks: 0.3,
          fgPercentage: 49.2,
          threePercentage: 42.7,
        },
        trend: 'up',
        fantasyPoints: 42.5,
        salary: '$48.1M',
        contract: '4 years',
        highlights: ['50-point game', 'NBA record 3-pointers'],
      },
      {
        id: 3,
        name: 'Nikola Jokić',
        team: 'Denver Nuggets',
        position: 'C',
        number: 15,
        age: 28,
        height: "6'11\"",
        weight: '284 lbs',
        stats: {
          games: 60,
          points: 24.5,
          rebounds: 11.8,
          assists: 9.8,
          steals: 1.3,
          blocks: 0.7,
          fgPercentage: 58.3,
          threePercentage: 35.9,
        },
        trend: 'up',
        fantasyPoints: 48.7,
        salary: '$47.6M',
        contract: '5 years',
        highlights: ['Triple-double machine', 'MVP candidate'],
      },
      {
        id: 4,
        name: 'Giannis Antetokounmpo',
        team: 'Milwaukee Bucks',
        position: 'PF',
        number: 34,
        age: 29,
        height: "6'11\"",
        weight: '242 lbs',
        stats: {
          games: 52,
          points: 30.4,
          rebounds: 11.5,
          assists: 6.5,
          steals: 1.2,
          blocks: 1.1,
          fgPercentage: 61.1,
          threePercentage: 27.5,
        },
        trend: 'stable',
        fantasyPoints: 46.8,
        salary: '$45.6M',
        contract: '5 years',
        highlights: ['Dominant in paint', 'Defensive anchor'],
      },
    ],
    NFL: [
      {
        id: 5,
        name: 'Patrick Mahomes',
        team: 'Kansas City Chiefs',
        position: 'QB',
        number: 15,
        age: 28,
        height: "6'3\"",
        weight: '225 lbs',
        stats: {
          games: 16,
          yards: 4683,
          touchdowns: 37,
          interceptions: 11,
          rating: 105.2,
          completion: 67.2,
        },
        trend: 'up',
        fantasyPoints: 25.4,
        salary: '$45.0M',
        contract: '10 years',
        highlights: ['Super Bowl MVP', 'Passing yards leader'],
      },
    ],
  };

  const loadData = async () => {
    try {
      console.log('📊 Loading enhanced Player Stats...');
      
      // Load players for selected sport
      let playersData = samplePlayers[selectedSport] || [];
      
      // Calculate stats summary
      if (playersData.length > 0) {
        const avgPoints = (playersData.reduce((sum, p) => sum + (p.stats.points || 0), 0) / playersData.length).toFixed(1);
        const avgRebounds = (playersData.reduce((sum, p) => sum + (p.stats.rebounds || 0), 0) / playersData.length).toFixed(1);
        const avgAssists = (playersData.reduce((sum, p) => sum + (p.stats.assists || 0), 0) / playersData.length).toFixed(1);
        const topScorer = playersData.reduce((top, p) => p.stats.points > top.stats.points ? p : top, playersData[0]);
        
        setStatsSummary({
          avgPoints,
          avgRebounds,
          avgAssists,
          topScorer: topScorer.name,
        });
      }
      
      setPlayers(playersData);
      setFilteredPlayers(playersData);
      
    } catch (error) {
      console.log('Error loading player stats:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSport]);

  useEffect(() => {
    // Filter players based on search query
    if (searchQuery.trim() === '') {
      setFilteredPlayers(players);
    } else {
      const filtered = players.filter(player =>
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.position.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPlayers(filtered);
    }
  }, [searchQuery, players]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#7c3aed', '#8b5cf6']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={styles.title}>Player Analytics Pro</Text>
        <Text style={styles.subtitle}>Advanced stats & performance metrics</Text>
      </View>
      
      <View style={styles.sportsFilter}>
        {sports.map((sport) => (
          <TouchableOpacity
            key={sport}
            style={[
              styles.sportButton,
              selectedSport === sport && styles.activeSportButton
            ]}
            onPress={() => {
              setSelectedSport(sport);
              setSearchQuery('');
              setSelectedPlayer(null);
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
      </View>
    </LinearGradient>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${selectedSport} players...`}
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderStatsSummary = () => (
    <View style={styles.statsSummary}>
      <Text style={styles.summaryTitle}>League Averages ({selectedSport})</Text>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{statsSummary.avgPoints}</Text>
          <Text style={styles.summaryLabel}>Points</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{statsSummary.avgRebounds}</Text>
          <Text style={styles.summaryLabel}>Rebounds</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{statsSummary.avgAssists}</Text>
          <Text style={styles.summaryLabel}>Assists</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{statsSummary.topScorer.split(' ')[0]}</Text>
          <Text style={styles.summaryLabel}>Top Scorer</Text>
        </View>
      </View>
    </View>
  );

  const renderPlayerCard = (player) => (
    <TouchableOpacity
      key={player.id}
      style={[
        styles.playerCard,
        selectedPlayer?.id === player.id && styles.selectedPlayerCard
      ]}
      onPress={() => setSelectedPlayer(player)}
    >
      <View style={styles.playerHeader}>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{player.name}</Text>
          <View style={styles.playerMeta}>
            <Text style={styles.playerTeam}>{player.team}</Text>
            <Text style={styles.playerSeparator}>•</Text>
            <Text style={styles.playerPosition}>{player.position} #{player.number}</Text>
          </View>
        </View>
        <View style={styles.playerTrend}>
          <Ionicons 
            name={player.trend === 'up' ? 'trending-up' : player.trend === 'down' ? 'trending-down' : 'remove'} 
            size={16} 
            color={player.trend === 'up' ? '#10b981' : player.trend === 'down' ? '#ef4444' : '#6b7280'} 
          />
          <Text style={styles.trendLabel}>
            {player.trend === 'up' ? '+2.3' : player.trend === 'down' ? '-1.5' : '0.0'}
          </Text>
        </View>
      </View>
      
      <View style={styles.playerStatsRow}>
        {selectedSport === 'NBA' ? (
          <>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>PTS</Text>
              <Text style={styles.statValue}>{player.stats.points}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>REB</Text>
              <Text style={styles.statValue}>{player.stats.rebounds}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>AST</Text>
              <Text style={styles.statValue}>{player.stats.assists}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>FPTS</Text>
              <Text style={styles.statValue}>{player.fantasyPoints}</Text>
            </View>
          </>
        ) : selectedSport === 'NFL' ? (
          <>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>YDS</Text>
              <Text style={styles.statValue}>{player.stats.yards}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>TD</Text>
              <Text style={styles.statValue}>{player.stats.touchdowns}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>INT</Text>
              <Text style={styles.statValue}>{player.stats.interceptions}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>RTG</Text>
              <Text style={styles.statValue}>{player.stats.rating}</Text>
            </View>
          </>
        ) : null}
      </View>
      
      <View style={styles.playerFooter}>
        <Text style={styles.playerSalary}>{player.salary}</Text>
        <View style={styles.playerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="stats-chart" size={14} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="star-outline" size={14} color="#f59e0b" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPlayerDetail = () => {
    if (!selectedPlayer) return null;
    
    return (
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailTitle}>{selectedPlayer.name}</Text>
          <TouchableOpacity onPress={() => setSelectedPlayer(null)}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.detailInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Team:</Text>
            <Text style={styles.infoValue}>{selectedPlayer.team}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Position:</Text>
            <Text style={styles.infoValue}>{selectedPlayer.position} #{selectedPlayer.number}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Age:</Text>
            <Text style={styles.infoValue}>{selectedPlayer.age} • {selectedPlayer.height} • {selectedPlayer.weight}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contract:</Text>
            <Text style={styles.infoValue}>{selectedPlayer.contract} • {selectedPlayer.salary}/yr</Text>
          </View>
        </View>
        
        <Text style={styles.detailSectionTitle}>Season Stats</Text>
        <View style={styles.statsGrid}>
          {Object.entries(selectedPlayer.stats).map(([key, value]) => (
            <View key={key} style={styles.detailStat}>
              <Text style={styles.detailStatLabel}>
                {key.charAt(0).toUpperCase() + key.slice(1).replace('Percentage', '%')}
              </Text>
              <Text style={styles.detailStatValue}>{value}</Text>
            </View>
          ))}
        </View>
        
        <Text style={styles.detailSectionTitle}>Performance Metrics</Text>
        <View style={styles.metricsContainer}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Fantasy Value</Text>
            <Progress.Bar 
              progress={selectedPlayer.fantasyPoints / 60}
              width={width - 60}
              height={8}
              color="#8b5cf6"
              unfilledColor="#e5e7eb"
              borderWidth={0}
            />
            <Text style={styles.metricValue}>{selectedPlayer.fantasyPoints}/60</Text>
          </View>
          
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Consistency</Text>
            <Progress.Bar 
              progress={0.82}
              width={width - 60}
              height={8}
              color="#10b981"
              unfilledColor="#e5e7eb"
              borderWidth={0}
            />
            <Text style={styles.metricValue}>82%</Text>
          </View>
        </View>
        
        <Text style={styles.detailSectionTitle}>Recent Highlights</Text>
        <View style={styles.highlights}>
          {selectedPlayer.highlights?.map((highlight, index) => (
            <View key={index} style={styles.highlightItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading Player Analytics...</Text>
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
        {renderSearchBar()}
        {renderStatsSummary()}
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedSport} Players ({filteredPlayers.length})
            </Text>
            <View style={styles.sortOptions}>
              <TouchableOpacity style={styles.sortButton}>
                <Ionicons name="funnel" size={16} color="#6b7280" />
                <Text style={styles.sortText}>Filter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sortButton}>
                <Ionicons name="swap-vertical" size={16} color="#6b7280" />
                <Text style={styles.sortText}>Sort</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map(player => renderPlayerCard(player))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No players found</Text>
              <Text style={styles.emptySubtext}>
                Try a different search term or sport
              </Text>
            </View>
          )}
        </View>

        {renderPlayerDetail()}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Stats update daily. Player comparisons and advanced metrics available.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf5ff',
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
  sportsFilter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  sportButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
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
  searchContainer: {
    padding: 15,
    paddingTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1f2937',
  },
  statsSummary: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
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
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 5,
  },
  section: {
    marginHorizontal: 15,
    marginBottom: 20,
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
  sortOptions: {
    flexDirection: 'row',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sortText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  playerCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedPlayerCard: {
    borderColor: '#8b5cf6',
    borderWidth: 2,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerTeam: {
    fontSize: 13,
    color: '#6b7280',
  },
  playerSeparator: {
    fontSize: 13,
    color: '#d1d5db',
    marginHorizontal: 6,
  },
  playerPosition: {
    fontSize: 13,
    color: '#6b7280',
  },
  playerTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  trendLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  playerStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  playerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  playerSalary: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  playerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 10,
  },
  detailContainer: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 10,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  detailInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailStat: {
    width: '30%',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  detailStatLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  detailStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  metricsContainer: {
    marginBottom: 20,
  },
  metric: {
    marginBottom: 15,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'right',
  },
  highlights: {
    marginTop: 10,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  highlightText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 10,
    flex: 1,
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
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

export default PlayerStatsScreen;
