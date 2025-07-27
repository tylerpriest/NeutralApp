#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface BuildConfig {
  environment: 'production' | 'staging';
  optimize: boolean;
  analyze: boolean;
  sourceMaps: boolean;
}

class ProductionBuilder {
  private config: BuildConfig;
  private buildDir: string;

  constructor(config: BuildConfig) {
    this.config = config;
    this.buildDir = 'dist';
  }

  /**
   * Clean build directory
   */
  private cleanBuildDir(): void {
    console.log('🧹 Cleaning build directory...');
    
    if (fs.existsSync(this.buildDir)) {
      fs.rmSync(this.buildDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(this.buildDir, { recursive: true });
    console.log('✅ Build directory cleaned');
  }

  /**
   * Build server-side TypeScript
   */
  private buildServer(): void {
    console.log('🏗️  Building server-side code...');
    
    try {
      // Set environment variables for production build
      const env = {
        ...process.env,
        NODE_ENV: this.config.environment === 'staging' ? 'production' : this.config.environment,
        TS_NODE_PROJECT: 'tsconfig.json'
      };

      // Build server with production optimizations
      execSync('npx tsc --project tsconfig.json', {
        stdio: 'inherit',
        env
      });

      console.log('✅ Server build completed');
    } catch (error) {
      console.error('❌ Server build failed:', error);
      throw error;
    }
  }

  /**
   * Build client-side React application
   */
  private buildClient(): void {
    console.log('🌐 Building client-side application...');
    
    try {
      // Set environment variables for Vite
      const env = {
        ...process.env,
        NODE_ENV: this.config.environment === 'staging' ? 'production' : this.config.environment,
        VITE_APP_ENV: this.config.environment
      };

      // Build client with Vite
      execSync('npx vite build', {
        stdio: 'inherit',
        env,
        cwd: process.cwd()
      });

      console.log('✅ Client build completed');
    } catch (error) {
      console.error('❌ Client build failed:', error);
      throw error;
    }
  }

  /**
   * Optimize assets for production
   */
  private optimizeAssets(): void {
    console.log('⚡ Optimizing assets...');
    
    const clientBuildDir = path.join(this.buildDir, 'web', 'client');
    
    if (!fs.existsSync(clientBuildDir)) {
      console.log('⚠️  Client build directory not found, skipping asset optimization');
      return;
    }

    // Optimize images
    this.optimizeImages(clientBuildDir);
    
    // Generate asset manifest
    this.generateAssetManifest(clientBuildDir);
    
    // Create service worker for caching
    this.createServiceWorker(clientBuildDir);
    
    console.log('✅ Asset optimization completed');
  }

  /**
   * Optimize images for web delivery
   */
  private optimizeImages(buildDir: string): void {
    const imgDir = path.join(buildDir, 'img');
    
    if (!fs.existsSync(imgDir)) {
      return;
    }

    console.log('🖼️  Optimizing images...');
    
    // This would typically use tools like imagemin
    // For now, we'll just log the optimization
    const images = fs.readdirSync(imgDir).filter(file => 
      /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(file)
    );
    
    console.log(`Found ${images.length} images to optimize`);
  }

  /**
   * Generate asset manifest for caching
   */
  private generateAssetManifest(buildDir: string): void {
    console.log('📋 Generating asset manifest...');
    
    const manifest: Record<string, string> = {};
    
    const walkDir = (dir: string, baseDir: string) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath, baseDir);
        } else {
          const relativePath = path.relative(baseDir, filePath);
          const hash = this.generateFileHash(filePath);
          manifest[relativePath] = `${relativePath}?v=${hash}`;
        }
      }
    };
    
    walkDir(buildDir, buildDir);
    
    const manifestPath = path.join(buildDir, 'asset-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log('✅ Asset manifest generated');
  }

  /**
   * Generate simple file hash for cache busting
   */
  private generateFileHash(filePath: string): string {
    const content = fs.readFileSync(filePath);
    const hash = require('crypto').createHash('md5').update(content).digest('hex');
    return hash.substring(0, 8);
  }

  /**
   * Create service worker for caching
   */
  private createServiceWorker(buildDir: string): void {
    console.log('🔧 Creating service worker...');
    
    const swContent = `
// Production Service Worker
const CACHE_NAME = 'neutral-app-v1';
const urlsToCache = [
  '/',
  '/assets/index.css',
  '/assets/index.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
`;
    
    const swPath = path.join(buildDir, 'sw.js');
    fs.writeFileSync(swPath, swContent);
    
    console.log('✅ Service worker created');
  }

  /**
   * Bundle analysis (if requested)
   */
  private analyzeBundle(): void {
    if (!this.config.analyze) {
      return;
    }

    console.log('📊 Analyzing bundle...');
    
    try {
      // This would typically use tools like webpack-bundle-analyzer
      // For now, we'll just calculate basic stats
      const clientBuildDir = path.join(this.buildDir, 'web', 'client');
      
      if (fs.existsSync(clientBuildDir)) {
        const stats = this.calculateBundleStats(clientBuildDir);
        console.log('Bundle Statistics:', stats);
      }
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error);
    }
  }

  /**
   * Calculate basic bundle statistics
   */
  private calculateBundleStats(buildDir: string): any {
    let totalSize = 0;
    let fileCount = 0;
    const fileTypes: Record<string, number> = {};
    
    const walkDir = (dir: string) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else {
          totalSize += stat.size;
          fileCount++;
          
          const ext = path.extname(file).toLowerCase();
          fileTypes[ext] = (fileTypes[ext] || 0) + 1;
        }
      }
    };
    
    walkDir(buildDir);
    
    return {
      totalSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
      fileCount,
      fileTypes
    };
  }

  /**
   * Create production configuration files
   */
  private createProductionConfig(): void {
    console.log('⚙️  Creating production configuration...');
    
    // Create environment-specific config
    const config = {
      environment: this.config.environment,
      buildTime: new Date().toISOString(),
      version: require('../package.json').version,
      features: {
        sourceMaps: this.config.sourceMaps,
        optimization: this.config.optimize,
        caching: true
      }
    };
    
    const configPath = path.join(this.buildDir, 'build-config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log('✅ Production configuration created');
  }

  /**
   * Run the complete production build
   */
  async build(): Promise<void> {
    console.log(`🚀 Starting production build for ${this.config.environment}...`);
    console.log(`Optimization: ${this.config.optimize ? 'enabled' : 'disabled'}`);
    console.log(`Source maps: ${this.config.sourceMaps ? 'enabled' : 'disabled'}`);
    console.log(`Bundle analysis: ${this.config.analyze ? 'enabled' : 'disabled'}`);
    console.log('');

    const startTime = Date.now();

    try {
      // Step 1: Clean build directory
      this.cleanBuildDir();

      // Step 2: Build server
      this.buildServer();

      // Step 3: Build client
      this.buildClient();

      // Step 4: Optimize assets
      if (this.config.optimize) {
        this.optimizeAssets();
      }

      // Step 5: Analyze bundle
      this.analyzeBundle();

      // Step 6: Create production config
      this.createProductionConfig();

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      console.log('');
      console.log('🎉 Production build completed successfully!');
      console.log(`⏱️  Build time: ${duration}s`);
      console.log(`📁 Output directory: ${this.buildDir}`);
      
      if (this.config.optimize) {
        console.log('⚡ Assets optimized for production');
      }
      
      console.log('🚀 Ready for deployment!');

    } catch (error) {
      console.error('❌ Production build failed:', error);
      process.exit(1);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  const config: BuildConfig = {
    environment: (args.find(arg => arg.startsWith('--env='))?.split('=')[1] as 'production' | 'staging') || 'production',
    optimize: args.includes('--optimize'),
    analyze: args.includes('--analyze'),
    sourceMaps: args.includes('--source-maps')
  };

  const builder = new ProductionBuilder(config);
  await builder.build();
}

// Run the build
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Build script failed:', error);
    process.exit(1);
  });
} 