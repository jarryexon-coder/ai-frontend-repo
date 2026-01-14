#!/bin/bash

echo "🎯 Fixing worst duplicate key offenders..."

# Fix HomeScreen-enhanced-v2.js - lines 884 and 907
FILE="src/screens/HomeScreen-enhanced-v2.js"
if [ -f "$FILE" ]; then
  echo "Fixing $FILE..."
  # Line 884: liveGames.map((game, index) => renderEnhancedGameCard(game, index, true))
  sed -i '' '884s/liveGames.map((game, index) => renderEnhancedGameCard(game, index, true))/liveGames.map((game, index) => renderEnhancedGameCard(game, index, true))/' "$FILE"
  
  # Line 907: add keys to the .map() call
  sed -i '' '907s/{games\.filter.*\.map((game, index) =>/{games.filter(g => g?.status === "scheduled").slice(0, 3).map((game, index) => (\n<View key={`scheduled-game-\${index}-\${game?.id || "na"}`}>/' "$FILE"
fi

# Fix DailyPicksScreen-enhanced.js - lines 930 and 953
FILE="src/screens/DailyPicksScreen-enhanced.js"
if [ -f "$FILE" ]; then
  echo "Fixing $FILE..."
  # Comment out problematic lines temporarily
  sed -i '' '930s/safeSlice(aiPredictions, 0, 5).map(prediction => renderAiPrediction(prediction))/safeSlice(aiPredictions, 0, 5).map((prediction, index) => renderAiPrediction(prediction, index))/' "$FILE"
  sed -i '' '953s/safeSlice(picks, 0, 10).map(pick => renderExpertPick(pick))/safeSlice(picks, 0, 10).map((pick, index) => renderExpertPick(pick, index))/' "$FILE"
fi

echo "✅ Applied targeted fixes"
