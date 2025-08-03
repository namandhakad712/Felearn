#!/usr/bin/env node

/**
 * Clean Console Script
 * Removes debug console.log statements from source files for production builds
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const DEBUG_PATTERNS = [
  /console\.log\(['"`]🔧.*?\);?\s*$/gm,
  /console\.log\(['"`]🔍.*?\);?\s*$/gm,
  /console\.log\(['"`]✅.*?\);?\s*$/gm,
  /console\.log\(['"`]❌.*?\);?\s*$/gm,
  /console\.log\(['"`]⚠️.*?\);?\s*$/gm,
  /console\.log\(['"`].*DEBUG.*?\);?\s*$/gm,
  /console\.log\(['"`].*debug.*?\);?\s*$/gm,
  /\/\/ Debug:.*$/gm,
  /\/\* Debug:.*?\*\//gm,
];

function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    DEBUG_PATTERNS.forEach(pattern => {
      content = content.replace(pattern, '');
    });
    
    // Remove empty lines that were left behind
    content = content.replace(/^\s*\n/gm, '');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Cleaned debug statements from: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error cleaning file ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Skipping console cleanup - not in production mode');
    return;
  }
  
  console.log('🧹 Cleaning debug console statements for production...');
  
  const srcFiles = glob.sync('src/**/*.{ts,tsx}', { 
    ignore: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'] 
  });
  
  let cleanedCount = 0;
  
  srcFiles.forEach(file => {
    if (cleanFile(file)) {
      cleanedCount++;
    }
  });
  
  console.log(`✅ Cleaned ${cleanedCount} files`);
}

if (require.main === module) {
  main();
}

module.exports = { cleanFile, DEBUG_PATTERNS };