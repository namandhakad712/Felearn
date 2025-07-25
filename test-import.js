// This is just a test script to check if the package is installed correctly
// Run with: node test-import.js

try {
  // Try to import the package
  const genai = require('@google/generative-ai');
  console.log('Successfully imported @google/generative-ai');
  console.log('Package version:', genai.version || 'unknown');
  console.log('Available exports:', Object.keys(genai));
} catch (error) {
  console.error('Error importing @google/generative-ai:', error.message);
}

try {
  // Try to import the package with the name used in the import map
  const genai = require('@google/genai');
  console.log('Successfully imported @google/genai');
  console.log('Package version:', genai.version || 'unknown');
  console.log('Available exports:', Object.keys(genai));
} catch (error) {
  console.error('Error importing @google/genai:', error.message);
  console.log('This is expected if you only have @google/generative-ai installed');
}