const fs = require('fs');

const filePath = 'src/screens/ParlayBuilder/PredictionsScreen.js';
let content = fs.readFileSync(filePath, 'utf8');

// Fix inline backgrounds by adding wrapper containers
content = content.replace(
  /<View style=\{\[styles\.playerImagePlaceholder, \{ backgroundColor: sportColor \+ '20' \}\]\}>/g,
  `<View style={styles.playerImagePlaceholderContainer}>
    <View style={[
      styles.playerImagePlaceholder,
      { 
        backgroundColor: sportColor + '20',
        borderWidth: 2,
        borderColor: 'white'
      }
    ]}>`
);

content = content.replace(
  /<View style=\{\[styles\.teamBadge, \{ backgroundColor: sportColor \+ '15' \}\]\}>/g,
  `<View style={styles.teamBadgeContainer}>
    <View style={[
      styles.teamBadge,
      { 
        backgroundColor: sportColor + '15',
        borderWidth: 1,
        borderColor: sportColor + '30'
      }
    ]}>`
);

content = content.replace(
  /<View style=\{\[styles\.confidenceBadge, \{ backgroundColor: confidenceColor \}\]\}>/g,
  `<View style={styles.confidenceBadgeContainer}>
    <View style={[
      styles.confidenceBadge,
      { 
        backgroundColor: confidenceColor,
        borderWidth: 1,
        borderColor: confidenceColor.replace(/[^,]+(?=\))/, '0.3)')
      }
    ]}>`
);

content = content.replace(
  /<View style=\{\[styles\.modelIcon, \{ backgroundColor: '#8b5cf620' \}\]\}>/g,
  `<View style={styles.modelIconContainer}>
    <View style={[
      styles.modelIcon,
      { 
        backgroundColor: '#8b5cf620',
        borderWidth: 2,
        borderColor: 'white'
      }
    ]}>`
);

content = content.replace(
  /<View style=\{\[styles\.modelIcon, \{ backgroundColor: '#10b98120' \}\]\}>/g,
  `<View style={styles.modelIconContainer}>
    <View style={[
      styles.modelIcon,
      { 
        backgroundColor: '#10b98120',
        borderWidth: 2,
        borderColor: 'white'
      }
    ]}>`
);

content = content.replace(
  /<View style=\{\[styles\.modelIcon, \{ backgroundColor: '#f59e0b20' \}\]\}>/g,
  `<View style={styles.modelIconContainer}>
    <View style={[
      styles.modelIcon,
      { 
        backgroundColor: '#f59e0b20',
        borderWidth: 2,
        borderColor: 'white'
      }
    ]}>`
);

// Fix closing tags
content = content.replace(/<\/View>\s*<\/View>\s*<\/View>/g, '</View></View></View>');

// Add container styles
const containerStyles = `

  // Container styles for shadow optimization
  playerImagePlaceholderContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  teamBadgeContainer: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  confidenceBadgeContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  modelIconContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
`;

// Find the StyleSheet.create section and add container styles
const styleSheetIndex = content.indexOf('const styles = StyleSheet.create');
if (styleSheetIndex !== -1) {
  const insertIndex = content.indexOf('{', styleSheetIndex) + 1;
  content = content.slice(0, insertIndex) + containerStyles + content.slice(insertIndex);
}

// Backup and write
fs.writeFileSync(`${filePath}.backup_${Date.now()}`, content);
fs.writeFileSync(filePath, content);

console.log(`✅ Fixed PredictionsScreen.js`);
console.log(`Added 4 container styles for shadow optimization`);
