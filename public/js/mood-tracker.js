/*
    MIT License - Mood Tracker with Face Recognition
    Copyright (c) 2025 Tellngrow Platform
    
    Uses face-api.js for face detection and expression recognition
*/

let isScanning = false;
let detectionInterval = null;
let currentDetectedEmotion = null;
let modelsLoaded = false;

// Log immediately to show script is loaded
console.log('🎬 mood-tracker.js loaded and running');

// Backup: ensure camera is visible on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('camera-feed');
    if (video) {
      video.style.display = 'block';
      video.style.visibility = 'visible';
      console.log('✅ Camera feed forced visible on DOMContentLoaded');
    }
  });
} else {
  // Page already loaded
  const video = document.getElementById('camera-feed');
  if (video) {
    video.style.display = 'block';
    video.style.visibility = 'visible';
    console.log('✅ Camera feed forced visible on script load');
  }
}

// Safe alert for early initialization
function safeAlert(message, type = 'info') {
  if (typeof showAlert === 'function') {
    showAlert(message, type);
  } else {
    const alertDiv = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-50' : type === 'error' ? 'bg-red-50' : 'bg-blue-50';
    const borderColor = type === 'success' ? 'border-green-400' : type === 'error' ? 'border-red-400' : 'border-blue-400';
    const textColor = type === 'success' ? 'text-green-700' : type === 'error' ? 'text-red-700' : 'text-blue-700';
    
    alertDiv.className = `fixed top-6 right-6 ${bgColor} border-l-4 ${borderColor} p-4 rounded-lg shadow-lg z-50 max-w-md`;
    alertDiv.innerHTML = `<p class="${textColor} font-medium">${message}</p>`;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => alertDiv.remove(), 5000);
  }
}

// Emotion mapping from face-api expressions to user-friendly names with feature links
const emotionMap = {
  'neutral': { 
    label: 'Neutral', 
    icon: '😐', 
    color: 'neutral', 
    activities: [
      { text: 'Take a moment for reflection', action: 'journal', link: '/journal', emoji: '📝' },
      { text: 'Practice mindfulness', action: 'breathing', link: '/games/breathing-bubble', emoji: '🫁' },
      { text: 'Journal your thoughts', action: 'journal', link: '/journal/new', emoji: '✍️' }
    ] 
  },
  'happy': { 
    label: 'Happy', 
    icon: '😊', 
    color: 'happy', 
    activities: [
      { text: 'Share your joy with others', action: 'messages', link: '/messages', emoji: '💬' },
      { text: 'Engage in your favorite hobby', action: 'games', link: '/games', emoji: '🎮' },
      { text: 'Celebrate your achievements', action: 'progress', link: '/user/progress', emoji: '🏆' }
    ] 
  },
  'sad': { 
    label: 'Sad', 
    icon: '😢', 
    color: 'sad', 
    activities: [
      { text: 'Listen to uplifting content', action: 'reading', link: '/reading', emoji: '📚' },
      { text: 'Journal about your feelings', action: 'journal', link: '/journal/new', emoji: '📔' },
      { text: 'Reach out to counselor', action: 'messages', link: '/messages', emoji: '💬' }
    ] 
  },
  'angry': { 
    label: 'Angry', 
    icon: '😠', 
    color: 'angry', 
    activities: [
      { text: 'Practice breathing exercises', action: 'breathing', link: '/games/breathing-bubble', emoji: '🫁' },
      { text: 'Take a walk or exercise', action: 'reading', link: '/reading/better-sleep', emoji: '🚶' },
      { text: 'Write down your frustrations', action: 'journal', link: '/journal/new', emoji: '✍️' }
    ] 
  },
  'fearful': { 
    label: 'Anxious', 
    icon: '😨', 
    color: 'anxious', 
    activities: [
      { text: 'Practice grounding techniques', action: 'reading', link: '/reading', emoji: '🧘' },
      { text: 'Try the breathing bubble game', action: 'breathing', link: '/games/breathing-bubble', emoji: '🫁' },
      { text: 'Talk to a counselor', action: 'messages', link: '/messages', emoji: '💬' }
    ] 
  },
  'disgusted': { 
    label: 'Disgusted', 
    icon: '🤢', 
    color: 'angry', 
    activities: [
      { text: 'Take a break from the situation', action: 'games', link: '/games', emoji: '🎮' },
      { text: 'Practice self-care', action: 'reading', link: '/reading', emoji: '💆' },
      { text: 'Do something pleasant', action: 'journal', link: '/journal', emoji: '🌸' }
    ] 
  },
  'surprised': { 
    label: 'Surprised', 
    icon: '😮', 
    color: 'happy', 
    activities: [
      { text: 'Take a moment to process', action: 'journal', link: '/journal', emoji: '⏸️' },
      { text: 'Write about the experience', action: 'journal', link: '/journal/new', emoji: '📝' },
      { text: 'Share with a friend', action: 'messages', link: '/messages', emoji: '👥' }
    ] 
  },
};

// Additional emotion: anxious (not in standard face expressions)
const additionalEmotions = {
  'anxious': { 
    label: 'Anxious', 
    icon: '😟', 
    color: 'anxious', 
    activities: [
      { text: 'Practice the breathing bubble', action: 'breathing', link: '/games/breathing-bubble', emoji: '🫁' },
      { text: 'Try progressive relaxation', action: 'reading', link: '/reading', emoji: '🧘' },
      { text: 'Read anxiety management tips', action: 'reading', link: '/reading', emoji: '📚' }
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// DEMO MODE FUNCTIONS - Fallback when models can't load
// ═══════════════════════════════════════════════════════════════════════════

let modelLoadTimeout;
window.isDemoMode = false;
window.modelsLoaded = false;

/**
 * Download Models - Placeholder function
 * Models are loaded automatically from CDN or local /models/ directory
 */
function downloadModels() {
  console.log('📥 Download models requested');
  safeAlert('Models are automatically loaded from CDN. If you have models locally at /models/, they will be used first. If download is stuck, try the Demo Mode button instead.', 'info');
}

/**
 * Generate simulated emotion for demo/testing
 */
let lastDemoEmotion = null;
function generateDemoEmotion() {
  const emotions = ['happy', 'sad', 'neutral', 'angry', 'surprised', 'fearful', 'disgusted'];
  
  // Keep same emotion for 3-5 frames for stability so user can see it
  if (lastDemoEmotion && Math.random() > 0.3) {
    return lastDemoEmotion;
  }
  
  const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
  
  // Random confidence between 75-95%
  const confidence = Math.floor(Math.random() * 20 + 75);
  
  lastDemoEmotion = {
    emotion: randomEmotion,
    confidence: confidence.toString()
  };
  
  console.log(`🎭 Demo emotion: ${randomEmotion} (${confidence}%)`);
  
  return lastDemoEmotion;
}

/**
 * Skip loading models and use demo mode immediately
 */
function skipModelsAndUseDemoMode() {
  console.log('🎭 SWITCHING TO DEMO MODE');
  
  window.isDemoMode = true;
  window.modelsLoaded = 'demo';
  
  // Clear the model load timeout
  if (modelLoadTimeout) {
    clearTimeout(modelLoadTimeout);
  }
  
  // Hide loading indicator
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
  
  // Make video visible
  const video = document.getElementById('camera-feed');
  if (video) {
    video.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important;';
  }
  
  safeAlert('🎭 Demo mode enabled - Emotions are simulated for testing', 'success');
  console.log('✅ Demo mode ready! Click "Start Scanning"');
}

/**
 * Auto-enable demo mode after timeout
 */
function autoEnableDemoMode() {
  modelLoadTimeout = setTimeout(() => {
    if (!window.modelsLoaded || window.modelsLoaded === false) {
      console.warn('⏰ Model loading timeout - activating DEMO MODE automatically');
      skipModelsAndUseDemoMode();
    }
  }, 5000); // 5 second timeout - faster activation
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🎯 Mood Tracker DOMContentLoaded event fired');
  
  // Check if elements exist
  const video = document.getElementById('camera-feed');
  const loadingIndicator = document.getElementById('loading-indicator');
  
  console.log('📋 Element check:', {
    videoExists: !!video,
    loadingIndicatorExists: !!loadingIndicator,
  });

  // Make camera visible immediately
  if (video) {
    video.style.display = 'block';
    video.style.visibility = 'visible';
    video.style.opacity = '1';
  }
  
  // Check library availability with retries
  console.log('📦 Checking external libraries...');
  console.log('  Using CDN: cdn.jsdelivr.net');
  console.log('  TensorFlow (tf):', typeof tf !== 'undefined' ? '✅ Available' : '❌ Not available');
  console.log('  face-api:', typeof faceapi !== 'undefined' ? '✅ Available' : '❌ Not available');
  
  // Wait for TensorFlow with longer timeout
  let tfAttempts = 0;
  const maxTfAttempts = 40; // 20 seconds
  
  while (typeof tf === 'undefined' && tfAttempts < maxTfAttempts) {
    console.log(`⏳ Waiting for TensorFlow... (${tfAttempts + 1}/${maxTfAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 500));
    tfAttempts++;
  }
  
  if (typeof tf === 'undefined') {
    console.error('❌ TensorFlow failed to load from CDN');
    console.error('CDN URL: https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js');
    safeAlert('⚠️ TensorFlow CDN timeout. Check internet connection.', 'error');
    return;
  }
  console.log(`✅ TensorFlow loaded in ${(tfAttempts * 0.5).toFixed(1)}s`);
  
  // Wait for face-api with longer timeout
  let faceAttempts = 0;
  const maxFaceAttempts = 40; // 20 seconds
  
  while (typeof faceapi === 'undefined' && faceAttempts < maxFaceAttempts) {
    console.log(`⏳ Waiting for face-api library... (${faceAttempts + 1}/${maxFaceAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 500));
    faceAttempts++;
  }
  
  if (typeof faceapi === 'undefined') {
    console.error('❌ face-api failed to load from CDN');
    console.error('CDN URL: https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js');
    console.error('Expected object: window.faceapi');
    safeAlert('❌ Face detection library failed to load. Check internet connection and browser console for blocked resources.', 'error');
    return;
  }
  
  console.log(`✅ face-api loaded in ${(faceAttempts * 0.5).toFixed(1)}s`);
  console.log('✅ All libraries loaded successfully');
  console.log('🚀 Initializing face detection...');
  
  await initializeFaceDetection();
  loadMoodHistory();
});

/**
 * Initialize Face Detection Models
 */
async function initializeFaceDetection() {
  const video = document.getElementById('camera-feed');
  const loadingIndicator = document.getElementById('loading-indicator');
  const permissionIndicator = document.getElementById('camera-permission-indicator');
  const permissionAlert = document.getElementById('permission-alert');
  
  // Safety checks
  if (!video) {
    console.error('❌ Video element not found!');
    safeAlert('Video element not found. Please refresh the page.', 'error');
    return;
  }
  
  console.log('✅ Video element found');
  
  if (!loadingIndicator) {
    console.error('❌ Loading indicator not found!');
    safeAlert('Loading indicator not found. Please refresh the page.', 'error');
    return;
  }
  
  console.log('✅ Loading indicator found');
  
  // Get or create loading text
  let loadingText = loadingIndicator.querySelector('p');
  if (!loadingText) {
    loadingText = document.createElement('p');
    loadingText.className = 'text-white text-lg font-semibold';
    loadingIndicator.appendChild(loadingText);
  }

  try {
    console.log('🔧 Starting face detection initialization...');
    
    // Double-check faceapi is loaded before proceeding
    if (typeof faceapi === 'undefined') {
      throw new Error('face-api library is not defined - failed to load from CDN');
    }
    
    console.log('✅ face-api is available');
    console.log('📊 face-api version info:', {
      hasNets: !!faceapi.nets,
      hasTinyFaceDetector: !!faceapi.nets?.tinyFaceDetector,
      hasFaceExpressionNet: !!faceapi.nets?.faceExpressionNet,
      hasFaceLandmark68Net: !!faceapi.nets?.faceLandmark68Net,
    });

    // Show loading indicator
    loadingIndicator.style.display = 'flex';
    if (permissionAlert) {
      permissionAlert.classList.add('hidden');
    }

    // Update loading text
    const updateLoading = (text) => {
      console.log(text);
      if (loadingText && loadingText.textContent !== text) {
        loadingText.textContent = text;
      }
    };

    // Step 1: Request camera access FIRST (before loading models)
    updateLoading('📹 Requesting camera permission...');
    console.log('⚠️ Browser will ask for camera permission - PLEASE CLICK ALLOW');
    
    // Show camera permission indicator
    if (permissionIndicator) {
      permissionIndicator.style.display = 'flex';
    }
    
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      
      // Hide permission indicator after permission granted
      if (permissionIndicator) {
        permissionIndicator.style.display = 'none';
      }
      
      updateLoading('✅ Camera permission granted!');
      console.log('✅ Camera access granted and stream received');
      console.log('📹 Stream active:', stream.active);
      console.log('📹 Video tracks:', stream.getVideoTracks().length);
    } catch (cameraError) {
      // Hide permission indicator after permission denied
      if (permissionIndicator) {
        permissionIndicator.style.display = 'none';
      }
      
      console.error('❌ Camera error:', cameraError);
      console.error('Error name:', cameraError.name);
      console.error('Error message:', cameraError.message);
      
      updateLoading('❌ Camera permission denied');
      if (permissionAlert) {
        permissionAlert.classList.remove('hidden');
      }
      loadingIndicator.style.display = 'none';
      safeAlert('❌ Camera permission was denied. Please click "Allow" when your browser asks for camera access.', 'error');
      throw cameraError;
    }

    // Set video stream and ensure it's playing
    updateLoading('📹 Starting camera feed...');
    
    // Make absolutely sure video element is visible
    video.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; width: 100% !important; height: 100% !important;';
    
    // Assign stream
    video.srcObject = stream;
    console.log('✅ Stream assigned to video element');
    console.log('📺 Video element display:', window.getComputedStyle(video).display);
    console.log('📺 Video element visibility:', window.getComputedStyle(video).visibility);
    
    // Try to play the video immediately
    try {
      video.play();
      console.log('✅ Video play() called');
    } catch (playError) {
      console.warn('⚠️ Video play warning:', playError);
    }
    
    // Wait for video to be ready with explicit checks
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error('❌ Video stream timeout - metadata not loaded after 5 seconds');
        console.log('Video readyState:', video.readyState);
        console.log('Video paused:', video.paused);
        console.log('Stream active:', stream.active);
        reject(new Error('Video stream timeout'));
      }, 5000);

      const checkReady = () => {
        console.log('Checking video ready... readyState:', video.readyState);
        if (video.readyState >= 2) {
          clearTimeout(timeout);
          video.removeEventListener('loadedmetadata', checkReady);
          console.log('✅ Video metadata loaded - readyState >= 2');
          resolve();
        }
      };

      if (video.readyState >= 2) {
        clearTimeout(timeout);
        console.log('✅ Video already ready on first check - readyState:', video.readyState);
        resolve();
      } else {
        console.log('⏳ Waiting for video metadata...');
        video.addEventListener('loadedmetadata', checkReady);
        // Also check every 200ms as backup
        const checkInterval = setInterval(() => {
          if (video.readyState >= 2 && timeout._destroyed !== true) {
            clearInterval(checkInterval);
            clearTimeout(timeout);
            video.removeEventListener('loadedmetadata', checkReady);
            console.log('✅ Video ready detected by polling');
            resolve();
          }
        }, 200);
      }
    });

    // Final play attempt
    try {
      if (video.paused) {
        await video.play();
        console.log('✅ Video playing confirmed');
      }
    } catch (e) {
      console.warn('⚠️ Video play catch:', e);
    }

    // Force video to be visible before moving forward
    video.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; width: 100% !important; height: 100% !important; border-radius: 12px; object-fit: cover;';
    console.log('📹 Video visibility enforced');

    updateLoading('📹 Camera feed active');
    console.log('✅ Camera stream ready');

    // Step 2: Load models (can happen while camera is streaming)
    updateLoading('🤖 Loading AI models (this may take ~10 seconds)...');
    console.log('📦 Starting model loading...');
    
    // Auto-enable demo mode if models take too long
    autoEnableDemoMode();
    
    // FIXED: Use working CDN paths WITHOUT cache parameters in the path
    // (cache-bust breaks the directory structure)
    const modelUrls = [
      `/models/`,                                                      // Local hosting - BEST
      `https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/`,    // jsdelivr CDN
      `https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/`, // GitHub raw
    ];
    
    let modelsLoaded = false;
    let lastError = null;
    
    console.log('📦 Will try', modelUrls.length, 'CDN URLs for models');
    
    for (let urlIndex = 0; urlIndex < modelUrls.length; urlIndex++) {
      if (modelsLoaded) break;
      
      const modelUrl = modelUrls[urlIndex];
      console.log(`\n📥 [${urlIndex + 1}/${modelUrls.length}] Trying: ${modelUrl}`);
      
      try {
        const modelStartTime = Date.now();
        
        // Test if model manifest is accessible first
        console.log(`   Testing access to: ${modelUrl}tiny_face_detector_model-weights_manifest.json`);
        
        // Load models with timeout
        const loadPromise = Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
          faceapi.nets.faceExpressionNet.loadFromUri(modelUrl),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
        ]);
        
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Load timeout - 15 seconds')), 15000)
        );
        
        await Promise.race([loadPromise, timeoutPromise]);
        
        const modelLoadTime = Date.now() - modelStartTime;
        console.log(`✅ SUCCESS! Models loaded in ${modelLoadTime}ms`);
        console.log(`📍 Working CDN: ${modelUrl}`);
        modelsLoaded = true;
        
        // Clear the demo mode timeout since models loaded successfully
        if (modelLoadTimeout) {
          clearTimeout(modelLoadTimeout);
          modelLoadTimeout = null;
        }
        window.modelsLoaded = true;
        window.isDemoMode = false;
        
      } catch (modelError) {
        lastError = modelError;
        console.error(`❌ Failed from ${modelUrl}`);
        console.error(`   Error: ${modelError.message}`);
        console.error(`   Stack:`, modelError.stack);
        
        // Log the specific fetch URL that failed for debugging
        if (modelError.message.includes('404')) {
          console.error('   → Model files not found at this path');
        } else if (modelError.message.includes('CORS')) {
          console.error('   → CORS policy blocked access');
        } else if (modelError.message.includes('timeout')) {
          console.error('   → Request timed out');
        }
        
        if (urlIndex < modelUrls.length - 1) {
          console.log(`⏳ Trying next URL in 1 second...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (!modelsLoaded) {
      console.error('\n❌ ALL CDN ATTEMPTS FAILED');
      console.error('Tried these URLs:', modelUrls);
      console.error('Last error:', lastError?.message);
      
      const troubleshoot = `
⚠️  MODEL LOADING FAILED - TROUBLESHOOTING GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ RECOMMENDED FIX (Local Model Hosting):
1. Create folder: public/models/
2. Download models from: https://github.com/vladmandic/face-api/tree/master/model
3. Copy all .json and .bin files to public/models/
4. Restart server: npm run xian
5. Hard refresh page: Ctrl+F5
6. Models will now load from /models/ (local server)

🔧 QUICK FIXES (Try first):
1. Hard refresh: Ctrl+F5 (or Cmd+Shift+R on Mac)
2. Clear ALL cache: Ctrl+Shift+Delete → Select "All time"
3. Try private/incognito window
4. Disable VPN or proxy
5. Try different browser

🔍 DEBUG NETWORK ISSUES:
1. Open F12 → Network tab
2. Search for "tiny_face", "face_express", etc.
3. Check status code (404 = not found, 403 = forbidden, 0 = blocked)
4. Note the exact failing URL

🔧 CHECK MODEL STATUS:
Copy this into browser console:
  fetch('/api/models/status').then(r => r.json()).then(d => console.table(d))

👤 NETWORK TAB DEBUGGING:
If you see 404 errors from unpkg.com:
- unpkg.com model path may have changed
- Use local hosting instead (Recommended Fix above)

If you see 0 errors:
- Browser blocked the request (security/CORS)
- Try: Disable extensions, use incognito mode, different browser

📊 PERFORMANCE NOTE:
- Model files are large (30-50MB total)
- Local hosting: ~5-10 seconds on fast connection
- CDN: Can take 10-30+ seconds depending on location

☎️  If still failing:
Share exact error from Network tab URL bar
Current tried CDNs:
- /models/ (local - RECOMMENDED)
- unpkg.com/face-api.js
- cdn.jsdelivr.net/npm/face-api.js
`;
      console.error(troubleshoot);
      
      throw new Error('Model loading failed from all CDNs: ' + lastError?.message);
    }
    
    updateLoading('✅ Models loaded successfully');

    // Mark models as loaded globally
    modelsLoaded = true;

    // Hide loading indicator and ensure camera stays visible
    setTimeout(() => {
      loadingIndicator.style.display = 'none';
      
      // Force video to remain visible
      video.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; width: 100% !important; height: 100% !important;';
      
      console.log('✅ Initializ complete - Camera visible:', window.getComputedStyle(video).display);
      safeAlert('✅ Mood Tracker ready! Click "Start Scanning"', 'success');
    }, 500);

  } catch (error) {
    console.error('❌ Initialization error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Always hide loading indicator
    loadingIndicator.style.display = 'none';
    
    // Try to ensure video is visible even on error for debugging
    video.style.display = 'block';
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      if (permissionAlert) {
        permissionAlert.classList.remove('hidden');
      }
      safeAlert('Camera access denied. Please enable camera in browser settings.', 'error');
    } else if (error.name === 'NotFoundError') {
      safeAlert('No camera found on your device.', 'error');
    } else if (error.message && error.message.includes('model')) {
      safeAlert('AI models failed to load. Check your internet connection: ' + error.message, 'error');
    } else if (error.message && error.message.includes('face-api')) {
      safeAlert('Face-api library failed to load. Please refresh the page.', 'error');
    } else if (error.message && error.message.includes('timeout')) {
      safeAlert('Camera stream timeout. Please check your camera connection and refresh.', 'error');
    } else {
      safeAlert('Error: ' + error.message, 'error');
    }
  }
}

/**
 * Start scanning for emotions - ENHANCED VERSION
 */
async function startScanning() {
  console.log('🎯 Start Scanning clicked');
  
  // Reset scan timer
  scanStartTime = null;
  detectionStableCount = 0;
  lastStableEmotion = null;
  
  // Verify libraries are loaded
  if (typeof faceapi === 'undefined') {
    console.warn('⚠️ faceapi not loaded - using DEMO MODE');
    skipModelsAndUseDemoMode();
  }
  
  if (typeof tf === 'undefined') {
    console.warn('⚠️ TensorFlow not loaded - using DEMO MODE');
    skipModelsAndUseDemoMode();
  }

  // If models didn't load, activate demo mode
  if (!modelsLoaded || modelsLoaded === false) {
    console.warn('⚠️ Models not loaded - AUTO-ENABLING DEMO MODE');
    skipModelsAndUseDemoMode();
  }

  const video = document.getElementById('camera-feed');
  
  // Check if camera is actually available
  if (!video || !video.srcObject) {
    console.error('❌ Camera not initialized - video.srcObject is', video?.srcObject);
    showAlert('❌ Camera not initialized. Please refresh the page and grant camera permission.', 'error');
    return;
  }

  // Check if video has tracks
  const tracks = video.srcObject.getVideoTracks();
  if (!tracks || tracks.length === 0) {
    console.error('❌ No video tracks available');
    showAlert('❌ Camera has no video stream. Please check your camera is working.', 'error');
    return;
  }
  
  console.log('✅ All checks passed - starting emotion detection');

  if (isScanning) {
    console.warn('Already scanning');
    return;
  }

  // Reset state
  isScanning = true;
  currentDetectedEmotion = null;
  const modal = document.getElementById('confirmation-modal');
  if (modal) {
    modal.classList.remove('shown');
    modal.classList.add('hidden');
  }
  
  document.getElementById('start-scan-btn').style.display = 'none';
  document.getElementById('stop-scan-btn').style.display = 'flex';
  document.getElementById('scanning-indicator').style.display = 'flex';
  document.getElementById('emotion-display').classList.add('hidden');
  document.getElementById('confirmation-modal').classList.add('hidden');
  document.getElementById('activities-container').classList.add('hidden');

  console.log('🎬 Starting emotion detection... [ADVANCED AUTO-STOP ENABLED]');
  showAlert('🎥 Scanning started - show your face to the camera (auto-stops when emotion locked)', 'success');

  // Ensure video is playing
  try {
    if (video.paused) {
      await video.play();
      console.log('✅ Video started playing');
    }
  } catch (e) {
    console.error('❌ Video play error:', e);
    showAlert('Error: Video failed to play', 'error');
    isScanning = false;
    return;
  }

  // Run detection faster in demo mode (100ms), slower for real detection (250ms)
  if (detectionInterval) {
    clearInterval(detectionInterval);
  }
  
  const detectionSpeed = (window.isDemoMode || window.modelsLoaded === 'demo') ? 100 : 250;
  console.log(`🎯 Detection speed: ${detectionSpeed}ms (Advanced Auto-Stop Active)`);
  console.log(`📊 Auto-Stop Conditions:`);
  console.log(`   • If confidence > 75%: Stop after 2 frames (500ms)`);
  console.log(`   • If stable emotion: Stop after 3 frames (750ms)`);
  console.log(`   • Maximum scan: 8 seconds (auto-stop timeout)`);
  
  detectionInterval = setInterval(async () => {
    await detectEmotion();
  }, detectionSpeed);
}

/**
 * Stop scanning - ENHANCED VERSION with visual feedback
 */
function stopScanning() {
  isScanning = false;
  
  // Reset scan timer
  scanStartTime = null;
  detectionStableCount = 0;
  lastStableEmotion = null;
  
  document.getElementById('start-scan-btn').style.display = 'flex';
  document.getElementById('stop-scan-btn').style.display = 'none';
  document.getElementById('scanning-indicator').style.display = 'none';

  if (detectionInterval) {
    clearInterval(detectionInterval);
  }

  console.log('⏹️ Emotion detection stopped - LOCKING RESULT');
  
  // Show the last detected emotion result
  if (currentDetectedEmotion) {
    console.log('📊 Final emotion detected:', currentDetectedEmotion);
    const emotion = currentDetectedEmotion.emotion;
    const emotionData = emotionMap[emotion] || { label: emotion.toUpperCase(), icon: '🤔' };
    
    // IMPORTANT: Use forceDisplayEmotionResult to ensure it shows
    forceDisplayEmotionResult(emotion, currentDetectedEmotion.confidence || 100);
    
    // Show activities FIRST, then modal
    console.log('📋 Showing suggested activities');
    if (emotionData.activities) {
      showActivities(emotionData.activities);
    }
    
    // Show confirmation modal - IMMEDIATELY after
    setTimeout(() => {
      showConfirmationModal(emotionData.label);
    }, 400);
  } else {
    console.warn('⚠️ No emotion detected during scan');
    showAlert('No clear emotion detected. Position your face better and try again.', 'info');
  }
}

/**
 * Detect emotions from video feed - ADVANCED AUTO-STOP VERSION
 */
let detectionStableCount = 0;
let lastStableEmotion = null;
let scanStartTime = null;
let maxScanDuration = 8000; // Max 8 seconds per scan

async function detectEmotion() {
  // Verify video is still available
  const video = document.getElementById('camera-feed');
  if (!video || !video.srcObject) {
    console.warn('⚠️ Video stream lost - stopping scan');
    stopScanning();
    return;
  }

  // Track scan duration for auto-stop
  if (!scanStartTime) {
    scanStartTime = Date.now();
  }
  const elapsedTime = Date.now() - scanStartTime;
  
  // AUTO-STOP if scan exceeds max duration
  if (elapsedTime > maxScanDuration) {
    console.log('⏱️ Max scan duration reached (8 seconds) - AUTO-STOPPING');
    stopScanning();
    return;
  }

  // Check if demo mode is active
  if (window.isDemoMode || window.modelsLoaded === 'demo') {
    // Generate demo emotion instead of detecting
    const demoEmotion = generateDemoEmotion();
    
    // Display the demo emotion
    currentDetectedEmotion = {
      emotion: demoEmotion.emotion,
      confidence: 85 + Math.random() * 15 // 85-100% confidence in demo mode
    };
    
    updateEmotionDisplay(currentDetectedEmotion);
    
    // ADVANCED DEMO MODE: Multiple stopping conditions
    // 1. If VERY HIGH confidence (>90%), stop immediately
    if (currentDetectedEmotion.confidence > 90 && lastStableEmotion === demoEmotion.emotion) {
      detectionStableCount++;
      if (detectionStableCount >= 2) { // Only 2 frames = 200ms
        console.log('🔥 VERY HIGH CONFIDENCE - AUTO-STOPPING SCAN IMMEDIATELY');
        stopScanning();
        return;
      }
    }
    // 2. Stable emotion for 3+ frames (300ms) = fast lock
    else if (lastStableEmotion === demoEmotion.emotion) {
      detectionStableCount++;
      if (detectionStableCount >= 3) { // 3 frames = 300ms
        console.log('✅ STABLE EMOTION DETECTED (Demo) - AUTO-STOPPING SCAN');
        stopScanning();
        return;
      }
    } else {
      lastStableEmotion = demoEmotion.emotion;
      detectionStableCount = 1; // Start count at 1 for new emotion
    }
    
    return;
  }

  const video = document.getElementById('camera-feed');

  // Safety checks
  if (!video) {
    console.error('❌ Video element not found');
    return;
  }

  if (!video.srcObject) {
    console.warn('⚠️ Video stream not available');
    stopScanning();
    return;
  }

  if (video.readyState !== video.HAVE_ENOUGH_DATA) {
    return;
  }

  // Check libraries
  if (typeof faceapi === 'undefined') {
    console.error('❌ faceapi not available - stopping scan');
    stopScanning();
    showAlert('Face detection library failed to load', 'error');
    return;
  }

  if (!faceapi.nets || !faceapi.nets.tinyFaceDetector) {
    console.error('❌ Face detection models not loaded');
    return;
  }

  try {
    // Verify models are loaded before detecting
    if (!faceapi.nets.tinyFaceDetector.isLoaded()) {
      return;
    }

    if (!faceapi.nets.faceExpressionNet.isLoaded()) {
      return;
    }

    // Detect faces and expressions
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (detections.length === 0) {
      // No face detected
      console.log('❌ No face detected');
      updateEmotionDisplay(null);
      lastStableEmotion = null; // Reset stability
      detectionStableCount = 0;
      return;
    }
    
    console.log(`✅ Face detected! ${detections.length} face(s) found`);

    // Get the first detected face
    const detectedFace = detections[0];
    const expressions = detectedFace.expressions;

    // Find the dominant emotion
    let maxEmotion = '';
    let maxScore = 0;

    for (const [emotion, score] of Object.entries(expressions)) {
      if (score > maxScore) {
        maxScore = score;
        maxEmotion = emotion;
      }
    }
    
    const confidencePercent = maxScore * 100;
    console.log(`📊 Detected ${maxEmotion}: ${confidencePercent.toFixed(1)}%`);

    // Check if confidence is high enough (> 0.15 = 15%)
    if (maxScore > 0.15) {
      currentDetectedEmotion = {
        emotion: maxEmotion,
        confidence: confidencePercent
      };

      updateEmotionDisplay(currentDetectedEmotion);
      
      // ADVANCED STABILITY CHECKING:
      // Multiple stopping conditions for faster auto-stop
      
      if (lastStableEmotion === maxEmotion) {
        detectionStableCount++;
        
        // 1. IMMEDIATE STOP: Very high confidence (>75%)
        if (confidencePercent > 75 && detectionStableCount >= 2) {
          console.log('🔥 HIGH CONFIDENCE (' + confidencePercent.toFixed(1) + '%) - AUTO-STOPPING SCAN IMMEDIATELY');
          stopScanning();
          return;
        }
        
        // 2. FAST STOP: Stable for 3 frames (750ms)
        if (detectionStableCount >= 3) {
          console.log('✅ STABLE EMOTION (' + confidencePercent.toFixed(1) + '%) - AUTO-STOPPING SCAN');
          stopScanning();
          return;
        }
      } else {
        // New emotion detected
        lastStableEmotion = maxEmotion;
        detectionStableCount = 1; // Start fresh count
        console.log('🔄 New emotion locked:', maxEmotion);
      }
    } else {
      console.log(`⏸️ Confidence too low: ${confidencePercent.toFixed(1)}%`);
      updateEmotionDisplay(null);
      lastStableEmotion = null; // Reset if confidence drops
      detectionStableCount = 0;
    }

  } catch (error) {
    console.error('❌ Error during emotion detection:', error.message);
  }
}

/**
 * Update emotion display - ENHANCED with visual feedback
 */
function updateEmotionDisplay(detectionResult) {
  const display = document.getElementById('emotion-display');
  const confidenceBar = document.getElementById('confidence-bar');
  
  // In demo mode, show even if confidence is lower
  const minConfidence = (window.isDemoMode || window.modelsLoaded === 'demo') ? 0 : 20;
  
  if (!detectionResult || detectionResult.confidence < minConfidence) {
    display.classList.add('hidden');
    return;
  }
  
  // Only show live preview if STILL scanning
  if (isScanning) {
    const emotion = detectionResult.emotion;
    const emotionData = emotionMap[emotion] || { label: emotion.toUpperCase(), icon: '🤔' };
    const confidence = Math.round(detectionResult.confidence);

    display.classList.remove('hidden');
    display.style.setProperty('display', 'block', 'important');
    display.style.setProperty('visibility', 'visible', 'important');
    
    // Gradual opacity based on confidence (0.4 - 0.8)
    const opacity = Math.min(0.4 + (confidence / 100) * 0.4, 0.8);
    display.style.setProperty('opacity', opacity.toString(), 'important');
    
    display.className = `emotion-card ${emotionData.color}`;

    const iconEl = document.getElementById('emotion-icon');
    const labelEl = document.getElementById('emotion-label');
    const scoreEl = document.getElementById('confidence-score');
    
    if (iconEl) {
      iconEl.textContent = emotionData.icon;
      // Scale icon based on confidence
      const scale = 1 + (confidence / 100) * 0.5; // Scale from 1 to 1.5
      iconEl.style.transform = `scale(${scale})`;
      iconEl.style.transition = 'transform 0.2s ease-out';
    }
    if (labelEl) labelEl.textContent = emotionData.label;
    if (scoreEl) scoreEl.textContent = confidence + '%';
    
    // Animate confidence bar
    if (confidenceBar) {
      confidenceBar.style.width = confidence + '%';
      confidenceBar.style.transition = 'width 0.3s ease-out';
      
      // Change color based on confidence level
      if (confidence > 75) {
        confidenceBar.style.background = 'linear-gradient(90deg, #10b981 0%, #059669 100%)'; // Green - high confidence
      } else if (confidence > 50) {
        confidenceBar.style.background = 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)'; // Orange - medium confidence
      } else {
        confidenceBar.style.background = 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'; // Red - low confidence
      }
    }
    
    console.log(`🔍 Live preview - ${emotion}: ${confidence}% (Opacity: ${(opacity * 100).toFixed(0)}%)`);
  }
  // If NOT scanning, keep emotion LOCKED and FULLY VISIBLE
  else {
    const emotion = detectionResult.emotion;
    const emotionData = emotionMap[emotion] || { label: emotion.toUpperCase(), icon: '🤔' };

    display.classList.remove('hidden');
    display.style.setProperty('display', 'block', 'important');
    display.style.setProperty('opacity', '1', 'important');
    display.style.setProperty('visibility', 'visible', 'important');
    display.className = `emotion-card ${emotionData.color}`;

    // Don't update content if scanning is done (locked)
    // Just keep showing what was detected
  }
}

/**
 * IMPORTANT: Force display emotion result - called after scan completes
 */
function forceDisplayEmotionResult(emotion, confidence) {
  console.log('💥 FORCE DISPLAY EMOTION:', emotion, confidence);
  
  const display = document.getElementById('emotion-display');
  const confidenceBar = document.getElementById('confidence-bar');
  const iconEl = document.getElementById('emotion-icon');
  const labelEl = document.getElementById('emotion-label');
  const scoreEl = document.getElementById('confidence-score');
  
  if (!display) {
    console.error('❌ Emotion display element not found');
    return;
  }
  
  const emotionData = emotionMap[emotion] || { label: emotion.toUpperCase(), icon: '🤔' };
  
  // FORCE show the display
  display.classList.remove('hidden');
  display.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; z-index: 999;';
  display.className = `emotion-card ${emotionData.color}`;
  
  // Update all elements
  if (iconEl) {
    iconEl.textContent = emotionData.icon;
    iconEl.style.fontSize = '3.5rem';
    iconEl.style.animation = 'pulse 2s infinite';
  }
  if (labelEl) {
    labelEl.textContent = emotionData.label;
    labelEl.style.fontSize = '1.5rem';
    labelEl.style.fontWeight = 'bold';
    labelEl.style.color = '#000';
  }
  if (scoreEl) {
    scoreEl.textContent = Math.round(confidence) + '%';
    scoreEl.style.fontSize = '1.2rem';
    scoreEl.style.fontWeight = 'bold';
    scoreEl.style.color = '#16a34a';
  }
  if (confidenceBar) {
    confidenceBar.style.width = confidence + '%';
    confidenceBar.style.transition = 'width 0.8s ease-out';
    confidenceBar.style.backgroundColor = '#16a34a';
  }
  
  // Scroll to display
  setTimeout(() => {
    display.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
  
  console.log('✅ Emotion result FORCED displayed');
}

/**
 * Show confirmation modal
 */
function showConfirmationModal(emotionLabel) {
  const modal = document.getElementById('confirmation-modal');
  const display = document.getElementById('emotion-display');
  
  if (!modal) {
    console.error('❌ Confirmation modal element not found');
    return;
  }
  
  console.log('📢 Showing confirmation: "Our system detected that you\'re feeling', emotionLabel + '"');
  
  // Get emotion data to show icon and confidence
  const emotionKey = Object.keys(emotionMap).find(key => emotionMap[key].label === emotionLabel) || 'neutral';
  const emotionData = emotionMap[emotionKey] || { label: emotionLabel, icon: '🤔' };
  const confidence = currentDetectedEmotion?.confidence || 100;
  
  // Make emotion display FULLY VISIBLE
  if (display) {
    display.style.setProperty('opacity', '1', 'important');
    display.style.setProperty('display', 'block', 'important');
  }
  
  // Update the emotion icon and text in modal
  const emotionIcon = document.getElementById('detected-emotion-icon');
  const emotionText = document.getElementById('detected-emotion-text');
  const confidenceText = document.getElementById('detected-confidence');
  
  if (emotionIcon) {
    emotionIcon.textContent = emotionData.icon;
  }
  
  if (emotionText) {
    emotionText.textContent = emotionLabel.toLowerCase();
    emotionText.style.setProperty('font-weight', 'bold', 'important');
    emotionText.style.setProperty('font-size', '1.1em', 'important');
  }
  
  if (confidenceText) {
    confidenceText.textContent = Math.round(confidence) + '%';
  }
  
  // Show modal - CENTERED AND PROMINENT
  modal.classList.remove('hidden');
  modal.classList.add('shown');
  modal.style.setProperty('display', 'block', 'important');
  modal.style.setProperty('visibility', 'visible', 'important');
  modal.style.setProperty('opacity', '1', 'important');
  
  // Center the modal on screen
  setTimeout(() => {
    modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
  
  console.log('✅ Modal visible - waiting for user response (Yes/No)');

  // Auto-hide after 25 seconds if not responded
  const timeoutId = setTimeout(() => {
    if (!modal.classList.contains('hidden')) {
      console.log('⏱️ Modal auto-closed (user didn\'t respond)');
      hideConfirmationModal();
    }
  }, 25000);
  
  modal.dataset.timeoutId = timeoutId;
}

/**
 * Hide confirmation modal
 */
function hideConfirmationModal() {
  const modal = document.getElementById('confirmation-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('shown');
    modal.style.display = 'none';
  }
}

/**
 * Confirm detected emotion
 */
async function confirmEmotion(response) {
  if (!currentDetectedEmotion) return;

  try {
    const modal = document.getElementById('confirmation-modal');
    
    // Clear timeout if exists
    if (modal.dataset.timeoutId) {
      clearTimeout(parseInt(modal.dataset.timeoutId));
    }
    
    console.log('👍 User confirmed:', response);
    
    // Hide modal
    hideConfirmationModal();

    // Show loading
    console.log('💾 Saving mood with response:', response);
    showAlert('Saving your mood entry...', 'info');

    // Send to backend
    const result = await fetch('/user/mood/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        detectedEmotion: currentDetectedEmotion.emotion,
        emotionConfidence: parseFloat(currentDetectedEmotion.confidence),
        userResponse: response,
        userConfirmed: true
      })
    });

    if (result.ok) {
      const data = await result.json();
      console.log('✅ Mood saved successfully:', data);

      // Get emotion data for activities
      const emotion = currentDetectedEmotion.emotion;
      const emotionData = emotionMap[emotion] || {};
      
      // SHOW ACTIVITIES PANEL - CLEAR AND VISIBLE
      console.log('📋 Showing suggested activities for:', emotion);
      showActivities(emotionData.activities || []);

      // Make activities visible
      const activitiesContainer = document.getElementById('activities-container');
      if (activitiesContainer) {
        activitiesContainer.classList.remove('hidden');
        activitiesContainer.style.setProperty('display', 'block', 'important');
        activitiesContainer.style.setProperty('opacity', '1', 'important');
        setTimeout(() => {
          activitiesContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 200);
      }

      // Reload history
      loadMoodHistory();

      // Show success message with clear instructions
      const successMsg = response === 'yes' 
        ? `✅ Perfect! I've saved that you're feeling ${emotionData.label || 'this way'}. Check out the activities below to help you feel better!`
        : `✅ Got it! I've noted your mood. Thanks for the feedback - it helps me understand you better!`;
      
      showAlert(successMsg, 'success');
    } else {
      const error = await result.json();
      showAlert('❌ Error saving mood: ' + (error.message || 'Unknown error'), 'error');
    }

  } catch (error) {
    console.error('❌ Error confirming emotion:', error);
    showAlert('❌ Error: ' + error.message, 'error');
  }
}

/**
 * Show suggested activities
 */
function showActivities(activities) {
  const container = document.getElementById('activities-container');
  const list = document.getElementById('activities-list');

  list.innerHTML = '';
  
  activities.forEach((activity, index) => {
    const li = document.createElement('li');
    
    // Handle both old string format and new object format
    if (typeof activity === 'string') {
      // Legacy format - just text
      li.className = 'flex gap-3 p-3 bg-green-50 rounded-lg';
      li.innerHTML = `
        <span class="text-green-600 font-bold flex-shrink-0">${index + 1}</span>
        <span class="text-gray-700">${activity}</span>
      `;
    } else {
      // New format with action button
      li.className = 'flex gap-3 items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-600 hover:shadow-md transition';
      li.innerHTML = `
        <span class="text-2xl flex-shrink-0">${activity.emoji || '✨'}</span>
        <div class="flex-1">
          <p class="text-gray-800 font-semibold text-sm">${activity.text}</p>
        </div>
        <a 
          href="${activity.link || '#'}" 
          class="flex-shrink-0 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition transform hover:scale-105 active:scale-95 text-sm whitespace-nowrap"
          title="Go to ${activity.action}"
        >
          Go Now →
        </a>
      `;
    }
    
    list.appendChild(li);
  });

  container.classList.remove('hidden');
}

/**
 * Load mood history
 */
async function loadMoodHistory() {
  try {
    const response = await fetch('/user/mood/history');
    const data = await response.json();

    const historyContainer = document.getElementById('mood-history');
    const noHistory = document.getElementById('no-history');

    if (!data.moods || data.moods.length === 0) {
      historyContainer.innerHTML = '';
      noHistory.classList.remove('hidden');
      return;
    }

    noHistory.classList.add('hidden');
    historyContainer.innerHTML = '';

    data.moods.forEach((mood) => {
      const emotionData = emotionMap[mood.detectedEmotion] || { label: mood.detectedEmotion.toUpperCase(), icon: '🤔' };
      const date = new Date(mood.createdAt);
      const timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const div = document.createElement('div');
      div.className = 'flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-green-600';
      div.innerHTML = `
        <div>
          <div class="flex items-center gap-3">
            <span class="text-3xl">${emotionData.icon}</span>
            <div>
              <p class="font-semibold text-gray-900">${emotionData.label}</p>
              <p class="text-sm text-gray-600">${timeStr}</p>
            </div>
          </div>
          ${mood.userResponse ? `<p class="text-xs text-gray-500 mt-2">You confirmed: <strong>${mood.userResponse === 'yes' ? '✓ Accurate' : '✗ Not Accurate'}</strong></p>` : ''}
        </div>
        <div class="text-right">
          <div class="text-sm text-gray-600">Confidence</div>
          <div class="text-lg font-bold text-green-600">${Math.round(mood.emotionConfidence)}%</div>
        </div>
      `;
      historyContainer.appendChild(div);
    });

  } catch (error) {
    console.error('❌ Error loading mood history:', error);
  }
}

/**
 * Show alert
 */
function showAlert(message, type = 'info') {
  // Create alert element
  const alertDiv = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-50' : type === 'error' ? 'bg-red-50' : 'bg-blue-50';
  const borderColor = type === 'success' ? 'border-green-400' : type === 'error' ? 'border-red-400' : 'border-blue-400';
  const textColor = type === 'success' ? 'text-green-700' : type === 'error' ? 'text-red-700' : 'text-blue-700';
  const bgIconColor = type === 'success' ? 'bg-green-100' : type === 'error' ? 'bg-red-100' : 'bg-blue-100';
  const iconColor = type === 'success' ? 'text-green-600' : type === 'error' ? 'text-red-600' : 'text-blue-600';

  alertDiv.className = `fixed top-6 right-6 ${bgColor} border-l-4 ${borderColor} p-4 rounded-lg shadow-lg z-50 max-w-md animate-fade-in-up`;
  alertDiv.innerHTML = `
    <div class="flex items-start gap-3">
      <div class="${bgIconColor} ${iconColor} rounded-full p-2 flex-shrink-0">
        ${type === 'success' ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>' : 
          type === 'error' ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>' :
          '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" clip-rule="evenodd"/></svg>'}
      </div>
      <p class="${textColor} font-medium">${message}</p>
    </div>
  `;

  document.body.appendChild(alertDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Handle page unload - stop video stream
window.addEventListener('beforeunload', () => {
  const video = document.getElementById('camera-feed');
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
  }
  if (detectionInterval) {
    clearInterval(detectionInterval);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT FUNCTIONS TO GLOBAL WINDOW SCOPE - For onclick handlers in HTML
// ═══════════════════════════════════════════════════════════════════════════
window.startScanning = startScanning;
window.stopScanning = stopScanning;
window.confirmEmotion = confirmEmotion;
window.skipModelsAndUseDemoMode = skipModelsAndUseDemoMode;
window.downloadModels = downloadModels;
window.loadMoodHistory = loadMoodHistory;
window.showAlert = showAlert;

console.log('✅ All functions exported to window scope - ready for HTML onclick handlers');
