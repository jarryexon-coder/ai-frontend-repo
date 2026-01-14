const fs = require('fs');
const path = require('path');

const filePath = 'src/screens/DailyPicksScreen-enhanced.js';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');

console.log(`🔧 Fixing ${filePath}`);

// Fix line 175: sportBadge with dynamic background
if (lines[174] && lines[174].includes('sportBadge')) {
  lines[174] = lines[174].replace(
    /<View style=\{\[styles\.sportBadge, \{ backgroundColor: \`\$\{getSportColor\(item\.sport\)\}20\` \}\]\}>/,
    `<View style={styles.sportBadgeContainer}>
      <View style={[
        styles.sportBadge,
        { 
          backgroundColor: \`\${getSportColor(item.sport)}20\`,
          borderWidth: 1,
          borderColor: getSportColor(item.sport) + '30'
        }
      ]}>`
  );
  console.log('✅ Fixed line 175: sportBadge');
}

// Fix line 182: confidenceBadge with dynamic background
if (lines[181] && lines[181].includes('confidenceBadge')) {
  lines[181] = lines[181].replace(
    /<View style=\{\[styles\.confidenceBadge, \{ backgroundColor: getConfidenceColor\(item\.confidence\) \}\]\}>/,
    `<View style={styles.confidenceBadgeContainer}>
      <View style={[
        styles.confidenceBadge,
        { 
          backgroundColor: getConfidenceColor(item.confidence),
          borderWidth: 1,
          borderColor: getConfidenceColor(item.confidence) + '40'
        }
      ]}>`
  );
  console.log('✅ Fixed line 182: confidenceBadge');
}

// Add container styles to StyleSheet
const containerStyles = `

  // Container styles for shadow optimization
  sportBadgeContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  confidenceBadgeContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
`;

// Find and insert container styles
const styleSheetIndex = content.indexOf('const styles = StyleSheet.create');
if (styleSheetIndex !== -1) {
  const insertIndex = content.indexOf('{', styleSheetIndex) + 1;
  const newContent = content.slice(0, insertIndex) + containerStyles + content.slice(insertIndex);
  
  // Write with fixed lines
  const fixedContent = newContent.split('\n');
  // Update the lines we fixed
  if (lines[174]) fixedContent[174] = lines[174];
  if (lines[181]) fixedContent[181] = lines[181];
  
  // Backup and write
  fs.writeFileSync(`${filePath}.backup_${Date.now()}`, content);
  fs.writeFileSync(filePath, fixedContent.join('\n'));
  
  console.log('✅ Added container styles to StyleSheet');
  console.log('✅ Applied all fixes to DailyPicksScreen');
} else {
  console.log('❌ Could not find StyleSheet in file');
}
