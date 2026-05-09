/**
 * Skip model loading and use demo mode
 */
function skipModelsAndUseDemoMode() {
  console.log('🎭 Skipping model loading - using DEMO MODE');
  
  // Mark as demo mode
  window.modelsLoaded = 'demo';
  window.isDemoMode = true;
  
  // Hide loading indicator
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
  
  // Show  video
  const video = document.getElementById('camera-feed');
  if (video) {
    video.style.display = 'block';
    video.style.visibility = 'visible';
    video.style.opacity = '1';
  }
  
  // Show buttons
  const startBtn = document.getElementById('start-scan-btn');
  if (startBtn) {
    startBtn.style.display = 'flex';
  }
  
  if (typeof showAlert === 'function') {
    showAlert('🎭 Demo mode activated! Click "Start Scanning" to see simulated results.', 'success');
  } else if (typeof safeAlert === 'function') {
    safeAlert('🎭 Demo mode activated!', 'success');
  }
}

/**
 * Generate random demo emotion for testing
 */
function generateDemoEmotion() {
  const emotions = [
    { emotion: 'happy', confidence: 85 },
    { emotion: 'neutral', confidence: 80 },
    { emotion: 'sad', confidence: 78 },
    { emotion: 'angry', confidence: 75 },
    { emotion: 'surprised', confidence: 82 },
    { emotion: 'fearful', confidence: 79 }
  ];
  
  const randomIndex = Math.floor(Math.random() * emotions.length);
  const emotion = emotions[randomIndex];
  
  // Add slight variance
  const variance = Math.floor(Math.random() * 15) - 7;
  const confidence = Math.max(20, Math.min(100, emotion.confidence + variance));
  
  return {
    emotion: emotion.emotion,
    confidence: confidence.toString()
  };
}

/**
 * Auto-enable demo mode after timeout if models don't load
 */
let modelLoadTimeout;
function autoEnableDemoMode() {
  modelLoadTimeout = setTimeout(() => {
    if (!window.modelsLoaded || window.modelsLoaded === false) {
      console.warn('⏱️ Models took too long - auto-enabling demo mode');
      skipModelsAndUseDemoMode();
    }
  }, 10000); // 10 second timeout
}

// Start the timeout
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoEnableDemoMode);
} else {
  autoEnableDemoMode();
}

