#!/bin/bash

# fix_remaining_urls.sh
# This script fixes remaining localhost:3002 URLs in src/ directory

set -e  # Exit on error

echo "🔍 Searching for remaining localhost:3002 URLs in src/ directory..."
echo ""

# Define the production URL
PROD_URL="https://pleasing-determination-production.up.railway.app"
PROD_BASE_URL="https://pleasing-determination-production.up.railway.app/api"
WS_PROD_URL="wss://pleasing-determination-production.up.railway.app"

# First, let's see what files still have localhost:3002
echo "Files containing localhost:3002:"
echo "=================================="
grep -r "localhost:3002" --include="*.js" --include="*.json" --include="*.jsx" --include="*.ts" --include="*.tsx" src/ || echo "No matches found"
echo ""

# Function to replace URLs in a file
replace_urls_in_file() {
  local file=$1
  echo "📝 Updating $file..."
  
  # Create backup
  cp "$file" "$file.bak"
  
  # Replace all variations
  # 1. http://localhost:3002
  sed -i '' "s|http://localhost:3002|${PROD_URL}|g" "$file"
  
  # 2. ws://localhost:3002
  sed -i '' "s|ws://localhost:3002|${WS_PROD_URL}|g" "$file"
  
  # 3. localhost:3002 (without protocol)
  sed -i '' "s|localhost:3002|pleasing-determination-production.up.railway.app|g" "$file"
  
  # 4. http://localhost:3002/api
  sed -i '' "s|http://localhost:3002/api|${PROD_BASE_URL}|g" "$file"
  
  echo "✅ Updated $file"
}

# Check if we have any files to update
FILES_TO_UPDATE=$(grep -r -l "localhost:3002" --include="*.js" --include="*.json" --include="*.jsx" --include="*.ts" --include="*.tsx" src/ 2>/dev/null || true)

if [ -z "$FILES_TO_UPDATE" ]; then
  echo "✅ No files found containing localhost:3002!"
  exit 0
fi

echo "Found files to update:"
echo "$FILES_TO_UPDATE"
echo ""
read -p "Continue with updates? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Update cancelled."
  exit 1
fi

# Update each file
echo ""
echo "🔄 Starting updates..."
echo ""

while IFS= read -r file; do
  if [ -f "$file" ]; then
    replace_urls_in_file "$file"
  fi
done <<< "$FILES_TO_UPDATE"

echo ""
echo "✅ All updates completed!"
echo ""
echo "Verifying no localhost:3002 remains..."
echo "======================================"

# Final check
REMAINING=$(grep -r "localhost:3002" --include="*.js" --include="*.json" --include="*.jsx" --include="*.ts" --include="*.tsx" src/ 2>/dev/null || true)

if [ -z "$REMAINING" ]; then
  echo "✅ Success! No remaining localhost:3002 URLs found."
else
  echo "❌ Some URLs remain:"
  echo "$REMAINING"
  echo ""
  echo "Manual review needed for above files."
fi

echo ""
echo "📋 Summary:"
echo "- Changed http://localhost:3002 → $PROD_URL"
echo "- Changed ws://localhost:3002 → $WS_PROD_URL"
echo "- Changed localhost:3002 → pleasing-determination-production.up.railway.app"
echo "- Created backup files with .bak extension"
echo ""
echo "Note: Backup files have been created. To restore:"
echo "  for f in src/**/*.bak; do mv \"\$f\" \"\${f%.bak}\"; done"
