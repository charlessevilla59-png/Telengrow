/**
 * CAMERA FIX UTILITY - Run these in browser console (F12) to debug and fix camera issues
 */

console.log('🎥 CAMERA FIX UTILITY LOADED');
console.log('================================================');
console.log('');

// ═══════════════════════════════════════════════════════════════════
// 1. AGGRESSIVE CAMERA VISIBILITY FIX
// ═══════════════════════════════════════════════════════════════════

window.fixCameraVisibility = function() {
  console.log('🔧 Attempting to fix camera visibility...');
  
  const video = document.getElementById('camera-feed');
  if (!video) {
    console.error('❌ Video element not found');
    return false;
  }

  // Apply aggressive CSS
  video.style.cssText = `
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    width: 100% !important;
    height: 100% !important;
    border-radius: 12px;
    object-fit: cover;
    transform: scaleX(-1);
    background: #000;
    position: relative;
    z-index: 10;
  `;

  // Remove any hidden classes
  video.classList.remove('hidden');
  video.removeAttribute('hidden');

  // Ensure container is visible
  const container = video.parentElement;
  if (container) {
    container.style.display = 'block';
    container.style.visibility = 'visible';
    container.style.opacity = '1';
  }

  console.log('✅ Camera visibility CSS applied');
  console.log('Video properties:');
  console.log('  - Display:', getComputedStyle(video).display);
  console.log('  - Visibility:', getComputedStyle(video).visibility);
  console.log('  - Opacity:', getComputedStyle(video).opacity);
  console.log('  - Width:', video.offsetWidth + 'px');
  console.log('  - Height:', video.offsetHeight + 'px');
  console.log('  - Stream active:', !!video.srcObject?.active);

  return true;
};

// ═══════════════════════════════════════════════════════════════════
// 2. VIDEO STREAM STATUS CHECK
// ═══════════════════════════════════════════════════════════════════

window.checkVideoStream = function() {
  console.log('📹 Checking video stream status...');
  console.log('');

  const video = document.getElementById('camera-feed');
  if (!video) {
    console.error('❌ Video element not found');
    return;
  }

  console.log('📺 Video Element Status:');
  console.log('  - Element exists:', !!video);
  console.log('  - Source object:', !!video.srcObject);
  console.log('  - Stream active:', video.srcObject?.active);
  console.log('  - Video tracks:', video.srcObject?.getVideoTracks().length || 0);
  console.log('  - Ready state:', video.readyState + ' (0=HAVE_NOTHING, 1=HAVE_METADATA, 2=HAVE_CURRENT_DATA, 3=HAVE_FUTURE_DATA, 4=HAVE_ENOUGH_DATA)');
  console.log('  - Paused:', video.paused);
  console.log('  - Video width:', video.videoWidth);
  console.log('  - Video height:', video.videoHeight);
  console.log('  - Current time:', video.currentTime);
  console.log('');

  if (video.srcObject && video.srcObject.getVideoTracks().length > 0) {
    const track = video.srcObject.getVideoTracks()[0];
    console.log('🎬 Video Track Status:');
    console.log('  - Track enabled:', track.enabled);
    console.log('  - Track readyState:', track.readyState);
    console.log('  - Track label:', track.label);
    const settings = track.getSettings?.();
    if (settings) {
      console.log('  - Resolution:', settings.width + 'x' + settings.height);
      console.log('  - Frame rate:', settings.frameRate);
      console.log('  - Facings mode:', settings.facingMode);
    }
  }

  return !!video.srcObject;
};

// ═══════════════════════════════════════════════════════════════════
// 3. RESTART CAMERA
// ═══════════════════════════════════════════════════════════════════

window.restartCamera = async function() {
  console.log('🔄 Attempting to restart camera...');

  const video = document.getElementById('camera-feed');
  if (!video) {
    console.error('❌ Video element not found');
    return false;
  }

  // Stop current stream
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => {
      console.log('🛑 Stopping track:', track.label);
      track.stop();
    });
    video.srcObject = null;
  }

  // Request new camera access
  try {
    console.log('📹 Requesting camera permission...');
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      },
      audio: false
    });

    video.srcObject = stream;
    console.log('✅ Camera restarted successfully');

    // Try to play
    try {
      await video.play();
      console.log('✅ Video is now playing');
    } catch (playError) {
      console.warn('⚠️ Video play error:', playError);
    }

    // Fix visibility
    window.fixCameraVisibility();

    return true;
  } catch (error) {
    console.error('❌ Camera restart failed:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════════
// 4. FULL CAMERA RESET & RELOAD
// ═══════════════════════════════════════════════════════════════════

window.fullCameraReset = async function() {
  console.log('🔄 Performing full camera reset...');

  // Stop all streams
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    devices.forEach(device => {
      if (device.kind === 'videoinput') {
        console.log('📷 Found camera:', device.label || device.deviceId);
      }
    });
  } catch (e) {
    console.warn('Could not enumerate devices:', e);
  }

  // Clear all video elements
  document.querySelectorAll('video').forEach(v => {
    if (v.srcObject) {
      v.srcObject.getTracks().forEach(track => track.stop());
      v.srcObject = null;
    }
  });

  // Wait a moment
  await new Promise(r => setTimeout(r, 1000));

  // Restart
  const success = await window.restartCamera();

  if (success) {
    console.log('✅ Full reset completed successfully');
    console.log('💡 You can now click "Start Scanning"');
  } else {
    console.error('❌ Full reset failed - may need manual page reload');
  }

  return success;
};

// ═══════════════════════════════════════════════════════════════════
// 5. FORCE DEMO MODE (If camera still not working)
// ═══════════════════════════════════════════════════════════════════

window.forceDemoMode = function() {
  console.log('🎭 Forcing demo mode...');

  window.isDemoMode = true;
  window.modelsLoaded = 'demo';

  const startBtn = document.getElementById('start-scan-btn');
  if (startBtn) startBtn.style.display = 'flex';

  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) loadingIndicator.style.display = 'none';

  const video = document.getElementById('camera-feed');
  if (video) {
    video.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);';
  }

  console.log('✅ Demo mode activated!');
  console.log('💡 You can now click "Start Scanning" to test with simulated emotions');
};

// ═══════════════════════════════════════════════════════════════════
// 6. BROWSER COMPATIBILITY CHECK
// ═══════════════════════════════════════════════════════════════════

window.checkBrowserCompatibility = function() {
  console.log('🌐 Checking browser compatibility...');
  console.log('');

  console.log('✅ Supported APIs:');
  console.log('  - getUserMedia:', typeof navigator.mediaDevices?.getUserMedia !== 'undefined');
  console.log('  - enumerateDevices:', typeof navigator.mediaDevices?.enumerateDevices !== 'undefined');
  console.log('  - Canvas:', typeof CanvasRenderingContext2D !== 'undefined');
  console.log('  - WebGL:', !!document.createElement('canvas').getContext('webgl2'));
  console.log('  - LocalStorage:', typeof Storage !== 'undefined');
  console.log('');

  // Check HTTPS
  const isHTTPS = window.location.protocol === 'https:';
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  console.log('🔒 Security:');
  console.log('  - HTTPS:', isHTTPS ? '✅ Yes' : '⚠️ No (required for non-localhost)');
  console.log('  - Localhost:', isLocalhost ? '✅ Yes' : '❌ No');
  console.log('');

  // Browser info
  console.log('📱 Browser Info:');
  console.log('  - User Agent:', navigator.userAgent.substring(0, 100) + '...');
  console.log('  - Platform:', navigator.platform);
  console.log('  - Language:', navigator.language);
};

// ═══════════════════════════════════════════════════════════════════
// 7. QUICK DIAGNOSTIC
// ═══════════════════════════════════════════════════════════════════

window.quickDiagnostic = function() {
  console.log('🔍 QUICK DIAGNOSTIC');
  console.log('================================================');
  console.log('');

  window.checkBrowserCompatibility();
  const streamOk = window.checkVideoStream();
  console.log('');

  console.log('🎯 RECOMMENDED ACTIONS:');
  if (streamOk) {
    console.log('✅ Camera stream is working!');
    console.log('   - Run: window.fixCameraVisibility()');
    console.log('   - Then click "Start Scanning"');
  } else {
    console.log('❌ Camera stream not active');
    console.log('   - Run: window.restartCamera()');
    console.log('   - Or: window.fullCameraReset()');
    console.log('   - Or: window.forceDemoMode()');
  }

  console.log('');
  console.log('================================================');
};

// ═══════════════════════════════════════════════════════════════════
// AUTO-FIX ON LOAD
// ═══════════════════════════════════════════════════════════════════

// Auto-fix on load
setTimeout(() => {
  console.log('🤖 Auto-running camera visibility fix...');
  window.fixCameraVisibility();
}, 2000);

console.log('');
console.log('💡 AVAILABLE COMMANDS:');
console.log('  window.fixCameraVisibility()      - Fix camera display');
console.log('  window.checkVideoStream()         - Check stream status');
console.log('  window.restartCamera()            - Restart camera');
console.log('  window.fullCameraReset()          - Full reset');
console.log('  window.forceDemoMode()            - Use demo mode');
console.log('  window.checkBrowserCompatibility()- Check browser');
console.log('  window.quickDiagnostic()          - Full diagnostic');
console.log('');
console.log('================================================');
