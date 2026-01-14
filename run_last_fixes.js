// run_last_fixes.js
const fs = require('fs');
const { exec } = require('child_cexec');

console.log('🚀 Running final fixes for remaining 2 files...\n');
console.log('='.repeat(60));

async function runFix(scriptName) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(scriptName)) {
      console.log(`❌ Script not found: ${scriptName}`);
      reject(new Error(`Script not found: ${scriptName}`));
      return;
    }
    
    console.log(`\n📦 Running ${scriptName}...`);
    console.log('-'.repeat(40));
    
    const child = exec(`node ${scriptName}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error in ${scriptName}:`, error.message);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.error(`⚠️  Warnings:`, stderr);
      }
      
      if (stdout) {
        console.log(stdout);
      }
      
      console.log(`✅ ${scriptName} completed`);
      resolve();
    });
  });
}

async function main() {
  try {
    await runFix('fix_analytics_final.js');
    await runFix('fix_premium_paywall_final.js');
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 All fixes completed!');
    console.log('='.repeat(60));
    
    console.log('\n📋 Verification steps:');
    console.log('1. Run full diagnostic:');
    console.log('   node diagnose_all_shadows.js');
    console.log('2. Check your app for warnings:');
    console.log('   npx react-native run-ios');
    console.log('3. If issues remain, use grep to find specific patterns:');
    console.log('   grep -n "style={[^}]*shadow" src/screens/AnalyticsScreen-enhanced.js');
    console.log('   grep -n "style={[^}]*backgroundColor" src/screens/AnalyticsScreen-enhanced.js');
    
  } catch (error) {
    console.error('\n❌ Failed to complete all fixes');
    process.exit(1);
  }
}

main();
