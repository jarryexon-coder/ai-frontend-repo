import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Load user data from AsyncStorage or API
      const userData = await AsyncStorage.getItem('@user_data');
      const subscriptionData = await AsyncStorage.getItem('@user_subscription');
      
      if (userData) {
        setUser(JSON.parse(userData));
      }
      
      if (subscriptionData) {
        setSubscription(JSON.parse(subscriptionData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: user?.avatar || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.name || 'Guest User'}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email || 'Sign in for personalized experience'}
            </Text>
          </View>
        </View>
      </View>

      {/* Subscription Status Card */}
      <TouchableOpacity 
        style={styles.subscriptionCard}
        onPress={() => navigation.navigate('Subscription')}
      >
        <View style={styles.subscriptionHeader}>
          <Ionicons 
            name={subscription?.plan === 'elite' ? 'trophy' : 
                  subscription?.plan === 'pro' ? 'star' : 'diamond-outline'} 
            size={24} 
            color={subscription?.plan === 'elite' ? '#FFD700' : 
                   subscription?.plan === 'pro' ? '#007AFF' : '#666'} 
          />
          <View style={styles.subscriptionInfo}>
            <Text style={styles.planName}>
              {subscription?.plan?.toUpperCase() || 'FREE'} PLAN
            </Text>
            {subscription?.expiresAt ? (
              <Text style={styles.planExpiry}>
                Renews {new Date(subscription.expiresAt).toLocaleDateString()}
              </Text>
            ) : (
              <Text style={styles.planExpiry}>No active subscription</Text>
            )}
          </View>
        </View>
        <TouchableOpacity 
          style={styles.manageButton}
          onPress={() => navigation.navigate('Subscription')}
        >
          <Text style={styles.manageButtonText}>
            {subscription?.plan === 'free' ? 'UPGRADE' : 'MANAGE'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Subscription')}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="diamond" size={24} color="#007AFF" />
            <Text style={styles.menuItemText}>Premium Features</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="settings" size={24} color="#666" />
            <Text style={styles.menuItemText}>Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="notifications" size={24} color="#666" />
            <Text style={styles.menuItemText}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="help-circle" size={24} color="#666" />
            <Text style={styles.menuItemText}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Days Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>87%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>+$1.2K</Text>
            <Text style={styles.statLabel}>Profit</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  subscriptionCard: {
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
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  subscriptionInfo: {
    marginLeft: 15,
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  planExpiry: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  manageButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  manageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuSection: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  statsSection: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});

export default ProfileScreen;
