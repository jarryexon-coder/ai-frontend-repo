#!/bin/bash
echo "📊 EXPO VERSION COMPATIBILITY CHECK"
echo "=================================="

# Check installed versions
echo "Installed versions:"
npm list --depth=0 | grep -E "expo|react-native|react"

echo ""
echo "🔍 Checking for known Expo 49 issues..."

# Check if using incompatible packages
INCOMPATIBLE_PKGS=("expo-router" "expo-updates" "react-native-reanimated")
for pkg in "${INCOMPATIBLE_PKGS[@]}"; do
  if npm list "$pkg" 2>/dev/null | grep -q "$pkg"; then
    echo "⚠️  Found potentially incompatible package: $pkg"
  fi
done

echo ""
echo "🚀 RECOMMENDED ACTIONS:"
echo "1. Update Expo: npx expo install expo@latest"
echo "2. Clear everything: rm -rf node_modules package-lock.json"
echo "3. Reinstall: npm install"
echo "4. Clear cache: npx expo start --clear"
