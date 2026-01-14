const fs = require('fs');
const path = require('path');

const srcDir = './src';

function findPotentialDuplicates(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let inArrayMap = false;
  let mapStartLine = -1;
  let elementsWithoutKeys = [];
  
  lines.forEach((line, lineNumber) => {
    // Look for .map() calls
    if (line.includes('.map(') && line.includes('=>')) {
      inArrayMap = true;
      mapStartLine = lineNumber;
      elementsWithoutKeys = [];
    }
    
    // Check if we're inside a .map() and count elements without keys
    if (inArrayMap) {
      if (line.includes('<View') || line.includes('<Text') || line.includes('<TouchableOpacity')) {
        if (!line.includes('key=')) {
          elementsWithoutKeys.push({ line: lineNumber + 1, content: line.trim() });
        }
      }
      
      // Check if we've reached the end of the .map()
      if (line.includes(');') || line.includes('})')) {
        if (elementsWithoutKeys.length >= 3) { // .$2 means at least 3 elements
          console.log(`⚠️  Potential .$2 error in: ${filePath}`);
          console.log(`   Line ${mapStartLine + 1}: ${lines[mapStartLine].trim()}`);
          console.log(`   Found ${elementsWithoutKeys.length} elements without keys:`);
          elementsWithoutKeys.forEach(e => {
            console.log(`     Line ${e.line}: ${e.content}`);
          });
          console.log('');
        }
        inArrayMap = false;
      }
    }
  });
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git') && !file.includes('backup')) {
      walkDir(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      findPotentialDuplicates(fullPath);
    }
  }
}

console.log('🔍 Searching for potential .$2 duplicate key issues...\n');
walkDir(srcDir);
