import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import revenueCatService from '../services/revenuecat-service';
import usePremiumAccess from '../hooks/usePremiumAccess';
import useDailyLocks from '../hooks/useDailyLocks';

const TestScreen = ({ navigation }) => {
  const { hasAccess: hasPremium, loading: premiumLoading, refreshAccess: refreshPremium } = usePremiumAccess();
  const { hasAccess: hasDailyLocks, loading: locksLoading, refreshAccess: refreshLocks } = useDailyLocks();
  const [entitlementsStatus, setEntitlementsStatus] = useState({ premium: false, locks: false });

  useEffect(() => {
    refreshEntitlements();
  }, []);

  const refreshEntitlements = async () => {
    await refreshPremium();
    await refreshLocks();
    const status = await revenueCatService.getEntitlementsStatus();
    setEntitlementsStatus({
      premium: status.premium_access,
      locks: status.daily_locks,
    });
  };

  const handleTestGrant = async (entitlement) => {
    console.log(`Testing grant for: ${entitlement}`);
    
    // Call the simpler method from revenueCatService
    const result = await revenueCatService.grantTestEntitlement(entitlement);
    
    if (result.success) {
      Alert.alert(
        'Test Granted ✅',
        `Test ${entitlement} granted successfully.`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              refreshEntitlements();
            }
          }
        ]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to grant test entitlement');
    }
  };

  const handleClearTest = async () => {
    const result = await revenueCatService.clearTestEntitlements();
    if (result.success) {
      Alert.alert(
        'Test Cleared ✅',
        'All test entitlements cleared.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              refreshEntitlements();
            }
          }
        ]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to clear test entitlements');
    }
  };

  const handleRestore = async () => {
    const result = await revenueCatService.restorePurchases();
    if (result.success) {
      Alert.alert(
        'Restore Completed',
        `Restored entitlements: ${result.restoredEntitlements.join(', ') || 'None'}`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              refreshEntitlements();
            }
          }
        ]
      );
    } else {
      Alert.alert('Restore Failed', result.error || 'Unable to restore purchases');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#6b7280', '#4b5563']}
        style={styles.header}
      >
        <Text style={styles.title}>RevenueCat Test Panel</Text>
        <Text style={styles.subtitle}>Development Testing Only</Text>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Status</Text>
        
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Premium Access:</Text>
              <View style={[
                styles.statusBadge,
                hasPremium ? styles.statusActive : styles.statusInactive
              ]}>
                <Text style={styles.statusText}>
                  {premiumLoading ? '...' : hasPremium ? 'ACTIVE' : 'INACTIVE'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity onPress={refreshPremium} style={styles.refreshButton}>
              <Ionicons name="refresh" size={16} color="#3b82f6" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Daily Locks:</Text>
              <View style={[
                styles.statusBadge,
                hasDailyLocks ? styles.statusActive : styles.statusInactive
              ]}>
                <Text style={styles.statusText}>
                  {locksLoading ? '...' : hasDailyLocks ? 'ACTIVE' : 'INACTIVE'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity onPress={refreshLocks} style={styles.refreshButton}>
              <Ionicons name="refresh" size={16} color="#8b5cf6" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Controls</Text>
        <Text style={styles.sectionDescription}>
          These buttons only work in development mode
        </Text>
        
        <TouchableOpacity
          style={[styles.testButton, styles.testPremiumButton]}
          onPress={() => handleTestGrant('premium_access')}
        >
          <Ionicons name="unlock" size={20} color="white" />
          <Text style={styles.testButtonText}>Grant Premium Access (Test)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.testButton, styles.testLocksButton]}
          onPress={() => handleTestGrant('daily_locks')}
        >
          <Ionicons name="unlock" size={20} color="white" />
          <Text style={styles.testButtonText}>Grant Daily Locks (Test)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.testButton, styles.testBothButton]}
          onPress={async () => {
            await handleTestGrant('premium_access');
            await handleTestGrant('daily_locks');
          }}
        >
          <Ionicons name="unlock" size={20} color="white" />
          <Text style={styles.testButtonText}>Grant Both (Test)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.testButton, styles.testClearButton]}
          onPress={handleClearTest}
        >
          <Ionicons name="trash" size={20} color="white" />
          <Text style={styles.testButtonText}>Clear All Test Entitlements</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Screen Navigation</Text>
        
        <View style={styles.navGrid}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('NFL')}
          >
            <Ionicons name="american-football" size={24} color="#3b82f6" />
            <Text style={styles.navButtonText}>NFL</Text>
            <Text style={styles.navStatus}>{hasPremium ? '🔓' : '🔒'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Fantasy')}
          >
            <Ionicons name="trophy" size={24} color="#3b82f6" />
            <Text style={styles.navButtonText}>Fantasy</Text>
            <Text style={styles.navStatus}>{hasPremium ? '🔓' : '🔒'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('News')}
          >
            <Ionicons name="newspaper" size={24} color="#3b82f6" />
            <Text style={styles.navButtonText}>News</Text>
            <Text style={styles.navStatus}>{hasPremium ? '🔓' : '🔒'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Analytics')}
          >
            <Ionicons name="analytics" size={24} color="#3b82f6" />
            <Text style={styles.navButtonText}>Analytics</Text>
            <Text style={styles.navStatus}>{hasPremium ? '🔓' : '🔒'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('DailyPicks')}
          >
            <Ionicons name="lock-closed" size={24} color="#8b5cf6" />
            <Text style={styles.navButtonText}>Daily Picks</Text>
            <Text style={styles.navStatus}>{hasDailyLocks ? '🔓' : '🔒'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Testing Instructions</Text>
        <Text style={styles.infoText}>
          1. Click "Grant Premium Access" to test protected screens
          2. Navigate to NFL, Fantasy, News, Analytics screens (should be unlocked)
          3. Click "Grant Daily Locks" to test Daily Picks screen
          4. Use "Clear All" to reset and test paywalls
          5. Test navigation with status indicators above
        </Text>
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
    padding: 30,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
  },
  statusCard: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusItem: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusActive: {
    backgroundColor: '#10b981',
  },
  statusInactive: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    justifyContent: 'center',
  },
  testPremiumButton: {
    backgroundColor: '#3b82f6',
  },
  testLocksButton: {
    backgroundColor: '#8b5cf6',
  },
  testBothButton: {
    backgroundColor: '#f59e0b',
  },
  testClearButton: {
    backgroundColor: '#ef4444',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  navButton: {
    width: '48%',
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 5,
  },
  navStatus: {
    fontSize: 16,
    marginTop: 3,
  },
  infoSection: {
    backgroundColor: '#fef3c7',
    margin: 15,
    marginTop: 5,
    marginBottom: 30,
    padding: 20,
    borderRadius: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
});

export default TestScreen;
