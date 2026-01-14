import Purchases, { LOG_LEVEL, CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';

export class RevenueCatService {
  static async initialize() {
    try {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      
      // Configure with your RevenueCat keys
      // You'll need to get these from your RevenueCat dashboard
      const apiKey = Platform.OS === 'ios' 
        ? 'appl_xxx' // Replace with your iOS RevenueCat key
        : 'your_android_revenuecat_key'; // Replace with your Android key

      Purchases.configure({ apiKey });
      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('Error initializing RevenueCat:', error);
    }
  }

  static async getOfferings() {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings;
    } catch (error) {
      console.error('Error fetching offerings:', error);
      return null;
    }
  }

  static async purchasePackage(package: any) {
    try {
      const { customerInfo } = await Purchases.purchasePackage(package);
      return { success: true, customerInfo };
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error('Purchase error:', error);
      }
      return { success: false, error };
    }
  }

  static async restorePurchases() {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return { success: true, customerInfo };
    } catch (error) {
      console.error('Restore error:', error);
      return { success: false, error };
    }
  }

  static async getCustomerInfo() {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('Error getting customer info:', error);
      return null;
    }
  }
}
