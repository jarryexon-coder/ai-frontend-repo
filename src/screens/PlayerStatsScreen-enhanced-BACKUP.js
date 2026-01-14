// src/screens/PlayerStatsScreen-enhanced-FIXED.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSearch } from '../providers/SearchProvider';

export default function PlayerStatsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [players, setPlayers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  
  const { searchQuery, performSearch, searchResults, isSearching } = useSearch();

  // FIXED: useCallback to prevent infinite loops
  const loadPlayers = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock player data
      const mockPlayers = [
        {
          id: 1,
          name: 'Patrick Mahomes',
          team: 'Kansas City Chiefs',
          position: 'QB',
          stats: {
            passingYards: 4250,
            passingTDs: 35,
            interceptions: 12,
            rating: 105.2
          }
        },
        {
          id: 2,
          name: 'Christian McCaffrey',
          team: 'San Francisco 49ers',
          position: 'RB',
          stats: {
            rushingYards: 1459,
            rushingTDs: 14,
            receivingYards: 564,
            totalTDs: 21
          }
        },
        {
          id: 3,
          name: 'Tyreek Hill',
          team: 'Miami Dolphins',
          position: 'WR',
          stats: {
            receivingYards: 1799,
            receivingTDs: 13,
            receptions: 119,
            yardsPerCatch: 15.1
          }
        },
        {
          id: 4,
          name: 'Lamar Jackson',
          team: 'Baltimore Ravens',
          position: 'QB',
          stats: {
            passingYards: 3678,
            passingTDs: 27,
            rushingYards: 821,
            totalTDs: 29
          }
        },
        {
          id: 5,
          name: 'Josh Allen',
          team: 'Buffalo Bills',
          position: 'QB',
          stats: {
            passingYards: 4306,
            passingTDs: 29,
            interceptions: 18,
            rushingTDs: 15
          }
        }
      ];
      
      setPlayers(mockPlayers);
      
    } catch (error) {
      // } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPlayers(true);
  }, [loadPlayers]);

  const renderPlayerItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.playerCard}
      onPress={() => navigation.navigate('PlayerDashboard', { playerId: item.id })}
    >
      <View style={styles.playerHeader}>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{item.name}</Text>
          <View style={styles.playerMeta}>
            <Text style={styles.playerTeam}>{item.team}</Text>
            <Text style={styles.playerPosition}>• {item.position}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#64748b" />
      </View>
      
      <View style={styles.statsGrid}>
        {Object.entries(item.stats).map(([key, value], index) => (
          <View key={index} style={styles.statItem}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={styles.loadingText}>Loading Player Stats...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Player Metrics</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={22} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search players..."
              placeholderTextColor="#64748b"
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={() => performSearch(searchInput)}
            />
            {searchInput ? (
              <TouchableOpacity onPress={() => setSearchInput('')}>
                <Ionicons name="close-circle" size={20} color="#94a3b8" />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => performSearch(searchInput)}
          >
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Position Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {['all', 'QB', 'RB', 'WR', 'TE', 'DEF'].map((position) => (
            <TouchableOpacity
              key={position}
              style={[styles.filterPill, filter === position && styles.activeFilterPill]}
              onPress={() => setFilter(position)}
            >
              <Text style={[styles.filterText, filter === position && styles.activeFilterText]}>
                {position === 'all' ? 'All Positions' : position}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={players}
          renderItem={renderPlayerItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ef4444"
              colors={['#ef4444']}
            />
          }
          contentContainerStyle={styles.playersList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.statsHeader}>
              <Text style={styles.sectionTitle}>Top Performers</Text>
              <Text style={styles.playerCount}>{players.length} players</Text>
            </View>
          }
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  searchButton: {
    marginLeft: 12,
    backgroundColor: '#ef4444',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1e293b',
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#334155',
    marginRight: 12,
  },
  activeFilterPill: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  playersList: {
    padding: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  playerCount: {
    color: '#94a3b8',
    fontSize: 14,
  },
  playerCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerTeam: {
    color: '#94a3b8',
    fontSize: 14,
  },
  playerPosition: {
    color: '#64748b',
    fontSize: 14,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
  },
});
