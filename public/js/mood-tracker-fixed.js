/*
    MOOD TRACKER - FIXED & WORKING VERSION
    Reliable emotion detection with AI fallback to demo mode
*/

// Global state
let isScanning = false;
let detectionInterval = null;
let currentDetectedEmotion = null;
let isDemoMode = false;
let modelsLoaded = false;
let emotionHistory = [];

console.log('✅ Mood tracker fixed version loaded');

// Emotion configuration
const emotionConfig = {
  'happy': { label: 'Happy', icon: '😊', color: 'bg-yellow-100 border-yellow-400', textColor: 'text-yellow-700' },
  'sad': { label: 'Sad', icon: '😢', color: 'bg-blue-100 border-blue-400', textColor: 'text-blue-700' },
  'neutral': { label: 'Neutral', icon: '😐', color: 'bg-gray-100 border-gray-400', textColor: 'text-gray-700' },
  'angry': { label: 'Angry', icon: '😠', color: 'bg-red-100 border-red-400', textColor: 'text-red-700' },
  'fearful': { label: 'Anxious', icon: '😨', color: 'bg-purple-100 border-purple-400', textColor: 'text-purple-700' },
  'surprised': { label: 'Surprised', icon: '😮', color: 'bg-orange-100 border-orange-400', textColor: 'text-orange-700' },
  'disgusted': { label: 'Disgusted', icon: '🤢', color: 'bg-green-100 border-green-400', textColor: 'text-green-700' }
};

// Activity suggestions
const activitySuggestions = {
  'happy': ['Share your joy', 'Play games', 'Read success stories'],
  'sad': ['Talk to counselor', 'Journal your feelings', 'Read inspiring content'],
  'neutral': ['Reflect on your day', 'Practice mindfulness', 'Write in journal'],
  'angry': ['Do breathing exercises', 'Take a walk', 'Cool down first'],
  'fearful': ['Breathing exercises', 'Read calming content', 'Talk to someone'],
  'surprised': ['Take a moment', 'Journal about it', 'Share with friends'],
  'disgusted': ['Take a break', 'Self-care time', 'Do something pleasant']
};

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

async function initializeEverything() {
  console.log('🚀 Initializing mood tracker...');
  
  try {
    // Step 1: Request camera permission
    await requestCameraPermission();
    
    // Step 2: Try to load AI models (with 10 second timeout)
    await loadModelsWithTimeout();
    
    // Step 3: Show ready state
    showReadyState();
    
  } catch (error) {
    console.error('❌ Initialization error:', error.message);
    // Even if models fail, we can still use demo mode
    isDemoMode = true;
    showReadyState();
  }
}

async function requestCameraPermission() {
  console.log('📹 Requesting camera permission...');
  
  const video = document.getElementById('camera-feed');
  if (!video) {
    throw new Error('Video element not found');
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });

    video.srcObject = stream;
    video.play();
    
    console.log('✅ Camera permission granted');
    showAlert('✅ Camera ready!', 'success');
    
    return true;
  } catch (error) {
    console.error('❌ Camera error:', error);
    showAlert('❌ Camera permission denied. Please allow camera access.', 'error');
    throw error;
  }
}

async function loadModelsWithTimeout() {
  console.log('🤖 Loading emotion detection models...');
  
  // Create a timeout promise
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Model loading timeout')), 10000)
  );

  try {
    // Check if face-api is loaded
    if (typeof faceapi === 'undefined') {
      throw new Error('face-api not loaded');
    }

    // Try to load models
    const loadPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models/'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models/'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models/'),
    ]);

    await Promise.race([loadPromise, timeoutPromise]);
    
    modelsLoaded = true;
    isDemoMode = false;
    console.log('✅ AI models loaded successfully!');
    showAlert('✅ AI models ready! Click "Start Scanning" to begin', 'success');
    
  } catch (error) {
    console.warn('⚠️ Models failed to load:', error.message);
    console.log('📊 Switching to demo mode...');
    isDemoMode = true;
    modelsLoaded = false;
    showAlert('⚠️ Using demo mode (simulation). Click "Start Scanning" to test', 'info');
  }
}

function showReadyState() {
  const startBtn = document.getElementById('start-scan-btn');
  if (startBtn) {
    startBtn.style.display = 'flex';
    startBtn.disabled = false;
    startBtn.innerHTML = isDemoMode 
      ? '🎭 Start Scanning (Demo Mode)' 
      : '🎥 Start Scanning';
  }
  
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SCANNING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

window.startScanning = async function() {
  console.log('🎯 Starting emotion scan...');
  
  if (isScanning) {
    console.warn('Already scanning');
    return;
  }

  // Verify video is ready
  const video = document.getElementById('camera-feed');
  if (!video || !video.srcObject) {
    showAlert('❌ Camera not ready. Please refresh the page.', 'error');
    return;
  }

  // Reset state
  isScanning = true;
  currentDetectedEmotion = null;
  emotionHistory = [];

  // Update UI
  document.getElementById('start-scan-btn').style.display = 'none';
  document.getElementById('stop-scan-btn').style.display = 'flex';
  document.getElementById('scanning-indicator').style.display = 'flex';
  document.getElementById('emotion-display').classList.add('hidden');
  document.getElementById('confirmation-modal').classList.add('hidden');

  showAlert(isDemoMode ? '🎭 Demo mode - showing simulated emotions' : '🎥 Scanning... show your face', 'success');

  // Start detection loop
  const detectionSpeed = isDemoMode ? 500 : 250; // Slower in demo mode
  
  if (detectionInterval) {
    clearInterval(detectionInterval);
  }

  detectionInterval = setInterval(async () => {
    await detectEmotion();
  }, detectionSpeed);

  // Auto-stop after 8 seconds
  setTimeout(() => {
    if (isScanning) {
      console.log('⏱️ Auto-stopping scan (8 second limit)');
      stopScanning();
    }
  }, 8000);
};

window.stopScanning = function() {
  console.log('⏹️ Stopping emotion scan');
  
  isScanning = false;

  // Update UI
  document.getElementById('start-scan-btn').style.display = 'flex';
  document.getElementById('stop-scan-btn').style.display = 'none';
  document.getElementById('scanning-indicator').style.display = 'none';

  // Clear interval
  if (detectionInterval) {
    clearInterval(detectionInterval);
  }

  // Display result if emotion was detected
  if (currentDetectedEmotion) {
    displayEmotionResult(currentDetectedEmotion);
  } else {
    showAlert('⚠️ No emotion detected. Try again with better lighting.', 'info');
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// EMOTION DETECTION
// ═══════════════════════════════════════════════════════════════════════════

async function detectEmotion() {
  if (!isScanning) return;

  const video = document.getElementById('camera-feed');
  if (!video || !video.srcObject || video.readyState !== video.HAVE_ENOUGH_DATA) {
    return;
  }

  try {
    if (isDemoMode) {
      // Demo mode: generate random emotion
      detectDemoEmotion();
    } else {
      // Real mode: use AI detection
      detectWithAI();
    }
  } catch (error) {
    console.error('Detection error:', error);
  }
}

function detectDemoEmotion() {
  const emotions = Object.keys(emotionConfig);
  const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
  const confidence = 75 + Math.random() * 25; // 75-100%

  currentDetectedEmotion = {
    emotion: randomEmotion,
    confidence: confidence
  };

  updateEmotionDisplay(currentDetectedEmotion);

  // Auto-stop after stable emotion
  emotionHistory.push(randomEmotion);
  if (emotionHistory.length >= 4 && emotionHistory[emotionHistory.length - 1] === randomEmotion) {
    stopScanning();
  }
}

async function detectWithAI() {
  if (!modelsLoaded || typeof faceapi === 'undefined') {
    return;
  }

  const video = document.getElementById('camera-feed');

  try {
    // Verify models are loaded
    if (!faceapi.nets.tinyFaceDetector.isLoaded() || !faceapi.nets.faceExpressionNet.isLoaded()) {
      return;
    }

    // Detect faces and expressions
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (detections.length === 0) {
      // No face detected
      updateEmotionDisplay(null);
      return;
    }

    // Get the first face
    const detectedFace = detections[0];
    const expressions = detectedFace.expressions;

    // Find dominant emotion
    let maxEmotion = '';
    let maxScore = 0;

    for (const [emotion, score] of Object.entries(expressions)) {
      if (score > maxScore) {
        maxScore = score;
        maxEmotion = emotion;
      }
    }

    if (maxScore > 0.15) {
      currentDetectedEmotion = {
        emotion: maxEmotion,
        confidence: maxScore * 100
      };

      updateEmotionDisplay(currentDetectedEmotion);

      // Track stable emotions for auto-stop
      emotionHistory.push(maxEmotion);
      if (emotionHistory.length >= 3 && 
          emotionHistory[emotionHistory.length - 1] === maxEmotion &&
          emotionHistory[emotionHistory.length - 2] === maxEmotion) {
        console.log('✅ Emotion stable - auto-stopping');
        stopScanning();
      }
    }

  } catch (error) {
    console.error('AI detection error:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UI DISPLAY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function updateEmotionDisplay(emotion) {
  const display = document.getElementById('emotion-display');
  if (!display) return;

  if (!emotion) {
    display.innerHTML = '<p class="text-gray-500">No face detected - position your face in the camera</p>';
    return;
  }

  const config = emotionConfig[emotion.emotion];
  if (!config) return;

  display.innerHTML = `
    <div class="text-center p-6 ${config.color} border-2 rounded-lg animate-pulse">
      <div class="text-6xl mb-4">${config.icon}</div>
      <h3 class="text-2xl font-bold ${config.textColor}">${config.label}</h3>
      <p class="text-sm ${config.textColor} mt-2">Confidence: ${emotion.confidence.toFixed(1)}%</p>
    </div>
  `;
}

function displayEmotionResult(emotion) {
  const config = emotionConfig[emotion.emotion];
  const suggestions = activitySuggestions[emotion.emotion] || [];

  const modal = document.getElementById('confirmation-modal');
  if (!modal) return;

  modal.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
      <div class="bg-white rounded-xl p-8 max-w-md w-full">
        <!-- Result -->
        <div class="text-center mb-8 p-6 ${config.color} border-2 rounded-lg">
          <div class="text-6xl mb-4">${config.icon}</div>
          <h2 class="text-3xl font-bold ${config.textColor}">${config.label}</h2>
          <p class="text-sm ${config.textColor} mt-2">Confidence: ${emotion.confidence.toFixed(1)}%</p>
        </div>

        <!-- Suggestions -->
        <div class="mb-6">
          <h3 class="font-bold text-gray-900 mb-3">📋 Suggestions:</h3>
          <ul class="space-y-2">
            ${suggestions.map(s => `<li class="text-gray-700 flex items-start gap-2">
              <span class="text-green-500">✓</span>
              <span>${s}</span>
            </li>`).join('')}
          </ul>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button onclick="startScanning()" class="flex-1 bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition">
            🔄 Scan Again
          </button>
          <button onclick="saveMoodAndClose('${emotion.emotion}')" class="flex-1 bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition">
            ✅ Save Mood
          </button>
        </div>

        <!-- Dismiss -->
        <button onclick="closeResult()" class="mt-4 w-full text-gray-600 hover:text-gray-900 font-medium">
          ✕ Close
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

window.closeResult = function() {
  const modal = document.getElementById('confirmation-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
};

window.saveMoodAndClose = async function(emotion) {
  console.log('💾 Saving mood:', emotion);
  
  try {
    const response = await fetch('/api/mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        detectedEmotion: emotion,
        emotionConfidence: currentDetectedEmotion?.confidence || 0,
        userConfirmed: true,
        userResponse: 'yes'
      })
    });

    if (response.ok) {
      showAlert('✅ Mood saved successfully!', 'success');
      closeResult();
      currentDetectedEmotion = null;
    } else {
      showAlert('❌ Failed to save mood', 'error');
    }
  } catch (error) {
    console.error('Save error:', error);
    showAlert('❌ Error saving mood', 'error');
  }
};

function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-100' : type === 'error' ? 'bg-red-100' : 'bg-blue-100';
  const borderColor = type === 'success' ? 'border-green-400' : type === 'error' ? 'border-red-400' : 'border-blue-400';
  const textColor = type === 'success' ? 'text-green-700' : type === 'error' ? 'text-red-700' : 'text-blue-700';

  alertDiv.className = `fixed top-6 right-6 ${bgColor} border-l-4 ${borderColor} p-4 rounded-lg shadow-lg z-50 max-w-md`;
  alertDiv.innerHTML = `<p class="${textColor} font-medium">${message}</p>`;
  document.body.appendChild(alertDiv);

  setTimeout(() => alertDiv.remove(), 4000);
}

// ═══════════════════════════════════════════════════════════════════════════
// STARTUP
// ═══════════════════════════════════════════════════════════════════════════

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEverything);
} else {
  initializeEverything();
}
