const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing all AnalyticsScreen-enhanced.js issues...');

const filePath = 'src/screens/AnalyticsScreen-enhanced.js';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');

// Fix 1: Line 544 - legendColor
if (lines[543] && lines[543].includes('legendColor') && lines[543].includes('#14b8a6')) {
  console.log(`Fixing line 544: legendColor`);
  lines[543] = lines[543].replace(
    /<View style=\{\[styles\.legendColor, \{ backgroundColor: '#14b8a6' \}\]\} \/>/,
    `<View style={styles.legendColorContainer}>
      <View style={[styles.legendColor, { backgroundColor: '#14b8a6' }]} />
    </View>`
  );
}

// Fix 2-5: comparisonBar lines
const comparisonBarLines = [680, 689, 692, 704]; // Lines 681, 690, 693, 705

comparisonBarLines.forEach(lineNum => {
  if (lines[lineNum] && lines[lineNum].includes('comparisonBar')) {
    console.log(`Fixing line ${lineNum + 1}: comparisonBar`);
    
    // Find the matching closing tag
    let closingLineIndex = -1;
    let openCount = 0;
    
    // Search forward for the closing tag
    for (let i = lineNum; i < Math.min(lineNum + 10, lines.length); i++) {
      if (lines[i].includes('<View')) {
        openCount++;
      }
      if (lines[i].includes('</View>')) {
        openCount--;
        if (openCount === 0) {
          closingLineIndex = i;
          break;
        }
      }
    }
    
    if (closingLineIndex !== -1) {
      // Wrap the entire comparisonBar block
      const openingLine = lines[lineNum];
      const closingLine = lines[closingLineIndex];
      
      // Create container
      lines[lineNum] = openingLine.replace(
        /<View style=\{\[styles\.comparisonBar,[^}]+\]\}>/,
        `<View style={styles.comparisonBarContainer}>
          <View style={[styles.comparisonBar,`
      );
      
      // Add closing container tag
      lines[closingLineIndex] = `${closingLine}
      </View>`;
    }
  }
});

// Fix 6: Line 1006 - probabilityBar
if (lines[1005] && lines[1005].includes('probabilityBar') && lines[1005].includes('#3b82f6')) {
  console.log(`Fixing line 1006: probabilityBar`);
  lines[1005] = lines[1005].replace(
    /<View style=\{\[styles\.probabilityBar,[^}]+\]\} \/>/,
    `<View style={styles.probabilityBarContainer}>
      <View style={[styles.probabilityBar, { width: '35%', backgroundColor: '#3b82f6' }]} />
    </View>`
  );
}

// Ensure all container styles exist
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
  },`;

// Add container styles if not present
if (!content.includes('legendColorContainer:')) {
  const styleSheetIndex = content.indexOf('const styles = StyleSheet.create');
  if (styleSheetIndex !== -1) {
    const insertIndex = content.indexOf('{', styleSheetIndex) + 1;
    content = content.slice(0, insertIndex) + containerStyles + content.slice(insertIndex);
    lines = content.split('\n');
  }
}

// Write the file
fs.writeFileSync(`${filePath}.backup_final_${Date.now()}`, fs.readFileSync(filePath, 'utf8'));
fs.writeFileSync(filePath, lines.join('\n'));

console.log('✅ Fixed 6 issues in AnalyticsScreen-enhanced.js');
