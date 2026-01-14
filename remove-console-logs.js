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
