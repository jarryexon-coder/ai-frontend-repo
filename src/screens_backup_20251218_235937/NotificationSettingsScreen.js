import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Alert
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import notificationService from '../services/notificationService';

export default function NotificationSettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [gameReminders, setGameReminders] = useState(true);
  const [scoreUpdates, setScoreUpdates] = useState(true);
  const [playerMilestones, setPlayerMilestones] = useState(true);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    const status = await notificationService.getPermissionStatus();
    setNotificationsEnabled(status === 'granted');
    setLoading(false);
  };

  const toggleNotifications = async (enabled) => {
    if (enabled) {
      await notificationService.configure();
      const status = await notificationService.getPermissionStatus();
      setNotificationsEnabled(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Please enable notifications in your device settings to receive alerts.'
        );
      }
    } else {
      await notificationService.cancelAllScheduledNotifications();
      setNotificationsEnabled(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loginMessage}>
          Please login to manage notification settings
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Notification Settings</Text>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>Push Notifications</Text>
          <Text style={styles.settingDescription}>
            Receive alerts for games and player updates
          </Text>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
        />
      </View>

      {notificationsEnabled && (
        <>
          <Text style={styles.sectionTitle}>Notification Types</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Game Reminders</Text>
              <Text style={styles.settingDescription}>
                Get notified 30 minutes before games start
              </Text>
            </View>
            <Switch
              value={gameReminders}
              onValueChange={setGameReminders}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Score Updates</Text>
              <Text style={styles.settingDescription}>
                Receive final scores and major score changes
              </Text>
            </View>
            <Switch
              value={scoreUpdates}
              onValueChange={setScoreUpdates}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Player Milestones</Text>
              <Text style={styles.settingDescription}>
                Get alerts when players reach milestones
              </Text>
            </View>
            <Switch
              value={playerMilestones}
              onValueChange={setPlayerMilestones}
            />
          </View>

          <View style={styles.note}>
            <Text style={styles.noteText}>
              💡 Notifications are sent for your favorite players and teams
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 24,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  loginMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  note: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  noteText: {
    color: '#1976d2',
    fontSize: 14,
  },
});
