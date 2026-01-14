const fs = require('fs');
const path = require('path');

// More specific patterns to look for
const patternsToFix = {
  // Pattern 1: Inline styles with backgroundColor in shadowed elements
  inlineBackgroundWithShadow: /style=\{.*?backgroundColor.*?\}/gs,
  
  // Pattern 2: Shadow properties without explicit background
  shadowWithoutBackground: /(shadowColor|shadowOffset|shadowOpacity|shadowRadius|elevation).*?(?!backgroundColor)/g,
  
  // Pattern 3: Transparent background with shadows
  transparentWithShadow: /backgroundColor:.*?(?:transparent|rgba\(|'transparent').*?(?:shadow|elevation)/gi,
  
  // Pattern 4: Complex shadows (performance heavy)
  complexShadows: /shadowRadius:\s*(?:1[0-9]|[2-9]\d+)/g,
  
  // Pattern 5: Missing overflow hidden
  missingOverflowHidden: /\}(?:\s*\/\/[^\n]*)?\n\s*(?:\/\/[^\n]*\n\s*)?[a-zA-Z]:/g
};

function analyzeFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { exists: false, issues: [] };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];
  
  // Check each pattern
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();
    
    // Check for inline styles with backgroundColor that might have shadows
    if (trimmed.includes('style={') && trimmed.includes('backgroundColor:')) {
      // Look ahead to see if there's a shadow property nearby
      const nextLines = lines.slice(index, Math.min(index + 5, lines.length));
      const hasShadowNearby = nextLines.some(l => 
        l.includes('shadow') || l.includes('elevation')
      );
      
      if (hasShadowNearby) {
        issues.push({
          type: 'INLINE_BACKGROUND_NEAR_SHADOW',
          line: lineNum,
          severity: 'HIGH',
          description: 'Inline backgroundColor near shadow properties',
          snippet: trimmed.substring(0, 100) + '...',
          fix: 'Wrap in container or move shadow to container'
        });
      }
    }
    
    // Check for style objects with shadows but missing background
    if (trimmed.includes('shadow') || trimmed.includes('elevation')) {
      if (!trimmed.includes('backgroundColor') && !trimmed.includes('transparent')) {
        // Check if this is in a style definition
        if (trimmed.match(/[a-zA-Z]+:\s*\{/) || trimmed.includes('StyleSheet.create')) {
          // Look for backgroundColor in the next 10 lines
          const styleBlock = getStyleBlock(lines, index);
          if (styleBlock && !hasBackgroundInBlock(styleBlock)) {
            issues.push({
              type: 'SHADOW_WITHOUT_BACKGROUND',
              line: lineNum,
              severity: 'HIGH',
              description: 'Shadow/elevation without backgroundColor in style object',
              snippet: trimmed.substring(0, 100) + '...',
              fix: 'Add backgroundColor to style object'
            });
          }
        }
      }
    }
    
    // Check for transparent backgrounds with shadows
    if ((trimmed.includes('transparent') || trimmed.includes('rgba(')) && 
        (trimmed.includes('shadow') || trimmed.includes('elevation'))) {
      issues.push({
        type: 'TRANSPARENT_WITH_SHADOW',
        line: lineNum,
        severity: 'HIGH',
        description: 'Transparent background with shadow/elevation',
        snippet: trimmed.substring(0, 100) + '...',
        fix: 'Change to solid color or remove shadow'
      });
    }
  });
  
  return { exists: true, issues };
}

function getStyleBlock(lines, startIndex) {
  let braceCount = 0;
  let inBlock = false;
  const block = [];
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('{') && !inBlock) {
      inBlock = true;
      braceCount++;
      block.push(line);
    } else if (inBlock) {
      block.push(line);
      if (line.includes('{')) braceCount++;
      if (line.includes('}')) braceCount--;
      if (braceCount === 0) {
        return block.join('\n');
      }
    }
  }
  return null;
}

function hasBackgroundInBlock(block) {
  return block.includes('backgroundColor') || 
         block.includes('background-color') ||
         block.includes('bgColor');
}

function fixInlineBackgroundIssues(filePath) {
  console.log(`\n🔧 Fixing inline background issues in: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let fixedLines = [];
  let changes = 0;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Pattern: <View style={[styles.something, { backgroundColor: dynamicColor }]}>
    if (line.includes('style={[') && line.includes('backgroundColor:')) {
      const viewMatch = line.match(/<(\w+)\s+style=\{\[([^\]]+)\]/);
      if (viewMatch) {
        const component = viewMatch[1];
        const styleClasses = viewMatch[2];
        
        // Extract the backgroundColor value
        const bgMatch = line.match(/backgroundColor:\s*([^,}]+)/);
        if (bgMatch) {
          const bgValue = bgMatch[1].trim();
          
          // Create a wrapper pattern
          const newLine = line.replace(
            /style=\{\[([^\]]+)\]/,
            `style={[$1]`
          );
          
          // We'll need to wrap this component - mark for manual fix
          console.log(`⚠️  Line ${i+1}: Manual fix needed for inline background`);
          console.log(`   Component: <${component}> with dynamic background`);
          console.log(`   Background: ${bgValue}`);
          console.log(`   Wrap this component in a container with solid background`);
          
          // Keep the original line for now
          fixedLines.push(line);
          continue;
        }
      }
    }
    
    fixedLines.push(line);
  }
  
  // Write the file if changes were made
  if (changes > 0) {
    fs.writeFileSync(`${filePath}.backup_${Date.now()}`, content);
    fs.writeFileSync(filePath, fixedLines.join('\n'));
    console.log(`✅ Applied ${changes} fixes`);
  }
  
  return changes;
}

function fixStyleSheetIssues(filePath) {
  console.log(`\n🎨 Fixing StyleSheet issues in: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let fixedLines = [];
  let changes = 0;
  let inStyleSheet = false;
  let currentStyle = '';
  let styleLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Detect StyleSheet.create or const styles
    if (line.includes('StyleSheet.create') || (line.includes('const styles') && line.includes('='))) {
      inStyleSheet = true;
    }
    
    if (inStyleSheet) {
      // Start of a style definition
      if (line.trim().match(/^[a-zA-Z]+:\s*\{/)) {
        currentStyle = line.trim().split(':')[0];
        styleLines = [line];
        
        // Look for the end of this style
        let j = i;
        let braceCount = 0;
        while (j < lines.length) {
          const currentLine = lines[j];
          styleLines.push(currentLine);
          if (currentLine.includes('{')) braceCount++;
          if (currentLine.includes('}')) braceCount--;
          if (braceCount === 0) break;
          j++;
        }
        
        // Process this style block
        const processedBlock = processStyleBlock(styleLines);
        if (processedBlock.changed) {
          changes += processedBlock.changes;
          fixedLines = fixedLines.concat(processedBlock.lines);
          i = j; // Skip the lines we just processed
        } else {
          fixedLines.push(line);
        }
        continue;
      }
    }
    
    fixedLines.push(line);
  }
  
  // Write the file
  if (changes > 0) {
    fs.writeFileSync(`${filePath}.backup_${Date.now()}`, content);
    fs.writeFileSync(filePath, fixedLines.join('\n'));
    console.log(`✅ Applied ${changes} StyleSheet fixes`);
  }
  
  return changes;
}

function processStyleBlock(block) {
  const blockStr = block.join('\n');
  let changed = false;
  let changes = 0;
  const lines = block;
  
  // Check if this style has shadow properties
  const hasShadow = blockStr.includes('shadow') || blockStr.includes('elevation');
  const hasBackground = blockStr.includes('backgroundColor');
  
  if (hasShadow && !hasBackground) {
    // Add backgroundColor to this style
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('{') && !lines[i].includes('backgroundColor')) {
        // Insert backgroundColor after the opening brace
        const indent = lines[i].match(/^(\s*)/)[1];
        lines[i] = lines[i] + `\n${indent}  backgroundColor: 'white',`;
        changed = true;
        changes++;
        break;
      }
    }
  }
  
  // Look for transparent backgrounds with shadows
  if (blockStr.includes('transparent') && hasShadow) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('transparent')) {
        lines[i] = lines[i].replace(/transparent/g, "'white'");
        changed = true;
        changes++;
      }
    }
  }
  
  return { changed, changes, lines };
}

// Main function
function fixAllIssues() {
  console.log('🔍 Analyzing files for shadow issues...\n');
  
  const files = [
    'src/screens/GameDetailsScreen.js',
    'src/screens/ParlayBuilder/PredictionsScreen.js',
    // Add other problematic files here
  ];
  
  let totalChanges = 0;
  
  files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📄 ${filePath}`);
      console.log(`${'='.repeat(80)}`);
      
      // Analyze the file
      const analysis = analyzeFile(filePath);
      
      if (analysis.issues.length > 0) {
        console.log(`Found ${analysis.issues.length} issues:`);
        analysis.issues.forEach(issue => {
          console.log(`\n${issue.severity === 'HIGH' ? '❌' : '⚠️'} ${issue.type}`);
          console.log(`   Line ${issue.line}: ${issue.description}`);
          console.log(`   Fix: ${issue.fix}`);
        });
        
        // Apply fixes
        const inlineChanges = fixInlineBackgroundIssues(filePath);
        const styleSheetChanges = fixStyleSheetIssues(filePath);
        totalChanges += inlineChanges + styleSheetChanges;
      } else {
        console.log('✅ No shadow issues found!');
      }
    } else {
      console.log(`❌ File not found: ${filePath}`);
    }
  });
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 SUMMARY');
  console.log(`${'='.repeat(80)}`);
  console.log(`Total files processed: ${files.length}`);
  console.log(`Total changes made: ${totalChanges}`);
  
  if (totalChanges > 0) {
    console.log('\n💡 Next steps:');
    console.log('1. Run your app and check for shadow warnings');
    console.log('2. Use the diagnostic script to verify fixes');
    console.log('3. For complex inline styles, consider refactoring to use wrapper components');
  }
}

// Run the fix
fixAllIssues();
