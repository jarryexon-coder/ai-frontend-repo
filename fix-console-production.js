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
