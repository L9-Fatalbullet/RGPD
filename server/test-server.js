// Simple test to check server startup
const fs = require('fs');
const path = require('path');

// Check if required files exist
const requiredFiles = [
  './data/users.json',
  './data/organizations.json',
  './data/invitations.json',
  './data/dpias.json',
  './data/assessments.json',
  './data/iso27001.json',
  './data/progression.json'
];

console.log('Checking required data files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    console.log(`✅ ${file} - ${stats.size} bytes`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

// Try to require the main server file
try {
  console.log('\nChecking server syntax...');
  require('./index.js');
  console.log('✅ Server file syntax is valid');
} catch (error) {
  console.error('❌ Server file has syntax errors:');
  console.error(error.message);
}
