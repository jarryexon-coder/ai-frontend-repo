const fs = require('fs');

console.log('🔍 Quick verification of fixes...\n');

const filesToCheck = [
  { 
    path: 'src/screens/GameDetailsScreen.js', 
    line: 716, 
    shouldContain: 'teamColorDotContainer' 
  },
  { 
    path: 'src/screens/AnalyticsScreen-enhanced.js', 
    lines: [544, 681, 690, 693, 705, 1006],
    shouldContain: 'Container' 
  },
  { 
    path: 'src/screens/PremiumAccessPaywall.js', 
    lines: [177, 270],
    shouldNotContain: "backgroundColor: 'white'" 
  }
];

filesToCheck.forEach(({ path, line, lines, shouldContain, shouldNotContain }) => {
  console.log(`\n📄 ${path}`);
  console.log('-'.repeat(40));
  
  if (!fs.existsSync(path)) {
    console.log('❌ File not found');
    return;
  }
  
  const content = fs.readFileSync(path, 'utf8');
  const linesArray = content.split('\n');
  
  const checkLines = lines ? lines : [line];
  
  let allGood = true;
  
  checkLines.forEach(lineNum => {
    if (lineNum && linesArray[lineNum - 1]) {
      const lineContent = linesArray[lineNum - 1];
      
      if (shouldContain && !lineContent.includes(shouldContain)) {
        console.log(`❌ Line ${lineNum}: Missing "${shouldContain}"`);
        console.log(`   ${lineContent.trim().substring(0, 80)}...`);
        allGood = false;
      }
      
      if (shouldNotContain && lineContent.includes(shouldNotContain)) {
        console.log(`❌ Line ${lineNum}: Contains "${shouldNotContain}" (should not)`);
        console.log(`   ${lineContent.trim().substring(0, 80)}...`);
        allGood = false;
      }
    }
  });
  
  if (allGood) {
    console.log('✅ All checks passed');
  }
});

console.log('\n' + '='.repeat(40));
console.log('🎯 Verification complete');
console.log('Run full diagnostic to confirm: node diagnose_all_shadows.js');
