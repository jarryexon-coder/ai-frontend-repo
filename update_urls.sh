#!/bin/bash

# update_urls.sh
# This script updates localhost:3002 URLs to production Railway URL

set -e  # Exit on error

echo "🔄 Updating URLs from localhost:3002 to production Railway URL..."

# Define the production URL
PROD_URL="https://pleasing-determination-production.up.railway.app"
PROD_BASE_URL="https://pleasing-determination-production.up.railway.app/api"
WS_PROD_URL="wss://pleasing-determination-production.up.railway.app"

# Update App.json
echo "📁 Updating ./App.json..."
sed -i.bak 's|"apiUrl": "http://localhost:3002"|"apiUrl": "'"$PROD_URL"'"|g' ./App.json
sed -i.bak 's|"apiBaseUrl": "http://localhost:3002/api"|"apiBaseUrl": "'"$PROD_BASE_URL"'"|g' ./App.json

# Update update-app-json.js
echo "📁 Updating ./update-app-json.js..."
sed -i.bak 's|: '"'"'http://localhost:3002'"'"'|: '"'"''"$PROD_URL"''"'"'|g' ./update-app-json.js
sed -i.bak 's|: '"'"'http://localhost:3002/api'"'"'|: '"'"''"$PROD_BASE_URL"''"'"'|g' ./update-app-json.js

# Update src/config/index.js
echo "📁 Updating ./src/config/index.js..."
sed -i.bak 's|apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || '"'"'http://localhost:3002'"'"'|apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || '"'"''"$PROD_BASE_URL"''"'"'|g' ./src/config/index.js

# Update src/config/environment.js
echo "📁 Updating ./src/config/environment.js..."
sed -i.bak 's|apiUrl: '"'"'http://localhost:3002'"'"'|apiUrl: '"'"''"$PROD_URL"''"'"'|g' ./src/config/environment.js
sed -i.bak 's|apiBaseUrl: '"'"'http://localhost:3002/api'"'"'|apiBaseUrl: '"'"''"$PROD_BASE_URL"''"'"'|g' ./src/config/environment.js

# Update src/screens/LiveGamesScreen.fixed.js
echo "📁 Updating ./src/screens/LiveGamesScreen.fixed.js..."
sed -i.bak 's|Connected to backend: http://localhost:3002|Connected to backend: '"$PROD_URL"'|g' ./src/screens/LiveGamesScreen.fixed.js

# Update src/components/TestSecretPhrase.js
echo "📁 Updating ./src/components/TestSecretPhrase.js..."
sed -i.bak 's|http://localhost:3002|'"$PROD_URL"'|g' ./src/components/TestSecretPhrase.js

# Update src/components/SecretPhraseTester.js
echo "📁 Updating ./src/components/SecretPhraseTester.js..."
sed -i.bak 's|http://localhost:3002|'"$PROD_URL"'|g' ./src/components/SecretPhraseTester.js

# Update src/components/TestSecretPhrase2.js
echo "📁 Updating ./src/components/TestSecretPhrase2.js..."
sed -i.bak 's|http://localhost:3002|'"$PROD_URL"'|g' ./src/components/TestSecretPhrase2.js

# Update src/components/ApiTestComponent.js
echo "📁 Updating ./src/components/ApiTestComponent.js..."
sed -i.bak 's|Backend URL: http://localhost:3002|Backend URL: '"$PROD_URL"'|g' ./src/components/ApiTestComponent.js

# Update src/components/ExampleSecretPhraseComponent.js
echo "📁 Updating ./src/components/ExampleSecretPhraseComponent.js..."
sed -i.bak 's|Backend URL: http://localhost:3002|Backend URL: '"$PROD_URL"'|g' ./src/components/ExampleSecretPhraseComponent.js

# Update src/hooks/useSportsData.js
echo "📁 Updating ./src/hooks/useSportsData.js..."
sed -i.bak 's|return '"'"'http://localhost:3002/api'"'"'|return '"'"''"$PROD_BASE_URL"''"'"'|g' ./src/hooks/useSportsData.js

# Update backup screens
echo "📁 Updating backup screens..."
sed -i.bak 's|http://localhost:3002/api/nba/games/today|'"$PROD_BASE_URL"'/nba/games/today|g' ./src/screens_backup_20251218_235937/LiveGamesScreen.js
sed -i.bak 's|http://localhost:3002/api/nba/games/today|'"$PROD_BASE_URL"'/nba/games/today|g' ./src/screens_backup_20251218_235937/LiveGamesScreen-old.js

# Update ConnectionDiagnostics.js
echo "📁 Updating ./src/screens_backup_20251218_235937/ConnectionDiagnostics.js..."
sed -i.bak 's|{ name: '"'"'Localhost:3000'"'"', url: '"'"'http://localhost:3002/health'"'"' }|{ name: '"'"'Production Backend'"'"', url: '"'"''"$PROD_URL"'/health'"'"' }|g' ./src/screens_backup_20251218_235937/ConnectionDiagnostics.js
sed -i.bak 's|{ name: '"'"'localhost:3002'"'"', url: '"'"'http://localhost:3002/health'"'"' }|{ name: '"'"'Production Backend (Alt)'"'"', url: '"'"''"$PROD_URL"'/health'"'"' }|g' ./src/screens_backup_20251218_235937/ConnectionDiagnostics.js
sed -i.bak 's|{ name: '"'"'Localhost NBA Games'"'"', url: '"'"'http://localhost:3002/api/nba/games/today'"'"' }|{ name: '"'"'Production NBA Games'"'"', url: '"'"''"$PROD_BASE_URL"'/nba/games/today'"'"' }|g' ./src/screens_backup_20251218_235937/ConnectionDiagnostics.js
sed -i.bak 's|{ name: '"'"'10.0.0.183 NBA Games'"'"', url: '"'"'http://localhost:3002/api/nba/games/today'"'"' }|{ name: '"'"'Production NBA Games (Alt)'"'"', url: '"'"''"$PROD_BASE_URL"'/nba/games/today'"'"' }|g' ./src/screens_backup_20251218_235937/ConnectionDiagnostics.js
sed -i.bak 's|curl http://localhost:3002/health|curl '"$PROD_URL"'/health|g' ./src/screens_backup_20251218_235937/ConnectionDiagnostics.js

# Update websocket-service.js
echo "📁 Updating ./src/services/websocket-service.js..."
sed -i.bak 's|ws://localhost:3002/ws|'"$WS_PROD_URL"'/ws|g' ./src/services/websocket-service.js

# Clean up backup files
echo "🧹 Cleaning up backup files..."
find . -name "*.bak" -type f -delete

echo "✅ All URLs have been updated!"
echo ""
echo "Summary of changes:"
echo "- Changed http://localhost:3002 → $PROD_URL"
echo "- Changed ws://localhost:3002 → $WS_PROD_URL"
echo "- Updated API endpoints to use production URL"
echo ""
echo "Note: Files that were already correct (no changes needed):"
echo "  - ./app.config.js"
echo "  - ./.env"
echo "  - ./App.js"
echo "  - ./src/config.js"
echo "  - ./src/services/NBAService.js"
echo "  - ./src/services/backendAuthService.js"
echo "  - ./src/services/api.js"
