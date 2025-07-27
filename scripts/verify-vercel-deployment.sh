#!/bin/bash

# Vercel Deployment Verification Script
set -e

echo "🔍 Verifying Vercel deployment configuration..."

# Check if build artifacts exist
echo "📦 Checking build artifacts..."

if [ ! -d "dist/web/server" ]; then
    echo "❌ Server build directory not found. Run 'npm run build' first."
    exit 1
fi

if [ ! -d "dist/web/client" ]; then
    echo "❌ Client build directory not found. Run 'npm run build' first."
    exit 1
fi

# Check for required files
echo "📋 Checking required files..."

if [ ! -f "dist/web/server/vercel.js" ]; then
    echo "❌ Vercel entry point not found: dist/web/server/vercel.js"
    echo "💡 Run 'npm run build:vercel' to generate it."
    exit 1
fi

if [ ! -f "dist/web/client/index.html" ]; then
    echo "❌ Client index.html not found: dist/web/client/index.html"
    exit 1
fi

# Check Vercel configuration
echo "⚙️  Checking Vercel configuration..."

if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found"
    exit 1
fi

# Validate vercel.json structure
if ! jq empty vercel.json 2>/dev/null; then
    echo "❌ Invalid JSON in vercel.json"
    exit 1
fi

# Check environment configuration
echo "🌍 Checking environment configuration..."

if [ ! -f "config/environments/vercel.env" ]; then
    echo "⚠️  Vercel environment config not found: config/environments/vercel.env"
    echo "💡 Consider creating it for production-specific settings."
fi

# Check package.json scripts
echo "📜 Checking build scripts..."

if ! grep -q "build:vercel" package.json; then
    echo "⚠️  build:vercel script not found in package.json"
fi

# Display build summary
echo ""
echo "✅ Vercel deployment verification completed!"
echo ""
echo "📊 Build Summary:"
echo "   Server build: $(ls -la dist/web/server/ | wc -l) files"
echo "   Client build: $(ls -la dist/web/client/ | wc -l) files"
echo "   Vercel entry: $(ls -la dist/web/server/vercel.js 2>/dev/null | awk '{print $5}' || echo 'NOT FOUND')"
echo ""
echo "🚀 Ready for deployment with: vercel --prod" 