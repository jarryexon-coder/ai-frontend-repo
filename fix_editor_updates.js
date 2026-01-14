const fs = require('fs');
const path = require('path');

const filePath = 'src/screens/EditorUpdatesScreen.js';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');

console.log(`🔧 Fixing ${filePath}`);

// Fix line 357: categoryBadge with dynamic background
if (lines[356] && lines[356].includes('categoryBadge')) {
  lines[356] = lines[356].replace(
    /style=\{\[styles\.categoryBadge, \{ backgroundColor: category\.color \+ '20' \}\]\}/,
    `style={styles.categoryBadgeContainer}>
      <View style={[
        styles.categoryBadge,
        { 
          backgroundColor: category.color + '20',
          borderWidth: 1,
          borderColor: category.color + '30'
        }
      ]}`
  );
  console.log('✅ Fixed line 357: categoryBadge');
}

// Add container style to StyleSheet
const containerStyle = `

  // Container style for shadow optimization
  categoryBadgeContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
`;

// Find and insert container style
const styleSheetIndex = content.indexOf('const styles = StyleSheet.create');
if (styleSheetIndex !== -1) {
  const insertIndex = content.indexOf('{', styleSheetIndex) + 1;
  const newContent = content.slice(0, insertIndex) + containerStyle + content.slice(insertIndex);
  
  // Write with fixed lines
  const fixedContent = newContent.split('\n');
  if (lines[356]) fixedContent[356] = lines[356];
  
  // Backup and write
  fs.writeFileSync(`${filePath}.backup_${Date.now()}`, content);
  fs.writeFileSync(filePath, fixedContent.join('\n'));
  
  console.log('✅ Added container style to StyleSheet');
  console.log('✅ Applied fix to EditorUpdatesScreen');
} else {
  console.log('❌ Could not find StyleSheet in file');
}
