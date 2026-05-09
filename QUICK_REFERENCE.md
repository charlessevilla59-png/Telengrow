# 🎯 MOOD TRACKER - QUICK REFERENCE CODE GUIDE

## 📌 QUICK START - Copy & Paste Ready Code

### 1️⃣ ROUTES TO ADD (Copy to your routes file)

```javascript
// ════════════════════════════════════════════════════════════
// MOOD TRACKER ROUTES - Add these
// ════════════════════════════════════════════════════════════

import * as moodController from '../controllers/moodControllerEnhanced.js';

// Render mood tracker page
router.get('/user/mood', moodController.moodTrackerPage);

// Save detected emotion
router.post('/user/mood/save', moodController.saveMoodEnhanced);

// Get mood history (with pagination)
router.get('/user/mood/history', moodController.getMoodHistoryEnhanced);

// Get emotional trends for 7 days
router.get('/user/mood/trends', moodController.getEmotionalTrends);

// Get specific mood entry
router.get('/user/mood/:moodId', moodController.getMoodById);
```

---

### 2️⃣ DATABASE SCHEMA - Add Missing Fields

```sql
-- If MoodEntry table doesn't have these fields, add them:

ALTER TABLE mood_entries 
ADD COLUMN confidenceLevel VARCHAR(20) DEFAULT 'medium';

ALTER TABLE mood_entries 
ADD COLUMN metadata JSON DEFAULT '{}';

ALTER TABLE mood_entries 
ADD INDEX idx_user_emotion (userId, detectedEmotion);

ALTER TABLE mood_entries 
ADD INDEX idx_user_date (userId, createdAt DESC);
```

---

### 3️⃣ SEQUELIZE MODEL DEFINITION

```javascript
// models/MoodEntryModel.js - Ensure all fields exist

export const MoodEntry = sequelize.define('MoodEntry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'id' },
    onDelete: 'CASCADE'
  },
  detectedEmotion: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'anxious']]
    }
  },
  emotionConfidence: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0, max: 100 }
  },
  confidenceLevel: {
    type: DataTypes.STRING(20),
    defaultValue: 'medium',
    validate: { isIn: [['low', 'medium', 'high']] }
  },
  userResponse: {
    type: DataTypes.STRING(20),
    validate: { isIn: [[null, 'yes', 'no', 'maybe']] }
  },
  userConfirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  userNote: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activitiesSuggested: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'mood_entries',
  timestamps: true
});
```

---

### 4️⃣ MIDDLEWARE - Add Authentication Check

```javascript
// Add to routes/index.js before mood routes

// Protect all mood routes with authentication
router.use('/user/mood', (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Please log in to access mood tracker'
    });
  }
  next();
});
```

---

### 5️⃣ TESTING - Browser Console Commands

```javascript
// Test emotion history manager
window.emotionHistoryManager.addEntry('happy', 85, true, 'Feeling great!');
window.emotionHistoryManager.getStatistics();
window.emotionHistoryManager.getRecentEntries(5);

// Test camera quality
const video = document.getElementById('camera-feed');
window.cameraQualityChecker.checkCameraQuality(video);

// Test emotion analyzer
window.emotionAnalyzer.analyzeDetectionQuality({
  emotion: 'happy',
  confidence: 89
});

// Manually trigger confirmation (for testing)
window.currentDetectedEmotion = {
  emotion: 'happy',
  confidence: 85
};
window.confirmEmotion('yes');

// Check all tips for an emotion
console.log(window.emotionTips['happy']);
console.log(window.emotionTips['sad']);
console.log(window.emotionTips['angry']);

// Get recommendations for emotion
const recs = window.SystemRecommendations.generateRecommendations('happy');
console.log(recs);
```

---

### 6️⃣ API TESTING - cURL Examples

```bash
# Test mood save endpoint
curl -X POST http://localhost:3000/user/mood/save \
  -H "Content-Type: application/json" \
  -d '{
    "detectedEmotion": "happy",
    "emotionConfidence": 85,
    "userResponse": "yes",
    "userConfirmed": true
  }'

# Get mood history
curl http://localhost:3000/user/mood/history?days=7&limit=10

# Get emotional trends
curl http://localhost:3000/user/mood/trends

# Get specific mood
curl http://localhost:3000/user/mood/mood-id-here
```

---

### 7️⃣ CLIENT-SIDE INTEGRATION - HTML/JS

```html
<!-- In your mood-tracker view -->

<!-- Scripts load in this order: -->
<script defer src="/js/mood-tracker-utils.js"></script>
<script defer src="/js/mood-tracker-improvements.js"></script>
<script defer src="/js/mood-tracker.js"></script>
<script defer src="/js/mood-tracker-enhanced.js"></script>

<!-- Call functions from anywhere -->
<script>
  // Start scanning with quality check
  document.getElementById('start-scan-btn').onclick = () => {
    window.startScanning();
  };

  // Manual confirmation
  document.getElementById('confirm-yes').onclick = () => {
    window.confirmEmotion('yes');
  };

  // Get recommendations
  document.getElementById('get-tips').onclick = () => {
    const tips = window.SystemRecommendations.generateRecommendations('happy');
    console.log(tips);
    window.showEmotionTips({ label: 'Happy', icon: '😊' }, tips);
  };
</script>
```

---

### 8️⃣ ERROR HANDLING - Try/Catch Examples

```javascript
// Safe initialization
async function initMoodTracker() {
  try {
    // Check if improvements loaded
    if (!window.emotionHistoryManager) {
      throw new Error('Mood tracker improvements not loaded');
    }

    // Check if libraries available
    if (typeof faceapi === 'undefined') {
      throw new Error('Face API not available');
    }

    // Safe function call
    window.startScanning();
  } catch (error) {
    console.error('Failed to initialize:', error);
    showAlert('Error: ' + error.message, 'error');
  }
}

// Safe emotion save
async function saveEmotionSafely(emotion, confidence, response) {
  try {
    if (!emotion || confidence < 0 || confidence > 100) {
      throw new Error('Invalid emotion data');
    }

    const result = await fetch('/user/mood/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        detectedEmotion: emotion,
        emotionConfidence: confidence,
        userResponse: response,
        userConfirmed: true
      })
    });

    if (!result.ok) {
      throw new Error(`HTTP ${result.status}`);
    }

    const data = await result.json();
    return data;
  } catch (error) {
    console.error('Save failed:', error);
    throw error;
  }
}
```

---

### 9️⃣ DEBUGGING - Browser Console Helpers

```javascript
// Comprehensive debug info
function debugMoodTracker() {
  console.log('🔍 MOOD TRACKER DEBUG INFO');
  console.log('');
  
  console.log('📦 Libraries Loaded:');
  console.log('  faceapi:', typeof faceapi !== 'undefined' ? '✅' : '❌');
  console.log('  tf:', typeof tf !== 'undefined' ? '✅' : '❌');
  
  console.log('');
  console.log('🎯 Global Objects:');
  console.log('  emotionHistoryManager:', typeof window.emotionHistoryManager);
  console.log('  cameraQualityChecker:', typeof window.cameraQualityChecker);
  console.log('  emotionAnalyzer:', typeof window.emotionAnalyzer);
  
  console.log('');
  console.log('📊 Current State:');
  console.log('  isScanning:', window.isScanning);
  console.log('  modelsLoaded:', window.modelsLoaded);
  console.log('  isDemoMode:', window.isDemoMode);
  console.log('  currentDetectedEmotion:', window.currentDetectedEmotion);
  
  console.log('');
  console.log('💾 Local Storage:');
  const history = localStorage.getItem('mood_tracker_history');
  const entries = history ? JSON.parse(history).length : 0;
  console.log('  Mood entries:', entries);
  
  console.log('');
  console.log('🎬 Video Status:');
  const video = document.getElementById('camera-feed');
  if (video) {
    console.log('  Video found:', true);
    console.log('  Video srcObject:', !!video.srcObject);
    console.log('  Video playing:', !video.paused);
    console.log('  Video readyState:', video.readyState);
  }
  
  console.log('');
  console.log('🧠 AI Models:');
  if (typeof faceapi !== 'undefined' && faceapi.nets) {
    console.log('  tinyFaceDetector loaded:', faceapi.nets.tinyFaceDetector.isLoaded?.());
    console.log('  faceExpressionNet loaded:', faceapi.nets.faceExpressionNet.isLoaded?.());
  }
}

// Run debug
debugMoodTracker();
```

---

### 🔟 COMMON ISSUES - Solutions

```javascript
// Issue: Tips not showing
// Solution: Force reload
window.location.reload(true);  // Hard refresh

// Issue: History empty
// Solution: Clear and resync
localStorage.removeItem('mood_tracker_history');
// Then scan emotion again

// Issue: Camera not working
// Solution: Check permissions and restart
async function resetCamera() {
  const video = document.getElementById('camera-feed');
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
  }
  // Reload page to reinitialize
  location.reload();
}

// Issue: Models won't load
// Solution: Use demo mode
window.skipModelsAndUseDemoMode();

// Issue: Confidence always low
// Solution: Improve lighting
const quality = window.cameraQualityChecker.checkCameraQuality(video);
console.log('Quality recommendation:', quality.recommendation);
```

---

## 📊 REAL USAGE EXAMPLES

### **Complete Workflow Example**

```javascript
// User workflow simulation
async function fullMoodWorkflow() {
  try {
    // 1. Start scanning
    console.log('1. Starting scan...');
    window.startScanning();
    
    // 2. Wait for auto-detection (simulated)
    await new Promise(r => setTimeout(r, 3000));
    
    // 3. Simulate detected emotion
    window.currentDetectedEmotion = {
      emotion: 'happy',
      confidence: 87
    };
    
    // 4. Show confirmation
    window.stopScanning();
    await new Promise(r => setTimeout(r, 500));
    
    // 5. Confirm emotion
    console.log('2. Confirming emotion...');
    await window.confirmEmotion('yes');
    
    // 6. Tips shown automatically
    // 7. Activities shown automatically
    // 8. History updated automatically
    
    console.log('✅ Complete workflow finished!');
    
  } catch (error) {
    console.error('❌ Workflow error:', error);
  }
}

// Run it
fullMoodWorkflow();
```

---

## 🔗 QUICK LINKS

- **Main Documentation:** MOOD_TRACKER_IMPROVEMENTS.md
- **Deployment Checklist:** MOOD_TRACKER_DEPLOYMENT.sh
- **Summary:** IMPROVEMENTS_SUMMARY.md
- **Enhancement Files:**
  - public/js/mood-tracker-improvements.js
  - public/js/mood-tracker-enhanced.js
  - controllers/moodControllerEnhanced.js

---

**Last Updated:** 2026-05-06
**Version:** 2.0 Enhanced Ready
**Status:** Production Ready ✅
