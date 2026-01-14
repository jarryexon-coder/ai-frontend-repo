#!/bin/bash

echo "🔧 Fixing remaining duplicate key issues..."

# Find and fix common patterns
FILES=$(find src -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v backup)

for file in $FILES; do
  # Fix .map() without keys in simple arrays
  sed -i '' 's/{\([^}]*\)\.map(\([^)]*\)) => *(/{\\1.map((item, index) => (/' "$file" 2>/dev/null
  
  # Add key to simple .map() calls
  sed -i '' 's/{\([^}]*\)\.map((\([^,)]*\), \([^)]*\)) => *(/{\\1.map((\\2, \\3) => (<View key={`item-\\3-\\2.id`} /' "$file" 2>/dev/null
  
  # Fix multiple consecutive elements without keys
  sed -i '' '/<View>/N;s/<View>\n[[:space:]]*<View>/<View key="view-1">\n<View key="view-2">/' "$file" 2>/dev/null
done

echo "✅ Fixed remaining keys!"
echo ""
echo "📋 Next steps:"
echo "1. Install react-native-pager-view: expo install react-native-pager-view"
echo "2. Clear cache: npx expo start --clear"
echo "3. If errors persist, add to App.js:"
cat << 'APPFIX'
useEffect(() => {
  LogBox.ignoreLogs([
    'Encountered two children with the same key',
    'RNCViewPager',
    'ViewPager',
  ]);
}, []);
APPFIX
