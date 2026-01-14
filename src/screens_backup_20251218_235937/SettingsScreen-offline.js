import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';

const SettingsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚙️ Settings</Text>
        <Text style={styles.subtitle}>App Configuration</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Push Notifications</Text>
          <Switch value={true} />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Game Alerts</Text>
          <Switch value={true} />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Betting Updates</Text>
          <Switch value={false} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Dark Mode</Text>
          <Switch value={false} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Auto-refresh</Text>
          <Switch value={true} />
        </View>
        
        <Text style={styles.settingNote}>Backend connection required for live data</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>NBA Fantasy & Betting App</Text>
        <Text style={styles.aboutText}>Version 3.0.0</Text>
        <Text style={styles.aboutText}>Running in Offline Mode</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#4b5563',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#d1d5db',
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4b5563',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingText: {
    fontSize: 16,
    color: '#374151',
  },
  settingNote: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 10,
  },
  aboutText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 5,
  },
});

export default SettingsScreen;
