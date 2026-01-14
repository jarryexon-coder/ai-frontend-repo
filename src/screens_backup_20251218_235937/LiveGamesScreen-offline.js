import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const LiveGamesScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏀 Live Games</Text>
        <Text style={styles.subtitle}>Offline Mode</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Games</Text>
        <Text style={styles.cardText}>Live scores will update when backend is available</Text>
      </View>

      <View style={styles.gameCard}>
        <Text style={styles.gameTitle}>Game 1</Text>
        <Text style={styles.gameScore}>Loading vs Loading</Text>
        <Text style={styles.gameStatus}>Quarter: -- | Time: --</Text>
      </View>

      <View style={styles.gameCard}>
        <Text style={styles.gameTitle}>Game 2</Text>
        <Text style={styles.gameScore}>Loading vs Loading</Text>
        <Text style={styles.gameStatus}>Quarter: -- | Time: --</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Key Plays</Text>
        <Text style={styles.cardText}>Live play-by-play updating when connected</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#7c2d12',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fed7aa',
  },
  card: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameCard: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#7c2d12',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7c2d12',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7c2d12',
    marginBottom: 5,
  },
  gameScore: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 3,
  },
  gameStatus: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default LiveGamesScreen;
