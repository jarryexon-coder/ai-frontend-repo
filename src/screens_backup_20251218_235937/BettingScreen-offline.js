import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const BettingScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💰 Betting Insights</Text>
        <Text style={styles.subtitle}>Offline Mode</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Best Bets</Text>
        <Text style={styles.cardText}>Betting data will load when backend is available</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Live Odds</Text>
        <Text style={styles.cardText}>• Moneyline: Loading...</Text>
        <Text style={styles.cardText}>• Spread: Loading...</Text>
        <Text style={styles.cardText}>• Over/Under: Loading...</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI Predictions</Text>
        <Text style={styles.cardText}>Predictions updating when connected</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sharp Money</Text>
        <Text style={styles.cardText}>Professional betting trends loading...</Text>
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
    backgroundColor: '#1e3a8a',
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
    color: '#e2e8f0',
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
});

export default BettingScreen;
