const { exec } = require('child_process');
const fs = require('fs');

console.log('🚀 Running all final shadow fixes...\n');
console.log('='.repeat(60));

const scripts = [
  'fix_game_details_final.js',
  'fix_analytics_complete.js',
  'fix_premium_complete.js'
];

// Check if scripts exist
scripts.forEach(script => {
  if (!fs.existsSync(script)) {
    console.log(`❌ Missing script: ${script}`);
    process.exit(1);
  }
});

function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    console.log(`\n📦 Running ${scriptName}...`);
    console.log('-'.repeat(40));
    
    exec(`node ${scriptName}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error:`, error.message);
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

async function runAllFixes() {
  try {
    for (const script of scripts) {
      await runScript(script);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 All final fixes completed!');
    console.log('='.repeat(60));
    
    console.log('\n📋 Next steps:');
    console.log('1. Run diagnostic to verify:');
    console.log('   node diagnose_all_shadows.js');
    console.log('2. Check your app for shadow warnings:');
    console.log('   npx react-native run-ios');
    console.log('3. If issues remain, check backup files (*.backup_final_*)');
    console.log('\n💡 Tip: Run this verification command:');
    console.log('   npx react-native log-ios | grep -i "shadow\|advice"');
    
  } catch (error) {
    console.error('\n❌ Failed to run all fixes');
    process.exit(1);
  }
}

runAllFixes();
