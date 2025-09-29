#!/bin/bash

# SafeTrade Development Server Launcher

echo "🚀 Starting SafeTrade development servers..."

# Function to cleanup background processes on script exit
cleanup() {
    echo "🛑 Stopping development servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set trap to cleanup on script termination
trap cleanup SIGINT SIGTERM

# Start backend server
echo "🔧 Starting backend server on port 3000..."
cd packages/backend
npm run start:dev &
BACKEND_PID=$!
cd ../..

# Start admin portal
echo "🌐 Starting admin portal on port 3001..."  
cd packages/admin-portal
npm run dev &
ADMIN_PID=$!
cd ../..

echo ""
echo "✅ Development servers started!"
echo ""
echo "🔗 Available endpoints:"
echo "  Backend API:    http://localhost:3000"
echo "  Health Check:   http://localhost:3000/health" 
echo "  Admin Portal:   http://localhost:3001"
echo ""
echo "📱 iOS App:"
echo "  Open packages/mobile/SafeTrade/SafeTrade.xcodeproj in Xcode"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for background processes
wait