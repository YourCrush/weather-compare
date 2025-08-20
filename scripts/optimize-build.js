#!/usr/bin/env node

/**
 * Post-build optimization script
 * Optimizes the built files for production deployment
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { resolve, join, extname } from 'path';
import { gzipSync } from 'zlib';

const distDir = resolve(process.cwd(), 'dist');

// File size formatting
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get all files recursively
const getAllFiles = (dir, files = []) => {
  const dirFiles = readdirSync(dir);
  
  for (const file of dirFiles) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, files);
    } else {
      files.push(filePath);
    }
  }
  
  return files;
};

// Analyze bundle sizes
const analyzeBundleSizes = () => {
  console.log('📊 Analyzing bundle sizes...');
  
  const files = getAllFiles(distDir);
  const analysis = {
    total: 0,
    js: 0,
    css: 0,
    images: 0,
    other: 0,
    files: [],
  };
  
  for (const file of files) {
    const stat = statSync(file);
    const ext = extname(file).toLowerCase();
    const relativePath = file.replace(distDir, '');
    
    const fileInfo = {
      path: relativePath,
      size: stat.size,
      gzipSize: gzipSync(readFileSync(file)).length,
    };
    
    analysis.files.push(fileInfo);
    analysis.total += stat.size;
    
    if (['.js', '.mjs'].includes(ext)) {
      analysis.js += stat.size;
    } else if (ext === '.css') {
      analysis.css += stat.size;
    } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
      analysis.images += stat.size;
    } else {
      analysis.other += stat.size;
    }
  }
  
  return analysis;
};

// Generate build report
const generateBuildReport = (analysis) => {
  const report = {
    buildTime: new Date().toISOString(),
    totalSize: analysis.total,
    totalSizeFormatted: formatBytes(analysis.total),
    breakdown: {
      javascript: {
        size: analysis.js,
        formatted: formatBytes(analysis.js),
        percentage: ((analysis.js / analysis.total) * 100).toFixed(1),
      },
      css: {
        size: analysis.css,
        formatted: formatBytes(analysis.css),
        percentage: ((analysis.css / analysis.total) * 100).toFixed(1),
      },
      images: {
        size: analysis.images,
        formatted: formatBytes(analysis.images),
        percentage: ((analysis.images / analysis.total) * 100).toFixed(1),
      },
      other: {
        size: analysis.other,
        formatted: formatBytes(analysis.other),
        percentage: ((analysis.other / analysis.total) * 100).toFixed(1),
      },
    },
    largestFiles: analysis.files
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .map(file => ({
        path: file.path,
        size: formatBytes(file.size),
        gzipSize: formatBytes(file.gzipSize),
        compressionRatio: ((1 - file.gzipSize / file.size) * 100).toFixed(1) + '%',
      })),
  };
  
  return report;
};

// Check performance budgets
const checkPerformanceBudgets = (analysis) => {
  const budgets = {
    total: 1024 * 1024, // 1MB
    js: 512 * 1024,     // 512KB
    css: 100 * 1024,    // 100KB
    images: 500 * 1024, // 500KB
  };
  
  const violations = [];
  
  if (analysis.total > budgets.total) {
    violations.push(`Total bundle size (${formatBytes(analysis.total)}) exceeds budget (${formatBytes(budgets.total)})`);
  }
  
  if (analysis.js > budgets.js) {
    violations.push(`JavaScript size (${formatBytes(analysis.js)}) exceeds budget (${formatBytes(budgets.js)})`);
  }
  
  if (analysis.css > budgets.css) {
    violations.push(`CSS size (${formatBytes(analysis.css)}) exceeds budget (${formatBytes(budgets.css)})`);
  }
  
  if (analysis.images > budgets.images) {
    violations.push(`Images size (${formatBytes(analysis.images)}) exceeds budget (${formatBytes(budgets.images)})`);
  }
  
  return violations;
};

// Add security headers to HTML files
const addSecurityHeaders = () => {
  console.log('🔒 Adding security optimizations...');
  
  const htmlFiles = getAllFiles(distDir).filter(file => extname(file) === '.html');
  
  for (const htmlFile of htmlFiles) {
    let content = readFileSync(htmlFile, 'utf8');
    
    // Add security meta tags if not present
    if (!content.includes('Content-Security-Policy')) {
      const cspMeta = `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.open-meteo.com;">`;
      content = content.replace('<head>', `<head>\n    ${cspMeta}`);
    }
    
    if (!content.includes('X-Content-Type-Options')) {
      const noSniffMeta = `<meta http-equiv="X-Content-Type-Options" content="nosniff">`;
      content = content.replace('<head>', `<head>\n    ${noSniffMeta}`);
    }
    
    if (!content.includes('X-Frame-Options')) {
      const frameOptionsMeta = `<meta http-equiv="X-Frame-Options" content="DENY">`;
      content = content.replace('<head>', `<head>\n    ${frameOptionsMeta}`);
    }
    
    writeFileSync(htmlFile, content, 'utf8');
  }
};

// Main optimization function
const optimizeBuild = () => {
  console.log('🚀 Starting build optimization...');
  
  try {
    // Analyze bundle sizes
    const analysis = analyzeBundleSizes();
    
    // Generate build report
    const report = generateBuildReport(analysis);
    
    // Write build report
    writeFileSync(
      join(distDir, 'build-report.json'),
      JSON.stringify(report, null, 2),
      'utf8'
    );
    
    // Check performance budgets
    const violations = checkPerformanceBudgets(analysis);
    
    // Add security headers
    addSecurityHeaders();
    
    // Display results
    console.log('\n📊 Build Analysis:');
    console.log(`   Total size: ${report.totalSizeFormatted}`);
    console.log(`   JavaScript: ${report.breakdown.javascript.formatted} (${report.breakdown.javascript.percentage}%)`);
    console.log(`   CSS: ${report.breakdown.css.formatted} (${report.breakdown.css.percentage}%)`);
    console.log(`   Images: ${report.breakdown.images.formatted} (${report.breakdown.images.percentage}%)`);
    console.log(`   Other: ${report.breakdown.other.formatted} (${report.breakdown.other.percentage}%)`);
    
    console.log('\n📁 Largest files:');
    report.largestFiles.slice(0, 5).forEach(file => {
      console.log(`   ${file.path}: ${file.size} (${file.gzipSize} gzipped, ${file.compressionRatio} compression)`);
    });
    
    if (violations.length > 0) {
      console.log('\n⚠️  Performance budget violations:');
      violations.forEach(violation => {
        console.log(`   - ${violation}`);
      });
    } else {
      console.log('\n✅ All performance budgets met!');
    }
    
    console.log('\n✅ Build optimization completed!');
    
  } catch (error) {
    console.error('❌ Build optimization failed:', error);
    process.exit(1);
  }
};

// Run optimization
optimizeBuild();