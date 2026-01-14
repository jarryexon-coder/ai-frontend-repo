import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, FlatList, TextInput, Modal
} from 'react-native';
import ApiService from '../services/ApiService';

export default function FantasyScreen() {
  const [team, setTeam] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [budget, setBudget] = useState(100000);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState('ALL');

  useEffect(() => {
    loadFantasyData();
  }, []);

  const loadFantasyData = async () => {
    // Mock data for demonstration
    const mockTeam = [
      { id: 1, name: 'LeBron James', position: 'SF', team: 'LAL', salary: 48000, points: 28.5, rebounds: 8.5, assists: 8.5, status: 'active' },
      { id: 2, name: 'Stephen Curry', position: 'PG', team: 'GSW', salary: 45000, points: 29.4, rebounds: 5.5, assists: 6.3, status: 'active' },
      { id: 3, name: 'Giannis Antetokounmpo', position: 'PF', team: 'MIL', salary: 47000, points: 31.1, rebounds: 11.8, assists: 5.7, status: 'active' },
      { id: 4, name: 'Nikola Jokic', position: 'C', team: 'DEN', salary: 46000, points: 26.4, rebounds: 12.4, assists: 9.0, status: 'active' },
    ];

    const mockAvailable = [
      { id: 5, name: 'Kevin Durant', position: 'SF', team: 'PHX', salary: 42000, points: 29.1, rebounds: 6.7, assists: 5.0 },
      { id: 6, name: 'Luka Doncic', position: 'PG', team: 'DAL', salary: 44000, points: 33.9, rebounds: 8.8, assists: 8.8 },
      { id: 7, name: 'Jayson Tatum', position: 'SF', team: 'BOS', salary: 40000, points: 30.1, rebounds: 8.8, assists: 4.6 },
      { id: 8, name: 'Joel Embiid', position: 'C', team: 'PHI', salary: 43000, points: 34.6, rebounds: 11.8, assists: 5.9 },
    ];

    setTeam(mockTeam);
    setAvailablePlayers(mockAvailable);
  };

  const addPlayer = (player) => {
    if (budget - player.salary >= 0) {
      setTeam([...team, { ...player, status: 'active' }]);
      setBudget(budget - player.salary);
      setAvailablePlayers(availablePlayers.filter(p => p.id !== player.id));
    }
  };

  const removePlayer = (player) => {
    setTeam(team.filter(p => p.id !== player.id));
    setBudget(budget + player.salary);
    setAvailablePlayers([...availablePlayers, player]);
  };

  const calculateTeamStats = () => {
    const totals = team.reduce((acc, player) => ({
      points: acc.points + player.points,
      rebounds: acc.rebounds + player.rebounds,
      assists: acc.assists + player.assists,
      salary: acc.salary + player.salary
    }), { points: 0, rebounds: 0, assists: 0, salary: 0 });
    
    return {
      avgPoints: (totals.points / team.length).toFixed(1),
      avgRebounds: (totals.rebounds / team.length).toFixed(1),
      avgAssists: (totals.assists / team.length).toFixed(1),
      totalSalary: totals.salary
    };
  };

  const teamStats = calculateTeamStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>🏀 Fantasy Team PRO</Text>
          <Text style={styles.subtitle}>Manage your dream team • ${budget.toLocaleString()} remaining</Text>
        </View>

        {/* Team Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{teamStats.avgPoints}</Text>
              <Text style={styles.statLabel}>PPG</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{teamStats.avgRebounds}</Text>
              <Text style={styles.statLabel}>RPG</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{teamStats.avgAssists}</Text>
              <Text style={styles.statLabel}>APG</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${teamStats.totalSalary.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Salary</Text>
            </View>
          </View>
        </View>

        {/* Current Team */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Your Team ({team.length}/8)</Text>
            <TouchableOpacity onPress={() => setShowAddPlayer(true)}>
              <Text style={styles.addButton}>+ Add Player</Text>
            </TouchableOpacity>
          </View>
          
          {team.map(player => (
            <View key={player.id} style={styles.playerCard}>
              <View style={styles.playerInfo}>
                <View style={styles.playerHeader}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <View style={styles.positionBadge}>
                    <Text style={styles.positionText}>{player.position}</Text>
                  </View>
                </View>
                <Text style={styles.playerTeam}>{player.team} • ${player.salary.toLocaleString()}</Text>
                <View style={styles.playerStats}>
                  <Text style={styles.stat}>PPG: {player.points}</Text>
                  <Text style={styles.stat}>RPG: {player.rebounds}</Text>
                  <Text style={styles.stat}>APG: {player.assists}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removePlayer(player)}
              >
                <Text style={styles.removeButtonText}>−</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Available Players Modal */}
        <Modal
          visible={showAddPlayer}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Player to Team</Text>
                <TouchableOpacity onPress={() => setShowAddPlayer(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.searchInput}
                placeholder="Search players..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              
              <ScrollView style={styles.playersList}>
                {availablePlayers.map(player => (
                  <TouchableOpacity 
                    key={player.id}
                    style={styles.availablePlayer}
                    onPress={() => addPlayer(player)}
                  >
                    <View style={styles.availablePlayerInfo}>
                      <Text style={styles.availablePlayerName}>{player.name}</Text>
                      <Text style={styles.availablePlayerDetails}>
                        {player.position} • {player.team} • ${player.salary.toLocaleString()}
                      </Text>
                      <Text style={styles.availablePlayerStats}>
                        {player.points} PPG • {player.rebounds} RPG • {player.assists} APG
                      </Text>
                    </View>
                    <View style={styles.addButtonSmall}>
                      <Text style={styles.addButtonText}>+</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Lineup Suggestions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Optimal Lineup Suggestions</Text>
          <View style={styles.suggestionCard}>
            <Text style={styles.suggestionTitle}>🎯 Best Value Pick</Text>
            <Text style={styles.suggestionText}>Add Tyrese Haliburton (PG, IND) - 22.8 PPG, 11.7 APG, $32,500</Text>
            <Text style={styles.suggestionSubtext}>+12.3 fantasy points per $1,000 salary</Text>
          </View>
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
  statsCard: { backgroundColor: 'white', margin: 15, padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1e3a8a' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 5 },
  section: { margin: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e3a8a' },
  addButton: { fontSize: 14, color: '#3b82f6', fontWeight: '600' },
  playerCard: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  playerInfo: { flex: 1 },
  playerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  playerName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  positionBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  positionText: { fontSize: 12, fontWeight: 'bold', color: '#1e40af' },
  playerTeam: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  playerStats: { flexDirection: 'row', marginTop: 8 },
  stat: { fontSize: 12, color: '#4b5563', marginRight: 15 },
  removeButton: { backgroundColor: '#fee2e2', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  removeButtonText: { fontSize: 18, color: '#dc2626', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  closeButton: { fontSize: 24, color: '#6b7280' },
  searchInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 15, backgroundColor: '#f9fafb' },
  playersList: { maxHeight: 300 },
  availablePlayer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  availablePlayerInfo: { flex: 1 },
  availablePlayerName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  availablePlayerDetails: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  availablePlayerStats: { fontSize: 12, color: '#059669', marginTop: 4 },
  addButtonSmall: { backgroundColor: '#10b981', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { fontSize: 20, color: 'white', fontWeight: 'bold' },
  suggestionCard: { backgroundColor: '#f0f9ff', padding: 15, borderRadius: 12 },
  suggestionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0369a1', marginBottom: 5 },
  suggestionText: { fontSize: 14, color: '#1e40af', lineHeight: 20 },
  suggestionSubtext: { fontSize: 12, color: '#4b5563', marginTop: 4 },
});
