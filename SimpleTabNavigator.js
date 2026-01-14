// src/navigation/SimpleTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Import the category stacks
import { AllAccessStack, PremiumAccessStack, WinnersCircleStack, MiscStack } from './CategoryStacks';

const Tab = createBottomTabNavigator();

// Custom Tab Bar Button Component
function CustomTabBarButton({ children, onPress }) {
  return (
    <TouchableOpacity
      style={styles.customButton}
      onPress={onPress}
    >
      <View style={styles.buttonContent}>
        {children}
      </View>
    </TouchableOpacity>
  );
}

export default function SimpleTabNavigator() {
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          // Category-based icons
          switch (route.name) {
            case 'AllAccess': 
              iconName = focused ? 'globe' : 'globe-outline'; 
              break;
            case 'PremiumAccess': 
              iconName = focused ? 'star' : 'star-outline'; 
              break;
            case 'WinnersCircle': 
              iconName = focused ? 'trophy' : 'trophy-outline'; 
              break;
            case 'Search': 
              iconName = focused ? 'search' : 'search-outline'; 
              break;
            case 'Settings': 
              iconName = focused ? 'settings' : 'settings-outline'; 
              break;
            default: 
              iconName = focused ? 'help-circle' : 'help-circle-outline';
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
          position: 'relative',
        },
        tabBarLabelStyle: { 
          fontSize: 11, 
          marginBottom: 4, 
          fontWeight: '500' 
        },
        headerShown: false,
      })}
      initialRouteName="AllAccess"
    >
      {/* Tab 1: All Access Category */}
      <Tab.Screen 
        name="AllAccess" 
        component={AllAccessStack} 
        options={{ 
          tabBarLabel: 'All Access',
          tabBarIcon: ({ focused, color, size }) => (
            <View style={styles.iconContainer}>
              <Ionicons 
                name={focused ? 'globe' : 'globe-outline'} 
                size={size} 
                color={color} 
              />
              <Text style={[styles.iconBadge, { backgroundColor: '#10b981' }]}>3</Text>
            </View>
          ),
        }} 
      />
      
      {/* Tab 2: Premium Access Category */}
      <Tab.Screen 
        name="PremiumAccess" 
        component={PremiumAccessStack} 
        options={{ 
          tabBarLabel: 'Premium',
          tabBarIcon: ({ focused, color, size }) => (
            <View style={styles.iconContainer}>
              <Ionicons 
                name={focused ? 'star' : 'star-outline'} 
                size={size} 
                color={color} 
              />
              <Text style={[styles.iconBadge, { backgroundColor: '#f59e0b' }]}>5</Text>
            </View>
          ),
        }} 
      />
      
      {/* Tab 3: Search (Center Button) */}
      <Tab.Screen 
        name="Search" 
        component={SearchScreenPlaceholder}
        options={{ 
          tabBarLabel: 'Search',
          tabBarButton: (props) => (
            <CustomTabBarButton
              {...props}
              onPress={() => navigation.navigate('SearchScreen')}
            >
              <Ionicons name="search" size={24} color="#007AFF" />
              <Text style={styles.searchButtonText}>Search</Text>
            </CustomTabBarButton>
          ),
        }} 
      />
      
      {/* Tab 4: Winners Circle Category */}
      <Tab.Screen 
        name="WinnersCircle" 
        component={WinnersCircleStack}
        options={{ 
          tabBarLabel: 'Winners',
          tabBarIcon: ({ focused, color, size }) => (
            <View style={styles.iconContainer}>
              <Ionicons 
                name={focused ? 'trophy' : 'trophy-outline'} 
                size={size} 
                color={color} 
              />
              <Text style={[styles.iconBadge, { backgroundColor: '#8b5cf6' }]}>5</Text>
            </View>
          ),
        }} 
      />
      
      {/* Tab 5: Settings/Misc Category */}
      <Tab.Screen 
        name="Settings" 
        component={MiscStack} 
        options={{ 
          tabBarLabel: 'More',
        }} 
      />
    </Tab.Navigator>
  );
}

// Placeholder component for Search tab
function SearchScreenPlaceholder() {
  return null;
}

const styles = StyleSheet.create({
  customButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1e293b',
    borderWidth: 3,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#007AFF',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  iconContainer: {
    position: 'relative',
  },
  iconBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: 8,
    color: 'white',
    borderRadius: 7,
    paddingHorizontal: 3,
    paddingVertical: 1,
    minWidth: 14,
    textAlign: 'center',
  },
});
