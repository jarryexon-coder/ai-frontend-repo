const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for remaining shadow issues...\n');

const checkFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  console.log(`\n📄 ${filePath}`);
  console.log('-'.repeat(50));
  
  let issueCount = 0;
  
  lines.forEach((line, index) => {
    if (line.includes('style={[') && line.includes('backgroundColor:')) {
      // Check if it has a solid wrapper
      const prevLines = lines.slice(Math.max(0, index - 3), index);
      const hasWrapper = prevLines.some(l => 
        l.includes('Container') || l.includes('Wrapper') || 
        (l.includes('style=') && l.includes('white'))
      );
      
      if (!hasWrapper) {
        console.log(`❌ Line ${index + 1}: Inline background without wrapper`);
        console.log(`   ${line.trim()}`);
        issueCount++;
      }
    }
    
    // Check for shadow without background
    if ((line.includes('shadow') || line.includes('elevation')) && 
        !line.includes('backgroundColor')) {
      console.log(`❌ Line ${index + 1}: Shadow without explicit background`);
      console.log(`   ${line.trim()}`);
      issueCount++;
    }
  });
  
  if (issueCount === 0) {
    console.log('✅ All shadow issues are fixed!');
  } else {
    console.log(`\nFound ${issueCount} remaining issues`);
  }
  
  return issueCount;
};

// Check your files
const files = [
  'src/screens/GameDetailsScreen.js',
  'src/screens/ParlayBuilder/PredictionsScreen.js'
];

let totalIssues = 0;
files.forEach(file => {
  if (fs.existsSync(file)) {
    totalIssues += checkFile(file);
  }
});

console.log(`\n${'='.repeat(50)}`);
console.log(`Total remaining issues: ${totalIssues}`);
