const express = require('express');
const path = require('path');
const app = express();
// CRITICAL: Railway dynamically assigns a port via this variable.
const port = process.env.PORT || 3000;

// Serve static files from 'web-build' (Expo's default web output folder)
app.use(express.static(path.join(__dirname, 'web-build')));

// Handle all other routes by sending index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-build', 'index.html'));
});

// Add a simple /health endpoint for Railway's check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start the server
app.listen(port, '0.0.0.0', () => { // Listen on all network interfaces
  console.log(`✅ Frontend server listening on port ${port}`);
  console.log(`🔍 Health check available at http://0.0.0.0:${port}/health`);
});
