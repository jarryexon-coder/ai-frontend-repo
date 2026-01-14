const fs = require('fs');
const path = require('path');

function safeCleanup(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Only comment out console.log, don't remove anything else
    content = content.replace(/console\.log\(/g, '// console.log(');
    content = content.replace(/console\.warn\(/g, '// console.warn(');
    content = content.replace(/console\.info\(/g, '// console.info(');
    content = content.replace(/console\.debug\(/g, '// console.debug(');
    
    // Keep console.error for error handling
    // content = content.replace(/console\.error\(/g, '// console.error(');
    
    // Verify the file still has valid syntax
    if (content.includes('export default') && content.includes('function') || content.includes('const')) {
      // Check for balanced braces
      const openBraces = (content.match(/{/g) || []).length;
      const closeBraces = (content.match(/}/g) || []).length;
      
      if (openBraces === closeBraces) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Safely cleaned: ${filePath}`);
        return true;
      } else {
        console.log(`⚠️  Skipped ${filePath}: Unbalanced braces after cleanup`);
        return false;
      }
    } else {
      console.log(`⚠️  Skipped ${filePath}: Missing export or function`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let cleaned = 0;
  let skipped = 0;
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('backup')) {
      const result = processDirectory(fullPath);
      cleaned += result.cleaned;
      skipped += result.skipped;
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      if (safeCleanup(fullPath)) {
        cleaned++;
      } else {
        skipped++;
      }
    }
  });
  
  return { cleaned, skipped };
}

console.log('Starting SAFE console.log cleanup...');
const result = processDirectory('src/screens');
console.log(`\n✅ SAFE Cleanup Complete:`);
console.log(`   Cleaned: ${result.cleaned} files`);
console.log(`   Skipped: ${result.skipped} files (to prevent breaking)`);
