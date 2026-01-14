// Note: This screen works in offline mode with mock data
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

export default function NflAnalyticsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>NFL Analytics</Text>
          <Text style={styles.subtitle}>Football data and insights</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>NFL Week 15</Text>
          <Text style={styles.cardText}>Chiefs vs Patriots: O/U 45.5</Text>
          <Text style={styles.cardText}>Eagles vs Cowboys: Eagles -3.5</Text>
        </View>
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
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 5,
  },
});
