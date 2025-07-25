#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Custom build script for Vercel
 */
class VercelBuild {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
  }

  /**
   * Run a command
   */
  runCommand(command) {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit', cwd: this.projectRoot });
  }

  /**
   * Log environment information
   */
  logEnvironment() {
    console.log('=== Build Environment ===');
    console.log(`Node version: ${process.version}`);
    console.log(`Platform: ${process.platform}`);
    console.log(`Architecture: ${process.arch}`);
    console.log(`Working directory: ${process.cwd()}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log('========================\n');
  }

  /**
   * Install dependencies
   */
  installDependencies() {
    console.log('📦 Installing dependencies...');
    
    // Use npm ci for faster, reliable builds
    if (fs.existsSync(path.join(this.projectRoot, 'package-lock.json'))) {
      this.runCommand('npm ci');
    } else {
      this.runCommand('npm install');
    }
  }

  /**
   * Build the application
   */
  buildApplication() {
    console.log('🏗️  Building application...');
    
    // Set production environment
    process.env.NODE_ENV = 'production';
    
    // Run the build command
    this.runCommand('npm run build');
    
    // Verify build output
    const distPath = path.join(this.projectRoot, 'dist');
    if (!fs.existsSync(distPath)) {
      throw new Error('Build failed: dist directory not found');
    }
    
    const indexPath = path.join(distPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
      throw new Error('Build failed: index.html not found');
    }
    
    console.log('✅ Build completed successfully');
  }

  /**
   * Optimize build output
   */
  optimizeBuild() {
    console.log('⚡ Optimizing build output...');
    
    const distPath = path.join(this.projectRoot, 'dist');
    
    // Log build statistics
    try {
      const stats = this.getBuildStats(distPath);
      console.log('Build Statistics:');
      console.log(`  Total files: ${stats.fileCount}`);
      console.log(`  Total size: ${this.formatBytes(stats.totalSize)}`);
      console.log(`  JS files: ${stats.jsFiles} (${this.formatBytes(stats.jsSize)})`);
      console.log(`  CSS files: ${stats.cssFiles} (${this.formatBytes(stats.cssSize)})`);
    } catch (error) {
      console.warn('Could not generate build statistics:', error.message);
    }
  }

  /**
   * Get build statistics
   */
  getBuildStats(distPath) {
    const stats = {
      fileCount: 0,
      totalSize: 0,
      jsFiles: 0,
      jsSize: 0,
      cssFiles: 0,
      cssSize: 0
    };

    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else {
          stats.fileCount++;
          stats.totalSize += stat.size;
          
          if (file.endsWith('.js')) {
            stats.jsFiles++;
            stats.jsSize += stat.size;
          } else if (file.endsWith('.css')) {
            stats.cssFiles++;
            stats.cssSize += stat.size;
          }
        }
      }
    };

    walkDir(distPath);
    return stats;
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Run the complete build process
   */
  build() {
    console.log('🚀 Starting Vercel build process...\n');
    
    try {
      this.logEnvironment();
      this.installDependencies();
      this.buildApplication();
      this.optimizeBuild();
      
      console.log('\n🎉 Vercel build completed successfully!');
      
    } catch (error) {
      console.error('\n❌ Vercel build failed:', error.message);
      process.exit(1);
    }
  }
}

// Run build if this script is executed directly
if (require.main === module) {
  const build = new VercelBuild();
  build.build();
}

module.exports = VercelBuild;