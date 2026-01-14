import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

// Import contexts
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Import all your actual screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import PlayerStatsScreen from './src/screens/PlayerStatsScreen';
import FantasyScreen from './src/screens/FantasyScreen';
import BettingScreen from './src/screens/BettingScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import LiveGamesScreen from './src/screens/LiveGamesScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import HomeScreen from './src/screens/HomeScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Loading Component
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <Text>Loading NBA Fantasy AI...</Text>
    </View>
  );
}

// Main Tab Navigator (shown when user is authenticated)
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Player Stats') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Fantasy') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Betting') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'Live Games') {
            iconName = focused ? 'basketball' : 'basketball-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Player Stats" 
        component={PlayerStatsScreen}
        options={{ title: 'Player Stats' }}
      />
      <Tab.Screen 
        name="Fantasy" 
        component={FantasyScreen}
        options={{ title: 'Fantasy' }}
      />
      <Tab.Screen 
        name="Betting" 
        component={BettingScreen}
        options={{ title: 'Betting' }}
      />
      <Tab.Screen 
        name="Live Games" 
        component={LiveGamesScreen}
        options={{ title: 'Live Games' }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{ title: 'Favorites' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

// Alternative: Simplified Tab Navigator with fewer tabs
function SimplifiedTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Stats') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Fantasy') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Betting') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'More') {
            iconName = focused ? 'menu' : 'menu-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Stats" component={PlayerStatsScreen} />
      <Tab.Screen name="Fantasy" component={FantasyScreen} />
      <Tab.Screen name="Betting" component={BettingScreen} />
      <Tab.Screen 
        name="More" 
        component={MoreStackNavigator}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

// Stack navigator for the "More" tab
function MoreStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MoreOptions" 
        component={MoreScreen}
        options={{ title: 'More' }}
      />
      <Stack.Screen 
        name="LiveGames" 
        component={LiveGamesScreen}
        options={{ title: 'Live Games' }}
      />
      <Stack.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{ title: 'My Favorites' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationSettingsScreen}
        options={{ title: 'Notification Settings' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'App Settings' }}
      />
    </Stack.Navigator>
  );
}

// More screen that lists additional options
function MoreScreen({ navigation }) {
  return (
    <View style={styles.moreContainer}>
      <Text style={styles.moreTitle}>More Options</Text>
      
      <TouchableOpacity 
        style={styles.optionButton}
        onPress={() => navigation.navigate('LiveGames')}
      >
        <Ionicons name="basketball-outline" size={24} color="#007AFF" />
        <Text style={styles.optionText}>Live Games</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.optionButton}
        onPress={() => navigation.navigate('Favorites')}
      >
        <Ionicons name="heart-outline" size={24} color="#007AFF" />
        <Text style={styles.optionText}>My Favorites</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.optionButton}
        onPress={() => navigation.navigate('Notifications')}
      >
        <Ionicons name="notifications-outline" size={24} color="#007AFF" />
        <Text style={styles.optionText}>Notification Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.optionButton}
        onPress={() => navigation.navigate('Settings')}
      >
        <Ionicons name="settings-outline" size={24} color="#007AFF" />
        <Text style={styles.optionText}>App Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

// Root Navigator - conditionally shows auth or main app
function RootNavigator() {
  const { user, loading } = useAuth();

  // Show loading while checking auth state
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator>
      {user ? (
        // User is authenticated - show main app
        <Stack.Screen 
          name="MainApp" 
          component={MainTabNavigator} // Change to SimplifiedTabNavigator if you prefer fewer tabs
          options={{ headerShown: false }}
        />
      ) : (
        // User is not authenticated - show auth flow
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  moreContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  moreTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
});

// Import TouchableOpacity for the MoreScreen
import { TouchableOpacity } from 'react-native';
