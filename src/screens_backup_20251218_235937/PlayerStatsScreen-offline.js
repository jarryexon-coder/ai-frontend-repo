import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const PlayerStatsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Player Statistics</Text>
        <Text style={styles.subtitle}>Offline Mode</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top Performers</Text>
        <Text style={styles.cardText}>Player stats will load when backend is available</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Season Averages</Text>
        <Text style={styles.cardText}>• Points: Loading...</Text>
        <Text style={styles.cardText}>• Rebounds: Loading...</Text>
        <Text style={styles.cardText}>• Assists: Loading...</Text>
        <Text style={styles.cardText}>• Steals: Loading...</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Advanced Metrics</Text>
        <Text style={styles.cardText}>Advanced stats updating when connected</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Injury Reports</Text>
        <Text style={styles.cardText}>Injury updates loading...</Text>
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
    backgroundColor: '#dc2626',
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
    color: '#fecaca',
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
    color: '#dc2626',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
});

export default PlayerStatsScreen;
