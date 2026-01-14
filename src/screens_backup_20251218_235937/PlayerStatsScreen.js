import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';

export default function PlayerStatsScreen() {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('points');

  useEffect(() => {
    loadPlayerStats();
  }, []);

  const loadPlayerStats = () => {
    const mockPlayers = [
      { id: 1, name: 'Joel Embiid', team: 'PHI', position: 'C', points: 34.6, rebounds: 11.8, assists: 5.9, steals: 1.2, blocks: 1.7, fg: '54.8%', threes: '33.0%' },
      { id: 2, name: 'Luka Doncic', team: 'DAL', position: 'PG', points: 33.9, rebounds: 8.8, assists: 8.8, steals: 1.4, blocks: 0.5, fg: '49.2%', threes: '38.2%' },
      { id: 3, name: 'Shai Gilgeous-Alexander', team: 'OKC', position: 'SG', points: 31.1, rebounds: 5.5, assists: 6.5, steals: 2.2, blocks: 0.9, fg: '54.6%', threes: '35.3%' },
      { id: 4, name: 'Giannis Antetokounmpo', team: 'MIL', position: 'PF', points: 31.1, rebounds: 11.8, assists: 5.7, steals: 1.3, blocks: 1.1, fg: '61.1%', threes: '22.9%' },
      { id: 5, name: 'Jayson Tatum', team: 'BOS', position: 'SF', points: 30.1, rebounds: 8.8, assists: 4.6, steals: 1.0, blocks: 0.6, fg: '47.5%', threes: '37.6%' },
      { id: 6, name: 'Kevin Durant', team: 'PHX', position: 'SF', points: 29.1, rebounds: 6.7, assists: 5.0, steals: 0.9, blocks: 1.2, fg: '52.3%', threes: '46.9%' },
      { id: 7, name: 'Stephen Curry', team: 'GSW', position: 'PG', points: 29.4, rebounds: 5.5, assists: 6.3, steals: 1.0, blocks: 0.4, fg: '47.5%', threes: '42.7%' },
      { id: 8, name: 'LeBron James', team: 'LAL', position: 'SF', points: 28.5, rebounds: 8.5, assists: 8.5, steals: 1.0, blocks: 0.6, fg: '54.0%', threes: '40.6%' },
    ];

    // Sort players
    const sorted = [...mockPlayers].sort((a, b) => b[sortBy] - a[sortBy]);
    setPlayers(sorted);
    if (!selectedPlayer) setSelectedPlayer(sorted[0]);
  };

  const sortPlayers = (criteria) => {
    setSortBy(criteria);
    const sorted = [...players].sort((a, b) => b[criteria] - a[criteria]);
    setPlayers(sorted);
  };

  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(search.toLowerCase()) ||
    player.team.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>📊 Player Statistics</Text>
          <Text style={styles.subtitle}>Advanced metrics & performance data</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search players or teams..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Sort Options */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['points', 'rebounds', 'assists', 'steals', 'blocks'].map(criteria => (
              <TouchableOpacity
                key={criteria}
                style={[styles.sortButton, sortBy === criteria && styles.sortButtonActive]}
                onPress={() => sortPlayers(criteria)}
              >
                <Text style={[styles.sortButtonText, sortBy === criteria && styles.sortButtonTextActive]}>
                  {criteria.charAt(0).toUpperCase() + criteria.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Selected Player Detail */}
        {selectedPlayer && (
          <View style={styles.playerDetailCard}>
            <View style={styles.playerHeader}>
              <View>
                <Text style={styles.playerName}>{selectedPlayer.name}</Text>
                <Text style={styles.playerInfo}>{selectedPlayer.team} • {selectedPlayer.position}</Text>
              </View>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{(players.findIndex(p => p.id === selectedPlayer.id) + 1)}</Text>
              </View>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{selectedPlayer.points}</Text>
                <Text style={styles.statLabel}>PPG</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{selectedPlayer.rebounds}</Text>
                <Text style={styles.statLabel}>RPG</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{selectedPlayer.assists}</Text>
                <Text style={styles.statLabel}>APG</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{selectedPlayer.steals}</Text>
                <Text style={styles.statLabel}>SPG</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{selectedPlayer.blocks}</Text>
                <Text style={styles.statLabel}>BPG</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{selectedPlayer.fg}</Text>
                <Text style={styles.statLabel}>FG%</Text>
              </View>
            </View>
          </View>
        )}

        {/* Players List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Player Rankings</Text>
          {filteredPlayers.map((player, index) => (
            <TouchableOpacity
              key={player.id}
              style={styles.playerRow}
              onPress={() => setSelectedPlayer(player)}
            >
              <View style={styles.rankColumn}>
                <Text style={styles.rankNumber}>#{index + 1}</Text>
              </View>
              <View style={styles.playerColumn}>
                <Text style={styles.rowPlayerName}>{player.name}</Text>
                <Text style={styles.rowPlayerInfo}>{player.team} • {player.position}</Text>
              </View>
              <View style={styles.statsColumn}>
                <Text style={styles.rowStat}>{player[sortBy]}</Text>
                <Text style={styles.rowStatLabel}>{sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: '#1e3a8a', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 14, color: '#93c5fd', marginTop: 5 },
  searchContainer: { padding: 15 },
  searchInput: { backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db' },
  sortContainer: { paddingHorizontal: 15, paddingBottom: 10 },
  sortLabel: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  sortButton: { backgroundColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  sortButtonActive: { backgroundColor: '#3b82f6' },
  sortButtonText: { fontSize: 14, color: '#6b7280' },
  sortButtonTextActive: { color: 'white', fontWeight: '600' },
  playerDetailCard: { backgroundColor: 'white', margin: 15, padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  playerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  playerName: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  playerInfo: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  rankBadge: { backgroundColor: '#fbbf24', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 16, fontWeight: 'bold', color: '#78350f' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statBox: { width: '30%', backgroundColor: '#f9fafb', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1e3a8a' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  section: { margin: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 15 },
  playerRow: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 8, alignItems: 'center' },
  rankColumn: { width: 40 },
  rankNumber: { fontSize: 16, fontWeight: 'bold', color: '#9ca3af' },
  playerColumn: { flex: 1, paddingHorizontal: 10 },
  rowPlayerName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  rowPlayerInfo: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  statsColumn: { alignItems: 'flex-end' },
  rowStat: { fontSize: 18, fontWeight: 'bold', color: '#059669' },
  rowStatLabel: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
});
