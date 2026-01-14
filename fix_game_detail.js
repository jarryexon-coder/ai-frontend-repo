const fs = require('fs');
const path = require('path');

const filePath = 'src/screens/GameDetailsScreen.js';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');
let changes = 0;

// Track which styles need backgroundColor
const stylesNeedingBackground = new Set();
let currentStyle = '';
let inStyleBlock = false;
let styleStartLine = 0;

// First pass: Find all style blocks with shadows but no background
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Detect style name
  if (line.trim().match(/^[a-zA-Z]+:\s*\{/)) {
    currentStyle = line.trim().split(':')[0];
    inStyleBlock = true;
    styleStartLine = i;
  }
  
  // Check if style has shadows
  if (inStyleBlock && (line.includes('shadow') || line.includes('elevation'))) {
    // Look ahead in the style block for backgroundColor
    let hasBackground = false;
    for (let j = styleStartLine; j <= i; j++) {
      if (lines[j].includes('backgroundColor')) {
        hasBackground = true;
        break;
      }
    }
    
    if (!hasBackground) {
      stylesNeedingBackground.add(currentStyle);
    }
  }
  
  // End of style block
  if (inStyleBlock && line.trim() === '},') {
    inStyleBlock = false;
    currentStyle = '';
  }
}

// Second pass: Add backgroundColor to identified styles
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check if this is a style that needs background
  for (const styleName of stylesNeedingBackground) {
    if (line.includes(`${styleName}: {`)) {
      // Add backgroundColor after the opening brace
      const indent = line.match(/^(\s*)/)[1];
      lines[i] = line + `\n${indent}  backgroundColor: 'white',`;
      changes++;
      console.log(`✅ Added background to style: ${styleName}`);
      break;
    }
  }
}

if (changes > 0) {
  // Backup
  fs.writeFileSync(`${filePath}.backup_${Date.now()}`, content);
  // Write fixed file
  fs.writeFileSync(filePath, lines.join('\n'));
  console.log(`\n✅ Applied ${changes} fixes to ${filePath}`);
} else {
  console.log('No changes needed');
}
