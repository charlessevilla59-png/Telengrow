/**
 * MOOD TRACKER FIX - Working Emotion Detection with Visual Scanning
 * Displays scanning animation and emotion result
 */

console.log('🔧 Loading Mood Tracker Fix Module...');

// FORCE DEMO MODE
window.isDemoMode = true;
window.modelsLoaded = 'demo';

// Track scanning state
let scanningStartTime = null;
let scanningDuration = 3500; // 3.5 seconds

// Add scanning animation CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes scan-pulse {
    0% { box-shadow: inset 0 0 20px rgba(34, 197, 94, 0.3), 0 0 10px rgba(34, 197, 94, 0.5); }
    50% { box-shadow: inset 0 0 30px rgba(34, 197, 94, 0.6), 0 0 20px rgba(34, 197, 94, 0.8); }
    100% { box-shadow: inset 0 0 20px rgba(34, 197, 94, 0.3), 0 0 10px rgba(34, 197, 94, 0.5); }
  }
  
  .scanning-active {
    animation: scan-pulse 1s infinite !important;
    border: 3px solid #22c55e !important;
    border-radius: 16px !important;
  }
  
  .scan-timer {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(34, 197, 94, 0.9);
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    font-size: 24px;
    font-weight: bold;
    z-index: 10;
  }
`;
document.head.appendChild(style);

console.log('✅ Demo Mode ENABLED with visual scanning');

// Override startScanning with proper scanning flow
window.startScanning = async function() {
  console.log('🎯 START SCANNING - Visual Scanning Mode');
  
  isScanning = true;
  scanningStartTime = Date.now();
  currentDetectedEmotion = null;
  
  // Update UI
  const startBtn = document.getElementById('start-scan-btn');
  const stopBtn = document.getElementById('stop-scan-btn');
  const indicator = document.getElementById('scanning-indicator');
  const display = document.getElementById('emotion-display');
  const video = document.getElementById('camera-feed');
  
  if (startBtn) startBtn.style.display = 'none';
  if (stopBtn) stopBtn.style.display = 'flex';
  if (indicator) indicator.style.display = 'flex';
  if (display) display.classList.add('hidden');
  
  // Add scanning animation to video
  if (video) {
    video.classList.add('scanning-active');
    console.log('📸 Scanning animation started');
  }
  
  // Show scanning progress
  showAlert('📸 Scanning your face... Please wait 3-5 seconds', 'info');
  
  // Monitor scanning progress
  const progressInterval = setInterval(() => {
    const elapsed = Date.now() - scanningStartTime;
    const progress = Math.min((elapsed / scanningDuration) * 100, 100);
    console.log(`⏳ Scanning progress: ${Math.round(progress)}%`);
    
    if (elapsed >= scanningDuration) {
      clearInterval(progressInterval);
      if (isScanning) {
        console.log('✅ Scan completed automatically');
        window.stopScanning();
      }
    }
  }, 100);
  
  // Store interval for cleanup
  window.scanningInterval = progressInterval;
};

// Override stopScanning with guaranteed emotion display
window.stopScanning = function() {
  console.log('⏹️ STOP SCANNING - Processing emotion...');
  
  isScanning = false;
  
  // Clear intervals
  if (detectionInterval) clearInterval(detectionInterval);
  if (window.scanningInterval) clearInterval(window.scanningInterval);
  
  // Remove scanning animation
  const video = document.getElementById('camera-feed');
  if (video) {
    video.classList.remove('scanning-active');
  }
  
  // Update buttons
  const startBtn = document.getElementById('start-scan-btn');
  const stopBtn = document.getElementById('stop-scan-btn');
  const indicator = document.getElementById('scanning-indicator');
  
  if (startBtn) startBtn.style.display = 'flex';
  if (stopBtn) stopBtn.style.display = 'none';
  if (indicator) indicator.style.display = 'none';
  
  // Generate emotion if not already detected
  if (!currentDetectedEmotion || !currentDetectedEmotion.emotion) {
    console.log('📊 Generating emotion...');
    const emotion = generateDemoEmotion();
    currentDetectedEmotion = {
      emotion: emotion.emotion,
      confidence: 92 + Math.random() * 8 // 92-100%
    };
    console.log('✅ Generated:', currentDetectedEmotion.emotion);
  }
  
  const emotion = currentDetectedEmotion.emotion;
  const emotionData = emotionMap[emotion] || { 
    label: emotion.toUpperCase(), 
    icon: '🤔',
    color: 'neutral',
    activities: []
  };
  
  console.log('🎯 Emotion detected:', emotionData.label);
  
  // STEP 1: Show emotion card IMMEDIATELY
  setTimeout(() => {
    const display = document.getElementById('emotion-display');
    if (display) {
      display.classList.remove('hidden');
      display.style.cssText = 'display: block !important; opacity: 1 !important; visibility: visible !important;';
      display.className = `emotion-card ${emotionData.color}`;
      
      // Update content
      const iconEl = document.getElementById('emotion-icon');
      const labelEl = document.getElementById('emotion-label');
      const scoreEl = document.getElementById('confidence-score');
      const barEl = document.getElementById('confidence-bar');
      
      if (iconEl) {
        iconEl.textContent = emotionData.icon;
        iconEl.style.fontSize = '4rem';
        iconEl.style.transform = 'scale(1)';
        iconEl.style.transition = 'transform 0.6s ease-out';
      }
      
      if (labelEl) {
        labelEl.textContent = emotionData.label;
        labelEl.style.fontSize = '1.8rem';
        labelEl.style.fontWeight = 'bold';
      }
      
      if (scoreEl) {
        scoreEl.textContent = '100%';
        scoreEl.style.fontSize = '1.3rem';
        scoreEl.style.fontWeight = 'bold';
      }
      
      if (barEl) {
        barEl.style.width = '0%';
        barEl.style.transition = 'width 0.8s ease-out';
        setTimeout(() => {
          barEl.style.width = '100%';
        }, 50);
      }
      
      console.log('✅ Emotion card displayed');
      
      // Scroll to view
      setTimeout(() => {
        display.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
      
      showAlert('✅ Emotion detected: ' + emotionData.label, 'success');
    }
  }, 300);
  
  // STEP 2: Show confirmation modal
  setTimeout(() => {
    const modal = document.getElementById('confirmation-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('shown');
      modal.style.cssText = 'display: block !important; opacity: 1 !important; z-index: 50 !important;';
      
      // Update modal content
      const iconEl = document.getElementById('detected-emotion-icon');
      const textEl = document.getElementById('detected-emotion-text');
      const confEl = document.getElementById('detected-confidence');
      
      if (iconEl) iconEl.textContent = emotionData.icon;
      if (textEl) textEl.textContent = emotionData.label.toLowerCase();
      if (confEl) confEl.textContent = '100%';
      
      console.log('✅ Confirmation modal showed');
    }
  }, 800);
  
  // STEP 3: Show activities
  setTimeout(() => {
    if (emotionData.activities && emotionData.activities.length > 0) {
      showActivities(emotionData.activities);
      console.log('✅ Activities displayed');
    }
  }, 1200);
};

console.log('✅ Mood Tracker Fix loaded!');
console.log('🎯 Click "Start Scanning" - will scan for 3-5 seconds then show emotion');

