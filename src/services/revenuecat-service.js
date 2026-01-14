import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class RevenueCatService {
  constructor() {
    this.isConfigured = false;
    this.ENTITLEMENTS = {
      PREMIUM_ACCESS: 'premium_access',
      DAILY_LOCKS: 'daily_locks',
    };
    
    this.OFFERINGS = {
      PREMIUM: 'premium_access',
      LOCKS: 'locks_offering',
    };
    
    // Initialize with test flags if in development
    if (__DEV__) {
      this.testMode = true;
    }
  }

  configure = async () => {
    try {
      // In development, skip real configuration
      if (__DEV__) {
        console.log('🚀 Development mode: Using test RevenueCat configuration');
        this.isConfigured = true;
        return;
      }

      // Production: Use RevenueCat API keys from environment
      const apiKeys = {
        ios: 'appl_eDwUHlFEtBYuVyjQVzJaNpYuDAR',
        android: 'goog_cURaZuoYPhEGjHovjWYEvaSOxsh',
      };

      const apiKey = Platform.select(apiKeys);
      
      if (!apiKey) {
        console.warn('⚠️ RevenueCat API key not configured.');
        this.isConfigured = false;
        return;
      }

      await Purchases.configure({ apiKey });
      this.isConfigured = true;
      console.log('✅ RevenueCat configured successfully');
      
      Purchases.addCustomerInfoUpdateListener(this.onCustomerInfoUpdated);
      
    } catch (error) {
      console.log('❌ RevenueCat configuration error:', error);
      this.isConfigured = false;
    }
  };

  onCustomerInfoUpdated = (customerInfo) => {
    console.log('🔄 Customer info updated');
  };

  // Simplified test entitlement method
  grantTestEntitlement = async (entitlement) => {
    try {
      console.log(`🎯 TEST: Granting ${entitlement} for testing`);
      
      // Store in AsyncStorage for persistence
      await AsyncStorage.setItem(`test_${entitlement}`, 'true');
      
      // Set expiration (30 days from now)
      const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await AsyncStorage.setItem(`test_${entitlement}_expiry`, expiryDate);
      
      console.log(`✅ TEST: ${entitlement} granted until ${expiryDate}`);
      return { success: true };
      
    } catch (error) {
      console.log('❌ Error granting test entitlement:', error);
      return { success: false, error: error.message };
    }
  };

  // Check if test entitlement is valid
  hasTestEntitlement = async (entitlement) => {
    try {
      const granted = await AsyncStorage.getItem(`test_${entitlement}`);
      const expiry = await AsyncStorage.getItem(`test_${entitlement}_expiry`);
      
      if (granted === 'true' && expiry) {
        const expiryDate = new Date(expiry);
        if (expiryDate > new Date()) {
          return true;
        } else {
          // Clear expired entitlement
          await AsyncStorage.removeItem(`test_${entitlement}`);
          await AsyncStorage.removeItem(`test_${entitlement}_expiry`);
          return false;
        }
      }
      return false;
    } catch (error) {
      console.log('Error checking test entitlement:', error);
      return false;
    }
  };

  // Clear all test entitlements
  clearTestEntitlements = async () => {
    try {
      await AsyncStorage.removeItem('test_premium_access');
      await AsyncStorage.removeItem('test_daily_locks');
      await AsyncStorage.removeItem('test_premium_access_expiry');
      await AsyncStorage.removeItem('test_daily_locks_expiry');
      console.log('🧹 Cleared all test entitlements');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Get offerings for a specific type
  getOfferings = async (offeringType = null) => {
    try {
      if (!this.isConfigured) await this.configure();
      
      // For development, return mock data
      if (__DEV__) {
        return this.getMockOfferings(offeringType);
      }
      
      const offerings = await Purchases.getOfferings();
      
      if (offeringType) {
        const offering = offerings[offeringType];
        if (offering) {
          return offering.availablePackages;
        }
      }
      
      return [];
      
    } catch (error) {
      console.log('Error fetching offerings:', error);
      return this.getMockOfferings(offeringType);
    }
  };

  // Mock data
  getMockOfferings = (offeringType) => {
    const premiumAccessPackages = [
      {
        identifier: 'weekly_subscription',
        product: {
          identifier: 'com.yourcompany.premium.weekly',
          priceString: '$5.99',
          description: 'Weekly subscription',
          title: 'Weekly Access',
        },
        offeringIdentifier: 'premium_access',
      },
      {
        identifier: 'monthly_subscription',
        product: {
          identifier: 'com.yourcompany.premium.monthly',
          priceString: '$19.99',
          description: 'Monthly subscription',
          title: 'Monthly Access',
        },
        offeringIdentifier: 'premium_access',
      },
      {
        identifier: 'yearly_subscription',
        product: {
          identifier: 'com.yourcompany.premium.yearly',
          priceString: '$179.99',
          description: 'Yearly subscription (Save 25%)',
          title: 'Yearly Access',
        },
        offeringIdentifier: 'premium_access',
      },
    ];

    const locksOfferingPackages = [
      {
        identifier: 'weekly_locks_subscription',
        product: {
          identifier: 'com.yourcompany.locks.weekly',
          priceString: '$29.99',
          description: 'Weekly locks subscription',
          title: 'Weekly Locks',
        },
        offeringIdentifier: 'locks_offering',
      },
      {
        identifier: 'monthly_locks_subscription',
        product: {
          identifier: 'com.yourcompany.locks.monthly',
          priceString: '$99.99',
          description: 'Monthly locks subscription',
          title: 'Monthly Locks',
        },
        offeringIdentifier: 'locks_offering',
      },
    ];

    if (offeringType === 'premium_access') {
      return premiumAccessPackages;
    } else if (offeringType === 'locks_offering') {
      return locksOfferingPackages;
    }
    
    return [...premiumAccessPackages, ...locksOfferingPackages];
  };

  purchasePackage = async (packageIdentifier) => {
    try {
      if (!this.isConfigured) {
        throw new Error('RevenueCat not configured');
      }

      const offerings = await this.getOfferings();
      const pkg = offerings.find(p => p.identifier === packageIdentifier);
      
      if (!pkg) {
        throw new Error('Package not found');
      }

      console.log('Purchasing package:', packageIdentifier);
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      
      const activeEntitlements = customerInfo.entitlements.active;
      const grantedEntitlements = [];
      
      if (activeEntitlements[this.ENTITLEMENTS.PREMIUM_ACCESS]) {
        grantedEntitlements.push(this.ENTITLEMENTS.PREMIUM_ACCESS);
      }
      if (activeEntitlements[this.ENTITLEMENTS.DAILY_LOCKS]) {
        grantedEntitlements.push(this.ENTITLEMENTS.DAILY_LOCKS);
      }
      
      return {
        success: true,
        customerInfo,
        grantedEntitlements,
      };
      
    } catch (error) {
      console.log('Purchase error:', error);
      return {
        success: false,
        error: error.message,
        userCancelled: error.userCancelled || false,
      };
    }
  };

  // Check entitlement with test support
  hasEntitlement = async (entitlement) => {
    try {
      // First check test storage
      const hasTest = await this.hasTestEntitlement(entitlement);
      if (hasTest) {
        console.log(`✅ TEST: Using test ${entitlement}`);
        return true;
      }
      
      // If not in test mode, check RevenueCat
      if (!__DEV__ && this.isConfigured) {
        const customerInfo = await Purchases.getCustomerInfo();
        const activeEntitlements = customerInfo?.entitlements.active || {};
        return !!activeEntitlements[entitlement];
      }
      
      // Default to false in production if not configured
      return false;
      
    } catch (error) {
      console.log('Error checking entitlement:', error);
      return false;
    }
  };

  restorePurchases = async () => {
    try {
      if (!this.isConfigured) {
        throw new Error('RevenueCat not configured');
      }
      
      const customerInfo = await Purchases.restorePurchases();
      const activeEntitlements = customerInfo.entitlements.active;
      
      const restored = [];
      if (activeEntitlements[this.ENTITLEMENTS.PREMIUM_ACCESS]) {
        restored.push(this.ENTITLEMENTS.PREMIUM_ACCESS);
      }
      if (activeEntitlements[this.ENTITLEMENTS.DAILY_LOCKS]) {
        restored.push(this.ENTITLEMENTS.DAILY_LOCKS);
      }
      
      return {
        success: true,
        restoredEntitlements: restored,
        customerInfo,
      };
      
    } catch (error) {
      console.log('Restore error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  getCustomerInfo = async () => {
    try {
      if (!this.isConfigured) {
        return null;
      }
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.log('Error getting customer info:', error);
      return null;
    }
  };

  getEntitlementsStatus = async () => {
    try {
      const premium = await this.hasEntitlement(this.ENTITLEMENTS.PREMIUM_ACCESS);
      const locks = await this.hasEntitlement(this.ENTITLEMENTS.DAILY_LOCKS);
      
      return {
        premium_access: premium,
        daily_locks: locks,
      };
      
    } catch (error) {
      console.log('Error getting entitlements status:', error);
      return {
        premium_access: false,
        daily_locks: false,
      };
    }
  };
}

export default new RevenueCatService();
