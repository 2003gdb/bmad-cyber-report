#!/bin/bash

# SafeTrade Test Runner Script

echo "🧪 Running SafeTrade tests..."

# Function to run tests and track results
run_tests() {
    local package_name=$1
    local package_path=$2
    
    echo "🧪 Testing $package_name..."
    cd $package_path
    npm run test
    local result=$?
    cd - > /dev/null
    
    if [ $result -eq 0 ]; then
        echo "✅ $package_name tests passed"
        return 0
    else
        echo "❌ $package_name tests failed"
        return 1
    fi
}

# Test backend
run_tests "Backend" "packages/backend"
BACKEND_RESULT=$?

# Test admin portal (if it has tests)
if [ -f "packages/admin-portal/package.json" ] && grep -q '"test"' "packages/admin-portal/package.json"; then
    run_tests "Admin Portal" "packages/admin-portal"  
    ADMIN_RESULT=$?
else
    echo "ℹ️  Admin Portal: No tests configured"
    ADMIN_RESULT=0
fi

echo ""
echo "📊 Test Results Summary:"
if [ $BACKEND_RESULT -eq 0 ]; then
    echo "✅ Backend: PASSED"
else
    echo "❌ Backend: FAILED"
fi

if [ $ADMIN_RESULT -eq 0 ]; then
    echo "✅ Admin Portal: PASSED"
else
    echo "❌ Admin Portal: FAILED"
fi

# iOS testing note
echo "📱 iOS: Run tests in Xcode using Cmd+U"

# Exit with failure if any tests failed
if [ $BACKEND_RESULT -ne 0 ] || [ $ADMIN_RESULT -ne 0 ]; then
    echo ""
    echo "❌ Some tests failed"
    exit 1
else
    echo ""
    echo "✅ All tests passed!"
    exit 0
fi