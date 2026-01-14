const fs = require('fs');
const path = require('path');

const filePath = 'src/screens/LiveGamesScreen-enhanced.js';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');

console.log(`🔧 Fixing ${filePath}`);

// Fix line 250: teamLogo for away team
if (lines[249] && lines[249].includes('teamLogo')) {
  lines[249] = lines[249].replace(
    /<View style=\{\[styles\.teamLogo, \{ backgroundColor: game\.awayColor \|\| '#1d428a' \}\]\} \/>/,
    `<View style={styles.teamLogoContainer}>
      <View style={[
        styles.teamLogo,
        { 
          backgroundColor: game.awayColor || '#1d428a',
          borderWidth: 2,
          borderColor: 'white'
        }
      ]} />
    </View>`
  );
  console.log('✅ Fixed line 250: away teamLogo');
}

// Fix line 283: teamLogo for home team
if (lines[282] && lines[282].includes('teamLogo')) {
  lines[282] = lines[282].replace(
    /<View style=\{\[styles\.teamLogo, \{ backgroundColor: game\.homeColor \|\| '#552583' \}\]\} \/>/,
    `<View style={styles.teamLogoContainer}>
      <View style={[
        styles.teamLogo,
        { 
          backgroundColor: game.homeColor || '#552583',
          borderWidth: 2,
          borderColor: 'white'
        }
      ]} />
    </View>`
  );
  console.log('✅ Fixed line 283: home teamLogo');
}

// Add container style to StyleSheet
const containerStyle = `

  // Container style for shadow optimization
  teamLogoContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
`;

// Find and insert container style
const styleSheetIndex = content.indexOf('const styles = StyleSheet.create');
if (styleSheetIndex !== -1) {
  const insertIndex = content.indexOf('{', styleSheetIndex) + 1;
  const newContent = content.slice(0, insertIndex) + containerStyle + content.slice(insertIndex);
  
  // Write with fixed lines
  const fixedContent = newContent.split('\n');
  if (lines[249]) fixedContent[249] = lines[249];
  if (lines[282]) fixedContent[282] = lines[282];
  
  // Backup and write
  fs.writeFileSync(`${filePath}.backup_${Date.now()}`, content);
  fs.writeFileSync(filePath, fixedContent.join('\n'));
  
  console.log('✅ Added container style to StyleSheet');
  console.log('✅ Applied 2 fixes to LiveGamesScreen');
} else {
  console.log('❌ Could not find StyleSheet in file');
}
