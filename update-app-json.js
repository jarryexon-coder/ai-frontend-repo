const fs = require('fs');
const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));

// Add API configuration to extra section
appJson.expo.extra = {
  ...appJson.expo.extra,
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-backend.com'
    : 'https://pleasing-determination-production.up.railway.app',
  apiBaseUrl: process.env.NODE_ENV === 'production'
    ? 'https://your-production-backend.com/api'
    : 'https://pleasing-determination-production.up.railway.app/api',
  environment: process.env.NODE_ENV || 'development'
};

fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2));
console.log('✅ Updated app.json with API configuration');
