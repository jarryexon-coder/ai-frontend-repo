import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NflAnalyticsScreen from '../screens/NflAnalyticsScreen';
import NhlAnalyticsScreen from '../screens/NhlAnalyticsScreen';
import FantasyScreen from '../screens/FantasyScreen';
import PlayerStatsScreen from '../screens/PlayerStatsScreen';
import BettingScreen from '../screens/BettingScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();

// Home Stack Navigator (Home + Settings)
function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen 
        name="HomeMain" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ 
          title: 'Settings',
          headerStyle: { backgroundColor: '#1e3a8a' },
          headerTintColor: '#fff',
        }}
      />
    </HomeStack.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let icon = '';
          
          if (route.name === 'Home') icon = '🏠';
          else if (route.name === 'Fantasy') icon = '🏀';
          else if (route.name === 'Player Stats') icon = '📊';
          else if (route.name === 'NFL') icon = '🏈';
          else if (route.name === 'NHL') icon = '🏒';
          else if (route.name === 'Betting') icon = '💰';
          else if (route.name === 'Analytics') icon = '📈';
          
          return <Text style={{ fontSize: size, color }}>{icon}</Text>;
        },
        tabBarActiveTintColor: '#1e3a8a',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#f8fafc',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerShown: false,
      })}
      initialRouteName="Home"
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Fantasy" 
        component={FantasyScreen}
        options={{ title: 'Fantasy' }}
      />
      <Tab.Screen 
        name="Player Stats" 
        component={PlayerStatsScreen}
        options={{ title: 'Players' }}
      />
      <Tab.Screen 
        name="NFL" 
        component={NflAnalyticsScreen}
        options={{ title: 'NFL' }}
      />
      <Tab.Screen 
        name="NHL" 
        component={NhlAnalyticsScreen}
        options={{ title: 'NHL' }}
      />
      <Tab.Screen 
        name="Betting" 
        component={BettingScreen}
        options={{ title: 'Betting' }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
    </Tab.Navigator>
  );
}
