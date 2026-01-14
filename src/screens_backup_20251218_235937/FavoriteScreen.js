import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_BASE_URL } from '../config/api';

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      // In production, fetch from backend
      // const response = await fetch(`${API_BASE_URL}/api/user/favorites`);
      // const data = await response.json();
      
      // Mock data for now
      const mockFavorites = [
        {
          id: 1,
          type: 'player',
          name: 'LeBron James',
          team: 'LAL',
          stats: { points: 28.5, rebounds: 8.2, assists: 8.5 },
          lastUpdate: '2 hours ago'
        },
        {
          id: 2,
          type: 'game',
          homeTeam: 'Lakers',
          awayTeam: 'Warriors',
          status: 'Live Q4',
          score: '112-108',
          lastUpdate: '5 minutes ago'
        },
        {
          id: 3,
          type: 'bet',
          game: 'Lakers vs Warriors',
          betType: 'Moneyline',
          odds: '+130',
          status: 'Active',
          lastUpdate: '1 hour ago'
        },
        {
          id: 4,
          type: 'analyst',
          name: 'NBA Insider',
          specialty: 'Fantasy Picks',
          successRate: '78%',
          lastUpdate: '1 day ago'
        }
      ];
      
      setFavorites(mockFavorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const renderFavoriteItem = ({ item }) => {
    switch (item.type) {
      case 'player':
        return (
          <TouchableOpacity style={styles.favoriteCard}>
            <View style={styles.playerHeader}>
              <Icon name="person-circle" size={40} color="#4A90E2" />
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{item.name}</Text>
                <Text style={styles.playerTeam}>{item.team}</Text>
              </View>
              <Icon name="stats-chart" size={24} color="#666" />
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{item.stats.points}</Text>
                <Text style={styles.statLabel}>PTS</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{item.stats.rebounds}</Text>
                <Text style={styles.statLabel}>REB</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{item.stats.assists}</Text>
                <Text style={styles.statLabel}>AST</Text>
              </View>
            </View>
          </TouchableOpacity>
        );

      case 'game':
        return (
          <TouchableOpacity style={styles.favoriteCard}>
            <View style={styles.gameHeader}>
              <Text style={styles.gameStatus}>{item.status}</Text>
              <Icon name="ellipse" size={12} color="#FF3B30" />
            </View>
            <View style={styles.teamsContainer}>
              <View style={styles.teamColumn}>
                <Text style={styles.teamName}>{item.homeTeam}</Text>
                <Text style={styles.teamScore}>{item.score.split('-')[0]}</Text>
              </View>
              <Text style={styles.vsText}>VS</Text>
              <View style={styles.teamColumn}>
                <Text style={styles.teamName}>{item.awayTeam}</Text>
                <Text style={styles.teamScore}>{item.score.split('-')[1]}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );

      case 'bet':
        return (
          <TouchableOpacity style={styles.favoriteCard}>
            <View style={styles.betHeader}>
              <Text style={styles.betGame}>{item.game}</Text>
              <View style={[styles.betStatus, 
                item.status === 'Active' ? styles.activeBet : 
                item.status === 'Won' ? styles.wonBet : styles.lostBet
              ]}>
                <Text style={styles.betStatusText}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.betDetails}>
              <Text style={styles.betType}>{item.betType}</Text>
              <Text style={styles.betOdds}>{item.odds}</Text>
            </View>
          </TouchableOpacity>
        );

      default:
        return (
          <TouchableOpacity style={styles.favoriteCard}>
            <Text>{item.name || 'Favorite Item'}</Text>
          </TouchableOpacity>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <TouchableOpacity>
          <Icon name="add-circle" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Players</Text>
          <FlatList
            data={favorites.filter(f => f.type === 'player')}
            renderItem={renderFavoriteItem}
            keyExtractor={item => `player-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Games</Text>
          <FlatList
            data={favorites.filter(f => f.type === 'game')}
            renderItem={renderFavoriteItem}
            keyExtractor={item => `game-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Bets</Text>
          <FlatList
            data={favorites.filter(f => f.type === 'bet')}
            renderItem={renderFavoriteItem}
            keyExtractor={item => `bet-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  favoriteCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerTeam: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  gameStatus: {
    fontSize: 14,
    color: '#666',
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamColumn: {
    alignItems: 'center',
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  teamScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  vsText: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 20,
  },
  betHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  betGame: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  betStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBet: {
    backgroundColor: '#E3F2FD',
  },
  wonBet: {
    backgroundColor: '#E8F5E9',
  },
  lostBet: {
    backgroundColor: '#FFEBEE',
  },
  betStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  betDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  betType: {
    fontSize: 14,
    color: '#666',
  },
  betOdds: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
});
