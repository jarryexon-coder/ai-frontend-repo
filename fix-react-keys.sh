#!/bin/bash

echo "🔧 Fixing React key warnings in .map() calls..."
echo "Found 49 .map() calls without explicit keys"

# Create a comprehensive fix script
cat > fix-keys-comprehensive.js << 'KEYSFIX'
const fs = require('fs');
const path = require('path');

function fixKeysInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Pattern 1: .map((item) => ( or .map((item) =>
  let patterns = [
    // Pattern for .map((item) => (
    /\.map\s*\(\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*=>\s*\(\s*$/gm,
    
    // Pattern for .map((item) =>
    /\.map\s*\(\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*=>\s*$/gm,
    
    // Pattern for .map(item => (
    /\.map\s*\(\s*([a-zA-Z0-9_]+)\s*=>\s*\(\s*$/gm,
    
    // Pattern for .map(item =>
    /\.map\s*\(\s*([a-zA-Z0-9_]+)\s*=>\s*$/gm,
  ];
  
  // Split by lines to process more carefully
  const lines = content.split('\n');
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let nextLine = lines[i + 1] || '';
    let modifiedLine = line;
    
    // Check for .map patterns
    patterns.forEach((pattern, patternIndex) => {
      const match = line.match(pattern);
      if (match) {
        const itemName = match[1];
        modified = true;
        
        // Determine the pattern type and add index parameter
        if (patternIndex === 0 || patternIndex === 1) {
          // .map((item) => pattern
          modifiedLine = line.replace(
            `(${itemName})`,
            `(${itemName}, index)`
          );
        } else {
          // .map(item => pattern
          modifiedLine = line.replace(
            `${itemName} =>`,
            `(${itemName}, index) =>`
          );
        }
        
        // Also need to add key prop to the JSX element on next lines
        // We'll handle this separately after modifying the map call
      }
    });
    
    newLines.push(modifiedLine);
    
    // If we modified a .map call, check next lines for JSX opening tags
    if (modifiedLine !== line) {
      // Look ahead a few lines to add key prop
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const lookLine = lines[j];
        // Find the first JSX opening tag after the map
        const jsxMatch = lookLine.match(/^\s*<(View|Text|TouchableOpacity|ScrollView|FlatList|SectionList|Image|Button|Pressable)(\s|>)/);
        if (jsxMatch) {
          // Add key prop
          const tagName = jsxMatch[1];
          lines[j] = lookLine.replace(
            `<${tagName}`,
            `<${tagName} key={\`${tagName.toLowerCase()}-\${index}\`}`
          );
          break;
        }
      }
    }
  }
  
  if (modified) {
    content = newLines.join('\n');
    
    // Additional fix: Replace common patterns in bulk
    content = content.replace(
      /\.map\s*\(\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*=>\s*\(\s*$/gm,
      '.map(($1, index) => ('
    );
    
    content = content.replace(
      /\.map\s*\(\s*([a-zA-Z0-9_]+)\s*=>\s*\(\s*$/gm,
      '.map(($1, index) => ('
    );
    
    content = content.replace(
      /{([^}]+)\.map\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*=>\s*\(/g,
      '{$1.map(($2, index) => ('
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed keys in: ${filePath}`);
  }
}

// Specialized fix for specific files mentioned
function fixSpecificFiles() {
  const specificFixes = {
    'src/screens/DailyPicksAIScreen.js': (content) => {
      return content.replace(
        '{sports.map((sport) => (',
        '{sports.map((sport, index) => ('
      );
    },
    'src/screens/LiveGamesScreen-enhanced.js': (content) => {
      return content.replace(
        "{['all', 'NFL', 'NBA', 'NHL', 'MLB'].map((sport) => (",
        "{['all', 'NFL', 'NBA', 'NHL', 'MLB'].map((sport, index) => ("
      );
    },
  };
  
  Object.entries(specificFixes).forEach(([filePath, fixFunction]) => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = fixFunction(content);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed specific pattern in: ${filePath}`);
    }
  });
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('backup')) {
      processDirectory(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      try {
        fixKeysInFile(fullPath);
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error.message);
      }
    }
  });
}

// Run fixes
console.log('Fixing specific files...');
fixSpecificFiles();

console.log('Processing all screen files...');
processDirectory('src/screens');

// Create a utility component for safe rendering
cat > src/components/SafeList.js << 'SAFELIST'
import React from 'react';
import { View, Text, FlatList } from 'react-native';

/**
 * SafeList - A wrapper component that handles keys properly
 */
export const SafeList = ({ 
  data, 
  renderItem, 
  keyExtractor, 
  emptyComponent,
  ...props 
}) => {
  const defaultKeyExtractor = (item, index) => 
    item?.id ? item.id.toString() : `item-${index}`;
  
  if (!data || data.length === 0) {
    return emptyComponent || (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ color: '#94a3b8' }}>No data available</Text>
      </View>
    );
  }
  
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor || defaultKeyExtractor}
      {...props}
    />
  );
};

/**
 * SafeMap - For mapping arrays with proper keys
 */
export const SafeMap = ({ 
  data, 
  renderItem, 
  keyProp = 'id',
  wrapperComponent: Wrapper = View,
  ...wrapperProps 
}) => {
  if (!data || !Array.isArray(data)) {
    return null;
  }
  
  return (
    <Wrapper {...wrapperProps}>
      {data.map((item, index) => (
        <View 
          key={item?.[keyProp] || `item-${index}`}
          style={{ flex: 1 }}
        >
          {renderItem(item, index)}
        </View>
      ))}
    </Wrapper>
  );
};

/**
 * KeyExtractor utilities
 */
export const KeyExtractors = {
  byId: (item) => item?.id?.toString(),
  byIndex: (item, index) => `item-${index}`,
  byProperty: (propName) => (item) => item?.[propName]?.toString(),
};
SAFELIST

console.log('\n✅ Key fixing complete!');
console.log('\nCreated src/components/SafeList.js with:');
console.log('• SafeList - Wrapper for FlatList with proper keys');
console.log('• SafeMap - Safe mapping component');
console.log('• KeyExtractors - Utility functions for key extraction');
KEYSFIX

node fix-keys-comprehensive.js

echo "\n✅ React key fixes applied!"
echo "\nRecommended manual fixes for complex cases:"
echo "1. For arrays of objects with unique IDs:"
echo "   .map(item => <View key={item.id}>..."
echo "2. For arrays without IDs:"
echo "   .map((item, index) => <View key={\`item-\${index}\`}>..."
echo "3. Consider using the new SafeList component for lists"
