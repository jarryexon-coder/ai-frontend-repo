import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, 
  ScrollView, TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LiveGamesScreenSimple({ navigation }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('all');

  // FIXED: Proper useEffect with dependency array
  useEffect(() => {
    fetchGames();
  }, [selectedSport]); // Only re-run when selectedSport changes

  const fetchGames = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockGames = [
        { id: 1, sport: 'NFL', teams: 'Chiefs vs 49ers', score: '24-21', time: 'Q4 7:32' },
        { id: 2, sport: 'NBA', teams: 'Lakers vs Celtics', score: '98-95', time: '3rd Q' },
        { id: 3, sport: 'NHL', teams: 'Maple Leafs vs Canadiens', score: '2-1', time: '2nd P' },
        { id: 4, sport: 'MLB', teams: 'Yankees vs Dodgers', score: '3-2', time: '7th Inning' },
      ];
      
      const filtered = selectedSport === 'all' 
        ? mockGames 
        : mockGames.filter(game => game.sport === selectedSport);
      
      setGames(filtered);
      setLoading(false);
    }, 1000);
  };

  const sports = ['all', 'NFL', 'NBA', 'NHL', 'MLB'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="play-circle" size={32} color="#ef4444" />
          <Text style={styles.title}>Live Games</Text>
          <Text style={styles.subtitle}>Real-time scores and stats</Text>
        </View>
      </View>
      
      <View style={styles.sportsFilter}>
        {sports.map((sport) => (
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
              {sport === 'all' ? 'All' : sport}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ef4444" />
            <Text style={styles.loadingText}>Loading live games...</Text>
          </View>
        ) : (
          <>
            {games.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="wifi" size={64} color="#475569" />
                <Text style={styles.emptyStateText}>No live games</Text>
                <Text style={styles.emptyStateSubtext}>
                  Check back later for live action
                </Text>
              </View>
            ) : (
              games.map((game) => (
                <View key={game.id} style={styles.gameCard}>
                  <View style={styles.gameHeader}>
                    <View style={[styles.sportBadge, { backgroundColor: getSportColor(game.sport) }]}>
                      <Text style={styles.sportText}>{game.sport}</Text>
                    </View>
                    <View style={styles.liveIndicator}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>LIVE</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.gameTeams}>{game.teams}</Text>
                  
                  <View style={styles.scoreContainer}>
                    <Text style={styles.score}>{game.score}</Text>
                    <Text style={styles.time}>{game.time}</Text>
                  </View>
                  
                  <TouchableOpacity style={styles.detailsButton}>
                    <Text style={styles.detailsButtonText}>View Details</Text>
                    <Ionicons name="stats-chart" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}
        
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchGames}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.refreshButtonText}>Refresh Games</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function getSportColor(sport) {
  const colors = {
    'NFL': '#dc2626',
    'NBA': '#2563eb',
    'NHL': '#0891b2',
    'MLB': '#ca8a04',
  };
  return colors[sport] || '#7c3aed';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { 
    padding: 20, 
    backgroundColor: '#1e293b', 
    borderBottomWidth: 1, 
    borderBottomColor: '#334155' 
  },
  headerContent: { alignItems: 'center' },
  title: { 
    color: '#fff', 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginTop: 10 
  },
  subtitle: { 
    color: '#ef4444', 
    fontSize: 16, 
    marginTop: 5 
  },
  sportsFilter: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  sportButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#0f172a',
  },
  sportButtonActive: {
    backgroundColor: '#ef4444',
  },
  sportButtonText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  sportButtonTextActive: {
    color: '#fff',
  },
  content: { flex: 1, padding: 16 },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyStateSubtext: {
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
  gameCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  sportText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 6,
  },
  liveText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gameTeams: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  score: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  time: {
    color: '#94a3b8',
    fontSize: 16,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  detailsButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#374151',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
