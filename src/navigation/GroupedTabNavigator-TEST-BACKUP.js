// Temporary test navigation
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen-working.js';
import EditorUpdatesScreen from '../screens/EditorUpdatesScreen.js';
import TestRevenueCatGate from '../screens/TestRevenueCatGate.js';
import { SearchProvider } from '../providers/SearchProvider';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TestStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TestMain" component={TestRevenueCatGate} />
    </Stack.Navigator>
  );
}

export default function GroupedTabNavigator() {
  return (
    <SearchProvider>
      <View style={styles.container}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              switch (route.name) {
                case 'Home':
                  iconName = focused ? 'home' : 'home-outline';
                  break;
                case 'Test':
                  iconName = focused ? 'bug' : 'bug-outline';
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
          <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }}/>
          <Tab.Screen name="Test" component={TestStack} options={{ tabBarLabel: 'Test Gate' }}/>
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
