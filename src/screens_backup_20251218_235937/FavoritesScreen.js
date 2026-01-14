import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, FlatList, RefreshControl, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/apiService';

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadFavorites();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('@favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const addSampleFavorites = async () => {
    const sampleFavorites = [
      {
        id: 1,
        type: 'player',
        name: 'LeBron James',
        sport: 'NBA',
        team: 'LAL',
        position: 'SF',
        stats: { points: 28.5, rebounds: 8.2, assists: 8.5 },
        image: 'https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 2,
        type: 'team',
        name: 'Kansas City Chiefs',
        sport: 'NFL',
        record: '12-5',
        streak: 'W3',
        image: 'https://static.www.nfl.com/image/private/t_editorial_landscape_12_desktop/league/hcvd2avk0kfnkjym1pbs',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 3,
        type: 'game',
        name: 'Lakers vs Warriors',
        sport: 'NBA',
        status: 'Live',
        homeScore: 112,
        awayScore: 108,
        time: 'Q4 2:15',
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
        lastUpdated: new Date().toISOString()
      }
    ];

    setFavorites(sampleFavorites);
    await AsyncStorage.setItem('@favorites', JSON.stringify(sampleFavorites));
    Alert.alert('Sample Added', 'Sample favorites added for demonstration');
  };

  const removeFavorite = async (id) => {
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this from favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updatedFavorites = favorites.filter(item => item.id !== id);
            setFavorites(updatedFavorites);
            await AsyncStorage.setItem('@favorites', JSON.stringify(updatedFavorites));
          }
        }
      ]
    );
  };

  const clearAllFavorites = () => {
    if (favorites.length === 0) return;
    
    Alert.alert(
      'Clear All Favorites',
      'Are you sure you want to remove all favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setFavorites([]);
            await AsyncStorage.setItem('@favorites', JSON.stringify([]));
          }
        }
      ]
    );
  };

  const getFilteredFavorites = () => {
    let filtered = favorites;
    
    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => item.type === activeCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sport?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.team?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const renderPlayerFavorite = (item) => (
    <View style={styles.favoriteCard}>
      <Image source={{ uri: item.image }} style={styles.favoriteImage} />
      <View style={styles.favoriteContent}>
        <View style={styles.favoriteHeader}>
          <View>
            <Text style={styles.favoriteName}>{item.name}</Text>
            <Text style={styles.favoriteDetails}>
              {item.team} • {item.position} • {item.sport}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => removeFavorite(item.id)}
            style={styles.removeButton}
          >
            <Ionicons name="heart" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.playerStats}>
          {Object.entries(item.stats || {}).map(([key, value]) => (
            <View key={key} style={styles.statItem}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{key.toUpperCase()}</Text>
            </View>
          )));;
        </View>
        
        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="stats-chart" size={16} color="#007AFF" />
          <Text style={styles.quickActionText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTeamFavorite = (item) => (
    <View style={styles.favoriteCard}>
      <Image source={{ uri: item.image }} style={styles.teamImage} />
      <View style={styles.favoriteContent}>
        <View style={styles.favoriteHeader}>
          <View>
            <Text style={styles.favoriteName}>{item.name}</Text>
            <Text style={styles.favoriteDetails}>
              {item.sport} • {item.record} • {item.streak}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => removeFavorite(item.id)}
            style={styles.removeButton}
          >
            <Ionicons name="heart" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.teamInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="trophy" size={16} color="#FFD700" />
            <Text style={styles.infoText}>Playoff Contender</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="trending-up" size={16} color="#4CAF50" />
            <Text style={styles.infoText}>Winning Streak</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderGameFavorite = (item) => (
    <View style={styles.favoriteCard}>
      <View style={styles.gameHeader}>
        <Text style={styles.gameTitle}>{item.name}</Text>
        <View style={styles.gameStatus}>
          <Text style={styles.gameStatusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.gameScore}>
        <Text style={styles.scoreText}>{item.homeScore}</Text>
        <Text style={styles.scoreDivider}>-</Text>
        <Text style={styles.scoreText}>{item.awayScore}</Text>
      </View>
      
      <View style={styles.gameDetails}>
        <Text style={styles.gameTime}>{item.time}</Text>
        <Text style={styles.gameSport}>{item.sport}</Text>
      </View>
      
      <View style={styles.gameActions}>
        <TouchableOpacity style={styles.gameAction}>
          <Ionicons name="play" size={16} color="#007AFF" />
          <Text style={styles.gameActionText}>Watch</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => removeFavorite(item.id)}
          style={[styles.gameAction, styles.removeAction]}
        >
          <Ionicons name="heart" size={16} color="#FF3B30" />
          <Text style={[styles.gameActionText, styles.removeText]}>Unfollow</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFavoriteItem = (item) => {
    switch(item.type) {
      case 'player':
        return renderPlayerFavorite(item);
      case 'team':
        return renderTeamFavorite(item);
      case 'game':
        return renderGameFavorite(item);
      default:
        return null;
    }
  };

  const filteredFavorites = getFilteredFavorites();

  return (
    <Animated.ScrollView
      style={[styles.container, { opacity: fadeAnim }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="heart" size={40} color="#FF3B30" />
          <View style={styles.headerText}>
            <Text style={styles.title}>⭐ Favorites</Text>
            <Text style={styles.subtitle}>Your personalized collection</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{favorites.length}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {favorites.filter(f => f.type === 'player').length}
          </Text>
          <Text style={styles.statLabel}>Players</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {favorites.filter(f => f.type === 'team').length}
          </Text>
          <Text style={styles.statLabel}>Teams</Text>
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {['all', 'player', 'team', 'game'].map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              activeCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => setActiveCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              activeCategory === category && styles.categoryTextActive
            ]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        )));;
      </ScrollView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search favorites..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Actions Bar */}
      <View style={styles.actionsBar}>
        <TouchableOpacity style={styles.actionButton} onPress={addSampleFavorites}>
          <Ionicons name="add-circle" size={20} color="#007AFF" />
          <Text style={styles.actionText}>Add Samples</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={clearAllFavorites}>
          <Ionicons name="trash" size={20} color="#FF3B30" />
          <Text style={styles.actionText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Favorites List */}
      <View style={styles.favoritesList}>
        <Text style={styles.listTitle}>
          {filteredFavorites.length} {activeCategory === 'all' ? 'Favorites' : activeCategory + 's'}
        </Text>
        
        {filteredFavorites.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
            <Text style={styles.emptyText}>
              {activeCategory === 'all'
                ? 'Start adding players, teams, or games to your favorites'
                : `No ${activeCategory}s in your favorites yet`}
            </Text>
            <TouchableOpacity style={styles.exploreButton} onPress={addSampleFavorites}>
              <Text style={styles.exploreButtonText}>Add Sample Data</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredFavorites.map(item => (
            <View key={item.id} style={styles.favoriteItem}>
              {renderFavoriteItem(item)}
            </View>
          ))
        )}
      </View>

      {/* Quick Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Tips</Text>
        <Text style={styles.tip}>• Tap the heart icon on any player/team to add to favorites</Text>
        <Text style={styles.tip}>• Get notifications when your favorites are playing</Text>
        <Text style={styles.tip}>• Use filters to quickly find what you need</Text>
      </View>
    </Animated.ScrollView>
  );
};

// Add TextInput import
import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 25,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 15,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  categoryContainer: {
    paddingHorizontal: 15,
    marginTop: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 20,
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#FF3B30',
  },
  categoryText: {
    color: '#666',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 15,
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  favoritesList: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  favoriteItem: {
    marginBottom: 15,
  },
  favoriteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  favoriteImage: {
    width: '100%',
    height: 120,
  },
  favoriteContent: {
    padding: 15,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  favoriteName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  favoriteDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  removeButton: {
    padding: 5,
  },
  playerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  quickActionText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  teamImage: {
    width: '100%',
    height: 150,
  },
  teamInfo: {
    flexDirection: 'row',
    marginTop: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1a1a1a',
  },
  gameTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameStatus: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  gameStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gameScore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2a2a2a',
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginHorizontal: 20,
  },
  scoreDivider: {
    fontSize: 24,
    color: '#888',
  },
  gameDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#1a1a1a',
  },
  gameTime: {
    color: '#888',
    fontSize: 14,
  },
  gameSport: {
    color: '#888',
    fontSize: 14,
  },
  gameActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#2a2a2a',
  },
  gameAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
  },
  gameActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  removeAction: {
    backgroundColor: '#3a1a1a',
  },
  removeText: {
    color: '#FF3B30',
  },
  tipsCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  tip: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
});

export default FavoritesScreen;
