/**
 * Camera Permission Manager
 * Provides explicit button to request camera permission
 */

console.log('📷 camera-permission.js loaded');

// Request camera permission explicitly
async function requestCameraPermission() {
  console.log('🎥 Requesting camera permission...');
  
  const permBtn = document.getElementById('request-camera-btn');
  const permIndicator = document.getElementById('camera-permission-indicator');
  const video = document.getElementById('camera-feed');
  
  if (!video) {
    console.error('❌ Video element not found');
    return false;
  }

  try {
    // Show indicator
    if (permIndicator) {
      permIndicator.style.display = 'flex';
    }
    
    // Request camera
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      },
      audio: false
    });

    console.log('✅ Camera permission GRANTED');
    
    // Hide indicator
    if (permIndicator) {
      permIndicator.style.display = 'none';
    }

    // Hide button
    if (permBtn) {
      permBtn.style.display = 'none';
    }

    // Assign stream to video
    video.srcObject = stream;
    
    // Force visibility
    video.style.cssText = `
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      width: 100% !important;
      height: 100% !important;
      background: #000;
    `;

    // Play video
    try {
      await video.play();
      console.log('✅ Video playing');
    } catch (err) {
      console.warn('⚠️ Auto-play warning:', err);
    }

    // Show success alert
    if (typeof showAlert === 'function') {
      showAlert('✅ Camera permission granted! Now click "Start Scanning"', 'success');
    }

    return true;

  } catch (error) {
    console.error('❌ Camera permission denied:', error.name, error.message);
    
    // Hide indicator
    if (permIndicator) {
      permIndicator.style.display = 'none';
    }

    // Show error alert
    if (typeof showAlert === 'function') {
      showAlert(`❌ Camera permission denied: ${error.message}`, 'error');
    } else {
      alert(`❌ Camera permission denied: ${error.message}`);
    }

    return false;
  }
}

// Stop all cameras
function stopAllCameras() {
  console.log('🛑 Stopping all camera streams');
  
  const video = document.getElementById('camera-feed');
  if (video && video.srcObject) {
    const tracks = video.srcObject.getTracks();
    tracks.forEach(track => {
      console.log('Stopping track:', track.kind);
      track.stop();
    });
    video.srcObject = null;
  }
}

// On page load - check if camera already has permission
window.addEventListener('load', () => {
  console.log('🔍 Checking if camera is already accessible...');
  
  const permBtn = document.getElementById('request-camera-btn');
  const video = document.getElementById('camera-feed');
  
  // Auto-request if we can (for subsequent page loads)
  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: 'camera' }).then(permissionStatus => {
      console.log('📷 Camera permission status:', permissionStatus.state);
      
      if (permissionStatus.state === 'granted') {
        console.log('✅ Camera permission already granted');
        if (permBtn) {
          permBtn.style.display = 'none';
        }
        // Auto-initialize camera
        requestCameraPermission();
      } else if (permissionStatus.state === 'denied') {
        console.log('❌ Camera permission denied');
        if (permBtn) {
          permBtn.style.display = 'block';
        }
      } else {
        console.log('❓ Camera permission prompt');
        if (permBtn) {
          permBtn.style.display = 'block';
        }
      }
    });
  } else {
    console.log('⚠️ Permissions API not available - showing button');
    if (permBtn) {
      permBtn.style.display = 'block';
    }
  }
});

// Make function globally available
window.requestCameraPermission = requestCameraPermission;
window.stopAllCameras = stopAllCameras;

console.log('✅ Camera permission manager ready');
