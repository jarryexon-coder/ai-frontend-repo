// src/navigation/GroupedTabNavigator.js - CORRECTED VERSION
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import HomeScreen and EditorUpdatesScreen (always visible)
import HomeScreen from '../screens/HomeScreen-working.js';
import EditorUpdatesScreen from '../screens/EditorUpdatesScreen.js';

// Import all the other screens for the stack navigators
import LiveGamesScreen from '../screens/LiveGamesScreen-enhanced.js';
import NHLScreen from '../screens/NHLScreen-enhanced.js';
import GameDetailsScreen from '../screens/GameDetailsScreen.js';
import NFLScreen from '../screens/NFLScreen-enhanced.js';
import PlayerStatsScreen from '../screens/PlayerStatsScreen-enhanced.js';
import PlayerProfileScreen from '../screens/PlayerProfileScreen-enhanced.js';
import FantasyScreen from '../screens/FantasyScreen-enhanced-v2.js';
import PredictionsScreen from '../screens/PredictionsScreen.js';
import ParlayBuilderScreen from '../screens/ParlayBuilderScreen.js';
import DailyPicksScreen from '../screens/DailyPicksScreen-enhanced.js';
import SportsNewsHubScreen from '../screens/SportsNewsHub-enhanced.js';
import AnalyticsScreen from '../screens/AnalyticsScreen-enhanced.js';

// Import RevenueCat components
import RevenueCatGate from '../components/RevenueCatGate';

// Import SearchProvider
import { SearchProvider } from '../providers/SearchProvider';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ====== STACK NAVIGATORS ======

// "All Access" Stack (Free features)
function AllAccessStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LiveGames" component={LiveGamesScreen} />
      <Stack.Screen name="NHLTrends" component={NHLScreen} />
      <Stack.Screen name="MatchAnalytics" component={GameDetailsScreen} />
    </Stack.Navigator>
  );
}

// "Elite Insights" Stack (Premium features - always protected)
function EliteInsightsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* NFL Analytics */}
      <Stack.Screen name="NFL">
        {(props) => (
          <RevenueCatGate 
            requiredEntitlement="premium_access"
            featureName="NFL Analytics"
          >
            <NFLScreen {...props} />
          </RevenueCatGate>
        )}
      </Stack.Screen>
      
      {/* Player Metrics */}
      <Stack.Screen name="PlayerMetrics">
        {(props) => (
          <RevenueCatGate 
            requiredEntitlement="premium_access"
            featureName="Player Metrics"
          >
            <PlayerStatsScreen {...props} />
          </RevenueCatGate>
        )}
      </Stack.Screen>
      
      {/* Player Dashboard - FIXED NAME */}
      <Stack.Screen name="PlayerDashboard">
        {(props) => (
          <RevenueCatGate 
            requiredEntitlement="premium_access"
            featureName="Player Dashboard"
          >
            <PlayerProfileScreen {...props} />
          </RevenueCatGate>
        )}
      </Stack.Screen>
      
      {/* Fantasy Tools */}
      <Stack.Screen name="Fantasy">
        {(props) => (
          <RevenueCatGate 
            requiredEntitlement="premium_access"
            featureName="Fantasy Tools"
          >
            <FantasyScreen {...props} />
          </RevenueCatGate>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// "Success Metrics & Elite Picks" Stack (Premium features - always protected)
function SuccessMetricsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Predictions */}
      <Stack.Screen name="Predictions">
        {(props) => (
          <RevenueCatGate 
            requiredEntitlement="premium_access"
            featureName="Predictions"
          >
            <PredictionsScreen {...props} />
          </RevenueCatGate>
        )}
      </Stack.Screen>
      
      {/* Parlay Architect */}
      <Stack.Screen name="ParlayArchitect">
        {(props) => (
          <RevenueCatGate 
            requiredEntitlement="premium_access"
            featureName="Parlay Architect"
          >
            <ParlayBuilderScreen {...props} />
          </RevenueCatGate>
        )}
      </Stack.Screen>
      
      {/* Expert Selections */}
      <Stack.Screen name="ExpertSelections">
        {(props) => (
          <RevenueCatGate 
            requiredEntitlement="premium_access"
            featureName="Expert Selections"
          >
            <DailyPicksScreen {...props} />
          </RevenueCatGate>
        )}
      </Stack.Screen>
      
      {/* Sports Wire */}
      <Stack.Screen name="SportsWire">
        {(props) => (
          <RevenueCatGate 
            requiredEntitlement="premium_access"
            featureName="Sports Wire"
          >
            <SportsNewsHubScreen {...props} />
          </RevenueCatGate>
        )}
      </Stack.Screen>
      
      {/* Analytics Dashboard */}
      <Stack.Screen name="Analytics">
        {(props) => (
          <RevenueCatGate 
            requiredEntitlement="premium_access"
            featureName="Analytics Dashboard"
          >
            <AnalyticsScreen {...props} />
          </RevenueCatGate>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// ====== MAIN TAB NAVIGATOR ======

export default function GroupedTabNavigator() {
  return (
    <SearchProvider> {/* WRAP THE ENTIRE TAB NAVIGATOR */}
      <View style={styles.container}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              switch (route.name) {
                case 'Home':
                  iconName = focused ? 'home' : 'home-outline';
                  break;
                case 'AllAccess':
                  iconName = focused ? 'lock-open' : 'lock-open-outline';
                  break;
                case 'EliteInsights':
                  iconName = focused ? 'diamond' : 'diamond-outline';
                  break;
                case 'SuccessMetrics':
                  iconName = focused ? 'trophy' : 'trophy-outline';
                  break;
                case 'MarketMoves':
                  iconName = focused ? 'trending-up' : 'trending-up-outline';
                  break;
                default:
                  iconName = 'help-circle';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#ef4444',
            tabBarInactiveTintColor: '#94a3b8',
            tabBarStyle: {
              backgroundColor: '#0f172a',
              borderTopWidth: 1,
              borderTopColor: '#334155',
              paddingBottom: 8,
              paddingTop: 8,
              height: 60,
            },
            tabBarLabelStyle: { 
              fontSize: 12,
              marginBottom: 4, 
              fontWeight: '500' 
            },
            headerShown: false,
          })}
          initialRouteName="Home"
        >
          {/* 5 Tabs Total */}
          <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }}/>
          <Tab.Screen name="AllAccess" component={AllAccessStack} options={{ tabBarLabel: 'All Access' }}/>
          <Tab.Screen name="EliteInsights" component={EliteInsightsStack} options={{ tabBarLabel: 'Elite Insights' }}/>
          <Tab.Screen name="SuccessMetrics" component={SuccessMetricsStack} options={{ tabBarLabel: 'Success & Picks' }}/>
          <Tab.Screen name="MarketMoves" component={EditorUpdatesScreen} options={{ tabBarLabel: 'Market Moves' }}/>
        </Tab.Navigator>
      </View>
    </SearchProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
