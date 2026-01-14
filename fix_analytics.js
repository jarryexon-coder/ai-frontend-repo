const fs = require('fs');
const path = require('path');

const filePath = 'src/screens/AnalyticsScreen-enhanced.js';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');

console.log(`🔧 Fixing ${filePath}`);

// Fix line 544: legendColor
if (lines[543] && lines[543].includes('legendColor')) {
  lines[543] = lines[543].replace(
    /<View style=\{\[styles\.legendColor, \{ backgroundColor: '#14b8a6' \}\]\} \/>/,
    `<View style={styles.legendColorContainer}>
      <View style={[styles.legendColor, { backgroundColor: '#14b8a6' }]} />
    </View>`
  );
  console.log('✅ Fixed line 544: legendColor');
}

// Fix line 681: comparisonBar with width and background
if (lines[680] && lines[680].includes('comparisonBar')) {
  lines[680] = lines[680].replace(
    /<View style=\{\[styles\.comparisonBar, \{ width: '68%', backgroundColor: '#3b82f6' \}\]\}>/,
    `<View style={styles.comparisonBarContainer}>
      <View style={[styles.comparisonBar, { width: '68%', backgroundColor: '#3b82f6' }]}>
    </View>`
  );
  console.log('✅ Fixed line 681: comparisonBar');
}

// Fix line 690: comparisonBar
if (lines[689] && lines[689].includes('comparisonBar')) {
  lines[689] = lines[689].replace(
    /<View style=\{\[styles\.comparisonBar, \{ width: '62%', backgroundColor: '#ef4444' \}\]\}>/,
    `<View style={styles.comparisonBarContainer}>
      <View style={[styles.comparisonBar, { width: '62%', backgroundColor: '#ef4444' }]}>
    </View>`
  );
  console.log('✅ Fixed line 690: comparisonBar');
}

// Fix line 693: comparisonBar
if (lines[692] && lines[692].includes('comparisonBar')) {
  lines[692] = lines[692].replace(
    /<View style=\{\[styles\.comparisonBar, \{ width: '58%', backgroundColor: '#dc2626' \}\]\}>/,
    `<View style={styles.comparisonBarContainer}>
      <View style={[styles.comparisonBar, { width: '58%', backgroundColor: '#dc2626' }]}>
    </View>`
  );
  console.log('✅ Fixed line 693: comparisonBar');
}

// Fix line 705: comparisonBar
if (lines[704] && lines[704].includes('comparisonBar')) {
  lines[704] = lines[704].replace(
    /<View style=\{\[styles\.comparisonBar, \{ width: '52%', backgroundColor: '#3b82f6' \}\]\}>/,
    `<View style={styles.comparisonBarContainer}>
      <View style={[styles.comparisonBar, { width: '52%', backgroundColor: '#3b82f6' }]}>
    </View>`
  );
  console.log('✅ Fixed line 705: comparisonBar');
}

// Fix line 1006: probabilityBar
if (lines[1005] && lines[1005].includes('probabilityBar')) {
  lines[1005] = lines[1005].replace(
    /<View style=\{\[styles\.probabilityBar, \{ width: '35%', backgroundColor: '#3b82f6' \}\]\} \/>/,
    `<View style={styles.probabilityBarContainer}>
      <View style={[styles.probabilityBar, { width: '35%', backgroundColor: '#3b82f6' }]} />
    </View>`
  );
  console.log('✅ Fixed line 1006: probabilityBar');
}

// Add container styles to StyleSheet
const containerStyles = `

  // Container styles for shadow optimization
  legendColorContainer: {
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  
  comparisonBarContainer: {
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  
  probabilityBarContainer: {
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
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
  [543, 680, 689, 692, 704, 1005].forEach(lineNum => {
    if (lines[lineNum - 1]) fixedContent[lineNum - 1] = lines[lineNum - 1];
  });
  
  // Backup and write
  fs.writeFileSync(`${filePath}.backup_${Date.now()}`, content);
  fs.writeFileSync(filePath, fixedContent.join('\n'));
  
  console.log('✅ Added container styles to StyleSheet');
  console.log('✅ Applied 6 fixes to AnalyticsScreen');
} else {
  console.log('❌ Could not find StyleSheet in file');
}
