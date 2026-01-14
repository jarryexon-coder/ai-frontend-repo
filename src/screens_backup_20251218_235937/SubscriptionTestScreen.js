import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SubscriptionGate from '../components/SubscriptionGate';

const SubscriptionTestScreen = () => {
  const [testSubscription, setTestSubscription] = useState(null);
  const [overrideEnabled, setOverrideEnabled] = useState(false);
  const [testData, setTestData] = useState({
    plan: 'free',
    expiresAt: null,
    lastUpdated: Date.now()
  });

  const setTestSubscriptionLevel = async (plan) => {
    const expiresAt = plan === 'free' ? null : 
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now
    
    const subscriptionData = {
      plan,
      expiresAt,
      lastUpdated: Date.now()
    };

    await AsyncStorage.setItem('@user_subscription', JSON.stringify(subscriptionData));
    await AsyncStorage.setItem('@test_override', JSON.stringify({
      enabled: overrideEnabled,
      data: subscriptionData
    }));

    setTestSubscription(subscriptionData);
    setTestData(subscriptionData);
    
    Alert.alert(
      'Test Subscription Set',
      `Now testing as ${plan.toUpperCase()} user`,
      [{ text: 'OK' }]
    );
  };

  const clearTestData = async () => {
    await AsyncStorage.removeItem('@user_subscription');
    await AsyncStorage.removeItem('@test_override');
    setTestSubscription(null);
    setTestData({ plan: 'free', expiresAt: null, lastUpdated: Date.now() });
    
    Alert.alert(
      'Test Data Cleared',
      'Using real subscription data',
      [{ text: 'OK' }]
    );
  };

  const getExpiryText = () => {
    if (!testData.expiresAt) return 'No expiry';
    const date = new Date(testData.expiresAt);
    return `Expires: ${date.toLocaleDateString()}`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Test Controls */}
      <View style={styles.testControls}>
        <Text style={styles.sectionTitle}>🔧 Subscription Testing</Text>
        
        <View style={styles.overrideToggle}>
          <Text style={styles.overrideLabel}>Enable Test Override</Text>
          <Switch
            value={overrideEnabled}
            onValueChange={setOverrideEnabled}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
          />
        </View>

        <Text style={styles.currentTestStatus}>
          Current Test Level: <Text style={styles.testLevel}>{testData.plan.toUpperCase()}</Text>
        </Text>
        <Text style={styles.expiryText}>{getExpiryText()}</Text>

        {/* Set Test Levels */}
        <View style={styles.testButtons}>
          <TouchableOpacity 
            style={[styles.testButton, styles.freeButton]}
            onPress={() => setTestSubscriptionLevel('free')}
          >
            <Text style={styles.testButtonText}>Set FREE</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.testButton, styles.proButton]}
            onPress={() => setTestSubscriptionLevel('pro')}
          >
            <Text style={styles.testButtonText}>Set PRO</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.testButton, styles.eliteButton]}
            onPress={() => setTestSubscriptionLevel('elite')}
          >
            <Text style={styles.testButtonText}>Set ELITE</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.clearButton}
          onPress={clearTestData}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          <Text style={styles.clearButtonText}>Clear Test Data</Text>
        </TouchableOpacity>
      </View>

      {/* Test Subscription Gates */}
      <View style={styles.testGates}>
        <Text style={styles.sectionTitle}>🎯 Test Gates</Text>
        
        {/* Free Access Gate */}
        <View style={styles.gateTestCard}>
          <Text style={styles.gateTitle}>Free Content (No Restriction)</Text>
          <Text style={styles.gateDescription}>
            This should always be visible to all users
          </Text>
          <View style={styles.gateContent}>
            <Text style={styles.gateContentText}>✅ Free content visible!</Text>
          </View>
        </View>

        {/* Pro Gate Test */}
        <View style={styles.gateTestCard}>
          <Text style={styles.gateTitle}>PRO Content (Requires Pro Plan)</Text>
          <Text style={styles.gateDescription}>
            This should be visible to PRO and ELITE users only
          </Text>
          <SubscriptionGate 
            requiredPlan="pro"
            featureName="Test Pro Feature"
            showUpgradePrompt={false}
          >
            <View style={styles.gateContent}>
              <Ionicons name="star" size={40} color="#FFD700" />
              <Text style={styles.gateContentText}>🎉 PRO Content Unlocked!</Text>
              <Text style={styles.gateSubtext}>
                This content requires PRO subscription
              </Text>
            </View>
          </SubscriptionGate>
        </View>

        {/* Elite Gate Test */}
        <View style={styles.gateTestCard}>
          <Text style={styles.gateTitle}>ELITE Content (Requires Elite Plan)</Text>
          <Text style={styles.gateDescription}>
            This should be visible to ELITE users only
          </Text>
          <SubscriptionGate 
            requiredPlan="elite"
            featureName="Test Elite Feature"
            showUpgradePrompt={false}
          >
            <View style={styles.gateContent}>
              <Ionicons name="trophy" size={40} color="#FFD700" />
              <Text style={styles.gateContentText}>🏆 ELITE Content Unlocked!</Text>
              <Text style={styles.gateSubtext}>
                This content requires ELITE subscription
              </Text>
            </View>
          </SubscriptionGate>
        </View>
      </View>

      {/* Test Scenarios */}
      <View style={styles.testScenarios}>
        <Text style={styles.sectionTitle}>🧪 Test Scenarios</Text>
        
        <View style={styles.scenarioCard}>
          <Text style={scenarioTitle}>Scenario 1: Free User</Text>
          <Text style={styles.scenarioText}>
            • Set subscription to FREE{'\n'}
            • Should see: Free content only{'\n'}
            • Should NOT see: PRO/ELITE gates{'\n'}
            • Upgrade prompts should show
          </Text>
        </View>

        <View style={styles.scenarioCard}>
          <Text style={scenarioTitle}>Scenario 2: Pro User</Text>
          <Text style={styles.scenarioText}>
            • Set subscription to PRO{'\n'}
            • Should see: Free + PRO content{'\n'}
            • Should NOT see: ELITE gates{'\n'}
            • Elite features should show upgrade
          </Text>
        </View>

        <View style={styles.scenarioCard}>
          <Text style={scenarioTitle}>Scenario 3: Elite User</Text>
          <Text style={styles.scenarioText}>
            • Set subscription to ELITE{'\n'}
            • Should see: All content{'\n'}
            • No upgrade prompts should show{'\n'}
            • All features accessible
          </Text>
        </View>
      </View>

      {/* Debug Info */}
      <View style={styles.debugInfo}>
        <Text style={styles.sectionTitle}>🔍 Debug Information</Text>
        
        <View style={styles.debugCard}>
          <Text style={styles.debugTitle}>Current Test Data:</Text>
          <Text style={styles.debugText}>
            {JSON.stringify(testData, null, 2)}
          </Text>
        </View>

        <View style={styles.debugCard}>
          <Text style={styles.debugTitle}>Platform:</Text>
          <Text style={styles.debugText}>
            OS: {Platform.OS}{'\n'}
            Version: {Platform.Version}{'\n'}
            Testing Override: {overrideEnabled ? 'ENABLED' : 'DISABLED'}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={async () => {
            const data = await AsyncStorage.getItem('@user_subscription');
            Alert.alert(
              'Current Storage',
              data || 'No subscription data stored'
            );
          }}
        >
          <Ionicons name="eye-outline" size={20} color="#666" />
          <Text style={styles.refreshButtonText}>View Storage Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  testControls: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  overrideToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  overrideLabel: {
    fontSize: 16,
    color: '#333',
  },
  currentTestStatus: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  testLevel: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  expiryText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  testButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  testButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  freeButton: {
    backgroundColor: '#e9ecef',
  },
  proButton: {
    backgroundColor: '#007AFF',
  },
  eliteButton: {
    backgroundColor: '#FFD700',
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#FFEFED',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFD1CC',
  },
  clearButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  testGates: {
    marginBottom: 20,
  },
  gateTestCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  gateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  gateDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  gateContent: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  gateContentText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  gateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  testScenarios: {
    marginBottom: 20,
  },
  scenarioCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  scenarioText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  debugInfo: {
    marginBottom: 30,
  },
  debugCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  debugText: {
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  refreshButtonText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
});

export default SubscriptionTestScreen;
