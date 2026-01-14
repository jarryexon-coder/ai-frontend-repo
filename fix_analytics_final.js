// fix_analytics_final.js
const fs = require('fs');

console.log('🔧 Comprehensive fix for AnalyticsScreen-enhanced.js...');

const filePath = 'src/screens/AnalyticsScreen-enhanced.js';
let content = fs.readFileSync(filePath, 'utf8');

// First, let's add container styles to the StyleSheet
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
  }
}

// Now fix the specific inline styles
// Pattern: Find and replace all inline comparisonBar styles
content = content.replace(
  /<View style=\{\[styles\.comparisonBar,\s*\{[^}]+\}\]\}>/g,
  (match) => {
    // Extract the inner properties
    const propsMatch = match.match(/\{([^}]+)\}/);
    if (propsMatch) {
      const props = propsMatch[1];
      return `<View style={styles.comparisonBarContainer}>
        <View style={[styles.comparisonBar, {${props}}]}>`;
    }
    return match;
  }
);

// Fix probabilityBar
content = content.replace(
  /<View style=\{\[styles\.probabilityBar,\s*\{[^}]+\}\]\} \/>/g,
  (match) => {
    // Extract the inner properties
    const propsMatch = match.match(/\{([^}]+)\}/);
    if (propsMatch) {
      const props = propsMatch[1];
      return `<View style={styles.probabilityBarContainer}>
        <View style={[styles.probabilityBar, {${props}}]} />`;
    }
    return match;
  }
);

// Fix legendColor
content = content.replace(
  /<View style=\{\[styles\.legendColor,\s*\{[^}]+\}\]\} \/>/g,
  (match) => {
    // Extract the inner properties
    const propsMatch = match.match(/\{([^}]+)\}/);
    if (propsMatch) {
      const props = propsMatch[1];
      return `<View style={styles.legendColorContainer}>
        <View style={[styles.legendColor, {${props}}]} />`;
    }
    return match;
  }
);

// Fix closing tags for comparisonBar
content = content.replace(/<\/View>\s*<\/View>/g, '</View>\n      </View>');

// Backup and write
fs.writeFileSync(`${filePath}.backup_complete_${Date.now()}`, content);
fs.writeFileSync(filePath, content);

console.log('✅ Applied comprehensive fixes to AnalyticsScreen-enhanced.js');
console.log('Fixed:');
console.log('  - legendColor with dynamic background');
console.log('  - comparisonBar elements (multiple)');
console.log('  - probabilityBar with dynamic background');
