import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
  const menuItems = [
    { title: 'Betting Insights', screen: 'Betting', color: '#1e3a8a', description: 'Get betting odds and predictions' },
    { title: 'Enhanced Betting', screen: 'EnhancedBetting', color: '#3730a3', description: 'Advanced betting analysis' },
    { title: 'Fantasy Advice', screen: 'Fantasy', color: '#059669', description: 'Fantasy basketball recommendations' },
    { title: 'Player Stats', screen: 'PlayerStats', color: '#dc2626', description: 'Player statistics and analytics' },
    { title: 'Live Games', screen: 'LiveGames', color: '#7c2d12', description: 'Live game updates and scores' },
    { title: 'My Favorites', screen: 'Favorites', color: '#7e22ce', description: 'Your favorite players and teams' },
    { title: 'Login', screen: 'Login', color: '#0f766e', description: 'Account login' },
    { title: 'Settings', screen: 'Settings', color: '#4b5563', description: 'App settings and preferences' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏀 NBA Fantasy & Betting</Text>
        <Text style={styles.subtitle}>Your ultimate basketball companion</Text>
      </View>

      <View style={styles.connectionStatus}>
        <Text style={styles.statusText}>Backend Status: ✅ Offline Mode</Text>
        <Text style={styles.tunnelText}>Running without backend connection</Text>
      </View>

      <View style={styles.grid}>
        {menuItems.map((item, index) => { const key = `item-${index}`; return (
          <TouchableOpacity
            key={index}
            style={[styles.card, { backgroundColor: item.color }]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </TouchableOpacity>
        )));;
      </View>
    </ScrollView>
  );
}

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
  connectionStatus: {
    backgroundColor: '#059669',
    padding: 10,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tunnelText: {
    color: '#d1fae5',
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
});
