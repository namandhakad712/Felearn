#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Appwrite Functions Deployment Script
 */
class FunctionsDeployment {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.functionsDir = path.join(this.projectRoot, 'functions');
    this.functions = [
      {
        id: 'export-story',
        name: 'Export Story',
        runtime: 'node-18.0',
        entrypoint: 'src/main.js',
        execute: ['users'],
        events: [],
        schedule: '',
        timeout: 30,
        enabled: true
      },
      {
        id: 'analytics',
        name: 'Analytics Processing',
        runtime: 'node-18.0',
        entrypoint: 'src/main.js',
        execute: ['users'],
        events: [],
        schedule: '0 2 * * *', // Daily at 2 AM
        timeout: 300,
        enabled: true
      },
      {
        id: 'cleanup',
        name: 'Data Cleanup',
        runtime: 'node-18.0',
        entrypoint: 'src/main.js',
        execute: ['users'],
        events: [],
        schedule: '0 3 * * 0', // Weekly on Sunday at 3 AM
        timeout: 600,
        enabled: true
      }
    ];
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
   * Check if Appwrite CLI is installed
   */
  checkAppwriteCLI() {
    try {
      this.runCommand('appwrite --version', { stdio: 'pipe' });
      console.log('✅ Appwrite CLI is installed');
    } catch (error) {
      console.error('❌ Appwrite CLI is not installed');
      console.log('Install it with: npm install -g appwrite-cli');
      console.log('Then login with: appwrite login');
      process.exit(1);
    }
  }

  /**
   * Check if user is logged in to Appwrite
   */
  checkAppwriteLogin() {
    try {
      this.runCommand('appwrite account get', { stdio: 'pipe' });
      console.log('✅ Logged in to Appwrite');
    } catch (error) {
      console.error('❌ Not logged in to Appwrite');
      console.log('Login with: appwrite login');
      process.exit(1);
    }
  }

  /**
   * Create or update a function
   */
  async deployFunction(functionConfig) {
    const functionPath = path.join(this.functionsDir, functionConfig.id);
    
    if (!fs.existsSync(functionPath)) {
      console.error(`❌ Function directory not found: ${functionPath}`);
      return false;
    }
    
    console.log(`\n📦 Deploying function: ${functionConfig.name}`);
    
    try {
      // Check if function exists
      let functionExists = false;
      try {
        this.runCommand(`appwrite functions get --functionId ${functionConfig.id}`, { stdio: 'pipe' });
        functionExists = true;
        console.log(`✅ Function ${functionConfig.id} exists, updating...`);
      } catch (error) {
        console.log(`📝 Function ${functionConfig.id} doesn't exist, creating...`);
      }
      
      if (!functionExists) {
        // Create function
        const createCommand = [
          'appwrite functions create',
          `--functionId ${functionConfig.id}`,
          `--name "${functionConfig.name}"`,
          `--runtime ${functionConfig.runtime}`,
          `--execute ${JSON.stringify(functionConfig.execute)}`,
          `--entrypoint ${functionConfig.entrypoint}`,
          `--timeout ${functionConfig.timeout}`,
          functionConfig.enabled ? '--enabled true' : '--enabled false'
        ].join(' ');
        
        this.runCommand(createCommand);
      } else {
        // Update function
        const updateCommand = [
          'appwrite functions update',
          `--functionId ${functionConfig.id}`,
          `--name "${functionConfig.name}"`,
          `--runtime ${functionConfig.runtime}`,
          `--execute ${JSON.stringify(functionConfig.execute)}`,
          `--entrypoint ${functionConfig.entrypoint}`,
          `--timeout ${functionConfig.timeout}`,
          functionConfig.enabled ? '--enabled true' : '--enabled false'
        ].join(' ');
        
        this.runCommand(updateCommand);
      }
      
      // Set schedule if provided
      if (functionConfig.schedule) {
        console.log(`⏰ Setting schedule: ${functionConfig.schedule}`);
        this.runCommand(`appwrite functions updateSchedule --functionId ${functionConfig.id} --schedule "${functionConfig.schedule}"`);
      }
      
      // Deploy code
      console.log(`🚀 Deploying code for ${functionConfig.id}...`);
      this.runCommand(`appwrite functions createDeployment --functionId ${functionConfig.id} --entrypoint ${functionConfig.entrypoint} --code ${functionPath}`);
      
      console.log(`✅ Successfully deployed ${functionConfig.name}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to deploy ${functionConfig.name}:`, error.message);
      return false;
    }
  }

  /**
   * Install dependencies for all functions
   */
  installDependencies() {
    console.log('📦 Installing dependencies for all functions...');
    
    for (const functionConfig of this.functions) {
      const functionPath = path.join(this.functionsDir, functionConfig.id);
      const packageJsonPath = path.join(functionPath, 'package.json');
      
      if (fs.existsSync(packageJsonPath)) {
        console.log(`Installing dependencies for ${functionConfig.id}...`);
        this.runCommand('npm install', { cwd: functionPath });
      }
    }
    
    console.log('✅ Dependencies installed for all functions');
  }

  /**
   * Deploy all functions
   */
  async deployAllFunctions() {
    console.log('🚀 Starting deployment of all functions...\n');
    
    const results = [];
    
    for (const functionConfig of this.functions) {
      const success = await this.deployFunction(functionConfig);
      results.push({ function: functionConfig.name, success });
    }
    
    // Summary
    console.log('\n📊 Deployment Summary:');
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${result.function}`);
    });
    
    console.log(`\n🎯 ${successful} successful, ${failed} failed`);
    
    if (failed > 0) {
      process.exit(1);
    }
  }

  /**
   * Run the complete deployment process
   */
  async deploy() {
    try {
      console.log('🚀 Starting Appwrite Functions deployment...\n');
      
      this.checkAppwriteCLI();
      this.checkAppwriteLogin();
      this.installDependencies();
      await this.deployAllFunctions();
      
      console.log('\n🎉 All functions deployed successfully!');
      
    } catch (error) {
      console.error('\n❌ Functions deployment failed:', error.message);
      process.exit(1);
    }
  }
}

// Run deployment if this script is executed directly
if (require.main === module) {
  const deployment = new FunctionsDeployment();
  deployment.deploy();
}

module.exports = FunctionsDeployment;