/**
 * ENHANCED EMOTION CONFIRMATION WITH TIPS & INSIGHTS
 * This module enhances the confirmEmotion flow with system tips and recommendations
 */

console.log('💡 Loading Enhanced Emotion Confirmation Module...');

/**
 * ENHANCED confirmEmotion with tips and history tracking
 */
const originalConfirmEmotion = window.confirmEmotion;

async function confirmEmotion(response) {
  if (!currentDetectedEmotion) return;

  try {
    const modal = document.getElementById('confirmation-modal');
    
    // Clear timeout if exists
    if (modal?.dataset.timeoutId) {
      clearTimeout(parseInt(modal.dataset.timeoutId));
    }
    
    console.log('👍 User confirmed:', response);
    console.log('🎯 Emotion:', currentDetectedEmotion.emotion);
    
    // Hide modal
    hideConfirmationModal();

    // Show loading
    console.log('💾 Saving mood with response:', response);
    showAlert('Saving your mood entry and generating tips...', 'info');

    // Save to client-side history IMMEDIATELY
    if (window.emotionHistoryManager) {
      const historyEntry = window.emotionHistoryManager.addEntry(
        currentDetectedEmotion.emotion,
        currentDetectedEmotion.confidence,
        response === 'yes',
        ''
      );
      console.log('✅ Added to local history:', historyEntry);
    }

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
      console.log('✅ Mood saved to database:', data);

      // Get emotion data
      const emotion = currentDetectedEmotion.emotion;
      const emotionData = emotionMap[emotion] || { label: 'This Emotion', icon: '🤔' };
      
      // ==================================================================
      // SHOW ENHANCED RECOMMENDATIONS WITH TIPS
      // ==================================================================
      
      // Get system recommendations and tips
      if (window.SystemRecommendations) {
        const recommendations = window.SystemRecommendations.generateRecommendations(emotion);
        
        console.log('💡 Showing recommendations for:', emotion);
        console.log('🎯 Tips:', recommendations.emotionTips);
        
        // Show tips in a dedicated tips panel
        showEmotionTips(emotionData, recommendations);
      }
      
      // Show activities
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
      if (typeof loadMoodHistory === 'function') {
        loadMoodHistory();
      }

      // Show success message with clear instructions
      const successMsg = response === 'yes' 
        ? `✅ Perfect! I've saved that you're feeling <strong>${emotionData.label}</strong>. Check out the tips and activities below to help!`
        : `✅ Got it! I've noted your mood. Thanks for the feedback - it helps me learn about you better!`;
      
      showAlert(successMsg, 'success');
      
      // Log analytics
      console.log('📊 Emotion saved - Analytics:');
      if (window.emotionAnalyzer) {
        const analysis = window.emotionAnalyzer.analyzeDetectionQuality(currentDetectedEmotion);
        console.log('Analysis:', analysis);
      }
      
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
 * Show emotion tips and recommendations panel
 */
function showEmotionTips(emotionData, recommendations) {
  // Create or get tips container
  let tipsContainer = document.getElementById('emotion-tips-container');
  
  if (!tipsContainer) {
    tipsContainer = document.createElement('div');
    tipsContainer.id = 'emotion-tips-container';
    
    // Insert after confirmation modal or activities container
    const activitiesContainer = document.getElementById('activities-container');
    if (activitiesContainer?.parentNode) {
      activitiesContainer.parentNode.insertBefore(tipsContainer, activitiesContainer);
    } else {
      document.querySelector('.container')?.appendChild(tipsContainer);
    }
  }

  // Build tips HTML
  let tipsHTML = `
    <div class="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-6 mb-6 border-l-4 border-purple-600 animate-fade-in-up">
      <div class="flex items-center gap-3 mb-4">
        <span class="text-3xl">${emotionData.icon || '💭'}</span>
        <div>
          <h3 class="text-2xl font-bold text-gray-900">Tips for ${emotionData.label}</h3>
          <p class="text-sm text-gray-600">Based on your current emotional state</p>
        </div>
      </div>

      <!-- Personal Tips -->
      <div class="mb-6 p-4 bg-white rounded-lg border-l-4 border-purple-500">
        <h4 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span>💡</span> Personal Tips for You
        </h4>
        <ul class="space-y-2">
  `;

  // Add personal tips
  recommendations.emotionTips.forEach((tip, index) => {
    tipsHTML += `
      <li class="flex gap-3 text-sm">
        <span class="font-bold text-purple-600 flex-shrink-0">${index + 1}.</span>
        <span class="text-gray-700">${tip}</span>
      </li>
    `;
  });

  tipsHTML += `
        </ul>
      </div>

      <!-- System Insights -->
      <div class="mb-6 p-4 bg-white rounded-lg border-l-4 border-blue-500">
        <h4 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span>🎯</span> System Insights
        </h4>
        <ul class="space-y-2">
  `;

  // Add system recommendations
  recommendations.systemRecommendations.forEach((rec, index) => {
    tipsHTML += `
      <li class="flex gap-3 text-sm">
        <span class="font-bold text-blue-600 flex-shrink-0">•</span>
        <span class="text-gray-700">${rec}</span>
      </li>
    `;
  });

  tipsHTML += `
        </ul>
      </div>

      <!-- Quick Resources -->
      <div class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-600">
        <h4 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span>🔗</span> Quick Access Resources
        </h4>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
  `;

  // Add quick resource buttons
  recommendations.resources.forEach(resource => {
    tipsHTML += `
      <a 
        href="${resource.link}" 
        class="flex flex-col items-center gap-2 p-3 bg-white rounded-lg border border-green-200 hover:border-green-600 hover:shadow-md transition transform hover:scale-105 active:scale-95"
        title="Go to ${resource.name}"
      >
        <span class="text-2xl">${resource.icon}</span>
        <span class="text-xs font-semibold text-center text-gray-700">${resource.name}</span>
      </a>
    `;
  });

  tipsHTML += `
        </div>
      </div>

      <!-- Key Insight Card -->
      <div class="mt-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-600">
        <p class="text-sm text-yellow-900">
          <strong>💭 Remember:</strong> Emotions are temporary and valid. What you're feeling right now is a natural response. 
          Be kind to yourself and reach out for support if you need it. Our counselors are always here to help!
        </p>
      </div>
    </div>
  `;

  // Update container
  tipsContainer.innerHTML = tipsHTML;
  tipsContainer.style.setProperty('display', 'block', 'important');
  tipsContainer.style.setProperty('opacity', '1', 'important');
  
  // Scroll into view
  setTimeout(() => {
    tipsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 200);

  console.log('✅ Emotion tips panel displayed');
}

/**
 * Get emotion analysis and insights
 */
function getEmotionInsights(emotion, confidence) {
  if (!window.emotionAnalyzer) {
    return null;
  }

  const analysis = window.emotionAnalyzer.analyzeDetectionQuality({
    emotion: emotion,
    confidence: confidence
  });

  console.log('📊 Emotion Analysis:', analysis);
  return analysis;
}

/**
 * Show camera quality check before scanning
 */
function checkCameraQualityBeforeScan() {
  const video = document.getElementById('camera-feed');
  
  if (!video || !window.cameraQualityChecker) {
    console.log('⏭️ Skipping quality check (video not ready)');
    return null;
  }

  // Only check if video has proper dimensions
  if (!video.videoWidth || !video.videoHeight) {
    console.log('⏭️ Video dimensions not ready yet');
    return null;
  }

  const quality = window.cameraQualityChecker.checkCameraQuality(video);
  
  if (!quality) {
    console.log('⏭️ Quality check skipped (canvas error)');
    return null;
  }

  console.log('📸 Camera Quality Check:', quality);

  // Show recommendation if needed
  if (!quality.isGoodLighting || !quality.isGoodContrast) {
    showAlert('💡 ' + quality.recommendation, 'info');
  }

  return quality;
}

// Override the original confirmEmotion
window.confirmEmotion = confirmEmotion;

// Add camera check before scanning
const originalStartScanning = window.startScanning;
window.startScanning = function() {
  console.log('🎥 Checking camera quality before scan...');
  checkCameraQualityBeforeScan();
  
  // Call original
  if (originalStartScanning) {
    return originalStartScanning.call(this);
  }
};

console.log('✅ Enhanced Emotion Confirmation loaded');
console.log('📊 Functions available: confirmEmotion (enhanced), showEmotionTips, getEmotionInsights, checkCameraQualityBeforeScan');
