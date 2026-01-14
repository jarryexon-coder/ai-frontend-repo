// Note: This screen works in offline mode with mock data
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

export default function LiveGamesScreen() {
  const [games] = useState([
    { id: 1, home: 'Lakers', away: 'Warriors', score: '102-98', time: '4th Qtr' },
    { id: 2, home: 'Celtics', away: 'Heat', score: '89-85', time: '3rd Qtr' },
    { id: 3, home: 'Bucks', away: 'Nets', score: '76-72', time: '2nd Qtr' },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Live Games</Text>
          <Text style={styles.subtitle}>Real-time scores and updates</Text>
        </View>
        
        {games.map(game => (
          <View key={game.id} style={styles.gameCard}>
            <View style={styles.teams}>
              <Text style={styles.teamName}>{game.home}</Text>
              <Text style={styles.vs}>vs</Text>
              <Text style={styles.teamName}>{game.away}</Text>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={styles.score}>{game.score}</Text>
              <Text style={styles.time}>{game.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#1e3a8a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: '#d1d5db',
    marginTop: 5,
  },
  gameCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  vs: {
    fontSize: 14,
    color: '#6b7280',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  time: {
    fontSize: 14,
    color: '#059669',
    marginTop: 5,
  },
});
