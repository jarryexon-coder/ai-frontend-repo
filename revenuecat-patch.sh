#!/bin/bash
FILE="ios/Pods/PurchasesHybridCommon/ios/PurchasesHybridCommon/PurchasesHybridCommon/StoreProduct+HybridAdditions.swift"

if [ -f "$FILE" ]; then
    # Replace ambiguous type references
    sed -i '' 's/subscriptionPeriod: SubscriptionPeriod/subscriptionPeriod: StoreKit.SubscriptionPeriod/g' "$FILE"
    sed -i '' 's/subscriptionPeriodUnit: SubscriptionPeriod\.Unit/subscriptionPeriodUnit: StoreKit.SubscriptionPeriod.Unit/g' "$FILE"
    echo "Patched RevenueCat file successfully"
fi
