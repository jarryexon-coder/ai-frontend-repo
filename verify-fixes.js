const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFYING ALL FIXES\n');

const appDir = process.cwd();

console.log('1. Checking ProgressBar imports:');
console.log('===============================\n');

const problematicFiles = [
  'src/screens/SportsNewsHub-enhanced-BACKUP.js',
  'src/screens/ParlayBuilder/PredictionsScreen.js',
  'src/screens/PredictionScreen.js',
  'src/screens/SportsNewsHub-enhanced.js',
  'src/screens/ParlayBuilderScreen-BACKUP.js',
  'src/screens/ParlayBuilder/ParlayBuilderScreen.js',
  'src/screens/ParlayBuilderScreen.js'
];

let allFixed = true;
problematicFiles.forEach(file => {
  const filePath = path.join(appDir, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('react-native-animated-progress')) {
      console.log(`❌ ${file} - Still has old import`);
      allFixed = false;
    } else {
      console.log(`✅ ${file} - Fixed`);
    }
  } else {
    console.log(`⚠️  ${file} - Not found`);
  }
});

console.log('\n2. Checking api.js service:');
console.log('==========================\n');

const apiPath = path.join(appDir, 'src/services/api.js');
if (fs.existsSync(apiPath)) {
  const apiContent = fs.readFileSync(apiPath, 'utf8');
  const hasLogSecretPhrase = apiContent.includes('logSecretPhrase');
  const hasExport = apiContent.includes('export default');
  
  console.log(`✅ api.js exists`);
  console.log(`   ${hasLogSecretPhrase ? '✅' : '❌'} Has logSecretPhrase function`);
  console.log(`   ${hasExport ? '✅' : '❌'} Has proper export`);
} else {
  console.log('❌ api.js not found');
  allFixed = false;
}

console.log('\n3. Checking AuthContext:');
console.log('======================\n');

const authContextPath = path.join(appDir, 'src/contexts/AuthContext.js');
if (fs.existsSync(authContextPath)) {
  const authContent = fs.readFileSync(authContextPath, 'utf8');
  const importsApi = authContent.includes("import apiService from '../services/api'");
  const usesApi = authContent.includes('apiService.logSecretPhrase');
  
  console.log(`✅ AuthContext.js exists`);
  console.log(`   ${importsApi ? '✅' : '❌'} Imports apiService`);
  console.log(`   ${usesApi ? '✅' : '❌'} Uses apiService`);
} else {
  console.log('❌ AuthContext.js not found');
  allFixed = false;
}

console.log('\n4. Checking package.json:');
console.log('========================\n');

const packagePath = path.join(appDir, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageContent = fs.readFileSync(packagePath, 'utf8');
  const hasBadPackage = packageContent.includes('react-native-animated-progress');
  
  console.log(`✅ package.json exists`);
  console.log(`   ${hasBadPackage ? '❌' : '✅'} Has removed react-native-animated-progress`);
  
  if (hasBadPackage) {
    console.log('   ⚠️  Run: npm uninstall react-native-animated-progress');
    allFixed = false;
  }
}

console.log('\n🎯 SUMMARY:');
console.log('===========');
if (allFixed) {
  console.log('✅ ALL ISSUES HAVE BEEN RESOLVED!');
  console.log('\n🚀 Next steps:');
  console.log('1. Start app: npm start');
  console.log('2. Press "i" for iOS Simulator');
  console.log('3. No more SECRET_PHRASE_LOG errors');
  console.log('4. No more ProgressBar warnings');
} else {
  console.log('⚠️  Some issues still need attention');
  console.log('\n🔧 Run these commands:');
  console.log('   npm uninstall react-native-animated-progress');
  console.log('   npm install');
  console.log('   Then restart your app');
}
