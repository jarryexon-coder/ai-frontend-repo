const fs = require('fs');
const path = require('path');

// Common HTML to React Native replacements
const replacements = [
  // Headers
  { pattern: /<h1[^>]*>(.*?)<\/h1>/g, replacement: '<Text style={{fontSize: 24, fontWeight: "bold"}}>$1</Text>' },
  { pattern: /<h2[^>]*>(.*?)<\/h2>/g, replacement: '<Text style={{fontSize: 20, fontWeight: "bold"}}>$1</Text>' },
  { pattern: /<h3[^>]*>(.*?)<\/h3>/g, replacement: '<Text style={{fontSize: 18, fontWeight: "bold"}}>$1</Text>' },
  
  // Paragraphs and spans
  { pattern: /<p[^>]*>(.*?)<\/p>/g, replacement: '<Text style={{marginVertical: 8}}>$1</Text>' },
  { pattern: /<span[^>]*>(.*?)<\/span>/g, replacement: '<Text>$1</Text>' },
  
  // Divs
  { pattern: /<div[^>]*>(.*?)<\/div>/g, replacement: '<View>$1</View>' },
  
  // Line breaks and horizontal rules
  { pattern: /<br\s*\/?>/g, replacement: '{/* line break */}' },
  { pattern: /<hr\s*\/?>/g, replacement: '<View style={{height: 1, backgroundColor: "#ccc", marginVertical: 10}} />' },
  
  // Strong and emphasis
  { pattern: /<strong>(.*?)<\/strong>/g, replacement: '<Text style={{fontWeight: "bold"}}>$1</Text>' },
  { pattern: /<b>(.*?)<\/b>/g, replacement: '<Text style={{fontWeight: "bold"}}>$1</Text>' },
  { pattern: /<em>(.*?)<\/em>/g, replacement: '<Text style={{fontStyle: "italic"}}>$1</Text>' },
  { pattern: /<i>(.*?)<\/i>/g, replacement: '<Text style={{fontStyle: "italic"}}>$1</Text>' },
];

function fixHTMLTags(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    replacements.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });
    
    if (modified) {
      // Ensure proper imports
      if (content.includes('<Text') && !content.includes("import { Text }")) {
        if (content.includes('import {') && content.includes('} from')) {
          // Add Text to existing import
          content = content.replace(
            /import\s*{([^}]+)}\s*from\s*['"][^'"]+['"]/,
            (match, imports) => {
              if (!imports.includes('Text')) {
                return `import {${imports}, Text} from 'react-native'`;
              }
              return match;
            }
          );
        }
      }
      
      if (content.includes('<View') && !content.includes("import { View }")) {
        if (content.includes('import {') && content.includes('} from')) {
          content = content.replace(
            /import\s*{([^}]+)}\s*from\s*['"][^'"]+['"]/,
            (match, imports) => {
              if (!imports.includes('View')) {
                return `import {${imports}, View} from 'react-native'`;
              }
              return match;
            }
          );
        }
      }
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed HTML tags in: ${filePath}`);
    }
  } catch (error) {
    console.log(`❌ Error fixing ${filePath}: ${error.message}`);
  }
}

// Check PlayerStatsScreen first (where the error occurred)
const playerStatsPath = 'src/screens/PlayerStatsScreen-enhanced.js';
if (fs.existsSync(playerStatsPath)) {
  console.log('\nChecking PlayerStatsScreen for HTML tags...');
  fixHTMLTags(playerStatsPath);
}

// Also check other likely files
const filesToCheck = [
  'src/screens/GameDetailsScreen.js',
  'src/screens/EditorUpdatesScreen.js',
  'src/screens/SportsNewsHub-enhanced.js'
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    fixHTMLTags(file);
  }
});
