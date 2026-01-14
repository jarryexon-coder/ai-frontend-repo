import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

const LiveGamesScreen = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading games...');
      
      // Try to fetch from API
      const response = await fetch('https://pleasing-determination-production.up.railway.app/api/nba/games/today');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('📊 Raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid JSON response');
      }
      
      console.log('📊 Parsed data:', data);
      
      // Extract games from different possible response structures
      let gamesData = [];
      
      if (data && Array.isArray(data)) {
        // Response is already an array
        gamesData = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        // Response has data property with array
        gamesData = data.data;
      } else if (data && data.games && Array.isArray(data.games)) {
        // Response has games property with array
        gamesData = data.games;
      } else if (data && data.success && data.data && Array.isArray(data.data)) {
        // Response has success: true and data property
        gamesData = data.data;
      } else {
        console.warn('Unexpected response structure:', data);
        // Use fallback data
        gamesData = getFallbackGames();
      }
      
      console.log(`✅ Loaded ${gamesData.length} games`);
      setGames(gamesData);
      
    } catch (err) {
      console.error('❌ Error loading games:', err);
      setError(err.message);
      
      // Use fallback data
      const fallbackGames = getFallbackGames();
      setGames(fallbackGames);
      
    } finally {
      setLoading(false);
    }
  };

  const getFallbackGames = () => {
    return [
      {
        id: 1,
        home_team: 'Lakers',
        away_team: 'Warriors',
        game_date: new Date().toISOString().split('T')[0],
        game_time: '19:30',
        status: 'scheduled',
        home_score: 0,
        away_score: 0
      },
      {
        id: 2,
        home_team: 'Celtics',
        away_team: 'Heat',
        game_date: new Date().toISOString().split('T')[0],
        game_time: '20:00',
        status: 'scheduled',
        home_score: 0,
        away_score: 0
      }
    ];
  };

  const renderGame = ({ item }) => (
    <View style={styles.gameCard}>
      <View style={styles.gameHeader}>
        <Text style={styles.gameTime}>{item.game_time || 'TBD'}</Text>
        <Text style={[
          styles.gameStatus,
          item.status === 'live' ? styles.liveStatus : 
          item.status === 'completed' ? styles.completedStatus : 
          styles.scheduledStatus
        ]}>
          {item.status?.toUpperCase() || 'SCHEDULED'}
        </Text>
      </View>
      
      <View style={styles.teamsContainer}>
        <View style={styles.team}>
          <Text style={styles.teamName}>{item.home_team || 'Home'}</Text>
          <Text style={styles.teamScore}>{item.home_score || 0}</Text>
        </View>
        
        <Text style={styles.vsText}>VS</Text>
        
        <View style={styles.team}>
          <Text style={styles.teamName}>{item.away_team || 'Away'}</Text>
          <Text style={styles.teamScore}>{item.away_score || 0}</Text>
        </View>
      </View>
      
      <Text style={styles.gameInfo}>
        {item.game_date ? new Date(item.game_date).toLocaleDateString() : 'Today'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.loadingText}>Loading games...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚡ Live Games</Text>
        <Text style={styles.subtitle}>Today's NBA matchups</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadGames}>
          <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>
      
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>Note: Using sample data - {error}</Text>
        </View>
      )}
      
      {games.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No games scheduled for today</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadGames}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={games}
          renderItem={renderGame}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={loadGames}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1e3a8a',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#93c5fd',
    marginBottom: 10,
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  errorBanner: {
    backgroundColor: '#fef3c7',
    padding: 10,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  errorText: {
    color: '#92400e',
    fontSize: 12,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  listContainer: {
    padding: 15,
  },
  gameCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  gameTime: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  gameStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveStatus: {
    backgroundColor: '#dc2626',
    color: 'white',
  },
  scheduledStatus: {
    backgroundColor: '#3b82f6',
    color: 'white',
  },
  completedStatus: {
    backgroundColor: '#10b981',
    color: 'white',
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  team: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  teamScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  vsText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  gameInfo: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default LiveGamesScreen;
