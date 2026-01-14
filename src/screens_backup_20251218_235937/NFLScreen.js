// src/screens/NFLScreen.js
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
import { safeArray, safeUpperCase, safeString, formatTeamName } from '../utils/helpers'; // Import helpers

export default function NFLScreen() {
  const [games, setGames] = useState([]);
  const [standings, setStandings] = useState([]);
  const [news, setNews] = useState([]);
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
      const [gamesResponse, standingsResponse, newsResponse] = await Promise.allSettled([
        apiService.get('/api/nfl/games'),
        apiService.get('/api/nfl/standings'),
        apiService.get('/api/nfl/news')
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
      
      setNews(safeArray(
        newsResponse.status === 'fulfilled'
          ? newsResponse.value?.data || newsResponse.value || []
          : []
      ));
      
    } catch (err) {
      console.error('Error fetching NFL data:', err);
      setError('Failed to load NFL data');
      // Set empty arrays on error
      setGames([]);
      setStandings([]);
      setNews([]);
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
    const uniqueKey = `nfl-game-${index}-${game?.id || ''}-${game?.homeTeam || ''}-${game?.awayTeam || ''}`;
    
    return (
      <Card key={uniqueKey} style={styles.gameCard}>
        <Card.Content>
          <View style={styles.gameHeader}>
            <Chip icon="football" style={styles.gameStatusChip}>
              {safeString(game?.status, 'Scheduled')}
            </Chip>
            <Text style={styles.gameTime}>
              {game?.time || game?.startTime || 'TBD'}
            </Text>
          </View>
          
          <View style={styles.teamsContainer}>
            <View style={styles.teamContainer}>
              <Text style={styles.teamName}>
                {formatTeamName(game?.awayTeam)} {/* Use safe formatting */}
              </Text>
              <Text style={styles.teamRecord}>
                ({safeString(game?.awayRecord, '0-0')})
              </Text>
              <Text style={styles.teamScore}>
                {game?.awayScore || '0'}
              </Text>
            </View>
            
            <Text style={styles.vsText}>@</Text>
            
            <View style={styles.teamContainer}>
              <Text style={styles.teamName}>
                {formatTeamName(game?.homeTeam)} {/* Use safe formatting */}
              </Text>
              <Text style={styles.teamRecord}>
                ({safeString(game?.homeRecord, '0-0')})
              </Text>
              <Text style={styles.teamScore}>
                {game?.homeScore || '0'}
              </Text>
            </View>
          </View>
          
          <View style={styles.gameDetails}>
            <Text style={styles.gameDetailsText}>
              {game?.venue || game?.location || 'Location TBD'}
            </Text>
            <Text style={styles.gameDetailsText}>
              {game?.tv || game?.broadcast || 'TV: TBD'}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderStandingCard = (team, index) => {
    const uniqueKey = `nfl-standing-${index}-${team?.id || ''}-${team?.name || ''}`;
    
    return (
      <Card key={uniqueKey} style={styles.standingCard}>
        <Card.Content>
          <View style={styles.standingHeader}>
            <Text style={styles.standingRank}>#{team?.rank || index + 1}</Text>
            <Text style={styles.standingTeam}>
              {safeString(team?.name, `Team ${index + 1}`)}
            </Text>
            <Chip style={styles.standingChip}>
              {safeString(team?.conference, 'NFC')}
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
              T: {team?.ties || 0}
            </Text>
            <Text style={styles.standingStat}>
              PCT: {team?.winPercentage || '.000'}
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

  const renderNewsCard = (newsItem, index) => {
    const uniqueKey = `nfl-news-${index}-${newsItem?.id || ''}-${newsItem?.title || ''}`;
    
    return (
      <Card key={uniqueKey} style={styles.newsCard}>
        <Card.Content>
          <Title style={styles.newsTitle}>
            {safeString(newsItem?.title, 'NFL News Update')}
          </Title>
          <Paragraph style={styles.newsDescription}>
            {safeString(newsItem?.description, 'No description available')}
          </Paragraph>
          <View style={styles.newsFooter}>
            <Text style={styles.newsSource}>
              Source: {safeString(newsItem?.source, 'Unknown')}
            </Text>
            <Text style={styles.newsDate}>
              {newsItem?.date 
                ? new Date(newsItem.date).toLocaleDateString()
                : 'Today'}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading NFL data...</Text>
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
          <Text style={styles.headerTitle}>🏈 NFL Hub</Text>
          <Text style={styles.headerSubtitle}>Games, Standings & News</Text>
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
            <Text style={styles.sectionTitle}>NFL Standings</Text>
            {standings.slice(0, 10).map((team, index) => renderStandingCard(team, index))}
          </>
        )}

        {/* News Section */}
        {news.length > 0 && (
          <>
            <Divider style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>Latest NFL News</Text>
            {news.slice(0, 5).map((newsItem, index) => renderNewsCard(newsItem, index))}
          </>
        )}

        {!loading && games.length === 0 && standings.length === 0 && news.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No NFL data available at the moment</Text>
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
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameStatusChip: {
    backgroundColor: '#3b82f6',
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
  standingCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  standingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  standingRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginRight: 12,
  },
  standingTeam: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  standingChip: {
    backgroundColor: '#e2e8f0',
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
  newsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#f1f5f9',
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  newsDescription: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  newsSource: {
    fontSize: 10,
    color: '#94a3b8',
  },
  newsDate: {
    fontSize: 10,
    color: '#94a3b8',
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
