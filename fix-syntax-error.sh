#!/bin/bash

echo "🔧 Fixing AIPredictionsScreen.js syntax error..."

# Fix line 69-70: Remove the extra <View> and fix the bracket
sed -i '' '69,70s/{data.map((value, index) => (<View key={`bar-\${index}-\${value}`}.*/<View key={`bar-\${index}-\${value}`} style={styles.barColumn}>/' src/screens/AIPredictionsScreen.js

echo "✅ Syntax error fixed!"
