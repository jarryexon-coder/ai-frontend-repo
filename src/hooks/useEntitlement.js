// src/hooks/useEntitlement.js
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';

const useEntitlement = () => {
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEntitlement();
  }, []);

  const checkEntitlement = async () => {
    try {
      setLoading(true);
      
      // Check for premium access in AsyncStorage (for free tier)
      const hasPremium = await AsyncStorage.getItem('@user_has_premium');
      
      if (hasPremium === 'true') {
        setIsActive(true);
        setLoading(false);
        return;
      }

      // Check RevenueCat for subscription
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        
        // Check for active entitlement
        const hasActiveEntitlement = customerInfo.entitlements.active && 
          Object.keys(customerInfo.entitlements.active).length > 0;
        
        setIsActive(hasActiveEntitlement);
      } catch (purchaseError) {
        console.log('RevenueCat check failed, using free tier:', purchaseError.message);
        setIsActive(false);
      }
      
    } catch (error) {
      console.error('Error checking entitlement:', error);
      setIsActive(false);
    } finally {
      setLoading(false);
    }
  };

  const unlockPremium = async () => {
    try {
      await AsyncStorage.setItem('@user_has_premium', 'true');
      setIsActive(true);
      return { success: true };
    } catch (error) {
      console.error('Error unlocking premium:', error);
      return { success: false, error: error.message };
    }
  };

  const restorePurchases = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const hasActiveEntitlement = customerInfo.entitlements.active && 
        Object.keys(customerInfo.entitlements.active).length > 0;
      
      setIsActive(hasActiveEntitlement);
      return { 
        success: true, 
        hasActiveEntitlement,
        customerInfo 
      };
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  };

  return {
    isActive,
    loading,
    checkEntitlement,
    unlockPremium,
    restorePurchases,
  };
};

export default useEntitlement;
```

Alternative: Update Your Import

If you don't want to use the useEntitlement hook, you can update your PlayerStatsScreen-enhanced.js file to use a different hook. Based on your logs, you might want to use the usePredictionCounter hook instead. Here's how to update the import:

In your PlayerStatsScreen-enhanced.js, change line 28:

```javascript
// Change this:
import useEntitlement from '../hooks/useEntitlement';

// To one of these options:
// Option 1: Use useDailyLocks (if you still have it)
import useDailyLocks from '../hooks/useDailyLocks';

// Option 2: Create a simple hook for free access
import { useState } from 'react'; // Then create a simple state for free access

// Option 3: Use usePremiumAccess if you have it
import usePremiumAccess from '../hooks/usePremiumAccess';
```

Quick Fix for Your Screen

If you want a quick fix, you can temporarily replace the useEntitlement import with a simple implementation directly in your PlayerStatsScreen-enhanced.js:

Replace the import and add this hook at the top of your component:

```javascript
// Remove this import:
// import useEntitlement from '../hooks/useEntitlement';

// Add this simple hook at the top of your component file:
const useSimpleEntitlement = () => {
  return {
    isActive: false, // Set to true for testing premium features
    loading: false,
    checkEntitlement: async () => ({ isActive: false }),
    unlockPremium: async () => ({ success: false }),
    restorePurchases: async () => ({ success: false }),
  };
};

// Then in your component, replace:
// const entitlement = useEntitlement();
// With:
const entitlement = useSimpleEntitlement();
