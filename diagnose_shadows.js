const fs = require('fs');
const path = require('path');

function findShadowIssues(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  console.log(`\n🔍 Scanning: ${filePath}`);
  console.log('='.repeat(80));
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Pattern 1: Shadow properties with transparent background
    if (line.includes('shadow') && line.includes('transparent')) {
      console.log(`❌ Line ${lineNum}: Shadow with transparent background`);
      console.log(`   ${line.trim()}`);
    }
    
    // Pattern 2: Shadow without explicit background
    if (line.includes('shadow') && !line.includes('backgroundColor')) {
      // Check next few lines for background
      const nextLines = lines.slice(index, Math.min(index + 10, lines.length));
      const hasBackground = nextLines.some(l => l.includes('backgroundColor'));
      if (!hasBackground) {
        console.log(`⚠️  Line ${lineNum}: Shadow without explicit background`);
        console.log(`   ${line.trim()}`);
      }
    }
    
    // Pattern 3: elevation without background
    if (line.includes('elevation') && !line.includes('backgroundColor')) {
      console.log(`⚠️  Line ${lineNum}: Elevation without background (Android)`);
      console.log(`   ${line.trim()}`);
    }
  });
}

// Run on your files
const screensDir = path.join(__dirname, 'src', 'screens');
const files = ['NFLScreen-enhanced.js', 'EditorUpdatesScreen.js', 'PlayerStatsScreen-enhanced.js'];

files.forEach(file => {
  const filePath = path.join(screensDir, file);
  if (fs.existsSync(filePath)) {
    findShadowIssues(filePath);
  }
});
