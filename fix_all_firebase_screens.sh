#!/bin/bash

echo "🔍 Analyzing Firebase initialization patterns in screens..."

# List of screens to fix (excluding backups)
SCREENS=(
  "src/screens/NFLScreen-enhanced.js"
  "src/screens/ParlayBuilder/PredictionsScreen.js"
  "src/screens/ParlayBuilder/ParlayBuilderScreen.js"
  "src/screens/FantasyScreen-enhanced-v2.js"
  "src/screens/PredictionScreen.js"
  "src/screens/SettingsScreen.js"
  "src/screens/FantasyScreen-enhanced.js"
  "src/screens/PlayerProfileScreen-enhanced.js"
)

# First, let's create the centralized firebase service if it doesn't exist
if [ ! -f "src/services/firebase.js" ]; then
  echo "📁 Creating centralized firebase.js service..."
  mkdir -p src/services
  
  cat > src/services/firebase.js << 'FIREBASE_EOF'
import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBjE2Of8ox9OMph797VOu05kbXwCUrDrlY",
  authDomain: "ai-fantasy-assistant-aa2f6.firebaseapp.com",
  projectId: "ai-fantasy-assistant-aa2f6",
  storageBucket: "ai-fantasy-assistant-aa2f6.firebasestorage.app",
  messagingSenderId: "909799347654",
  appId: "1:909799347654:web:adca0f7aec0ad9e9f48ec7",
  measurementId: "G-QTSWN0T7JV"
};

let app = null;
let analytics = null;

// Only initialize on web platform to avoid IndexedDB errors
if (Platform.OS === 'web') {
  try {
    app = initializeApp(firebaseConfig);
    
    // Check analytics support before initializing
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('✅ Firebase Analytics initialized on Web');
      } else {
        console.log('⚠️ Firebase Analytics not supported in this environment');
      }
    }).catch((err) => {
      console.log('⚠️ Could not check analytics support:', err);
    });
  } catch (error) {
    console.warn('⚠️ Firebase web SDK initialization failed:', error.message);
  }
} else {
  console.log('📱 Skipping Firebase web SDK on native platform');
}

export { app, analytics };
FIREBASE_EOF
  echo "✅ Created src/services/firebase.js"
fi

echo ""
echo "🔄 Processing ${#SCREENS[@]} screen files..."

for SCREEN in "${SCREENS[@]}"; do
  if [ ! -f "$SCREEN" ]; then
    echo "⚠️  File not found: $SCREEN"
    continue
  fi
  
  echo ""
  echo "📝 Processing: $SCREEN"
  
  # Backup the file
  BACKUP="${SCREEN}.backup.$(date +%s)"
  cp "$SCREEN" "$BACKUP"
  echo "   Created backup: $BACKUP"
  
  # Calculate relative path for import
  # src/screens/SomeScreen.js -> ../services/firebase
  # src/screens/ParlayBuilder/SomeScreen.js -> ../../services/firebase
  RELATIVE_PATH=""
  if [[ "$SCREEN" == *"ParlayBuilder/"* ]]; then
    RELATIVE_PATH="../../services/firebase"
  else
    RELATIVE_PATH="../services/firebase"
  fi
  
  # Create a temporary file for the transformed content
  TEMP_FILE="${SCREEN}.temp"
  
  # Process the file with awk for better pattern matching
  awk -v rel_path="$RELATIVE_PATH" '
  BEGIN { in_firebase_init = 0; in_try_block = 0; brace_count = 0; skip_line = 0 }
  
  # Track if we are inside a try block that contains Firebase initialization
  /try {/ && !in_firebase_init {
    in_try_block = 1
    brace_count = 1
    # Check if this try block contains Firebase imports in the next few lines
    has_firebase = 0
    for (i=NR+1; i<=NR+10; i++) {
      if (getline temp_line > 0) {
        if (temp_line ~ /firebase\/app/ || temp_line ~ /firebase\/analytics/) {
          has_firebase = 1
        }
      }
    }
    # Reset file position (simplified approach)
    if (has_firebase) {
      in_firebase_init = 1
      print "      // Firebase initialization moved to centralized service"
      print "      // Import from: import { app, analytics } from \"" rel_path "\";"
      skip_line = 1
      next
    } else {
      in_try_block = 0
    }
  }
  
  # Skip lines in the Firebase initialization block
  skip_line && /^[[:space:]]*}/ {
    brace_count--
    if (brace_count == 0) {
      in_firebase_init = 0
      in_try_block = 0
      skip_line = 0
    }
    next
  }
  
  skip_line && /{/ {
    brace_count++
    next
  }
  
  skip_line && /}/ {
    brace_count--
    if (brace_count == 0) {
      in_firebase_init = 0
      in_try_block = 0
      skip_line = 0
    }
    next
  }
  
  skip_line {
    next
  }
  
  # Remove old Firebase dynamic imports
  /import.*firebase\/app/ || /import.*firebase\/analytics/ {
    # Skip these lines
    next
  }
  
  # Remove firebaseConfig definitions
  /const firebaseConfig = {/,/^[[:space:]]*}/ {
    next
  }
  
  # Remove initializeApp calls
  /initializeApp/ {
    # Skip lines with initializeApp
    next
  }
  
  # Add import at the top if not already present
  NR == 1 && !/import.*firebase/ {
    print "// Firebase imports centralized - see src/services/firebase.js"
  }
  
  # Print all other lines
  { print }
  ' "$SCREEN" > "$TEMP_FILE"
  
  # Now add the proper import statement at the top (after other imports)
  if ! grep -q "from.*services/firebase" "$TEMP_FILE"; then
    # Create a new file with the import added
    awk -v rel_path="$RELATIVE_PATH" '
    /^import/ {
      print $0
      # Add our import after the last import statement
      if (getline next_line > 0) {
        if (next_line !~ /^import/) {
          print "import { app, analytics } from \"" rel_path "\";"
          print next_line
          added = 1
        } else {
          print next_line
        }
      }
      next
    }
    !added && !/^import/ && NR > 1 {
      if (!added_import) {
        print "import { app, analytics } from \"" rel_path "\";"
        added_import = 1
      }
      print $0
    }
    ' "$TEMP_FILE" > "${TEMP_FILE}.2"
    mv "${TEMP_FILE}.2" "$TEMP_FILE"
  fi
  
  # Replace the original file
  mv "$TEMP_FILE" "$SCREEN"
  
  echo "✅ Updated: $SCREEN"
  
  # Show what changed
  echo "📋 Changes made:"
  echo "   1. Added: import { app, analytics } from '$RELATIVE_PATH';"
  echo "   2. Removed dynamic Firebase imports and initializeApp calls"
  echo "   3. Firebase now initialized centrally for web platform only"
done

echo ""
echo "🎉 All screens have been updated!"
echo ""
echo "📋 Summary of changes:"
echo "   • Created/updated src/services/firebase.js with platform-specific initialization"
echo "   • Removed Firebase web SDK initialization from 8 screen files"
echo "   • Added centralized imports to prevent IndexedDB errors on mobile"
echo ""
echo "🚀 Next steps:"
echo "   1. Restart Metro bundler: npm start -- --reset-cache"
echo "   2. Test on both web and mobile platforms"
echo "   3. Check that Firebase services work where needed"
