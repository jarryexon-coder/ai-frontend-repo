
const fs = require('fs');
const path = require('path');

// Common fixes for shadow issues
const fixes = {
  addBackground: (line) => {
    if (line.includes('shadow') || line.includes('elevation')) {
      if (!line.includes('backgroundColor') && !line.includes('transparent')) {
        // Check if this is a style line
        if (line.trim().endsWith(',') || line.includes(':')) {
          const indent = line.match(/^\s*/)[0];
          return `${indent}backgroundColor: 'white',
${line}`;
        }
      }
    }
    return line;
  },
  
  replaceTransparent: (line) => {
    if (line.includes('transparent') && (line.includes('shadow') || line.includes('elevation'))) {
      return line.replace(/transparent/g, "'white'");
    }
    return line;
  },
  
  reduceShadowRadius: (line) => {
    const match = line.match(/shadowRadius:\s*(\d+)/);
    if (match && parseInt(match[1]) > 8) {
      return line.replace(/shadowRadius:\s*\d+/, `shadowRadius: ${Math.min(parseInt(match[1]), 6)}`);
    }
    return line;
  },
  
  reduceElevation: (line) => {
    const match = line.match(/elevation:\s*(\d+)/);
    if (match && parseInt(match[1]) > 6) {
      return line.replace(/elevation:\s*\d+/, `elevation: ${Math.min(parseInt(match[1]), 4)}`);
    }
    return line;
  }
};

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }
  
  console.log(`🔧 Fixing: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const fixedLines = [];
  let changes = 0;
  
  lines.forEach(line => {
    let fixedLine = line;
    
    // Apply fixes in order
    fixedLine = fixes.replaceTransparent(fixedLine);
    fixedLine = fixes.reduceShadowRadius(fixedLine);
    fixedLine = fixes.reduceElevation(fixedLine);
    fixedLine = fixes.addBackground(fixedLine);
    
    if (fixedLine !== line) {
      changes++;
      console.log(`   ✓ Line ${lines.indexOf(line) + 1}: Applied fix`);
    }
    
    fixedLines.push(fixedLine);
  });
  
  if (changes > 0) {
    // Backup original
    const backupPath = `${filePath}.backup_${Date.now()}`;
    fs.writeFileSync(backupPath, content);
    console.log(`   📦 Backup saved to: ${backupPath}`);
    
    // Write fixed file
    fs.writeFileSync(filePath, fixedLines.join('\n'));
    console.log(`   ✅ Applied ${changes} fixes to ${filePath}`);
  } else {
    console.log(`   ⏭️  No fixes needed for ${filePath}`);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node fix_shadows.js <file1> [file2] ...');
  console.log('       node fix_shadows.js --group=premium_access');
  process.exit(1);
}

if (args[0].startsWith('--group=')) {
  const group = args[0].split('=')[1];
  const groups = {
    premium_access: [
      'src/screens/NFLScreen-enhanced.js',
      'src/screens/PlayerStatsScreen-enhanced.js',
      'src/screens/PlayerProfileScreen-enhanced.js',
      'src/screens/GameDetailsScreen.js'
    ],
    daily_locks: [
      'src/screens/ParlayBuilder/ParlayBuilderScreen.js',
      'src/screens/ParlayBuilder/PredictionsScreen.js',
      'src/screens/FantasyScreen-enhanced.js',
      'src/screens/DailyPicksScreen-enhanced.js',
      'src/screens/SportsNewsHub-enhanced.js',
      'src/screens/AnalyticsScreen-enhanced.js'
    ]
  };
  
  if (groups[group]) {
    groups[group].forEach(fixFile);
  } else {
    console.log(`❌ Unknown group: ${group}`);
  }
} else {
  args.forEach(fixFile);
}
