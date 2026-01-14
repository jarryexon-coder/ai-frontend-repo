// src/screens/HomeScreen-SIMPLE.js
import React from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, 
  ScrollView, TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  // SIMPLE navigation - just test basic functionality
  const navigateToScreen = (screenName) => {
    // if (screenName === 'MarketMoves') {
      navigation.navigate('EditorsUpdates');
      return;
    }
    
    if (screenName === 'Analytics') {
      navigation.navigate('AnalyticsTab', { screen: 'AnalyticsMain' });
      return;
    }
    
    // Just use simple navigation for testing
    if (['LiveGames', 'Fantasy', 'Predictions'].includes(screenName)) {
      navigation.navigate(screenName === 'LiveGames' ? 'LiveSports' : 
                         screenName === 'Fantasy' ? 'PremiumTab' : 'WinnersCircle', 
                         { screen: screenName });
    } else {
      // For other screens, navigate to appropriate tab
      navigation.navigate('AnalyticsTab', { screen: 'AnalyticsMain' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="football" size={36} color="#ef4444" />
          <Text style={styles.title}>Sports Pro Analytics</Text>
          <Text style={styles.subtitle}>Testing Mode - Basic Navigation</Text>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        
        {/* WORKING SCREENS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.sectionTitle}>Working Screens</Text>
          </View>
          
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={styles.tabCard}
              onPress={() => navigateToScreen('MarketMoves')}
            >
              <View style={[styles.tabIcon, { backgroundColor: '#10b98120' }]}>
                <Ionicons name="megaphone" size={24} color="#10b981" />
              </View>
              <Text style={styles.tabTitle}>Market Moves</Text>
              <Text style={styles.tabSubtitle}>✅ Confirmed working</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tabCard}
              onPress={() => navigateToScreen('LiveGames')}
            >
              <View style={[styles.tabIcon, { backgroundColor: '#ef444420' }]}>
                <Ionicons name="play-circle" size={24} color="#ef4444" />
              </View>
              <Text style={styles.tabTitle}>Live Games</Text>
              <Text style={styles.tabSubtitle}>✅ Simple version works</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tabCard}
              onPress={() => navigateToScreen('Fantasy')}
            >
              <View style={[styles.tabIcon, { backgroundColor: '#f59e0b20' }]}>
                <Ionicons name="trophy" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.tabTitle}>Fantasy Tools</Text>
              <Text style={styles.tabSubtitle}>✅ Enhanced v2 works</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tabCard}
              onPress={() => navigateToScreen('Predictions')}
            >
              <View style={[styles.tabIcon, { backgroundColor: '#8b5cf620' }]}>
                <Ionicons name="trending-up" size={24} color="#8b5cf6" />
              </View>
              <Text style={styles.tabTitle}>AI Predictions</Text>
              <Text style={styles.tabSubtitle}>✅ Predictions work</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* TESTING SCREENS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="build" size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Testing Screens</Text>
          </View>
          
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={styles.tabCard}
              onPress={() => navigateToScreen('NFL')}
            >
              <View style={[styles.tabIcon, { backgroundColor: '#dc262620' }]}>
                <Ionicons name="american-football" size={24} color="#dc2626" />
              </View>
              <Text style={styles.tabTitle}>NFL Analytics</Text>
              <Text style={styles.tabSubtitle}>Placeholder for now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tabCard}
              onPress={() => navigateToScreen('PlayerMetrics')}
            >
              <View style={[styles.tabIcon, { backgroundColor: '#3b82f620' }]}>
                <Ionicons name="stats-chart" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.tabTitle}>Player Metrics</Text>
              <Text style={styles.tabSubtitle}>Placeholder for now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tabCard}
              onPress={() => navigateToScreen('ParlayArchitect')}
            >
              <View style={[styles.tabIcon, { backgroundColor: '#f59e0b20' }]}>
                <Ionicons name="build" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.tabTitle}>Parlay Architect</Text>
              <Text style={styles.tabSubtitle}>Testing</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tabCard}
              onPress={() => navigateToScreen('ExpertSelections')}
            >
              <View style={[styles.tabIcon, { backgroundColor: '#eab30820' }]}>
                <Ionicons name="star" size={24} color="#eab308" />
              </View>
              <Text style={styles.tabTitle}>Expert Selections</Text>
              <Text style={styles.tabSubtitle}>Placeholder for now</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { 
    paddingVertical: 20, 
    paddingHorizontal: 16,
    backgroundColor: '#1e293b', 
    borderBottomWidth: 1, 
    borderBottomColor: '#334155' 
  },
  headerContent: {
    alignItems: 'center',
  },
  title: { 
    color: '#fff', 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginTop: 10,
    textAlign: 'center'
  },
  subtitle: { 
    color: '#94a3b8', 
    fontSize: 16, 
    marginTop: 5,
    textAlign: 'center'
  },
  content: { flex: 1, padding: 16 },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff', 
    fontSize: 24, 
    fontWeight: 'bold',
    marginLeft: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tabCard: {
    backgroundColor: '#1e293b',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabIcon: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  tabTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tabSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 16,
  },
  bottomSpacer: {
    height: 32,
  },
});
