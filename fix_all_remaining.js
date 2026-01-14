const { exec } = require('child_process');
const fs = require('fs');

console.log('🚀 Running all remaining shadow fixes...\n');

const scripts = [
  'fix_daily_picks.js',
  'fix_analytics.js', 
  'fix_premium_paywall.js'
];

function runScript(scriptName, callback) {
  console.log(`📦 Running ${scriptName}...`);
  exec(`node ${scriptName}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error in ${scriptName}:`, error.message);
    }
    if (stderr) {
      console.error(`⚠️  ${scriptName} stderr:`, stderr);
    }
    if (stdout) {
      console.log(stdout);
    }
    callback();
  });
}

// Run scripts sequentially
let current = 0;
function runNext() {
  if (current < scripts.length) {
    runScript(scripts[current], () => {
      current++;
      runNext();
    });
  } else {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 All fixes completed!');
    console.log('='.repeat(60));
    console.log('\nNext steps:');
    console.log('1. Run diagnostic to verify fixes:');
    console.log('   node diagnose_all_shadows.js');
    console.log('2. Run your app to check for warnings:');
    console.log('   npx react-native run-ios');
    console.log('3. If issues remain, check the backup files');
  }
}

// Check which scripts exist
const existingScripts = scripts.filter(script => fs.existsSync(script));
if (existingScripts.length === 0) {
  console.log('❌ No fix scripts found. Please create them first.');
  process.exit(1);
}

runNext();
