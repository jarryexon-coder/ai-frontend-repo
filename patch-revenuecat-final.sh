#!/bin/bash

echo "Patching RevenueCat Swift file with iOS compatibility fix..."

FILE="ios/Pods/PurchasesHybridCommon/ios/PurchasesHybridCommon/PurchasesHybridCommon/StoreProduct+HybridAdditions.swift"

if [ -f "$FILE" ]; then
    # Create backup
    cp "$FILE" "$FILE.backup"
    
    # Replace the problematic functions
    sed -i '' '48,58c\
    static func rc_normalized(subscriptionPeriod: Any) -> String {\
        guard #available(iOS 11.2, macOS 10.13.2, tvOS 11.2, watchOS 6.2, *) else {\
            return "P1M" // Default fallback\
        }\
        \
        if let period = subscriptionPeriod as? SubscriptionPeriod {\
            let unitString: String\
            switch period.unit {\
            case .day:\
                unitString = "D"\
            case .week:\
                unitString = "W"\
            case .month:\
                unitString = "M"\
            case .year:\
                unitString = "Y"\
            @unknown default:\
                unitString = "-"\
            }\
            return "P\(period.value)\(unitString)"\
        }\
        return "P1M"\
    }' "$FILE"
    
    sed -i '' '65,76c\
    static func rc_normalized(subscriptionPeriodUnit: Any) -> String {\
        guard #available(iOS 11.2, macOS 10.13.2, tvOS 11.2, watchOS 6.2, *) else {\
            return "MONTH" // Default fallback\
        }\
        \
        if let unit = subscriptionPeriodUnit as? SubscriptionPeriod.Unit {\
            switch unit {\
            case .day:\
                return "DAY"\
            case .week:\
                return "WEEK"\
            case .month:\
                return "MONTH"\
            case .year:\
                return "YEAR"\
            @unknown default:\
                return "-"\
            }\
        }\
        return "MONTH"\
    }' "$FILE"
    
    echo "✓ Patched: $FILE"
else
    echo "⚠️ File not found: $FILE"
    exit 1
fi
