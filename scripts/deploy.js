#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Deployment script for Vercel
 */
class DeploymentScript {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.packageJson = require(path.join(this.projectRoot, 'package.json'));
  }

  /**
   * Run a command and log the output
   */
  runCommand(command, options = {}) {
    console.log(`🔄 Running: ${command}`);
    try {
      const result = execSync(command, {
        stdio: 'inherit',
        cwd: this.projectRoot,
        ...options
      });
      return result;
    } catch (error) {
      console.error(`❌ Command failed: ${command}`);
      throw error;
    }
  }

  /**
   * Check if required environment variables are set
   */
  checkEnvironmentVariables() {
    console.log('🔍 Checking environment variables...');
    
    const requiredVars = [
      'VITE_APPWRITE_ENDPOINT',
      'VITE_APPWRITE_PROJECT_ID',
      'VITE_APPWRITE_DATABASE_ID'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:');
      missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
      });
      console.error('\nPlease set these variables in your Vercel dashboard or .env file');
      process.exit(1);
    }
    
    console.log('✅ All required environment variables are set');
  }

  /**
   * Run pre-deployment checks
   */
  preDeploymentChecks() {
    console.log('🔍 Running pre-deployment checks...');
    
    // Check if package.json exists
    if (!fs.existsSync(path.join(this.projectRoot, 'package.json'))) {
      throw new Error('package.json not found');
    }
    
    // Check if build script exists
    if (!this.packageJson.scripts || !this.packageJson.scripts.build) {
      throw new Error('Build script not found in package.json');
    }
    
    // Check if Vercel configuration exists
    if (!fs.existsSync(path.join(this.projectRoot, 'vercel.json'))) {
      console.warn('⚠️  vercel.json not found - using default Vercel configuration');
    }
    
    console.log('✅ Pre-deployment checks passed');
  }

  /**
   * Install dependencies
   */
  installDependencies() {
    console.log('📦 Installing dependencies...');
    
    if (fs.existsSync(path.join(this.projectRoot, 'yarn.lock'))) {
      this.runCommand('yarn install --frozen-lockfile');
    } else if (fs.existsSync(path.join(this.projectRoot, 'package-lock.json'))) {
      this.runCommand('npm ci');
    } else {
      this.runCommand('npm install');
    }
    
    console.log('✅ Dependencies installed');
  }

  /**
   * Run tests
   */
  runTests() {
    console.log('🧪 Running tests...');
    
    if (this.packageJson.scripts && this.packageJson.scripts.test) {
      try {
        this.runCommand('npm run test -- --watchAll=false --coverage=false');
        console.log('✅ Tests passed');
      } catch (error) {
        console.error('❌ Tests failed');
        throw error;
      }
    } else {
      console.log('⚠️  No test script found, skipping tests');
    }
  }

  /**
   * Build the application
   */
  buildApplication() {
    console.log('🏗️  Building application...');
    
    this.runCommand('npm run build');
    
    // Check if build output exists
    const buildDir = path.join(this.projectRoot, 'dist');
    if (!fs.existsSync(buildDir)) {
      throw new Error('Build output directory not found');
    }
    
    console.log('✅ Application built successfully');
  }

  /**
   * Deploy to Vercel
   */
  deployToVercel() {
    console.log('🚀 Deploying to Vercel...');
    
    const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');
    const deployCommand = isProduction ? 'vercel --prod' : 'vercel';
    
    this.runCommand(deployCommand);
    
    console.log('✅ Deployment completed');
  }

  /**
   * Run the complete deployment process
   */
  async deploy() {
    console.log('🚀 Starting deployment process...\n');
    
    try {
      this.checkEnvironmentVariables();
      this.preDeploymentChecks();
      this.installDependencies();
      this.runTests();
      this.buildApplication();
      this.deployToVercel();
      
      console.log('\n🎉 Deployment completed successfully!');
      
    } catch (error) {
      console.error('\n❌ Deployment failed:', error.message);
      process.exit(1);
    }
  }
}

// Run deployment if this script is executed directly
if (require.main === module) {
  const deployment = new DeploymentScript();
  deployment.deploy();
}

module.exports = DeploymentScript;