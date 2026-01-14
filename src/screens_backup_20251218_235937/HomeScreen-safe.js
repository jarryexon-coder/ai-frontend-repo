import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏀 NBA Fantasy</Text>
        <Text style={styles.subtitle}>Offline Mode - Backend Coming Soon</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fantasy Teams</Text>
        <Text style={styles.cardText}>Create and manage your fantasy teams</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Live Scores</Text>
        <Text style={styles.cardText}>Real-time game updates</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Player Stats</Text>
        <Text style={styles.cardText}>Advanced player statistics</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Betting Insights</Text>
        <Text style={styles.cardText}>AI-powered predictions</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
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
    marginBottom: 5,
  },
  cardText: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default HomeScreen;
