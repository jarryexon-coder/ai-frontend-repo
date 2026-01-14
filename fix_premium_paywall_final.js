// fix_premium_paywall_final.js
const fs = require('fs');

console.log('🔧 Final fix for PremiumAccessPaywall.js...');

const filePath = 'src/screens/PremiumAccessPaywall.js';
let content = fs.readFileSync(filePath, 'utf8');

// The issue: When we combine styles with shadowContainer, 
// React Native needs to know which one provides the background.
// Solution: Ensure ALL styles in the array have explicit backgrounds.

// First, let's see what the styles look like
const lines = content.split('\n');

// Find and fix the problematic lines
let updated = false;

// Line 177: header with shadowContainer
if (lines[176] && lines[176].includes('header') && lines[176].includes('shadowContainer')) {
  console.log('Fixing line 177 (header with shadowContainer)...');
  
  // Option 1: Create a combined style in the StyleSheet
  // Option 2: Wrap in a container
  // Let's go with Option 2 for consistency
  
  lines[176] = lines[176].replace(
    /style=\{\[styles\.header, styles\.shadowContainer\]\}/,
    `<View style={styles.headerShadowContainer}>
      <View style={styles.header}>`
  );
  
  // We need to find the matching closing tag
  for (let i = 176; i < lines.length; i++) {
    if (lines[i].includes('</View>') && lines[i].trim() === '</View>') {
      lines[i] = `      </View>
    </View>`;
      break;
    }
  }
  
  updated = true;
}

// Line 270: actionSection with shadowContainer
if (lines[269] && lines[269].includes('actionSection') && lines[269].includes('shadowContainer')) {
  console.log('Fixing line 270 (actionSection with shadowContainer)...');
  
  lines[269] = lines[269].replace(
    /<View style=\{\[styles\.actionSection, styles\.shadowContainer\]\}>/,
    `<View style={styles.actionSectionShadowContainer}>
      <View style={styles.actionSection}>`
  );
  
  // We need to find the matching closing tag (search forward)
  for (let i = 269; i < Math.min(300, lines.length); i++) {
    if (lines[i].includes('</View>') && lines[i].trim() === '</View>') {
      lines[i] = `      </View>
    </View>`;
      break;
    }
  }
  
  updated = true;
}

// Add the new container styles to the StyleSheet
const newContainerStyles = `
  headerShadowContainer: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 20, // Add if your header has rounded corners
    marginBottom: 20, // Adjust as needed
  },
  
  actionSectionShadowContainer: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 15, // Add if your actionSection has rounded corners
    marginVertical: 10, // Adjust as needed
  },`;

// Add to StyleSheet if we made changes
if (updated) {
  const styleSheetIndex = content.indexOf('const styles = StyleSheet.create');
  if (styleSheetIndex !== -1) {
    const insertIndex = content.indexOf('{', styleSheetIndex) + 1;
    const beforeInsert = content.slice(0, insertIndex);
    const afterInsert = content.slice(insertIndex);
    
    // Rebuild content with new lines and container styles
    const newContent = beforeInsert + newContainerStyles + afterInsert;
    const newLines = newContent.split('\n');
    
    // Update the lines we fixed
    if (lines[176]) newLines[176] = lines[176];
    if (lines[269]) newLines[269] = lines[269];
    
    // Find and update the closing tags in newLines
    // (We already updated them in the lines array above)
    
    // Write the file
    fs.writeFileSync(`${filePath}.backup_complete_${Date.now()}`, newLines.join('\n'));
    fs.writeFileSync(filePath, newLines.join('\n'));
    
    console.log('✅ Applied fixes to PremiumAccessPaywall.js');
    console.log('Added headerShadowContainer and actionSectionShadowContainer styles');
  }
} else {
  console.log('⚠️ No changes needed or could not find the problematic lines');
}
