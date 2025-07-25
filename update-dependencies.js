const fs = require('fs');
const path = require('path');

// Read the package.json file
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add Sentry dependencies
packageJson.dependencies = {
  ...packageJson.dependencies,
  '@sentry/react': '^7.12.1',
  '@sentry/tracing': '^7.12.1'
};

// Write the updated package.json file
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Added Sentry dependencies to package.json');
console.log('Run "npm install" or "yarn" to install the new dependencies.');