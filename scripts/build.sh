#!/bin/bash

# SafeTrade Build Script

echo "🔨 Building SafeTrade project..."

# Build backend
echo "🔧 Building backend..."
cd packages/backend
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Backend build failed"
  exit 1
fi
cd ../..

# Build admin portal  
echo "🌐 Building admin portal..."
cd packages/admin-portal
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Admin portal build failed"
  exit 1
fi
cd ../..

echo "✅ All packages built successfully!"
echo ""
echo "📦 Built artifacts:"
echo "  Backend:       packages/backend/dist/"
echo "  Admin Portal:  packages/admin-portal/.next/"
echo ""
echo "🚀 To run in production:"
echo "  Backend:       cd packages/backend && npm run start:prod"
echo "  Admin Portal:  cd packages/admin-portal && npm run start"