const fs = require('fs');
const path = require('path');

// Define your screen groups
const screenGroups = {
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
  ],
  other_screens: [
    'src/screens/LoginScreen-enhanced.js',
    'src/screens/SettingsScreen.js',
    'src/screens/EditorUpdatesScreen.js',
    'src/screens/HomeScreen-enhanced-v2.js',
    'src/screens/LiveGamesScreen-enhanced.js',
    'src/screens/NHLScreen-enhanced.js',
    'src/screens/PremiumAccessPaywall.js',
    'src/screens/BettingScreen-enhanced.js'
  ]
};

// Statistics tracking
const stats = {
  totalIssues: 0,
  filesScanned: 0,
  filesWithIssues: 0,
  byGroup: {
    premium_access: { issues: 0, files: 0 },
    daily_locks: { issues: 0, files: 0 },
    other_screens: { issues: 0, files: 0 }
  }
};

// Helper function to find which group a file belongs to
function getFileGroup(filePath) {
  for (const [group, files] of Object.entries(screenGroups)) {
    if (files.includes(filePath)) {
      return group;
    }
  }
  // Check if file exists in nested groups
  for (const [group, files] of Object.entries(screenGroups)) {
    const found = files.find(f => filePath.endsWith(f) || f.includes(path.basename(filePath)));
    if (found) return group;
  }
  return 'unknown';
}

function scanFileForShadowIssues(filePath, group) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return { issues: [], fileExists: false };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];
  
  let inStyleSheet = false;
  let currentStyleName = '';
  let styleStartLine = 0;
  let styleLines = [];
  
  // Track shadow usage patterns
  let shadowLineNumbers = [];
  let backgroundLineNumbers = [];
  let elevationLineNumbers = [];
  
  // First pass: Collect all shadow and background declarations
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    // Track StyleSheet.create sections
    if (trimmedLine.includes('StyleSheet.create') || trimmedLine.includes('const styles')) {
      inStyleSheet = true;
    }
    
    if (inStyleSheet) {
      // Look for style name
      if (trimmedLine.endsWith(':{') || trimmedLine.includes(':{')) {
        currentStyleName = trimmedLine.split(':')[0].trim();
        styleStartLine = lineNum;
        styleLines = [];
      }
      
      // Collect style properties
      if (currentStyleName && trimmedLine) {
        styleLines.push({ lineNum, text: trimmedLine });
      }
      
      // End of style definition
      if (trimmedLine === '},' || trimmedLine === '}') {
        // Analyze this style
        analyzeStyle(currentStyleName, styleStartLine, styleLines, issues, filePath);
        currentStyleName = '';
        styleLines = [];
      }
    }
    
    // Also check inline styles
    if (line.includes('shadow') || line.includes('elevation') || line.includes('backgroundColor')) {
      if (!inStyleSheet && line.includes('style=')) {
        issues.push({
          type: 'INLINE_STYLE',
          line: lineNum,
          message: 'Inline style with shadow/background properties',
          code: line.trim().substring(0, 100) + '...',
          severity: 'MEDIUM'
        });
      }
    }
  });
  
  // Analyze collected style definitions
  function analyzeStyle(name, startLine, lines, issues) {
    const styleText = lines.map(l => l.text).join(' ');
    const hasShadow = lines.some(l => l.text.includes('shadow') && !l.text.includes('shadowColor'));
    const hasElevation = lines.some(l => l.text.includes('elevation'));
    const hasBackground = lines.some(l => l.text.includes('backgroundColor'));
    const hasTransparentBg = lines.some(l => l.text.includes('transparent') || l.text.includes('rgba'));
    
    // Check for common issues
    if ((hasShadow || hasElevation) && !hasBackground) {
      issues.push({
        type: 'MISSING_BACKGROUND',
        line: startLine,
        style: name,
        message: 'Shadow/elevation without explicit backgroundColor',
        severity: 'HIGH'
      });
    }
    
    if ((hasShadow || hasElevation) && hasTransparentBg) {
      issues.push({
        type: 'TRANSPARENT_BACKGROUND',
        line: startLine,
        style: name,
        message: 'Shadow with transparent/translucent background',
        severity: 'HIGH'
      });
    }
    
    // Check for shadow properties
    lines.forEach(({ lineNum, text }) => {
      // Shadow properties without radius/opacity
      if (text.includes('shadowOffset') && !text.includes('shadowRadius') && !text.includes('shadowOpacity')) {
        issues.push({
          type: 'INCOMPLETE_SHADOW',
          line: lineNum,
          style: name,
          message: 'shadowOffset without shadowRadius or shadowOpacity',
          severity: 'MEDIUM'
        });
      }
      
      // Shadow radius without offset
      if ((text.includes('shadowRadius') || text.includes('shadowOpacity')) && !text.includes('shadowOffset')) {
        issues.push({
          type: 'INCOMPLETE_SHADOW',
          line: lineNum,
          style: name,
          message: 'shadowRadius/shadowOpacity without shadowOffset',
          severity: 'MEDIUM'
        });
      }
      
      // Complex shadows (high performance cost)
      if (text.includes('shadowRadius') && text.includes(':')) {
        const match = text.match(/shadowRadius:\s*(\d+)/);
        if (match && parseInt(match[1]) > 8) {
          issues.push({
            type: 'COMPLEX_SHADOW',
            line: lineNum,
            style: name,
            message: `Complex shadow (radius: ${match[1]}). Consider reducing for better performance.`,
            severity: 'LOW'
          });
        }
      }
      
      // High elevation (Android)
      if (text.includes('elevation') && text.includes(':')) {
        const match = text.match(/elevation:\s*(\d+)/);
        if (match && parseInt(match[1]) > 6) {
          issues.push({
            type: 'HIGH_ELEVATION',
            line: lineNum,
            style: name,
            message: `High elevation (${match[1]}). Consider reducing for Android performance.`,
            severity: 'LOW'
          });
        }
      }
    });
  }
  
  return { issues, fileExists: true };
}

function generateReport(filePath, issues, group) {
  if (issues.length === 0) {
    return;
  }
  
  stats.filesWithIssues++;
  stats.totalIssues += issues.length;
  stats.byGroup[group].issues += issues.length;
  stats.byGroup[group].files++;
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔍 ${filePath}`);
  console.log(`📊 Group: ${group.toUpperCase().replace('_', ' ')}`);
  console.log(`${'='.repeat(80)}`);
  
  // Group issues by severity
  const bySeverity = {
    HIGH: [],
    MEDIUM: [],
    LOW: []
  };
  
  issues.forEach(issue => {
    bySeverity[issue.severity]?.push(issue);
  });
  
  // Display by severity
  ['HIGH', 'MEDIUM', 'LOW'].forEach(severity => {
    const severityIssues = bySeverity[severity];
    if (severityIssues.length > 0) {
      console.log(`\n${severity} ISSUES (${severityIssues.length}):`);
      severityIssues.forEach(issue => {
        const icon = severity === 'HIGH' ? '❌' : severity === 'MEDIUM' ? '⚠️' : 'ℹ️';
        console.log(`${icon} Line ${issue.line}: ${issue.type}`);
        console.log(`   ${issue.message}`);
        if (issue.style) {
          console.log(`   Style: ${issue.style}`);
        }
        if (issue.code) {
          console.log(`   Code: ${issue.code}`);
        }
      });
    }
  });
}

function generateSummary() {
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log(`${'='.repeat(80)}`);
  
  console.log(`\n📈 Overall Statistics:`);
  console.log(`   Total files scanned: ${stats.filesScanned}`);
  console.log(`   Files with issues: ${stats.filesWithIssues}`);
  console.log(`   Total issues found: ${stats.totalIssues}`);
  
  console.log(`\n🏷️  By Group:`);
  Object.entries(stats.byGroup).forEach(([group, data]) => {
    const percentage = stats.filesScanned > 0 ? ((data.files / stats.filesScanned) * 100).toFixed(1) : '0';
    console.log(`   ${group.toUpperCase().replace('_', ' ')}:`);
    console.log(`     Files: ${data.files} (${percentage}%)`);
    console.log(`     Issues: ${data.issues}`);
  });
  
  console.log(`\n💡 Recommendations:`);
  
  if (stats.byGroup.premium_access.issues > 10) {
    console.log(`   ⭐ Premium Access screens have ${stats.byGroup.premium_access.issues} issues - Focus here first!`);
  }
  
  if (stats.totalIssues > 50) {
    console.log(`   🚨 High number of shadow issues (${stats.totalIssues}). Consider:`);
    console.log(`     1. Using border instead of shadows where possible`);
    console.log(`     2. Implementing a ShadowWrapper component`);
    console.log(`     3. Reducing shadow complexity`);
  }
  
  if (stats.filesWithIssues > stats.filesScanned * 0.7) {
    console.log(`   📋 Many files affected (${stats.filesWithIssues}/${stats.filesScanned}).`);
    console.log(`      Consider running batch fixes.`);
  }
}

function generateFixCommands() {
  console.log(`\n${'='.repeat(80)}`);
  console.log('🔧 QUICK FIX COMMANDS');
  console.log(`${'='.repeat(80)}`);
  
  console.log(`\nFor each problematic file, run:`);
  console.log(`   node fix_shadows.js [filename]`);
  console.log(`\nExample:`);
  console.log(`   node fix_shadows.js src/screens/NFLScreen-enhanced.js`);
  
  console.log(`\nOr run batch fix for a group:`);
  Object.keys(screenGroups).forEach(group => {
    if (stats.byGroup[group].issues > 0) {
      console.log(`   node fix_shadows.js --group=${group}`);
    }
  });
}

// Main scanning function
function scanAllScreens() {
  console.log('🔍 Starting comprehensive shadow diagnostic scan...\n');
  
  // Combine all files
  const allFiles = [
    ...screenGroups.premium_access,
    ...screenGroups.daily_locks,
    ...screenGroups.other_screens
  ];
  
  allFiles.forEach(filePath => {
    const group = getFileGroup(filePath);
    stats.filesScanned++;
    stats.byGroup[group].files++;
    
    const { issues, fileExists } = scanFileForShadowIssues(filePath, group);
    
    if (fileExists && issues.length > 0) {
      generateReport(filePath, issues, group);
    } else if (!fileExists) {
      console.log(`❌ Skipping (not found): ${filePath}`);
    }
  });
  
  generateSummary();
  generateFixCommands();
  
  // Write results to file
  const report = {
    timestamp: new Date().toISOString(),
    stats,
    recommendations: getRecommendations()
  };
  
  fs.writeFileSync('shadow_diagnostic_report.json', JSON.stringify(report, null, 2));
  console.log(`\n📄 Full report saved to: shadow_diagnostic_report.json`);
}

function getRecommendations() {
  const recs = [];
  
  if (stats.totalIssues > 30) {
    recs.push({
      priority: 'HIGH',
      action: 'IMPLEMENT_SHADOW_WRAPPER',
      description: 'Create a reusable ShadowWrapper component to centralize shadow logic',
      files: ['src/components/ShadowWrapper.js']
    });
  }
  
  if (stats.byGroup.premium_access.issues > stats.byGroup.daily_locks.issues) {
    recs.push({
      priority: 'HIGH',
      action: 'FIX_PREMIUM_SCREENS_FIRST',
      description: 'Focus on Premium Access screens as they have the most issues',
      files: screenGroups.premium_access
    });
  }
  
  recs.push({
    priority: 'MEDIUM',
    action: 'ADD_BACKGROUND_COLORS',
    description: 'Add explicit backgroundColor to all shadowed elements',
    files: 'All files with shadow issues'
  });
  
  recs.push({
    priority: 'LOW',
    action: 'REDUCE_SHADOW_COMPLEXITY',
    description: 'Replace complex shadows with simpler borders where possible',
    files: 'Files with shadowRadius > 8'
  });
  
  return recs;
}

// Create a fix script template
function createFixScript() {
  const fixScript = `
const fs = require('fs');
const path = require('path');

// Common fixes for shadow issues
const fixes = {
  addBackground: (line) => {
    if (line.includes('shadow') || line.includes('elevation')) {
      if (!line.includes('backgroundColor') && !line.includes('transparent')) {
        // Check if this is a style line
        if (line.trim().endsWith(',') || line.includes(':')) {
          const indent = line.match(/^\\s*/)[0];
          return \`\${indent}backgroundColor: 'white',\n\${line}\`;
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
    const match = line.match(/shadowRadius:\\s*(\\d+)/);
    if (match && parseInt(match[1]) > 8) {
      return line.replace(/shadowRadius:\\s*\\d+/, \`shadowRadius: \${Math.min(parseInt(match[1]), 6)}\`);
    }
    return line;
  },
  
  reduceElevation: (line) => {
    const match = line.match(/elevation:\\s*(\\d+)/);
    if (match && parseInt(match[1]) > 6) {
      return line.replace(/elevation:\\s*\\d+/, \`elevation: \${Math.min(parseInt(match[1]), 4)}\`);
    }
    return line;
  }
};

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(\`❌ File not found: \${filePath}\`);
    return;
  }
  
  console.log(\`🔧 Fixing: \${filePath}\`);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\\n');
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
      console.log(\`   ✓ Line \${lines.indexOf(line) + 1}: Applied fix\`);
    }
    
    fixedLines.push(fixedLine);
  });
  
  if (changes > 0) {
    // Backup original
    const backupPath = \`\${filePath}.backup_\${Date.now()}\`;
    fs.writeFileSync(backupPath, content);
    console.log(\`   📦 Backup saved to: \${backupPath}\`);
    
    // Write fixed file
    fs.writeFileSync(filePath, fixedLines.join('\\n'));
    console.log(\`   ✅ Applied \${changes} fixes to \${filePath}\`);
  } else {
    console.log(\`   ⏭️  No fixes needed for \${filePath}\`);
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
    console.log(\`❌ Unknown group: \${group}\`);
  }
} else {
  args.forEach(fixFile);
}
`;
  
  fs.writeFileSync('fix_shadows.js', fixScript);
  console.log('\n🔧 Created fix script: fix_shadows.js');
}

// Run the diagnostic
try {
  scanAllScreens();
  createFixScript();
} catch (error) {
  console.error('Error during scan:', error.message);
  process.exit(1);
}
