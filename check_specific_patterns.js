// check_specific_patterns.js
const fs = require('fs');

console.log('🔍 Checking for specific problematic patterns...\n');

const files = [
  'src/screens/AnalyticsScreen-enhanced.js',
  'src/screens/PremiumAccessPaywall.js'
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
  
  // Pattern 1: Inline styles with backgroundColor
  console.log('\nInline styles with backgroundColor:');
  lines.forEach((line, index) => {
    if (line.includes('style={[') && line.includes('backgroundColor:')) {
      console.log(`  Line ${index + 1}: ${line.trim().substring(0, 80)}...`);
    }
  });
  
  // Pattern 2: Style arrays with shadow properties
  console.log('\nStyle arrays with shadow properties:');
  lines.forEach((line, index) => {
    if (line.includes('style={[') && (line.includes('shadow') || line.includes('elevation'))) {
      console.log(`  Line ${index + 1}: ${line.trim().substring(0, 80)}...`);
    }
  });
  
  // Pattern 3: Check for container usage
  console.log('\nContainer usage check:');
  const hasContainers = content.includes('Container') || 
                        content.includes('Container') ||
                        content.includes('Container');
  
  console.log(`  Has container styles: ${hasContainers ? '✅' : '❌'}`);
});
