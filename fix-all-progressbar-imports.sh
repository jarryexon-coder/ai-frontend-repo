#!/bin/bash

echo "🔄 Fixing all ProgressBar imports..."

# List of files to fix
declare -A files_to_fix=(
  ["src/screens/SportsNewsHub-enhanced-BACKUP.js"]="../components/ProgressBar"
  ["src/screens/ParlayBuilder/PredictionsScreen.js"]="../../components/ProgressBar"
  ["src/screens/PredictionScreen.js"]="../components/ProgressBar"
  ["src/screens/SportsNewsHub-enhanced.js"]="../components/ProgressBar"
  ["src/screens/ParlayBuilderScreen-BACKUP.js"]="../components/ProgressBar"
  ["src/screens/ParlayBuilder/ParlayBuilderScreen.js"]="../../components/ProgressBar"
  ["src/screens/ParlayBuilderScreen.js"]="../components/ProgressBar"
)

# Fix each file
for file in "${!files_to_fix[@]}"; do
  if [ -f "$file" ]; then
    echo "🔧 Fixing $file..."
    
    # Fix ProgressBar imports from react-native-animated-progress
    sed -i '' "s|import ProgressBar from 'react-native-animated-progress';|import ProgressBar from '${files_to_fix[$file]}';|g" "$file"
    sed -i '' "s|import AnimatedProgress from 'react-native-animated-progress';|import ProgressBar from '${files_to_fix[$file]}';|g" "$file"
    
    # Replace AnimatedProgress component with ProgressBar
    sed -i '' "s|<AnimatedProgress|<ProgressBar animated={true}|g" "$file"
    sed -i '' "s|</AnimatedProgress>|</ProgressBar>|g" "$file"
    
    # Add animated prop to ProgressBar if it doesn't have it
    sed -i '' "s|<ProgressBar\([^>]*\)progress=|<ProgressBar animated={true}\1progress=|g" "$file"
    
    echo "✅ Fixed $file"
  else
    echo "⚠️ File not found: $file"
  fi
done

echo ""
echo "🎉 All ProgressBar imports fixed!"
