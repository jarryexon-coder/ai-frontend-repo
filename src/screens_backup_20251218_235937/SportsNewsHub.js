// src/screens/SportsNewsHub.js
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
import { safeArray } from '../utils/helpers'; // Import the helper

export default function SportsNewsHub() {
  const [nbaNews, setNbaNews] = useState([]);
  const [nhlNews, setNhlNews] = useState([]);
  const [nflNews, setNflNews] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use safeArray to ensure we always have arrays
      const newsResponse = await apiService.get('/api/news/all');
      const data = newsResponse?.data || newsResponse || {};
      
      // Apply safeArray to ensure we're setting arrays
      setNbaNews(safeArray(data.nba));
      setNhlNews(safeArray(data.nhl));
      setNflNews(safeArray(data.nfl));
      setInjuries(safeArray(data.injuries));
      
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news');
      // Set empty arrays on error
      setNbaNews([]);
      setNhlNews([]);
      setNflNews([]);
      setInjuries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  const renderNewsCard = (news, index, sport) => {
    // Create a unique key using index, sport, and timestamp if available
    const uniqueKey = `${sport}-${index}-${news?.id || ''}-${news?.published || ''}`;
    
    return (
      <Card key={uniqueKey} style={styles.newsCard}>
        <Card.Content>
          <View style={styles.newsHeader}>
            <Chip icon="information" style={styles.sportChip}>
              {sport}
            </Chip>
            <Text style={styles.newsDate}>
              {news?.published 
                ? new Date(news.published).toLocaleDateString()
                : 'Today'}
            </Text>
          </View>
          <Title style={styles.newsTitle}>
            {safeString(news?.title, 'Untitled News')}
          </Title>
          <Paragraph style={styles.newsDescription}>
            {safeString(news?.description, 'No description available')}
          </Paragraph>
          {news?.author && (
            <Text style={styles.newsAuthor}>By {news.author}</Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderInjuryCard = (injury, index) => {
    const uniqueKey = `injury-${index}-${injury?.id || ''}-${injury?.player || ''}`;
    
    return (
      <Card key={uniqueKey} style={styles.injuryCard}>
        <Card.Content>
          <View style={styles.injuryHeader}>
            <Chip 
              icon="alert-circle" 
              style={[
                styles.injuryChip,
                { backgroundColor: injury?.severity === 'Out' ? '#ef4444' : '#f59e0b' }
              ]}
            >
              {safeString(injury?.status, 'Unknown')}
            </Chip>
            <Text style={styles.injurySport}>{injury?.sport || 'NBA'}</Text>
          </View>
          <Title style={styles.injuryTitle}>
            {safeString(injury?.player, 'Unknown Player')}
          </Title>
          <Paragraph style={styles.injuryDescription}>
            {safeString(injury?.injury, 'No injury details')}
          </Paragraph>
          <View style={styles.injuryDetails}>
            <Text style={styles.injuryTeam}>
              Team: {safeString(injury?.team, 'Unknown')}
            </Text>
            <Text style={styles.injuryUpdate}>
              Update: {safeString(injury?.update, 'No update')}
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
        <Text style={styles.loadingText}>Loading sports news...</Text>
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
          <Text style={styles.headerTitle}>Sports News Hub</Text>
          <Text style={styles.headerSubtitle}>All sports news in one place</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* NBA News Section */}
        {nbaNews.length > 0 && (
          <>
            <Divider style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>🏀 NBA News</Text>
            {nbaNews.map((news, index) => renderNewsCard(news, index, 'NBA'))}
          </>
        )}

        {/* NHL News Section */}
        {nhlNews.length > 0 && (
          <>
            <Divider style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>🏒 NHL News</Text>
            {nhlNews.map((news, index) => renderNewsCard(news, index, 'NHL'))}
          </>
        )}

        {/* NFL News Section */}
        {nflNews.length > 0 && (
          <>
            <Divider style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>🏈 NFL News</Text>
            {nflNews.map((news, index) => renderNewsCard(news, index, 'NFL'))}
          </>
        )}

        {/* Injuries Section */}
        {injuries.length > 0 && (
          <>
            <Divider style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>🤕 Injury Report</Text>
            {injuries.map((injury, index) => renderInjuryCard(injury, index))}
          </>
        )}

        {!loading && nbaNews.length === 0 && nhlNews.length === 0 && 
         nflNews.length === 0 && injuries.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No news available at the moment</Text>
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
  newsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sportChip: {
    backgroundColor: '#3b82f6',
  },
  newsDate: {
    fontSize: 12,
    color: '#64748b',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  newsDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  newsAuthor: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
    fontStyle: 'italic',
  },
  injuryCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  injuryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  injuryChip: {
    backgroundColor: '#ef4444',
  },
  injurySport: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  injuryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  injuryDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  injuryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  injuryTeam: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  injuryUpdate: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
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
