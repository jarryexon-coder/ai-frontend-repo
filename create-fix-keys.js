// create-fix-keys.js
const fs = require('fs');
const path = require('path');

const srcDir = './src';

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, lineNumber) => {
    // Look for .map() calls
    if (line.includes('.map(') && line.includes('=>') && !line.includes('key=')) {
      console.log(`⚠️  Possible missing key in: ${filePath}:${lineNumber + 1}`);
      console.log(`   ${line.trim()}`);
      console.log('');
    }
    
    // Look for FlatList without keyExtractor
    if (line.includes('<FlatList') && !content.includes('keyExtractor=')) {
      console.log(`⚠️  FlatList without keyExtractor in: ${filePath}`);
      console.log('');
    }
  });
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
      walkDir(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      checkFile(fullPath);
    }
  }
}

console.log('🔍 Searching for duplicate key issues...\n');
walkDir(srcDir);
console.log('✅ Scan complete!');
