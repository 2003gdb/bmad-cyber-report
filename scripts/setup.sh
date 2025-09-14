#!/bin/bash

# SafeTrade Project Setup Script

echo "🚀 SafeTrade Project Setup Starting..."

# Check Node.js version
NODE_VERSION=$(node -v)
REQUIRED_NODE_VERSION="v18.17.0"

echo "📦 Node.js version: $NODE_VERSION"

if [[ "$NODE_VERSION" < "$REQUIRED_NODE_VERSION" ]]; then
  echo "❌ Node.js $REQUIRED_NODE_VERSION or higher is required"
  exit 1
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "🔧 Setting up backend..."
cd packages/backend
if [ ! -f ".env" ]; then
  echo "📝 Creating backend .env file from template..."
  cp .env.example .env
  echo "⚠️  Please configure database credentials in packages/backend/.env"
fi
npm install
cd ../..

# Install admin portal dependencies
echo "🌐 Setting up admin portal..."
cd packages/admin-portal
if [ ! -f ".env.local" ]; then
  echo "📝 Creating admin portal .env.local file from template..."
  cp .env.local.example .env.local
fi
npm install
cd ../..

echo "✅ Project setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Configure database credentials in packages/backend/.env"
echo "2. Generate JWT secrets for both backend and admin portal"
echo "3. Create Xcode project for iOS app (see packages/mobile/README.md)"
echo "4. Run 'npm run dev' to start development servers"
echo ""
echo "🔗 Available commands:"
echo "  npm run dev        - Start all development servers"
echo "  npm run build      - Build all packages"  
echo "  npm run test       - Run all tests"