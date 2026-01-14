// src/screens/NHLScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Card, Title, Paragraph, Chip, Divider } from 'react-native-paper';
import apiService from '../services/api-service';
import { safeArray, safeString, formatTeamName } from '../utils/helpers'; // Import helpers

export default function NHLScreen() {
  const [games, setGames] = useState([]);
  const [standings, setStandings] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data with safe handling
      const [gamesResponse, standingsResponse, playersResponse] = await Promise.allSettled([
        apiService.get('/api/nhl/games'),
        apiService.get('/api/nhl/standings'),
        apiService.get('/api/nhl/players')
      ]);

      // Use safeArray for all responses
      setGames(safeArray(
        gamesResponse.status === 'fulfilled' 
          ? gamesResponse.value?.data || gamesResponse.value || []
          : []
      ));
      
      setStandings(safeArray(
        standingsResponse.status === 'fulfilled'
          ? standingsResponse.value?.data || standingsResponse.value || []
          : []
      ));
      
      setPlayers(safeArray(
        playersResponse.status === 'fulfilled'
          ? playersResponse.value?.data || playersResponse.value || []
          : []
      ));
      
    } catch (err) {
      console.error('Error fetching NHL data:', err);
      setError('Failed to load NHL data');
      // Set empty arrays on error
      setGames([]);
      setStandings([]);
      setPlayers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderGameCard = (game, index) => {
    const uniqueKey = `nhl-game-${index}-${game?.id || ''}-${game?.homeTeam || ''}-${game?.awayTeam || ''}`;
    
    // Use safe access to game properties
    const awayTeam = game?.awayTeam || game?.away || 'Away Team';
    const homeTeam = game?.homeTeam || game?.home || 'Home Team';
    const awayScore = game?.awayScore || game?.awayScore || 0;
    const homeScore = game?.homeScore || game?.homeScore || 0;
    const status = game?.status || 'Scheduled';
    const period = game?.period || game?.quarter || 'TBD';
    const time = game?.time || game?.startTime || 'TBD';
    
    return (
      <Card key={uniqueKey} style={styles.gameCard}>
        <Card.Content>
          <View style={styles.gameHeader}>
            <Chip icon="hockey-puck" style={styles.gameStatusChip}>
              {safeString(status)}
            </Chip>
            <View style={styles.gameInfo}>
              <Text style={styles.gamePeriod}>Period: {period}</Text>
              <Text style={styles.gameTime}>{time}</Text>
            </View>
          </View>
          
          <View style={styles.teamsContainer}>
            <View style={styles.teamContainer}>
              <Text style={styles.teamName}>
                {formatTeamName(awayTeam)}
              </Text>
              <Text style={styles.teamRecord}>
                ({safeString(game?.awayRecord, '0-0')})
              </Text>
              <Text style={styles.teamScore}>
                {awayScore}
              </Text>
            </View>
            
            <Text style={styles.vsText}>@</Text>
            
            <View style={styles.teamContainer}>
              <Text style={styles.teamName}>
                {formatTeamName(homeTeam)}
              </Text>
              <Text style={styles.teamRecord}>
                ({safeString(game?.homeRecord, '0-0')})
              </Text>
              <Text style={styles.teamScore}>
                {homeScore}
              </Text>
            </View>
          </View>
          
          <View style={styles.gameDetails}>
            <Text style={styles.gameDetailsText}>
              {safeString(game?.venue || game?.location, 'Venue TBD')}
            </Text>
            <Text style={styles.gameDetailsText}>
              TV: {safeString(game?.tv || game?.broadcast, 'TBD')}
            </Text>
          </View>
          
          {game?.lastPlay && (
            <View style={styles.lastPlayContainer}>
              <Text style={styles.lastPlayLabel}>Last Play: </Text>
              <Text style={styles.lastPlayText}>
                {safeString(game.lastPlay)}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderStandingCard = (team, index) => {
    const uniqueKey = `nhl-standing-${index}-${team?.id || ''}-${team?.name || ''}`;
    
    return (
      <Card key={uniqueKey} style={styles.standingCard}>
        <Card.Content>
          <View style={styles.standingHeader}>
            <Text style={styles.standingRank}>#{team?.rank || index + 1}</Text>
            <Text style={styles.standingTeam}>
              {safeString(team?.name, `Team ${index + 1}`)}
            </Text>
            <Chip style={styles.standingChip}>
              {safeString(team?.conference, 'Eastern')}
            </Chip>
          </View>
          
          <View style={styles.standingStats}>
            <Text style={styles.standingStat}>
              W: {team?.wins || 0}
            </Text>
            <Text style={styles.standingStat}>
              L: {team?.losses || 0}
            </Text>
            <Text style={styles.standingStat}>
              OTL: {team?.otLosses || 0}
            </Text>
            <Text style={styles.standingStat}>
              PTS: {team?.points || 0}
            </Text>
          </View>
          
          <View style={styles.standingStreak}>
            <Text style={styles.streakLabel}>Streak: </Text>
            <Text style={[
              styles.streakValue,
              team?.streak?.startsWith('W') ? styles.winStreak : styles.lossStreak
            ]}>
              {safeString(team?.streak, 'N/A')}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderPlayerCard = (player, index) => {
    const uniqueKey = `nhl-player-${index}-${player?.id || ''}-${player?.name || ''}`;
    
    return (
      <Card key={uniqueKey} style={styles.playerCard}>
        <Card.Content>
          <View style={styles.playerHeader}>
            <Text style={styles.playerName}>
              {safeString(player?.name, 'Unknown Player')}
            </Text>
            <Text style={styles.playerPosition}>
              {safeString(player?.position, 'FWD')}
            </Text>
          </View>
          
          <View style={styles.playerDetails}>
            <Text style={styles.playerTeam}>
              {safeString(player?.team, 'N/A')}
            </Text>
            <Text style={styles.playerNumber}>
              #{safeString(player?.number, '00')}
            </Text>
          </View>
          
          <View style={styles.playerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>GP</Text>
              <Text style={styles.statValue}>
                {player?.gamesPlayed || player?.gp || 0}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>G</Text>
              <Text style={styles.statValue}>
                {player?.goals || player?.g || 0}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>A</Text>
              <Text style={styles.statValue}>
                {player?.assists || player?.a || 0}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>PTS</Text>
              <Text style={styles.statValue}>
                {player?.points || player?.pts || 0}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>+/-</Text>
              <Text style={[
                styles.statValue,
                (player?.plusMinus || 0) >= 0 ? styles.positiveStat : styles.negativeStat
              ]}>
                {player?.plusMinus || 0}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading NHL data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🏒 NHL Hub</Text>
          <Text style={styles.headerSubtitle}>Games, Standings & Players</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Games Section */}
        {games.length > 0 && (
          <>
            <Divider style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>Live & Upcoming Games</Text>
            {games.map((game, index) => renderGameCard(game, index))}
          </>
        )}

        {/* Standings Section */}
        {standings.length > 0 && (
          <>
            <Divider style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>NHL Standings</Text>
            {standings.slice(0, 10).map((team, index) => renderStandingCard(team, index))}
          </>
        )}

        {/* Players Section */}
        {players.length > 0 && (
          <>
            <Divider style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>Top Players</Text>
            {players.slice(0, 10).map((player, index) => renderPlayerCard(player, index))}
          </>
        )}

        {!loading && games.length === 0 && standings.length === 0 && players.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No NHL data available at the moment</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
  },
  sectionDivider: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  gameCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
    backgroundColor: '#f0f9ff', // Light blue background for NHL
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameStatusChip: {
    backgroundColor: '#0369a1', // Darker blue for NHL
  },
  gameInfo: {
    alignItems: 'flex-end',
  },
  gamePeriod: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  gameTime: {
    fontSize: 12,
    color: '#64748b',
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    color: '#0c4a6e', // Dark blue for team names
  },
  teamRecord: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  teamScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  vsText: {
    fontSize: 14,
    color: '#64748b',
    marginHorizontal: 16,
  },
  gameDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gameDetailsText: {
    fontSize: 12,
    color: '#64748b',
  },
  lastPlayContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  lastPlayLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  lastPlayText: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
  },
  standingCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
  },
  standingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  standingRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369a1',
    marginRight: 12,
  },
  standingTeam: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  standingChip: {
    backgroundColor: '#e0f2fe',
  },
  standingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  standingStat: {
    fontSize: 12,
    color: '#475569',
  },
  standingStreak: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  streakValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  winStreak: {
    color: '#10b981',
  },
  lossStreak: {
    color: '#ef4444',
  },
  playerCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0c4a6e',
  },
  playerPosition: {
    fontSize: 12,
    color: '#64748b',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  playerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  playerTeam: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  playerNumber: {
    fontSize: 14,
    color: '#64748b',
  },
  playerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  positiveStat: {
    color: '#10b981',
  },
  negativeStat: {
    color: '#ef4444',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
