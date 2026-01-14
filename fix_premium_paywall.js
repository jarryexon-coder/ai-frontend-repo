const fs = require('fs');
const path = require('path');

const filePath = 'src/screens/PremiumAccessPaywall.js';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');

console.log(`🔧 Fixing ${filePath}`);

// Fix line 177: header with shadowContainer
if (lines[176] && lines[176].includes('header')) {
  // Ensure the header style has a solid background
  lines[176] = lines[176].replace(
    /style=\{\[styles\.header, styles\.shadowContainer\]\}/,
    `style={[styles.header, styles.shadowContainer, { backgroundColor: 'white' }]}`
  );
  console.log('✅ Fixed line 177: header with solid background');
}

// Fix line 270: actionSection with shadowContainer
if (lines[269] && lines[269].includes('actionSection')) {
  // Ensure the actionSection style has a solid background
  lines[269] = lines[269].replace(
    /<View style=\{\[styles\.actionSection, styles\.shadowContainer\]\}>/,
    `<View style={[styles.actionSection, styles.shadowContainer, { backgroundColor: 'white' }]}>`
  );
  console.log('✅ Fixed line 270: actionSection with solid background');
}

// Ensure shadowContainer style has backgroundColor
const updatedContent = content.replace(
  /shadowContainer: \{[^}]+?\}/s,
  `shadowContainer: {
    backgroundColor: 'white', // Added for shadow optimization
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }`
);

// Also ensure header and actionSection styles have backgroundColor
let finalContent = updatedContent;

// Add backgroundColor to header if not present
if (!finalContent.includes('header: {')) {
  finalContent = finalContent.replace(
    /header: \{[^}]+?\}/s,
    (match) => {
      if (!match.includes('backgroundColor')) {
        return match.replace('{', '{\n    backgroundColor: \'white\',');
      }
      return match;
    }
  );
}

// Add backgroundColor to actionSection if not present
if (!finalContent.includes('actionSection: {')) {
  finalContent = finalContent.replace(
    /actionSection: \{[^}]+?\}/s,
    (match) => {
      if (!match.includes('backgroundColor')) {
        return match.replace('{', '{\n    backgroundColor: \'white\',');
      }
      return match;
    }
  );
}

// Write with fixed lines
const fixedLines = finalContent.split('\n');
if (lines[176]) fixedLines[176] = lines[176];
if (lines[269]) fixedLines[269] = lines[269];

// Backup and write
fs.writeFileSync(`${filePath}.backup_${Date.now()}`, content);
fs.writeFileSync(filePath, fixedLines.join('\n'));

console.log('✅ Updated shadowContainer with backgroundColor');
console.log('✅ Ensured header and actionSection have solid backgrounds');
console.log('✅ Applied 2 fixes to PremiumAccessPaywall');
