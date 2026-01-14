import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const FantasyScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Fantasy Basketball</Text>
        <Text style={styles.subtitle}>Offline Mode</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>My Fantasy Team</Text>
        <Text style={styles.cardText}>Team data will load when backend is available</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Player Recommendations</Text>
        <Text style={styles.cardText}>• Top Picks: Loading...</Text>
        <Text style={styles.cardText}>• Sleepers: Loading...</Text>
        <Text style={styles.cardText}>• Bust Alerts: Loading...</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>League Standings</Text>
        <Text style={styles.cardText}>Standings will update when connected</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upcoming Games</Text>
        <Text style={styles.cardText}>Game schedule loading...</Text>
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
    backgroundColor: '#059669',
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
    color: '#d1fae5',
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
    color: '#059669',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
});

export default FantasyScreen;
