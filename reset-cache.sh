#!/bin/bash

echo "🧹 Resetting all caches..."

# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Clear expo cache
npx expo start --clear

# Clear Metro bundler cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-map-*
rm -rf $TMPDIR/react-*

# Clear watchman
watchman watch-del-all

# iOS Simulator cache
if [ -d ~/Library/Developer/CoreSimulator ]; then
  rm -rf ~/Library/Developer/CoreSimulator/Caches
fi

echo "✅ Cache cleared! Starting app..."
npx expo start
