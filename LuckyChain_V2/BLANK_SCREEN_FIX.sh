#!/bin/bash

echo "🔍 Fixing Blank Screen Issue..."
echo ""

# Step 1: Stop any running processes
echo "📋 Step 1: Checking running processes..."
echo "   (You'll need to press Ctrl+C in Terminal 3 if frontend is running)"
echo ""

# Step 2: Clear Next.js cache
echo "🧹 Step 2: Clearing Next.js cache..."
cd /Users/alaradinc/Downloads/luckychain_Dec_2_2025/luckychain_V2/LuckyChain_V2
rm -rf .next
rm -rf node_modules/.cache
echo "✅ Cache cleared!"
echo ""

# Step 3: Check for build errors
echo "🔨 Step 3: Building project to check for errors..."
npm run build 2>&1 | head -30

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful! No errors found."
    echo ""
    echo "📝 Next steps:"
    echo "   1. Start frontend: npm run dev"
    echo "   2. Open browser: http://localhost:3000"
    echo "   3. Clear cache: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
    echo "   4. Check browser console (F12) for any runtime errors"
else
    echo ""
    echo "❌ Build failed! Check errors above."
    echo "   Fix any TypeScript/compilation errors first."
fi

