#!/bin/bash

echo "🧹 Cleaning up unused screen files..."
echo ""

# Backup directory for removed files
BACKUP_DIR="./removed-screens-backup"
mkdir -p "$BACKUP_DIR"

# Files to check and potentially remove
UNUSED_FILES=(
  "src/screens/HomeScreen.js"  # Basic HomeScreen (if exists)
  "src/screens/ParlayBuilderScreen.js"  # Old version (if exists)
  "src/screens/PredictionsScreen.js"  # Old version (if exists)
  "src/screens/ParlayBuilderScreen-basic.js"  # Basic test version
  "src/services/firebase-service.js"  # Removed service
  "src/firebase/firebase-config-simple.js"  # Old config (if exists)
)

# Also check for any "*.backup.js" files
BACKUP_FILES=$(find src -name "*.backup.js" -type f)

echo "Checking for unused files:"
for file in "${UNUSED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  Found: $file"
    echo "    Do you want to backup and remove it? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
      cp "$file" "$BACKUP_DIR/$(basename "$file")"
      rm "$file"
      echo "    ✅ Backed up and removed"
    else
      echo "    ❌ Skipped"
    fi
  fi
done

echo ""
echo "Checking for backup files:"
if [ -n "$BACKUP_FILES" ]; then
  echo "$BACKUP_FILES" | while read -r backup_file; do
    echo "  Found: $backup_file"
    echo "    Do you want to remove this backup? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
      rm "$backup_file"
      echo "    ✅ Removed"
    else
      echo "    ❌ Skipped"
    fi
  done
else
  echo "  No backup files found"
fi

# Check for duplicate files
echo ""
echo "🔍 Checking for duplicate screen names:"
find src/screens -name "*.js" -exec basename {} \; | sort | uniq -d | while read duplicate; do
  echo "  ⚠️  Duplicate name: $duplicate"
  find src/screens -name "$duplicate" -type f
done

echo ""
echo "✅ Cleanup complete!"
echo "   Backup files saved in: $BACKUP_DIR"
