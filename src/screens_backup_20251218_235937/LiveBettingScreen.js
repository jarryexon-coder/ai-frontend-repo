import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Alert
} from 'react-native';
import SocketService from '../services/socketService';
import ApiService from '../services/ApiService';

const LiveBettingScreen = () => {
  const [liveGames, setLiveGames] = useState([]);
  const [oddsUpdates, setOddsUpdates] = useState({});
  const [selectedBet, setSelectedBet] = useState(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Connect to socket
    SocketService.connect('user123');

    // Subscribe to live events
    const unsubscribeScore = SocketService.subscribe('live-score', handleLiveScore);
    const unsubscribeOdds = SocketService.subscribe('odds-update', handleOddsUpdate);
    const unsubscribeBet = SocketService.subscribe('bet-matched', handleBetMatched);

    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Initial data
    fetchLiveGames();

    return () => {
      unsubscribeScore();
      unsubscribeOdds();
      unsubscribeBet();
    };
  }, []);

  const fetchLiveGames = async () => {
    try {
      const response = await ApiService.getTodayGames();
      const gamesWithLive = response.data.map(game => ({
        ...game,
        isLive: game.status === 'Q3 4:32' || game.status.includes('Q'),
        odds: {
          moneyline: { home: -150, away: +130 },
          spread: { home: -3.5, away: +3.5 },
          total: 225.5
        }
      }));
      setLiveGames(gamesWithLive);
    } catch (error) {
      console.error('Error fetching live games:', error);
    }
  };

  const handleLiveScore = (data) => {
    setLiveGames(prev => prev.map(game => 
      game.id === data.gameId 
        ? { ...game, home_score: data.homeScore, away_score: data.awayScore }
        : game
    ));
  };

  const handleOddsUpdate = (data) => {
    setOddsUpdates(prev => ({
      ...prev,
      [data.gameId]: data.odds
    }));
  };

  const handleBetMatched = (data) => {
    Alert.alert(
      '🎉 Bet Matched!',
      `Your bet on ${data.game} was matched at odds ${data.odds}`,
      [{ text: 'OK' }]
    );
  };

  const placeLiveBet = (game, betType, selection) => {
    const betData = {
      gameId: game.id,
      game: `${game.home_team} vs ${game.away_team}`,
      betType,
      selection,
      stake: 50,
      odds: betType === 'moneyline' 
        ? (selection === 'home' ? game.odds.moneyline.home : game.odds.moneyline.away)
        : 1.9,
      timestamp: new Date().toISOString()
    };

    if (SocketService.placeLiveBet(betData)) {
      setSelectedBet(betData);
      Alert.alert(
        'Bet Placed',
        `Live bet placed! Waiting for match...`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Error', 'Unable to place live bet. Check connection.');
    }
  };

  const renderOddsChange = (gameId, market) => {
    const update = oddsUpdates[gameId];
    if (!update || !update[market]) return null;
    
    const change = update[market].change;
    const color = change > 0 ? '#4CAF50' : '#F44336';
    
    return (
      <Text style={[styles.oddsChange, { color }]}>
        {change > 0 ? '↑' : '↓'} {Math.abs(change)}
      </Text>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Live Indicator */}
      <View style={styles.liveHeader}>
        <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
        <Text style={styles.liveText}>LIVE BETTING</Text>
      </View>

      {liveGames.filter(g => g.isLive).map(game => (
        <View key={game.id} style={styles.liveGameCard}>
          {/* Game Header */}
          <View style={styles.gameHeader}>
            <Text style={styles.gameTitle}>
              {game.home_team} vs {game.away_team}
            </Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.score}>
                {game.home_score} - {game.away_score}
              </Text>
              <Text style={styles.period}>{game.status}</Text>
            </View>
          </View>

          {/* Live Odds */}
          <View style={styles.oddsSection}>
            <Text style={styles.oddsTitle}>Live Odds</Text>
            
            {/* Moneyline */}
            <View style={styles.oddsRow}>
              <TouchableOpacity 
                style={styles.oddsButton}
                onPress={() => placeLiveBet(game, 'moneyline', 'home')}
              >
                <Text style={styles.teamName}>{game.home_team}</Text>
                <Text style={styles.oddsValue}>{game.odds.moneyline.home}</Text>
                {renderOddsChange(game.id, 'moneyline_home')}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.oddsButton}
                onPress={() => placeLiveBet(game, 'moneyline', 'away')}
              >
                <Text style={styles.teamName}>{game.away_team}</Text>
                <Text style={styles.oddsValue}>{game.odds.moneyline.away}</Text>
                {renderOddsChange(game.id, 'moneyline_away')}
              </TouchableOpacity>
            </View>

            {/* Spread */}
            <View style={styles.oddsRow}>
              <TouchableOpacity 
                style={styles.oddsButton}
                onPress={() => placeLiveBet(game, 'spread', 'home')}
              >
                <Text style={styles.oddsLabel}>Spread</Text>
                <Text style={styles.oddsValue}>{game.odds.spread.home}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.oddsButton}
                onPress={() => placeLiveBet(game, 'spread', 'away')}
              >
                <Text style={styles.oddsLabel}>Spread</Text>
                <Text style={styles.oddsValue}>{game.odds.spread.away}</Text>
              </TouchableOpacity>
            </View>

            {/* Total */}
            <TouchableOpacity 
              style={styles.totalButton}
              onPress={() => placeLiveBet(game, 'total', 'over')}
            >
              <Text style={styles.totalText}>Total: {game.odds.total}</Text>
              <View style={styles.overUnder}>
                <Text style={styles.overUnderText}>Over</Text>
                <Text style={styles.overUnderText}>Under</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Live Stats */}
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Live Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Possession</Text>
                <Text style={styles.statValue}>54% - 46%</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Shots</Text>
                <Text style={styles.statValue}>24 - 18</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Last Play</Text>
                <Text style={styles.statValue}>3pt Made</Text>
              </View>
            </View>
          </View>
        </View>
      )));;

      {/* Selected Bet Info */}
      {selectedBet && (
        <View style={styles.selectedBetCard}>
          <Text style={styles.selectedBetTitle}>Your Live Bet</Text>
          <Text style={styles.selectedBetText}>
            {selectedBet.game} - {selectedBet.betType}
          </Text>
          <Text style={styles.selectedBetText}>
            Odds: {selectedBet.odds} | Stake: ${selectedBet.stake}
          </Text>
          <Text style={styles.pendingText}>⏳ Waiting for match...</Text>
        </View>
      )}

      {/* Live Betting Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>Live Betting Tips</Text>
        <Text style={styles.tip}>• Bet during timeouts for better odds</Text>
        <Text style={styles.tip}>• Watch momentum shifts</Text>
        <Text style={styles.tip}>• Use cashout feature when available</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  liveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 15,
    marginBottom: 10,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    marginRight: 10,
  },
  liveText: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  liveGameCard: {
    backgroundColor: '#1a1a1a',
    margin: 10,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  gameTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  score: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  period: {
    color: '#888',
    fontSize: 12,
  },
  oddsSection: {
    marginBottom: 15,
  },
  oddsTitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 10,
  },
  oddsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  oddsButton: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  teamName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  oddsValue: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  oddsLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 5,
  },
  oddsChange: {
    fontSize: 10,
    marginTop: 5,
    fontWeight: 'bold',
  },
  totalButton: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  totalText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 8,
  },
  overUnder: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  overUnderText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  statsTitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#aaa',
    fontSize: 12,
  },
  statValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  selectedBetCard: {
    backgroundColor: '#2a2a2a',
    margin: 10,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  selectedBetTitle: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectedBetText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
  pendingText: {
    color: '#FF9800',
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  tipsCard: {
    backgroundColor: '#1a1a1a',
    margin: 10,
    padding: 15,
    borderRadius: 12,
  },
  tipsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tip: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
  },
});

export default LiveBettingScreen;
