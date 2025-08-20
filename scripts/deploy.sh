#!/bin/bash

# Weather Comparison App Deployment Script
# This script builds and deploys the app to GitHub Pages

set -e # Exit on any error

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes. Consider committing them first."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci
fi

# Run tests
echo "🧪 Running tests..."
npm run test:ci

# Run linting
echo "🔍 Running linter..."
npm run lint

# Run type checking
echo "📝 Running type check..."
npm run type-check

# Build the application
echo "🏗️  Building application..."
npm run build:github

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed - dist directory not found."
    exit 1
fi

# Create .nojekyll file to bypass Jekyll processing
touch dist/.nojekyll

# Create CNAME file if custom domain is configured
if [ -n "$CUSTOM_DOMAIN" ]; then
    echo "$CUSTOM_DOMAIN" > dist/CNAME
    echo "🌐 Added CNAME file for custom domain: $CUSTOM_DOMAIN"
fi

# Add build info
cat > dist/build-info.json << EOF
{
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "gitCommit": "$(git rev-parse HEAD)",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD)",
  "version": "$(node -p "require('./package.json').version")"
}
EOF

echo "✅ Build completed successfully!"
echo "📊 Build statistics:"
echo "   - Total files: $(find dist -type f | wc -l)"
echo "   - Total size: $(du -sh dist | cut -f1)"
echo "   - JS files: $(find dist -name "*.js" | wc -l)"
echo "   - CSS files: $(find dist -name "*.css" | wc -l)"

# If running in CI, the GitHub Action will handle the actual deployment
if [ "$CI" = "true" ]; then
    echo "🤖 Running in CI - GitHub Action will handle deployment"
    exit 0
fi

# For local testing, offer to serve the built files
echo ""
echo "🎯 Deployment preparation complete!"
echo "To test the build locally, run: npm run preview"
echo "To deploy to GitHub Pages, push to the main branch."

# Optionally start preview server
read -p "Start preview server now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run preview
fi