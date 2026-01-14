// Note: This screen works in offline mode with mock data
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

export default function AnalyticsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Data-driven insights</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Performance Trends</Text>
          <Text style={styles.cardText}>Your betting accuracy: 68%</Text>
          <Text style={styles.cardText}>Average ROI: +12.5%</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Team Analysis</Text>
          <Text style={styles.cardText}>Lakers ATS: 18-12 (60%)</Text>
          <Text style={styles.cardText}>Celtics Over: 20-10 (67%)</Text>
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
