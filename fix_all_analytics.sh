#!/bin/bash

echo "Fixing analytics functions in all screens..."

# List of files to fix
FILES=(
  "src/screens/ParlayBuilderScreen.js"
  "src/screens/SportsNewsHub-enhanced.js"
  "src/screens/PredictionsScreen.js"
  "src/screens/AnalyticsScreen-enhanced.js"
  "src/screens/EditorUpdatesScreen.js"
)

# Simple analytics function to insert
SIMPLE_FUNCTION='const logAnalyticsEvent = async (eventName, eventParams = {}) => {
  console.log(`📊 [DEV] Analytics Event: ${eventName}`, eventParams);
  try {
    const existingEvents = JSON.parse(await AsyncStorage.getItem("analytics_events") || "[]");
    existingEvents.push({
      event: eventName,
      params: eventParams,
      timestamp: new Date().toISOString(),
    });
    if (existingEvents.length > 100) {
      existingEvents.splice(0, existingEvents.length - 100);
    }
    await AsyncStorage.setItem("analytics_events", JSON.stringify(existingEvents));
  } catch (error) {
    console.warn("Failed to save analytics event locally:", error.message);
  }
};'

for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    echo "Processing $FILE..."
    
    # Backup
    cp "$FILE" "${FILE}.backup.$(date +%s)"
    
    # Remove old logAnalyticsEvent function (both styles)
    sed -i '' '/const logAnalyticsEvent = async/,/^};$/d' "$FILE"
    sed -i '' '/async function logAnalyticsEvent/,/^}/d' "$FILE"
    
    # Remove try-catch blocks that might be causing syntax errors
    sed -i '' '/^  try {/,/^  } catch (error) {/,/^  }/d' "$FILE"
    
    # Add simple function at the top (after imports)
    if grep -q "import.*AsyncStorage" "$FILE"; then
      # Insert after AsyncStorage import
      sed -i '' "/import.*AsyncStorage/a\\
$SIMPLE_FUNCTION" "$FILE"
    else
      # Insert after the last import
      sed -i '' "/^import.*';$/ {
x
/^$/!{x;H;d}
x
s/^/$SIMPLE_FUNCTION\n/
}" "$FILE"
    fi
    
    # Fix PredictionsScreen.js specific issue (line 133)
    if [[ "$FILE" == *"PredictionsScreen.js" ]]; then
      sed -i '' '133s/today\.,`/today.`/' "$FILE"
      sed -i '' '133s/`Prediction generated! ${remaining} free predictions left today.,`/`Prediction generated! ${remaining} free predictions left today.`,/' "$FILE"
    fi
  fi
done

echo "Done! All files have been fixed."
