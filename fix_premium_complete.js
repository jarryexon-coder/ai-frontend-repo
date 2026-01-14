const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing PremiumAccessPaywall.js issues...');

const filePath = 'src/screens/PremiumAccessPaywall.js';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');

// The issue: We're applying shadowContainer style that has shadows, 
// and ALSO adding backgroundColor inline. This confuses React Native.
// Solution: Remove inline backgroundColor and ensure shadowContainer style has it.

// Fix 1: Line 177 - Remove inline backgroundColor from header
if (lines[176] && lines[176].includes('header') && lines[176].includes('shadowContainer')) {
  console.log(`Fixing line 177: header`);
  lines[176] = lines[176].replace(
    /style=\{\[styles\.header, styles\.shadowContainer, \{ backgroundColor: 'white' \}\]\}/,
    `style={[styles.header, styles.shadowContainer]}`
  );
}

// Fix 2: Line 270 - Remove inline backgroundColor from actionSection
if (lines[269] && lines[269].includes('actionSection') && lines[269].includes('shadowContainer')) {
  console.log(`Fixing line 270: actionSection`);
  lines[269] = lines[269].replace(
    /<View style=\{\[styles\.actionSection, styles\.shadowContainer, \{ backgroundColor: 'white' \}\]\}>/,
    `<View style={[styles.actionSection, styles.shadowContainer]}>`
  );
}

// Ensure shadowContainer style has backgroundColor
const shadowContainerRegex = /shadowContainer:\s*\{[^}]*\}/s;
const shadowContainerMatch = content.match(shadowContainerRegex);

if (shadowContainerMatch) {
  let shadowContainerStyle = shadowContainerMatch[0];
  
  if (!shadowContainerStyle.includes('backgroundColor')) {
    console.log('Adding backgroundColor to shadowContainer style');
    
    // Add backgroundColor to shadowContainer
    shadowContainerStyle = shadowContainerStyle.replace(
      '{',
      '{\n    backgroundColor: \'white\','
    );
    
    // Update content
    content = content.replace(shadowContainerRegex, shadowContainerStyle);
    lines = content.split('\n');
  }
} else {
  console.log('⚠️ Could not find shadowContainer style');
}

// Also ensure header and actionSection styles have backgroundColor
const headerRegex = /header:\s*\{[^}]*\}/s;
const headerMatch = content.match(headerRegex);

if (headerMatch && !headerMatch[0].includes('backgroundColor')) {
  console.log('Adding backgroundColor to header style');
  content = content.replace(headerRegex, headerMatch[0].replace('{', '{\n    backgroundColor: \'white\','));
}

const actionSectionRegex = /actionSection:\s*\{[^}]*\}/s;
const actionSectionMatch = content.match(actionSectionRegex);

if (actionSectionMatch && !actionSectionMatch[0].includes('backgroundColor')) {
  console.log('Adding backgroundColor to actionSection style');
  content = content.replace(actionSectionRegex, actionSectionMatch[0].replace('{', '{\n    backgroundColor: \'white\','));
}

// Update lines with our fixed lines
if (lines[176]) {
  const contentLines = content.split('\n');
  contentLines[176] = lines[176];
  contentLines[269] = lines[269];
  content = contentLines.join('\n');
}

// Write the file
fs.writeFileSync(`${filePath}.backup_final_${Date.now()}`, fs.readFileSync(filePath, 'utf8'));
fs.writeFileSync(filePath, content);

console.log('✅ Fixed PremiumAccessPaywall.js');
console.log('⚠️  Note: If header or actionSection have their own backgrounds,');
console.log('    you may need to adjust the backgroundColor to match your design.');
