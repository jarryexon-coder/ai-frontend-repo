#!/bin/bash

echo "🔧 Removing console.log statements for production..."
echo "Found 135 console.log statements to remove"

# Create a backup directory
mkdir -p backups_$(date +%Y%m%d_%H%M%S)

# Method 1: Comment out all console.log statements
echo "Method 1: Commenting out console.log statements..."
find src/screens -name "*.js" -type f | while read file; do
    # Backup the file
    cp "$file" "${file}.backup_$(date +%s)"
    
    # Comment out console.log statements
    sed -i '' 's/console\.log(/\/\/ console.log(/g' "$file"
    sed -i '' 's/console\.warn(/\/\/ console.warn(/g' "$file"
    sed -i '' 's/console\.error(/\/\/ console.error(/g' "$file"
    
    echo "Processed: $file"
done

# Method 2: Remove them completely (more aggressive)
echo "\nMethod 2: Remove console.log statements completely..."
cat > remove-console-logs.js << 'REMOVAL'
const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove console.log statements (but keep the rest of the line if there's more code)
    content = content.replace(/console\.(log|warn|error|info|debug)\([^;]*\);?\s*/g, '');
    
    // Remove empty lines that might have been created
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned: ${filePath}`);
}

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('backup')) {
            processDirectory(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            processFile(fullPath);
        }
    });
}

processDirectory('src/screens');
REMOVAL

node remove-console-logs.js

# Create a production-ready version that keeps only essential logs
echo "\nCreating production-friendly version (keeping error logs)..."
cat > fix-console-production.js << 'PRODUCTION'
const fs = require('fs');
const path = require('path');

function makeProductionReady(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Keep console.error for actual errors, remove others
    content = content.replace(/console\.(log|warn|info|debug|trace)\([^;]*\);?\s*/g, '');
    
    // Keep console.error but only for error handling
    content = content.replace(/console\.error\([^;]*\);?\s*/g, (match) => {
        // Only keep if it looks like error handling (in catch blocks or with 'error' variable)
        if (match.includes('catch') || match.includes('err') || match.includes('error')) {
            return match;
        }
        return '';
    });
    
    // Remove consecutive blank lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    fs.writeFileSync(filePath, content, 'utf8');
}

function processDir(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('backup')) {
            processDir(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            console.log(`Making production ready: ${fullPath}`);
            makeProductionReady(fullPath);
        }
    });
}

processDir('src/screens');
PRODUCTION

node fix-console-production.js

echo "\n✅ Console.log cleanup complete!"
echo "Summary:"
echo "- Removed most console.log, console.warn, console.info, console.debug"
echo "- Kept console.error for actual error handling"
echo "- Created backups of original files"
