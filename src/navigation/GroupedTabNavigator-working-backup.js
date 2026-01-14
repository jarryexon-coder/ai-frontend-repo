// src/navigation/GroupedTabNavigator.js - CLEAN SIMPLE VERSION
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import working screens
import WrappedHomeScreen from '../screens/WrappedHomeScreen.js';
import DebugScreen from '../screens/DebugScreen.js';
import LiveGamesScreen from '../screens/LiveGamesScreen-enhanced.js';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ====== STACK NAVIGATORS ======

// "All Access" Stack (Free features)
function AllAccessStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="LiveGames" 
        component={LiveGamesScreen}
        initialParams={{ name: 'LiveGames' }}
      />
      <Stack.Screen 
        name="NHLTrends" 
        component={DebugScreen}
        initialParams={{ name: 'NHL Trends' }}
      />
      <Stack.Screen 
        name="MatchAnalytics" 
        component={DebugScreen}
        initialParams={{ name: 'Match Analytics' }}
      />
    </Stack.Navigator>
  );
}

// "Elite Insights" Stack (Premium features)
function EliteInsightsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="NFL" 
        component={DebugScreen}
        initialParams={{ name: 'NFL Analytics' }}
      />
      <Stack.Screen 
        name="PlayerMetrics" 
        component={DebugScreen}
        initialParams={{ name: 'Player Metrics' }}
      />
      <Stack.Screen 
        name="PlayerDashboard" 
        component={DebugScreen}
        initialParams={{ name: 'Player Dashboard' }}
      />
      <Stack.Screen 
        name="Fantasy" 
        component={DebugScreen}
        initialParams={{ name: 'Fantasy Tools' }}
      />
    </Stack.Navigator>
  );
}

// "Success Metrics & Elite Picks" Stack (Premium features)
function SuccessMetricsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="Predictions" 
        component={DebugScreen}
        initialParams={{ name: 'Predictions' }}
      />
      <Stack.Screen 
        name="ParlayArchitect" 
        component={DebugScreen}
        initialParams={{ name: 'Parlay Architect' }}
      />
      <Stack.Screen 
        name="ExpertSelections" 
        component={DebugScreen}
        initialParams={{ name: 'Expert Selections' }}
      />
      <Stack.Screen 
        name="SportsWire" 
        component={DebugScreen}
        initialParams={{ name: 'Sports Wire' }}
      />
      <Stack.Screen 
        name="Analytics" 
        component={DebugScreen}
        initialParams={{ name: 'Analytics Dashboard' }}
      />
    </Stack.Navigator>
  );
}

// ====== MAIN TAB NAVIGATOR ======

export default function GroupedTabNavigator() {
  return (
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
                iconName = focused ? 'star' : 'star-outline';
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
        <Tab.Screen 
          name="Home" 
          component={WrappedHomeScreen} 
          options={{ tabBarLabel: 'Home' }}
        />
        <Tab.Screen 
          name="AllAccess" 
          component={AllAccessStack} 
          options={{ 
            tabBarLabel: 'All Access',
            unmountOnBlur: false
          }}
        />
        <Tab.Screen 
          name="EliteInsights" 
          component={EliteInsightsStack} 
          options={{ 
            tabBarLabel: 'Elite Insights',
            unmountOnBlur: false
          }}
        />
        <Tab.Screen 
          name="SuccessMetrics" 
          component={SuccessMetricsStack} 
          options={{ 
            tabBarLabel: 'Success & Picks',
            unmountOnBlur: false
          }}
        />
        <Tab.Screen 
          name="MarketMoves" 
          component={DebugScreen}
          initialParams={{ name: 'Market Moves' }}
          options={{ tabBarLabel: 'Market Moves' }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
