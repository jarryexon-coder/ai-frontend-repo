const fs = require('fs');
const path = require('path');

console.log('🔧 Manual key fix for critical files...');

// List of critical files that need fixing
const criticalFiles = [
  'src/screens/HomeScreen-enhanced-v2.js',
  'src/screens/DailyPicksScreen-enhanced.js',
  'src/screens/SportsNewsHub-enhanced.js',
  'src/screens/LiveGamesScreen-enhanced.js'
];

criticalFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  
  console.log(`\n📄 Fixing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  let changes = 0;
  
  // Fix common patterns manually
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Pattern 1: .map(renderFunction) without keys
    if (line.includes('.map(') && line.includes('render') && line.includes(')') && !line.includes('key=')) {
      console.log(`  Line ${i+1}: Found .map(renderFunction) without keys`);
      
      // Example: {games.map(game => renderGameCard(game))}
      if (line.includes('renderGameCard')) {
        lines[i] = line.replace(
          /\.map\(([^)]+)\)/,
          `.map(($1, index) => renderGameCard($1, index))`
        );
        changes++;
      }
      // Example: {liveGames.map(renderEnhancedGameCard)}
      else if (line.includes('renderEnhancedGameCard')) {
        lines[i] = line.replace(
          /\.map\(([^)]+)\)/,
          `.map(($1, index) => renderEnhancedGameCard($1, index))`
        );
        changes++;
      }
    }
    
    // Pattern 2: Direct .map() with arrow function but no keys
    if (line.includes('.map(') && line.includes('=>') && line.includes('<') && !line.includes('key=')) {
      console.log(`  Line ${i+1}: Found .map() without key prop`);
      
      // Look ahead to find the opening tag
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].includes('<View') || lines[j].includes('<Text') || lines[j].includes('<TouchableOpacity')) {
          if (!lines[j].includes('key=')) {
            // Add a key attribute
            lines[j] = lines[j].replace(
              /(<[A-Z][a-zA-Z]*)/,
              `$1 key={\`item-\${index}\`}`
            );
            changes++;
            break;
          }
        }
      }
    }
  }
  
  if (changes > 0) {
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`  ✅ Applied ${changes} fixes`);
  } else {
    console.log(`  ✅ No fixes needed`);
  }
});

console.log('\n🎯 Done! Clear cache and restart: npx expo start --clear');
