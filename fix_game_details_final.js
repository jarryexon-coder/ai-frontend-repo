const fs = require('fs');

console.log('🔧 Fixing final GameDetailsScreen.js issue...');

const filePath = 'src/screens/GameDetailsScreen.js';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');

// Line 716: teamColorDot for away team (we fixed home but missed away)
if (lines[715] && lines[715].includes('teamColorDot') && lines[715].includes('awayTeam')) {
  console.log(`Found line 716: ${lines[715].trim().substring(0, 80)}...`);
  
  // Replace with wrapped version
  lines[715] = lines[715].replace(
    /<View style=\{\[styles\.teamColorDot, \{ backgroundColor: game\?\.awayTeam\?\.color \|\| '#1D428A' \}\]\} \/>/,
    `<View style={styles.teamColorDotContainer}>
      <View style={[
        styles.teamColorDot,
        { 
          backgroundColor: game?.awayTeam?.color || '#1D428A',
          borderWidth: 2,
          borderColor: 'white'
        }
      ]} />
    </View>`
  );
  
  console.log('✅ Fixed line 716: away teamColorDot');
}

// Also check if we have the teamColorDotContainer style
if (!content.includes('teamColorDotContainer:')) {
  console.log('⚠️ Adding missing teamColorDotContainer style...');
  
  // Find StyleSheet.create
  const styleSheetIndex = content.indexOf('const styles = StyleSheet.create');
  if (styleSheetIndex !== -1) {
    const insertIndex = content.indexOf('{', styleSheetIndex) + 1;
    const containerStyle = `
  teamColorDotContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },`;
    
    content = content.slice(0, insertIndex) + containerStyle + content.slice(insertIndex);
    lines = content.split('\n'); // Update lines
  }
}

// Write the file
fs.writeFileSync(`${filePath}.backup_final_${Date.now()}`, fs.readFileSync(filePath, 'utf8'));
fs.writeFileSync(filePath, lines.join('\n'));

console.log('✅ Fixed GameDetailsScreen.js');
