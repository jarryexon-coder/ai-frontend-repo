#!/bin/bash

echo "🔍 Searching for navigation buttons in screens..."
echo ""

# Find all files with navigation.navigate calls
echo "Files containing navigation.navigate():"
grep -l "navigation\.navigate" src/screens/*.js src/screens/**/*.js 2>/dev/null | while read file; do
  echo "  📄 $file"
  grep -n "navigation\.navigate" "$file" | head -5 | while read line; do
    echo "    $line"
  done
  echo ""
done

echo ""
echo "Files containing TouchableOpacity with onPress:"
grep -l "TouchableOpacity.*onPress" src/screens/*.js src/screens/**/*.js 2>/dev/null | while read file; do
  echo "  📄 $file"
  grep -n "onPress=" "$file" | head -3 | while read line; do
    echo "    $line"
  done
  echo ""
done

# Check for specific navigation patterns
echo ""
echo "🔄 Checking for specific navigation patterns:"
PATTERNS=(
  "navigate.*Home"
  "navigate.*Betting"
  "navigate.*Fantasy"
  "navigate.*NHL"
  "navigate.*Settings"
)

for pattern in "${PATTERNS[@]}"; do
  echo ""
  echo "Pattern: $pattern"
  grep -r "$pattern" src/screens/ --include="*.js" | head -3
done
