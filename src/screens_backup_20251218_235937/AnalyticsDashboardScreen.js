import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import AnalyticsService from '../services/AnalyticsService';

const { width } = Dimensions.get('window');

const AnalyticsDashboardScreen = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await AnalyticsService.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="analytics" size={60} color="#007AFF" />
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Subscription metrics and user behavior
        </Text>
      </View>

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {['1d', '7d', '30d', '90d'].map(range => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.timeRangeButtonActive
            ]}
            onPress={() => setTimeRange(range)}
          >
            <Text style={[
              styles.timeRangeText,
              timeRange === range && styles.timeRangeTextActive
            ]}>
              {range}
            </Text>
          </TouchableOpacity>
        )));;
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Ionicons name="trending-up" size={30} color="#4CAF50" />
          <Text style={styles.metricValue}>{metrics?.upgradeAttempts || 0}</Text>
          <Text style={styles.metricLabel}>Upgrade Attempts</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Ionicons name="checkmark-circle" size={30} color="#2196F3" />
          <Text style={styles.metricValue}>{metrics?.upgradeSuccesses || 0}</Text>
          <Text style={styles.metricLabel}>Successes</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Ionicons name="bar-chart" size={30} color="#FF9800" />
          <Text style={styles.metricValue}>
            {metrics?.conversionRate ? metrics.conversionRate.toFixed(1) : '0.0'}%
          </Text>
          <Text style={styles.metricLabel}>Conversion Rate</Text>
        </View>
      </View>

      {/* Event Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Event Summary</Text>
        <View style={styles.eventSummary}>
          <View style={styles.eventItem}>
            <Text style={styles.eventCount}>{metrics?.totalEvents || 0}</Text>
            <Text style={styles.eventLabel}>Total Events</Text>
          </View>
          <View style={styles.eventItem}>
            <Text style={styles.eventCount}>{metrics?.subscriptionEvents || 0}</Text>
            <Text style={styles.eventLabel}>Subscription Events</Text>
          </View>
          <View style={styles.eventItem}>
            <Text style={styles.eventCount}>{metrics?.recentEvents || 0}</Text>
            <Text style={styles.eventLabel}>Last 30 Days</Text>
          </View>
        </View>
      </View>

      {/* Sample Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Subscription Events Timeline</Text>
        <VictoryChart
          width={width - 40}
          theme={VictoryTheme.material}
          domainPadding={20}
        >
          <VictoryAxis
            tickValues={[1, 2, 3, 4, 5, 6, 7]}
            tickFormat={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
          />
          <VictoryAxis dependentAxis />
          <VictoryBar
            data={[
              { day: 'Mon', events: 12 },
              { day: 'Tue', events: 19 },
              { day: 'Wed', events: 15 },
              { day: 'Thu', events: 22 },
              { day: 'Fri', events: 18 },
              { day: 'Sat', events: 24 },
              { day: 'Sun', events: 16 }
            ]}
            x="day"
            y="events"
            style={{ data: { fill: "#007AFF", width: 20 } }}
          />
        </VictoryChart>
      </View>

      {/* Refresh Button */}
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={loadMetrics}
      >
        <Ionicons name="refresh" size={20} color="#666" />
        <Text style={styles.refreshText}>Refresh Metrics</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  timeRangeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    backgroundColor: '#e9ecef',
    borderRadius: 20,
  },
  timeRangeButtonActive: {
    backgroundColor: '#007AFF',
  },
  timeRangeText: {
    color: '#666',
    fontWeight: '600',
  },
  timeRangeTextActive: {
    color: 'white',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  eventSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  eventItem: {
    alignItems: 'center',
  },
  eventCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  eventLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  chartCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
});

export default AnalyticsDashboardScreen;
