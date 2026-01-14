#!/bin/bash
echo "🔍 RUNTIME ISSUE DIAGNOSTIC"
echo "==========================="

echo "1. Checking package.json 'main' field..."
MAIN_FIELD=$(grep '"main"' package.json | head -1)
echo "   $MAIN_FIELD"
if [[ ! "$MAIN_FIELD" == *"node_modules/expo/AppEntry.js"* ]]; then
  echo "   ⚠️  Should be: \"main\": \"node_modules/expo/AppEntry.js\""
fi

echo ""
echo "2. Checking for AppRegistry.registerComponent calls..."
REG_COUNT=$(grep -r "AppRegistry.registerComponent" src/ --include="*.js" 2>/dev/null | wc -l)
if [ $REG_COUNT -gt 0 ]; then
  echo "   ⚠️  Found $REG_COUNT registration calls (should be 0 with Expo)"
  grep -r "AppRegistry.registerComponent" src/ --include="*.js"
else
  echo "   ✅ No manual AppRegistry calls found"
fi

echo ""
echo "3. Checking expo-modules-core version..."
npm list expo-modules-core 2>/dev/null | head -5

echo ""
echo "4. Checking for duplicate React instances..."
DUPLICATE_REACT=$(npm list react 2>/dev/null | grep -c "deduped" | tr -d '\n')
if [ "$DUPLICATE_REACT" != "1" ]; then
  echo "   ⚠️  Possible duplicate React installations"
  npm list react 2>/dev/null | grep -v "deduped"
fi

echo ""
echo "🚀 RECOMMENDED FIXES:"
echo "===================="
echo "1. Clear everything: rm -rf node_modules package-lock.json"
echo "2. Reinstall: npm install"
echo "3. Clear cache: npx expo start --clear"
