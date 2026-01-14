#!/bin/bash
echo "🔧 DEBUG MODULE RESOLUTION"
echo "=========================="

# Check App-stats-version.js structure
echo "1. Analyzing App-stats-version.js:"
if [ -f "src/App-stats-version.js" ]; then
  LINE_COUNT=$(wc -l < src/App-stats-version.js)
  echo "   Lines: $LINE_COUNT"
  echo "   First 10 lines:"
  head -10 src/App-stats-version.js
else
  echo "   ❌ File not found"
fi

echo ""
echo "2. Checking for undefined imports:"
# Find any imports that might be problematic
grep -r "import.*undefined\|from 'undefined'" src/ --include="*.js" 2>/dev/null

echo ""
echo "3. Checking circular imports in navigation:"
# Check if GroupedTabNavigator imports something that imports it back
echo "   GroupedTabNavigator imports:"
grep "import.*from" src/navigation/GroupedTabNavigator.js | head -5

echo ""
echo "4. Verify all screen files exist:"
for screen in HomeScreen-working.js EditorUpdatesScreen.js LiveGamesScreen-enhanced.js NHLScreen-enhanced.js GameDetailsScreen.js NFLScreen-enhanced.js PlayerStatsScreen-enhanced.js PlayerProfileScreen-enhanced.js FantasyScreen-enhanced-v2.js PredictionsScreen.js ParlayBuilderScreen.js DailyPicksScreen-enhanced.js SportsNewsHub-enhanced.js AnalyticsScreen-enhanced.js; do
  if [ -f "src/screens/$screen" ]; then
    echo "   ✅ $screen"
  else
    echo "   ❌ $screen (MISSING)"
  fi
done

echo ""
echo "🚀 RECOMMENDED FIX:"
echo "1. Try the clean App.js option above"
echo "2. Clear Metro cache: rm -rf node_modules/.cache"
echo "3. Restart: npx expo start --clear"
