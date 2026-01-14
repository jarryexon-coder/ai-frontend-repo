const fs = require('fs');

console.log('🔍 Verifying fixes...\n');

const files = [
  'src/screens/GameDetailsScreen.js',
  'src/screens/ParlayBuilder/PredictionsScreen.js'
];

files.forEach(filePath => {
  console.log(`\n📄 ${filePath}`);
  console.log('-'.repeat(50));
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ File not found');
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let inlineIssues = 0;
  let shadowWithoutBg = 0;
  
  lines.forEach((line, index) => {
    // Check for inline background without container
    if (line.includes('style={[') && line.includes('backgroundColor:')) {
      if (!line.includes('Container') && !line.includes('borderWidth:')) {
        console.log(`⚠️  Line ${index + 1}: Possible inline background issue`);
        console.log(`   ${line.trim().substring(0, 80)}...`);
        inlineIssues++;
      }
    }
    
    // Check for shadow properties without background in same line
    if ((line.includes('shadow') || line.includes('elevation')) && 
        !line.includes('backgroundColor') &&
        line.trim().endsWith(',')) {
      console.log(`⚠️  Line ${index + 1}: Shadow without background in line`);
      shadowWithoutBg++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Inline background issues: ${inlineIssues}`);
  console.log(`   Shadow without background lines: ${shadowWithoutBg}`);
  
  if (inlineIssues === 0 && shadowWithoutBg === 0) {
    console.log('✅ All shadow issues appear to be fixed!');
  }
});

console.log('\n' + '='.repeat(50));
console.log('🎉 Verification complete!');
console.log('Run your app to confirm warnings are gone.');
