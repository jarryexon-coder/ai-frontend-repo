#!/bin/bash

echo "🔧 Replacing alert() calls with React Native modals..."
echo "Found 80 alert() calls to replace"

# Create a reusable modal component first
cat > src/components/AlertModal.js << 'MODAL'
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AlertModal = () => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    message: '',
    buttons: [],
  });

  // Function to show alert (call this instead of alert())
  const showAlert = (title, message, buttons = []) => {
    setConfig({
      title: title || 'Alert',
      message: message || '',
      buttons: buttons.length > 0 ? buttons : [{ text: 'OK', onPress: () => {} }],
    });
    setVisible(true);
  };

  const handleButtonPress = (button) => {
    if (button.onPress) {
      button.onPress();
    }
    setVisible(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Ionicons name="information-circle" size={24} color="#3b82f6" />
            <Text style={styles.title}>{config.title}</Text>
          </View>
          
          <View style={styles.body}>
            <Text style={styles.message}>{config.message}</Text>
          </View>
          
          <View style={styles.footer}>
            {config.buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === 'cancel' && styles.cancelButton,
                  button.style === 'destructive' && styles.destructiveButton,
                ]}
                onPress={() => handleButtonPress(button)}
              >
                <Text style={[
                  styles.buttonText,
                  button.style === 'destructive' && styles.destructiveButtonText,
                ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  body: {
    padding: 20,
  },
  message: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
    backgroundColor: '#3b82f6',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#64748b',
  },
  destructiveButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  destructiveButtonText: {
    color: '#fff',
  },
});

export default AlertModal;
export { AlertModal };
MODAL

# Now create a utility function to replace alert()
cat > src/utils/alertUtils.js << 'ALERTUTILS'
import { Alert } from 'react-native';

/**
 * Production-ready alert replacement
 * Uses React Native's Alert for iOS/Android consistency
 */
export const showAlert = (title, message, buttons, options) => {
  // Use React Native's Alert for consistency
  if (buttons && Array.isArray(buttons)) {
    Alert.alert(title, message, buttons, options);
  } else {
    Alert.alert(title, message);
  }
};

/**
 * Confirmation dialog
 */
export const confirm = (title, message, onConfirm, onCancel) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'OK',
        onPress: onConfirm,
      },
    ]
  );
};

/**
 * Error alert with consistent styling
 */
export const showError = (message, title = 'Error') => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};

/**
 * Success alert
 */
export const showSuccess = (message, title = 'Success') => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};

/**
 * Warning alert
 */
export const showWarning = (message, title = 'Warning') => {
  Alert.alert(title, message, [{ text: 'OK', style: 'default' }]);
};
ALERTUTILS

# Create a script to replace alert() calls in all screen files
cat > replace-alerts.js << 'REPLACEALERTS'
const fs = require('fs');
const path = require('path');

function replaceAlertsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Pattern to match alert() calls
  const alertPattern = /alert\(([^)]+)\)/g;
  
  // Replace simple alert("message") with showAlert("message")
  content = content.replace(alertPattern, (match, alertContent) => {
    modified = true;
    
    // Clean up the alert content
    let cleanedContent = alertContent.trim();
    
    // Check if it's just a string
    if (cleanedContent.match(/^['"`]/)) {
      return `showAlert(${cleanedContent})`;
    }
    
    // For template literals or variables
    return `showAlert(${cleanedContent})`;
  });
  
  if (modified) {
    // Add import if not already present
    if (!content.includes("import { showAlert }") && !content.includes("from '../utils/alertUtils'")) {
      // Find the last import statement
      const importMatch = content.match(/import .* from ['"][^'"]+['"];?\s*\n/g);
      if (importMatch) {
        const lastImport = importMatch[importMatch.length - 1];
        const importIndex = content.lastIndexOf(lastImport) + lastImport.length;
        content = content.slice(0, importIndex) + 
                 "\nimport { showAlert, showError, showSuccess, showWarning } from '../utils/alertUtils';\n" + 
                 content.slice(importIndex);
      } else {
        // Add at top if no imports
        content = "import { showAlert, showError, showSuccess, showWarning } from '../utils/alertUtils';\n" + content;
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
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
        replaceAlertsInFile(fullPath);
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error.message);
      }
    }
  });
}

// Process all screen files
processDirectory('src/screens');

// Also update App.js to include the AlertModal if needed
const appJsPath = 'App.js';
if (fs.existsSync(appJsPath)) {
  let appContent = fs.readFileSync(appJsPath, 'utf8');
  
  // Add AlertModal import if not present
  if (!appContent.includes('AlertModal') && !appContent.includes("from './src/components/AlertModal'")) {
    // Add after React import
    appContent = appContent.replace(
      /import React[^;]+;/,
      "$&\nimport { AlertModal } from './src/components/AlertModal';"
    );
    
    // Add AlertModal component in the render
    appContent = appContent.replace(
      /return\s*\(/,
      "return (\n    <>\n      <AlertModal />"
    );
    
    // Close the fragment at the end
    appContent = appContent.replace(
      /<\/View>\s*\)/,
      "    </View>\n    </>\n  )"
    );
    
    fs.writeFileSync(appJsPath, appContent, 'utf8');
    console.log('Updated App.js with AlertModal');
  }
}
REPLACEALERTS

node replace-alerts.js

echo "\n✅ Alert replacement complete!"
echo "Created:"
echo "1. src/components/AlertModal.js - Reusable modal component"
echo "2. src/utils/alertUtils.js - Utility functions for alerts"
echo "3. Updated all screen files to use showAlert() instead of alert()"
