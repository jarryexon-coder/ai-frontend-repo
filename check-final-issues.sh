#!/bin/bash
echo "🔍 FINAL ISSUES DIAGNOSTIC"
echo "=========================="

echo "1. Checking installed expo-font version:"
npm list expo-font 2>/dev/null | head -5

echo ""
echo "2. Checking app.json plugins:"
if grep -q '"plugins"' app.json; then
  PLUGINS=$(grep -A20 '"plugins"' app.json | grep -o '"expo-[^"]*"' | tr -d '"')
  echo "   Found plugins:"
  for plugin in $PLUGINS; do
    # Check if plugin is installed
    if npm list "$plugin" 2>/dev/null | grep -q "$plugin"; then
      echo "   ✅ $plugin (installed)"
    else
      echo "   ❌ $plugin (NOT installed)"
    fi
  done
fi

echo ""
echo "3. Checking for other common issues:"
# Check if expo-font build directory exists
if [ -d "node_modules/expo-font/build" ]; then
  echo "   ✅ expo-font build directory exists"
  echo "   Files in build directory:"
  ls -la node_modules/expo-font/build/ 2>/dev/null | head -5
else
  echo "   ❌ expo-font build directory missing"
fi

echo ""
echo "4. Checking package.json dependencies:"
if grep -q "expo-font" package.json; then
  echo "   ✅ expo-font in package.json"
else
  echo "   ❌ expo-font NOT in package.json"
fi

echo ""
echo "🚀 RECOMMENDED FIXES:"
echo "1. Remove node_modules and reinstall: rm -rf node_modules package-lock.json && npm install"
echo "2. Clear all caches: rm -rf node_modules/.cache .expo"
echo "3. If still failing, temporarily remove expo-font from app.json plugins"
