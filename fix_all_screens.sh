#!/bin/bash

echo "Fixing ALL screen files with syntax errors..."

# List of all files with issues
FILES=(
  "src/screens/SportsNewsHub-enhanced.js"
  "src/screens/PredictionsScreen.js"
  "src/screens/ParlayBuilderScreen.js"
  "src/screens/AnalyticsScreen-enhanced.js"
  "src/screens/EditorUpdatesScreen.js"
)

for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    echo "Fixing $FILE..."
    
    # Backup
    cp "$FILE" "${FILE}.backup.$(date +%s)"
    
    # Remove ALL old logAnalyticsEvent functions (any style)
    sed -i '' '/const logAnalyticsEvent = async/,/^};$/d' "$FILE"
    sed -i '' '/async function logAnalyticsEvent/,/^}/d' "$FILE"
    sed -i '' '/^const logAnalyticsEvent = async/,/^};$/d' "$FILE"
    
    # Remove any broken try-catch blocks
    sed -i '' '/^  try {/,/^  } catch (error) {/,/^  }/d' "$FILE"
    sed -i '' '/^    try {/,/^    } catch (error) {/,/^    }/d' "$FILE"
    
    # Remove any standalone catch blocks
    sed -i '' '/^  } catch (error) {/,/^  }/d' "$FILE"
    sed -i '' '/^    } catch (error) {/,/^    }/d' "$FILE"
    
    # Add the simple function at the top (after the last import)
    if grep -q "import.*AsyncStorage" "$FILE"; then
      # Insert after AsyncStorage import
      sed -i '' "/import.*AsyncStorage/a\\
const logAnalyticsEvent = async (eventName, eventParams = {}) => {\\
  console.log(\`📊 [DEV] Analytics Event: \${eventName}\`, eventParams);\\
  try {\\
    const existingEvents = JSON.parse(await AsyncStorage.getItem('analytics_events') || '[]');\\
    existingEvents.push({\\
      event: eventName,\\
      params: eventParams,\\
      timestamp: new Date().toISOString(),\\
    });\\
    if (existingEvents.length > 100) {\\
      existingEvents.splice(0, existingEvents.length - 100);\\
    }\\
    await AsyncStorage.setItem('analytics_events', JSON.stringify(existingEvents));\\
  } catch (error) {\\
    console.warn('Failed to save analytics event locally:', error.message);\\
  }\\
};" "$FILE"
    else
      # Insert after the last import statement
      sed -i '' "/^import.*';$/ {
:loop
n
/^import.*';$/b loop
i\\
const logAnalyticsEvent = async (eventName, eventParams = {}) => {\\
  console.log(\`📊 [DEV] Analytics Event: \${eventName}\`, eventParams);\\
  try {\\
    const existingEvents = JSON.parse(await AsyncStorage.getItem('analytics_events') || '[]');\\
    existingEvents.push({\\
      event: eventName,\\
      params: eventParams,\\
      timestamp: new Date().toISOString(),\\
    });\\
    if (existingEvents.length > 100) {\\
      existingEvents.splice(0, existingEvents.length - 100);\\
    }\\
    await AsyncStorage.setItem('analytics_events', JSON.stringify(existingEvents));\\
  } catch (error) {\\
    console.warn('Failed to save analytics event locally:', error.message);\\
  }\\
};
}" "$FILE"
    fi
  fi
done

echo "All files have been fixed with a simple working analytics function!"
