/**
 * Script to update dependencies after Firebase removal
 * 
 * This script:
 * 1. Removes Firebase dependencies
 * 2. Updates Appwrite dependencies to latest versions
 * 3. Cleans up any unused dependencies
 * 
 * Usage:
 * node scripts/update-dependencies.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Dependencies to remove (Firebase related)
const dependenciesToRemove = [
  'firebase',
  '@firebase/app',
  '@firebase/auth',
  '@firebase/firestore',
  '@firebase/storage',
  '@firebase/functions',
  '@firebase/analytics',
  'firebase-admin',
  'firebase-functions',
  'reactfire',
];

// Dependencies to add or update
const dependenciesToAdd = {
  'appwrite': '^18.1.1',
  'node-appwrite': '^17.0.0',
};

// Remove Firebase dependencies
let dependenciesRemoved = false;
for (const dep of dependenciesToRemove) {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    console.log(`Removing dependency: ${dep}`);
    delete packageJson.dependencies[dep];
    dependenciesRemoved = true;
  }
  
  if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
    console.log(`Removing dev dependency: ${dep}`);
    delete packageJson.devDependencies[dep];
    dependenciesRemoved = true;
  }
}

// Add or update dependencies
for (const [dep, version] of Object.entries(dependenciesToAdd)) {
  if (!packageJson.dependencies[dep]) {
    console.log(`Adding dependency: ${dep}@${version}`);
    packageJson.dependencies[dep] = version;
  } else if (packageJson.dependencies[dep] !== version) {
    console.log(`Updating dependency: ${dep} from ${packageJson.dependencies[dep]} to ${version}`);
    packageJson.dependencies[dep] = version;
  }
}

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

// Run npm install if dependencies were removed
if (dependenciesRemoved) {
  console.log('Running npm install to update dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('Dependencies updated successfully!');
  } catch (error) {
    console.error('Error updating dependencies:', error);
    process.exit(1);
  }
}

console.log('Dependencies update script completed successfully!');