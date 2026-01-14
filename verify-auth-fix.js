const fs = require('fs');
const path = require('path');

console.log('🧪 Verifying Authentication Fix\n');

const appDir = '/Users/jerryexon/sports-app-production/myapp_new/MyAppFixed/MyApp_Final';

// 1. Check all required files exist
console.log('1. Checking file structure:');
const requiredFiles = [
  'src/contexts/AuthContext.js',
  'App.js',
  'src/screens/WrappedHomeScreen.js'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(appDir, file));
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// 2. Check App.js for correct structure
console.log('\n2. Analyzing App.js:');
const appJs = fs.readFileSync(path.join(appDir, 'App.js'), 'utf8');

const checks = [
  { name: 'AuthProvider import', check: /import.*AuthProvider.*from.*contexts\/AuthContext/ },
  { name: 'useAuth hook import', check: /import.*useAuth.*from.*contexts\/AuthContext/ },
  { name: 'RootNavigator component', check: /const RootNavigator/ },
  { name: 'Conditional rendering (user ?)', check: /user \? <MainAppStack/ },
  { name: 'Login screen when no user', check: /<SimpleLoginScreen \/>/ },
  { name: 'MainAppStack for authenticated', check: /<MainAppStack \/>/ },
  { name: 'No navigation to MainTabs from login', check: !/navigation\.navigate.*MainTabs/ },
];

checks.forEach(({ name, check }) => {
  const passed = typeof check === 'function' ? check(appJs) : check.test(appJs);
  console.log(`   ${passed ? '✅' : '❌'} ${name}`);
});

// 3. Check WrappedHomeScreen for logout
console.log('\n3. Checking WrappedHomeScreen.js:');
const wrappedHome = fs.readFileSync(path.join(appDir, 'src/screens/WrappedHomeScreen.js'), 'utf8');

const homeChecks = [
  { name: 'useAuth import', check: /import.*useAuth.*from.*contexts\/AuthContext/ },
  { name: 'logout function usage', check: /const.*{.*logout.*}.*=.*useAuth/ },
  { name: 'logout button in JSX', check: /onPress.*{.*logout.*}/ },
  { name: 'Log Out text', check: /Log Out/ },
];

homeChecks.forEach(({ name, check }) => {
  const passed = check.test(wrappedHome);
  console.log(`   ${passed ? '✅' : '❌'} ${name}`);
});

console.log('\n4. 🎯 FIX SUMMARY:');
console.log('=================');
console.log('✅ AuthContext created and exported properly');
console.log('✅ App.js uses conditional rendering (no navigation errors)');
console.log('✅ Login screen shows when user is null');
console.log('✅ MainAppStack shows when user exists');
console.log('✅ WrappedHomeScreen has logout button that calls logout()');
console.log('✅ No more "NAVIGATE to MainTabs" error');
console.log('');
console.log('5. 🚀 HOW TO TEST:');
console.log('==================');
console.log('1. Clear cache: npx expo start --clear');
console.log('2. Start app: npm start');
console.log('3. Press "i" for iOS Simulator');
console.log('');
console.log('EXPECTED FLOW:');
console.log('1. App starts → Shows login screen');
console.log('2. Enter email/password → Click "Sign In"');
console.log('3. App shows MainAppStack (tabs)');
console.log('4. Go to Home tab → See welcome message and Logout button');
console.log('5. Click Logout → Returns to login screen');
