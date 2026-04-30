#!/bin/bash
set -e

echo "=== Target Classes APK Builder ==="
echo ""

# Step 1: Build web app
echo "[1/4] Building web app..."
npm run build

# Step 2: Add Android platform (if not already added)
if [ ! -d "android" ]; then
  echo "[2/4] Adding Android platform..."
  npx cap add android
else
  echo "[2/4] Android platform already exists"
fi

# Step 3: Sync web assets to Android
echo "[3/4] Syncing web assets to Android..."
npx cap sync android

# Step 4: Build APK
echo "[4/4] Building APK..."
cd android
./gradlew assembleDebug

echo ""
echo "=== APK Built Successfully! ==="
echo "APK location: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "To install on your phone:"
echo "  adb install android/app/build/outputs/apk/debug/app-debug.apk"
