// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity } from 'react-native';

// Import all your screens
import HomeScreen from '../screens/HomeScreen-enhanced-v2';
import LiveGamesScreen from '../screens/LiveGamesScreen-enhanced';
import SportsNewsHubScreen from '../screens/SportsNewsHub-enhanced';
import NflAnalyticsScreen from '../screens/NFLScreen-enhanced';
import DailyPicksScreen from '../screens/DailyPicksScreen-enhanced';
import PlayerStatsScreen from '../screens/PlayerStatsScreen-enhanced';
import AnalyticsScreen from '../screens/AnalyticsScreen-enhanced';
import ParlayBuilderScreen from '../screens/ParlayBuilder/ParlayBuilderScreen';
import NHLScreen from '../screens/NHLScreen-enhanced';
import FantasyScreen from '../screens/FantasyScreen-enhanced-v2';
import BettingScreen from '../screens/BettingScreen-enhanced';
import PlayerProfileScreen from '../screens/PlayerProfileScreen';

const Tab = createBottomTabNavigator();

// Create a simple modal system for screens that should be accessible from buttons
const ModalContext = React.createContext();

export const useModal = () => React.useContext(ModalContext);

const ModalProvider = ({ children }) => {
  const [modalContent, setModalContent] = React.useState(null);
  
  const showModal = (content) => {
    setModalContent(content);
  };
  
  const hideModal = () => {
    setModalContent(null);
  };
  
  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {modalContent && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <View style={{
            backgroundColor: '#1e293b',
            padding: 20,
            borderRadius: 10,
            width: '90%',
            maxHeight: '80%',
          }}>
            {modalContent}
            <TouchableOpacity onPress={hideModal} style={{
              marginTop: 20,
              padding: 10,
              backgroundColor: '#ef4444',
              borderRadius: 5,
              alignItems: 'center',
            }}>
              <Text style={{ color: 'white' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ModalContext.Provider>
  );
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons = {
            'Home': '🏠',
            'Live': '🏀',
            'News': '📰',
            'NFL': '🏈',
            'Picks': '🎯',
            'Players': '📊',
            'Parlay': '💰',
            'Analytics': '📈',
            'Fantasy': '⭐',
            'NHL': '🏒',
          };
          return <Text style={{ fontSize: size, color }}>{icons[route.name] || '•'}</Text>;
        },
        tabBarActiveTintColor: '#ef4444',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopWidth: 1,
          borderTopColor: '#334155',
          paddingBottom: 8,
          paddingTop: 8,
        },
      })}
      initialRouteName="Home"
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Live" component={LiveGamesScreen} />
      <Tab.Screen name="Players" component={PlayerStatsScreen} />
      <Tab.Screen name="NFL" component={NflAnalyticsScreen} />
      <Tab.Screen name="Fantasy" component={FantasyScreen} />
      <Tab.Screen name="NHL" component={NHLScreen} />
      <Tab.Screen name="Picks" component={DailyPicksScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Parlay" component={ParlayBuilderScreen} />
      <Tab.Screen name="News" component={SportsNewsHubScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <ModalProvider>
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    </ModalProvider>
  );
}
