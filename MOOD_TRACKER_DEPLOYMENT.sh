#!/bin/bash
# MOOD TRACKER SYSTEM - IMPLEMENTATION CHECKLIST
# Follow these steps to deploy the improvements

echo "🎯 MOOD TRACKER ENHANCEMENTS - DEPLOYMENT CHECKLIST"
echo "=================================================="
echo ""

# ═══════════════════════════════════════════════════════════════════
# STEP 1: VERIFY NEW FILES CREATED
# ═══════════════════════════════════════════════════════════════════
echo "✅ STEP 1: Verify New Files Exist"
echo "  Required files:"
echo "  □ public/js/mood-tracker-improvements.js"
echo "  □ public/js/mood-tracker-enhanced.js"
echo "  □ controllers/moodControllerEnhanced.js"
echo "  □ MOOD_TRACKER_IMPROVEMENTS.md (this documentation)"
echo ""

# ═══════════════════════════════════════════════════════════════════
# STEP 2: UPDATE HTML VIEW
# ═══════════════════════════════════════════════════════════════════
echo "✅ STEP 2: Update HTML View"
echo "  File: views/user/mood-tracker.xian"
echo "  Change:"
echo "    FROM:"
echo "      <script defer src=\"/js/mood-tracker-utils.js\"></script>"
echo "      <script defer src=\"/js/mood-tracker.js\"></script>"
echo "    TO:"
echo "      <script defer src=\"/js/mood-tracker-utils.js\"></script>"
echo "      <script defer src=\"/js/mood-tracker-improvements.js\"></script>"
echo "      <script defer src=\"/js/mood-tracker.js\"></script>"
echo "      <script defer src=\"/js/mood-tracker-enhanced.js\"></script>"
echo "  Status: ✅ ALREADY DONE"
echo ""

# ═══════════════════════════════════════════════════════════════════
# STEP 3: UPDATE ROUTES
# ═══════════════════════════════════════════════════════════════════
echo "✅ STEP 3: Update Routes"
echo "  File: routes/index.js or messageRoutes.js"
echo "  Add these routes:"
echo "    router.get('/user/mood', moodController.moodTrackerPage);"
echo "    router.post('/user/mood/save', moodController.saveMoodEnhanced);"
echo "    router.get('/user/mood/history', moodController.getMoodHistoryEnhanced);"
echo "    router.get('/user/mood/trends', moodController.getEmotionalTrends);"
echo "    router.get('/user/mood/:moodId', moodController.getMoodById);"
echo ""

# ═══════════════════════════════════════════════════════════════════
# STEP 4: VERIFY DATABASE SCHEMA
# ═══════════════════════════════════════════════════════════════════
echo "✅ STEP 4: Verify MoodEntry Model"
echo "  File: models/MoodEntryModel.js"
echo "  Required fields:"
echo "    ✓ id (UUID, Primary Key)"
echo "    ✓ userId (UUID, Foreign Key)"
echo "    ✓ detectedEmotion (STRING)"
echo "    ✓ emotionConfidence (FLOAT, 0-100)"
echo "    ✓ confidenceLevel (STRING, low/medium/high)"
echo "    ✓ userResponse (STRING, yes/no/maybe)"
echo "    ✓ userConfirmed (BOOLEAN)"
echo "    ✓ userNote (TEXT)"
echo "    ✓ activitiesSuggested (JSON)"
echo "    ✓ metadata (JSON)"
echo "    ✓ createdAt (DATE)"
echo "    ✓ updatedAt (DATE)"
echo ""

# ═══════════════════════════════════════════════════════════════════
# STEP 5: MIGRATE DATABASE IF NEEDED
# ═══════════════════════════════════════════════════════════════════
echo "✅ STEP 5: Database Migration"
echo "  If adding new fields to MoodEntry:"
echo "    npm run migrate"
echo "  Or manually:"
echo "    ALTER TABLE mood_entries ADD COLUMN confidenceLevel VARCHAR(20) DEFAULT 'medium';"
echo "    ALTER TABLE mood_entries ADD COLUMN metadata JSON DEFAULT '{}';"
echo ""

# ═══════════════════════════════════════════════════════════════════
# STEP 6: TEST THE SYSTEM
# ═══════════════════════════════════════════════════════════════════
echo "✅ STEP 6: Test Implementation"
echo "  1. Start the server:"
echo "     npm run xian"
echo "  2. Open browser and navigate to /user/mood"
echo "  3. Open Developer Console (F12)"
echo "  4. Check for these success messages:"
echo "     ✅ 'mood-tracker.js loaded and running'"
echo "     ✅ 'Mood Tracker Improvements loaded successfully'"
echo "     ✅ 'Enhanced Emotion Confirmation loaded'"
echo "  5. Test workflow:"
echo "     □ Click 'Start Scanning'"
echo "     □ Show face to camera"
echo "     □ Wait for auto-detection"
echo "     □ Confirm emotion accuracy"
echo "     □ Review tips and recommendations"
echo "     □ Check mood history updated"
echo ""

# ═══════════════════════════════════════════════════════════════════
# STEP 7: VERIFY BROWSER STORAGE
# ═══════════════════════════════════════════════════════════════════
echo "✅ STEP 7: Verify Local Storage"
echo "  In browser console, run:"
echo "    console.log(localStorage.getItem('mood_tracker_history'))"
echo "  Should show: Array of mood entries with timestamps"
echo ""

# ═══════════════════════════════════════════════════════════════════
# STEP 8: MONITOR LOGS
# ═══════════════════════════════════════════════════════════════════
echo "✅ STEP 8: Monitor Server Logs"
echo "  Should see logs like:"
echo "    ✅ Mood entry saved successfully"
echo "    📊 Emotion: happy (89% - high)"
echo "    👤 User: [Name] (ID: [UUID])"
echo "    🎯 User confirmed: Yes"
echo ""

# ═══════════════════════════════════════════════════════════════════
# TROUBLESHOOTING
# ═══════════════════════════════════════════════════════════════════
echo "❓ TROUBLESHOOTING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Issue: Tips not showing after emotion confirmation"
echo "Fix: "
echo "  1. Clear browser cache (Ctrl+Shift+Delete)"
echo "  2. Hard refresh page (Ctrl+Shift+R)"
echo "  3. Check console for errors"
echo ""
echo "Issue: Camera quality warnings too frequent"
echo "Fix: Adjust thresholds in CameraQualityChecker"
echo "  - Edit: public/js/mood-tracker-improvements.js"
echo "  - Find: luminanceThreshold = 50 (increase for less warnings)"
echo ""
echo "Issue: Emotions not saving to database"
echo "Fix:"
echo "  1. Check /user/mood/save endpoint exists"
echo "  2. Verify user session: console.log(req.session)"
echo "  3. Check MoodEntry table permissions"
echo ""
echo "Issue: History always empty"
echo "Fix:"
echo "  1. Verify at least one mood is saved"
echo "  2. Check GET /user/mood/history endpoint"
echo "  3. Try: localStorage.clear() then rescan"
echo ""

echo "=================================================="
echo "✅ DEPLOYMENT CHECKLIST COMPLETE"
echo "For full documentation, see: MOOD_TRACKER_IMPROVEMENTS.md"
echo "=================================================="
