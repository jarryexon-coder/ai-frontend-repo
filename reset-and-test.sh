#!/bin/bash

echo "🔄 Resetting app and testing authentication..."
echo ""

cd /Users/jerryexon/sports-app-production/myapp_new/MyAppFixed/MyApp_Final

echo "1. Clearing Expo cache..."
npx expo start --clear --tunnel 2>/dev/null &
EXPO_PID=$!

echo "2. Waiting for Metro to start..."
sleep 5

echo ""
echo "3. 🎯 TEST INSTRUCTIONS:"
echo "========================"
echo "In the iOS Simulator:"
echo "1. Press 'i' to open simulator"
echo "2. You should see the login screen first"
echo "3. Use email: demo@nba.com"
echo "4. Use password: demo123"
echo "5. Click 'Sign In'"
echo "6. App will show main tabs"
echo "7. Go to Home tab → Should see 'Welcome, demo!'"
echo "8. Click 'Log Out' button"
echo "9. Should return to login screen"
echo ""
echo "✅ If all steps work, authentication is fixed!"

# Kill Expo after instructions
kill $EXPO_PID 2>/dev/null
