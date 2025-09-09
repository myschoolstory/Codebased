#!/bin/bash

# AI Codebase Agent Deployment Script

set -e

echo "🚀 Starting deployment of AI Codebase Agent..."

# Check if required environment variables are set
if [ -z "$MISTRAL_API_KEY" ]; then
    echo "❌ MISTRAL_API_KEY is not set"
    exit 1
fi

if [ -z "$LANGBASE_API_KEY" ]; then
    echo "❌ LANGBASE_API_KEY is not set"
    exit 1
fi

if [ -z "$DAYTONA_API_KEY" ]; then
    echo "❌ DAYTONA_API_KEY is not set"
    exit 1
fi

echo "✅ Environment variables validated"

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Build the application
echo "🔨 Building application..."
bun run build

# Run tests if they exist
if [ -f "package.json" ] && grep -q "test" package.json; then
    echo "🧪 Running tests..."
    bun test
fi

echo "✅ Deployment completed successfully!"
echo "🌐 You can now start the application with: bun start"
