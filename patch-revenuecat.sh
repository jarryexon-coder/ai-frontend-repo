#!/bin/bash

echo "Patching RevenueCat Swift file..."

FILE="ios/Pods/PurchasesHybridCommon/ios/PurchasesHybridCommon/PurchasesHybridCommon/StoreProduct+HybridAdditions.swift"

if [ -f "$FILE" ]; then
    # Fix ambiguous type references
    sed -i '' 's/subscriptionPeriod: SubscriptionPeriod/subscriptionPeriod: StoreKit.SubscriptionPeriod/g' "$FILE"
    sed -i '' 's/subscriptionPeriodUnit: SubscriptionPeriod\.Unit/subscriptionPeriodUnit: StoreKit.SubscriptionPeriod.Unit/g' "$FILE"
    echo "✓ Patched: $FILE"
else
    echo "⚠️ File not found: $FILE"
fi
