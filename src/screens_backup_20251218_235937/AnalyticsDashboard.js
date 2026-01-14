import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/Ionicons';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [metrics, setMetrics] = useState({
    activeUsers: 1245,
    newUsers: 234,
    sessions: 5432,
    avgSession: '4m 32s',
    conversionRate: '2.3%',
    revenue: '$1,234'
  });

  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [20, 45, 28, 80, 99, 43, 50],
      color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
    }]
  };

  const barData = {
    labels: ['Home', 'Games', 'Bets', 'Profile', 'Favorites'],
    datasets: [{
      data: [300, 150, 200, 80, 120]
    }]
  };

  const pieData = [
    { name: 'Free', population: 75, color: '#4A90E2', legendFontColor: '#7F7F7F' },
    { name: 'Pro', population: 20, color: '#34C759', legendFontColor: '#7F7F7F' },
    { name: 'Elite', population: 5, color: '#FF9500', legendFontColor: '#7F7F7F' }
  ];

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <View style={styles.timeRangeSelector}>
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
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        {Object.entries(metrics).map(([key, value]) => (
          <View key={key} style={styles.metricCard}>
            <Text style={styles.metricValue}>{value}</Text>
            <Text style={styles.metricLabel}>
              {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
            </Text>
          </View>
        )));;
      </View>

      {/* User Growth Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Active Users Trend</Text>
        <LineChart
          data={data}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Screen Views */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Screen Views</Text>
        <BarChart
          data={barData}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars
        />
      </View>

      {/* User Distribution */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>User Plan Distribution</Text>
        <PieChart
          data={pieData}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      {/* Events Table */}
      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>Recent Events</Text>
        {[
          { event: 'User Signed Up', count: 124, change: '+12%' },
          { event: 'Game Viewed', count: 543, change: '+5%' },
          { event: 'Bet Placed', count: 87, change: '+23%' },
          { event: 'Subscription Purchased', count: 23, change: '+8%' }
        ].map((row, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{row.event}</Text>
            <Text style={styles.tableCell}>{row.count}</Text>
            <Text style={[
              styles.tableCell,
              styles.changeText,
              row.change.startsWith('+') ? styles.positiveChange : styles.negativeChange
            ]}>
              {row.change}
            </Text>
          </View>
        )));;
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  timeRangeSelector: {
    flexDirection: 'row',
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
  },
  timeRangeButtonActive: {
    backgroundColor: '#4A90E2',
  },
  timeRangeText: {
    fontSize: 14,
    color: '#666',
  },
  timeRangeTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  metricCard: {
    width: '50%',
    padding: 16,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  chartCard: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  tableCard: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tableCell: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  changeText: {
    textAlign: 'right',
    fontWeight: '600',
  },
  positiveChange: {
    color: '#34C759',
  },
  negativeChange: {
    color: '#FF3B30',
  },
});
