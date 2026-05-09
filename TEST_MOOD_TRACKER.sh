#!/bin/bash

# Quick Mood Tracker Test Script
# Verifies the fix is working correctly

echo "================================================"
echo "  MOOD TRACKER EMOTION DETECTION FIX - TESTER"
echo "================================================"
echo ""
echo "📋 Files to Check:"
echo "  ✓ public/js/mood-tracker-fix.js"
echo "  ✓ views/user/mood-tracker.xian (script inclusion)"
echo "  ✓ public/models/ (model files)"
echo ""

# Check if fix file exists
if [ -f "public/js/mood-tracker-fix.js" ]; then
  echo "✅ mood-tracker-fix.js EXISTS"
  echo "   Line count: $(wc -l < public/js/mood-tracker-fix.js) lines"
else
  echo "❌ mood-tracker-fix.js MISSING"
fi

echo ""

# Check if models directory has required files
if [ -d "public/models" ]; then
  echo "✅ Models directory EXISTS"
  MODEL_COUNT=$(find public/models -type f | wc -l)
  echo "   Files: $MODEL_COUNT"
  
  if [ -f "public/models/tiny_face_detector_model-weights_manifest.json" ]; then
    echo "   ✓ Face detector model found"
  fi
  
  if [ -f "public/models/face_expression_model-weights_manifest.json" ]; then
    echo "   ✓ Expression model found"
  fi
else
  echo "❌ Models directory MISSING"
fi

echo ""
echo "================================================"
echo "  HOW TO TEST"
echo "================================================"
echo ""
echo "1. Start the server:"
echo "   npm run xian"
echo ""
echo "2. Open in browser:"
echo "   http://localhost:3000/user/mood-tracker"
echo ""
echo "3. Open DevTools (F12) and go to Console"
echo ""
echo "4. Look for these messages:"
echo "   ✅ Mood Tracker Fix loaded successfully!"
echo "   ✅ This means the fix module loaded"
echo ""
echo "5. Test the scanner:"
echo "   - Click 'Start Scanning' button"
echo "   - If models loaded:"
echo "     Show your face to the camera"
echo "     Wait for emotion detection (2-3 seconds)"
echo "   - If in Demo Mode:"
echo "     Click button and see simulated emotion"
echo ""
echo "6. Expected Results:"
echo "   ✅ Emotion card appears with icon and label"
echo "   ✅ Confidence bar fills up"
echo "   ✅ After detection → Confirmation modal appears"
echo "   ✅ Click 'Yes' or 'No' to confirm"
echo ""
echo "================================================"
echo "  DEBUGGING (Open F12 Console)"
echo "================================================"
echo ""
echo "Look for these console messages:"
echo ""
echo "At startup:"
echo "  🔧 Loading Mood Tracker Fix Module..."
echo "  ✅ Mood Tracker Fix loaded successfully!"
echo ""
echo "When scanning:"
echo "  🎯 Start Scanning (FIXED)"
echo "  ⏳ Waiting for face..."
echo "  ✅ Face detected"
echo "  📊 Frame 1: happy (87.5%)"
echo "  📊 Frame 2: happy (89.2%)"
echo "  ✅ LOCKED: happy at 89.2% confidence"
echo "  🔒 LOCKING EMOTION: happy"
echo ""
echo "If emotion not showing:"
echo "  Check F12 → Network tab for:"
echo "  - tiny_face_detector_model-weights_manifest.json (200 OK)"
echo "  - face_expression_model-weights_manifest.json (200 OK)"
echo ""
echo "If still having issues, run:"
echo "  npm run xian"
echo "  Then Ctrl+F5 (hard refresh)"
echo ""
echo "================================================"
