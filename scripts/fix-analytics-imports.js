// scripts/fix-analytics-imports.js
const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/screens/ParlayBuilderScreen.js',
  'src/screens/SportsNewsHub-enhanced.js',
  'src/screens/PredictionsScreen.js',
  'src/screens/AnalyticsScreen-enhanced.js',
  'src/screens/EditorUpdatesScreen.js',
  // Add all other screens with analytics
];

filesToUpdate.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove old Firebase imports
      content = content.replace(/import\s+firebase.*from\s+['"]firebase\/app['"];?\n?/g, '');
      content = content.replace(/import\s+.*from\s+['"]firebase\/analytics['"];?\n?/g, '');
      
      // Add new import at the top with other hooks
      const hookImportMatch = content.match(/import\s+{[^}]*}\s+from\s+['"]\.\.\/hooks\/[^'"]+['"];?\n?/);
      if (hookImportMatch) {
        // Add after existing hook imports
        content = content.replace(
          hookImportMatch[0],
          `${hookImportMatch[0]}import { useAnalytics } from '../hooks/useAnalytics';\n`
        );
      } else {
        // Add near the top after React imports
        const reactImportMatch = content.match(/import\s+React[^;]+;?\n?/);
        if (reactImportMatch) {
          content = content.replace(
            reactImportMatch[0],
            `${reactImportMatch[0]}import { useAnalytics } from '../hooks/useAnalytics';\n`
          );
        }
      }
      
      // Replace logAnalyticsEvent function with hook usage
      if (content.includes('logAnalyticsEvent')) {
        // Remove the old function
        const functionRegex = /const\s+logAnalyticsEvent\s*=\s*async\s*\([^)]*\)\s*=>\s*{[^}]*}/gs;
        content = content.replace(functionRegex, '');
        
        // Remove standalone function definitions
        const funcRegex = /async\s+function\s+logAnalyticsEvent[^{]*{[^}]*}/gs;
        content = content.replace(funcRegex, '');
        
        // Update component to use hook
        const componentRegex = /export\s+default\s+function\s+(\w+)/;
        const match = content.match(componentRegex);
        if (match) {
          const componentName = match[1];
          const componentStart = content.indexOf(`export default function ${componentName}`);
          
          if (componentStart !== -1) {
            // Find the opening brace of the function
            const braceIndex = content.indexOf('{', componentStart);
            if (braceIndex !== -1) {
              // Insert hook usage right after opening brace
              content = content.slice(0, braceIndex + 1) + 
                `\n  const { logEvent, logNavigation, logSecretPhrase } = useAnalytics();\n` +
                content.slice(braceIndex + 1);
            }
          }
        }
        
        // Replace all logAnalyticsEvent calls with logEvent
        content = content.replace(/logAnalyticsEvent\(/g, 'logEvent(');
      }
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
});

console.log('🎉 All files updated successfully!');
