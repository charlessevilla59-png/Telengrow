/*
 * UNIFIED MOOD TRACKER MODULE
 * Handles mood selection, persistence, and synchronization across dashboard and mood-tracker pages
 * Features:
 * - localStorage persistence to prevent data loss on refresh
 * - Unified emotion selection function
 * - Mood trend & alert updates
 * - Activity suggestions after mood save
 */

const MoodTrackerState = {
  selectedEmotion: null,
  emotionConfidence: 75,
  moodNotes: '',
  alertMessage: '', // Store alert message for persistence
  isSaved: false, // Only restore if successfully saved
  
  // Initialize from localStorage
  init() {
    const saved = localStorage.getItem('moodTrackerState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        // Only restore if it was marked as saved
        if (state.isSaved) {
          this.selectedEmotion = state.selectedEmotion;
          this.emotionConfidence = state.emotionConfidence || 75;
          this.moodNotes = state.moodNotes || '';
          this.alertMessage = state.alertMessage || '';
          this.isSaved = true;
          console.log('📦 Restored saved mood state from localStorage:', state);
        }
      } catch (e) {
        console.warn('⚠️ Failed to restore mood state:', e);
      }
    }
  },
  
  // Save state to localStorage (only after successful API save)
  save(isSaved = false) {
    const state = {
      selectedEmotion: this.selectedEmotion,
      emotionConfidence: this.emotionConfidence,
      moodNotes: this.moodNotes,
      alertMessage: this.alertMessage,
      isSaved: isSaved, // Mark as saved only on successful API call
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('moodTrackerState', JSON.stringify(state));
    console.log('💾 Mood state saved to localStorage (isSaved:', isSaved, ')');
  },
  
  // Clear state
  clear() {
    this.selectedEmotion = null;
    this.emotionConfidence = 75;
    this.moodNotes = '';
    this.alertMessage = '';
    this.isSaved = false;
    localStorage.removeItem('moodTrackerState');
    console.log('🗑️ Mood state cleared');
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  MoodTrackerState.init();
  restoreMoodUIState();
});

/**
 * Restore UI state from saved mood selection (only if successfully saved)
 */
function restoreMoodUIState() {
  if (!MoodTrackerState.selectedEmotion || !MoodTrackerState.isSaved) {
    console.log('📭 No saved mood to restore');
    return;
  }
  
  console.log('🔄 Restoring saved mood UI state:', MoodTrackerState.selectedEmotion);
  
  const emotion = MoodTrackerState.selectedEmotion;
  
  // Find and highlight the emotion button (works for both dashboard and mood-tracker)
  // Try multiple selectors to be compatible with both page types
  let emotionBtn = document.querySelector(`button[onclick*="selectEmotion('${emotion}"]`);
  
  if (!emotionBtn) {
    emotionBtn = document.querySelector(`button[onclick*="selectMood('${emotion}"]`);
  }
  
  if (!emotionBtn) {
    emotionBtn = document.querySelector(`button[data-emotion="${emotion}"]`);
  }
  
  if (emotionBtn) {
    console.log('✅ Found emotion button, highlighting it');
    emotionBtn.classList.add('selected');
  } else {
    console.warn('⚠️ Could not find emotion button for:', emotion);
  }
  
  // Restore notes
  const notesTextarea = document.getElementById('mood-notes');
  if (notesTextarea && MoodTrackerState.moodNotes) {
    notesTextarea.value = MoodTrackerState.moodNotes;
  }
  
  // Restore confidence slider
  const confidenceSlider = document.getElementById('mood-confidence');
  if (confidenceSlider) {
    confidenceSlider.value = MoodTrackerState.emotionConfidence;
    const confValue = document.getElementById('confidence-value');
    if (confValue) {
      confValue.textContent = MoodTrackerState.emotionConfidence;
    }
  }
  
  // Restore and display mood alert message
  if (MoodTrackerState.alertMessage) {
    const moodAlert = document.getElementById('mood-alert');
    const moodAlertMessage = document.getElementById('mood-alert-message');
    
    if (moodAlert && moodAlertMessage) {
      console.log('✅ Restoring mood alert message:', MoodTrackerState.alertMessage);
      moodAlertMessage.innerHTML = MoodTrackerState.alertMessage;
      moodAlert.classList.remove('hidden');
    }
  }
  
  console.log('✅ Saved mood UI state restored');
}

/**
 * Unified emotion selection function (works for both dashboard and mood-tracker)
 * Also handles selectMood for mood-tracker page
 * NOTE: Selection is temporary - only persists after successful save
 */
function selectEmotion(emotion, buttonElement) {
  console.log('🧠 Unified selectEmotion called:', emotion);
  
  if (!buttonElement && !event?.target) {
    console.warn('⚠️ selectEmotion called without element context');
    return;
  }
  
  const btn = buttonElement || event.target.closest('button');
  
  // If selecting a DIFFERENT emotion than the saved one, clear the old alert
  if (MoodTrackerState.isSaved && emotion !== MoodTrackerState.selectedEmotion) {
    console.log('🔄 New emotion selected, clearing old alert message');
    MoodTrackerState.alertMessage = '';
    const moodAlert = document.getElementById('mood-alert');
    if (moodAlert) {
      moodAlert.classList.add('hidden');
    }
  }
  
  // Update state IN MEMORY ONLY (not saved to localStorage yet)
  MoodTrackerState.selectedEmotion = emotion;
  MoodTrackerState.emotionConfidence = document.getElementById('mood-confidence')?.value || 75;
  MoodTrackerState.moodNotes = document.getElementById('mood-notes')?.value || '';
  
  // Update UI - highlight selected button ONLY
  document.querySelectorAll('.emotion-btn, .mood-button').forEach(e => {
    e.classList.remove('selected');
  });
  
  if (btn) {
    btn.classList.add('selected');
  }
  
  // Hide suggestions container initially - will show after save
  const suggestionsContainer = document.getElementById('suggestions-container');
  if (suggestionsContainer) {
    suggestionsContainer.classList.remove('show');
  }
  
  console.log('✨ Emotion selected (temporary - will persist after save):', emotion);
  
  // Trigger mood trend update
  updateMoodTrendAlert(emotion);
}

/**
 * Alias for selectEmotion - allows selectMood to work on mood-tracker page
 */
function selectMood(emotion) {
  const btn = document.querySelector(`[data-emotion="${emotion}"]`);
  selectEmotion(emotion, btn);
}

/**
 * Unified mood save function (works for both dashboard and mood-tracker)
 */
async function saveMoodEntry() {
  const emotion = MoodTrackerState.selectedEmotion;
  
  if (!emotion) {
    showMoodAlert('Please select an emotion first!', 'error');
    return;
  }

  console.log('💾 Saving mood entry:', emotion);

  const saveBtn = document.getElementById('save-mood-btn');
  if (!saveBtn) {
    console.warn('⚠️ Save button not found');
    return;
  }
  
  const originalText = saveBtn.innerHTML;
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span class="spinner"></span> Saving...';

  try {
    // Get notes and confidence if they exist
    const notesTextarea = document.getElementById('mood-notes');
    const confidenceSlider = document.getElementById('mood-confidence');
    
    const notes = notesTextarea ? notesTextarea.value : '';
    const confidence = confidenceSlider ? parseInt(confidenceSlider.value) : 95;
    
    // Update state in memory
    MoodTrackerState.emotionConfidence = confidence;
    MoodTrackerState.moodNotes = notes;

    const response = await fetch('/api/mood/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        detectedEmotion: emotion,
        emotionConfidence: confidence,
        userResponse: 'yes',
        userConfirmed: true,
        userNote: notes || 'Selected from dashboard/mood tracker'
      })
    });

    console.log('📡 API Response Status:', response.status);
    
    const data = await response.json();
    console.log('📦 API Response Data:', data);

    if (!response.ok) {
      throw new Error(data.message || data.error || `Server error: ${response.statusText}`);
    }

    if (data.success) {
      console.log('✅ Mood saved successfully!');
      
      // NOW save to localStorage after successful API call
      MoodTrackerState.save(true); // Mark as saved
      
      // Update button
      saveBtn.innerHTML = '✅ Mood Saved!';
      saveBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      
      // Show success notification
      showMoodAlert(`Your ${emotion} mood has been recorded! 🎉`, 'success');
      
      // Fetch and show suggestions
      await displaySuggestionsAfterSave(emotion);
      
      // Update greeting card if on dashboard
      if (typeof loadMoodGreetingOnDashboard === 'function') {
        await loadMoodGreetingOnDashboard();
      }
      
      // Update mood trend alert
      await updateMoodTrendAlert(emotion);
      
      // Reset button after delay, but KEEP the selection
      setTimeout(() => {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
        saveBtn.style.background = '';
      }, 2000);
    } else {
      throw new Error(data.error || 'Failed to save mood');
    }
  } catch (error) {
    console.error('❌ Error saving mood:', error);
    saveBtn.disabled = false;
    saveBtn.innerHTML = originalText;
    showMoodAlert(`Error: ${error.message}`, 'error');
  }
}

/**
 * Update mood trend alert based on selected emotion
 */
async function updateMoodTrendAlert(emotion) {
  try {
    console.log('🔄 Updating mood trend alert for:', emotion);
    
    const response = await fetch('/api/user/mood/trend', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      console.warn('⚠️ Failed to fetch mood trend');
      return;
    }
    
    const data = await response.json();
    console.log('📊 Mood trend data:', data);
    
    if (data.success) {
      const trendData = data.trend || {};
      const alertData = data.alert || {};
      
      // Update mood alert on dashboard
      const moodAlert = document.getElementById('mood-alert');
      const moodAlertMessage = document.getElementById('mood-alert-message');
      
      if (moodAlert && moodAlertMessage) {
        // Determine alert based on emotion and trend
        const emotionMessages = {
          'happy': '💪 Keep it up! You\'re doing amazing! Your positive energy is inspiring.',
          'surprised': '✨ That\'s exciting! Embrace this new experience with openness!',
          'neutral': '🎯 Take a moment to reflect on what might lift your mood today.',
          'sad': '💙 We\'re here for you. Talk to your counselor or try some activities to feel better.',
          'angry': '🔥 Your feelings are valid. Talk to your counselor or do activities to channel this energy.',
          'fearful': '🤝 Remember, you\'re not alone. Talk to your counselor for support.',
          'anxious': '🌊 Let\'s ease that anxiety. Talk to your counselor or try calming activities.',
          'disgusted': '💚 Process these feelings with support. Talk to your counselor or do helpful activities.'
        };
        
        let alertMessage = emotionMessages[emotion] || 'Your mood has been recorded. Great job!';
        
        // Add alert if mood is declining
        if (alertData.isCritical) {
          alertMessage += ` ⚠️ ${alertData.reason}`;
        } else if (trendData.isDeclining) {
          alertMessage += ' 📉 We notice your mood has been declining. Consider talking to your counselor.';
        }
        
        // Save alert message to state for persistence
        MoodTrackerState.alertMessage = alertMessage;
        if (MoodTrackerState.isSaved) {
          MoodTrackerState.save(true);
        }
        
        moodAlertMessage.innerHTML = alertMessage;
        
        // Show alert for negative moods or if trend is declining
        if (['sad', 'angry', 'fearful', 'anxious', 'disgusted'].includes(emotion) || trendData.isDeclining || alertData.isCritical) {
          moodAlert.classList.remove('hidden', 'bg-green-50', 'border-green-500', 'bg-yellow-50', 'border-yellow-500');
          moodAlert.classList.add('bg-yellow-50', 'border-yellow-500');
        } else {
          moodAlert.classList.remove('hidden', 'bg-yellow-50', 'border-yellow-500', 'bg-green-50', 'border-green-500');
          moodAlert.classList.add('bg-green-50', 'border-green-500');
        }
        
        console.log('✅ Mood alert updated and saved to localStorage');
      }
    }
  } catch (error) {
    console.error('❌ Error updating mood trend:', error);
  }
}

/**
 * Display suggestions after mood save
 */
async function displaySuggestionsAfterSave(emotion) {
  const suggestionsContainer = document.getElementById('suggestions-container');
  if (!suggestionsContainer) return;
  
  const loadingState = document.getElementById('loading-state');
  const suggestionsList = document.getElementById('suggestions-list');
  
  if (!loadingState || !suggestionsList) return;
  
  // Show suggestions container with loading
  suggestionsContainer.classList.add('show');
  loadingState.style.display = 'flex';
  suggestionsList.innerHTML = '';

  try {
    const response = await fetch('/api/mood/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emotion: emotion })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch suggestions');
    }

    const data = await response.json();
    console.log('💡 Suggestions received:', data);

    loadingState.style.display = 'none';

    // Update suggestion intro
    const introMessages = {
      'happy': '🌟 Keep riding this wave of positivity!',
      'sad': '💙 We\'re here to support you. Try one of these activities.',
      'angry': '🔥 Channel that energy into something constructive.',
      'fearful': '💜 Take a moment to calm yourself. These activities can help.',
      'anxious': '🌊 Let\'s ease that anxiety with some calming activities.',
      'neutral': '😐 Take a moment to reflect or try something new.',
      'disgusted': '🤢 Process these feelings with helpful activities.',
      'surprised': '😲 Process this new experience with care.'
    };

    const introEl = document.getElementById('suggestion-intro');
    if (introEl) {
      introEl.textContent = introMessages[emotion] || 'Check out these suggestions for you!';
    }

    // Display suggestions
    if (data.activities && Array.isArray(data.activities)) {
      data.activities.forEach((activity, index) => {
        const suggestionEl = document.createElement('div');
        suggestionEl.className = 'suggestion-item';
        suggestionEl.style.animationDelay = `${index * 0.1}s`;
        
        const icon = activity.icon || '🎯';
        const name = activity.name || `Activity ${index + 1}`;
        const description = activity.description || 'Try this activity';
        const link = activity.link || '#';
        
        suggestionEl.innerHTML = `
          <div class="suggestion-title">
            <span>${icon}</span>
            <span>${name}</span>
          </div>
          <div class="suggestion-desc">${description}</div>
          ${link && link !== '#' ? `<a href="${link}" class="suggestion-link">Open Activity →</a>` : ''}
        `;
        
        suggestionsList.appendChild(suggestionEl);
      });
    } else {
      suggestionsList.innerHTML = '<p class="text-gray-600">No specific suggestions available, but remember to reach out to your counselor anytime!</p>';
    }
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    loadingState.style.display = 'none';
    suggestionsList.innerHTML = '<p class="text-red-600 font-semibold">⚠️ Unable to load suggestions. Please try again.</p>';
  }
}

/**
 * Clear mood selection and state (only clears temporary selection, not saved mood)
 */
function clearMoodSelection() {
  console.log('🗑️ Clearing mood selection');
  
  // Only clear if not saved, otherwise keep the saved mood
  if (!MoodTrackerState.isSaved) {
    MoodTrackerState.clear();
  } else {
    console.log('✨ Keeping saved mood selection:', MoodTrackerState.selectedEmotion);
  }
  
  // Reset UI - remove all highlights
  document.querySelectorAll('.emotion-btn, .mood-button').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Re-highlight the saved mood if it exists
  if (MoodTrackerState.isSaved && MoodTrackerState.selectedEmotion) {
    const emotion = MoodTrackerState.selectedEmotion;
    let emotionBtn = document.querySelector(`button[onclick*="selectEmotion('${emotion}"]`);
    if (!emotionBtn) emotionBtn = document.querySelector(`button[onclick*="selectMood('${emotion}"]`);
    if (!emotionBtn) emotionBtn = document.querySelector(`button[data-emotion="${emotion}"]`);
    
    if (emotionBtn) {
      emotionBtn.classList.add('selected');
      console.log('✅ Restored saved mood highlighting:', emotion);
    }
  }
  
  const suggestionsContainer = document.getElementById('suggestions-container');
  if (suggestionsContainer) {
    suggestionsContainer.classList.remove('show');
  }
  
  // Clear notes (but keep saved mood alert)
  const notesTextarea = document.getElementById('mood-notes');
  if (notesTextarea) {
    notesTextarea.value = '';
  }
  
  console.log('✅ Mood selection cleared');
}

/**
 * Show mood alert/notification
 */
function showMoodAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-50' : type === 'error' ? 'bg-red-50' : 'bg-blue-50';
  const borderColor = type === 'success' ? 'border-green-400' : type === 'error' ? 'border-red-400' : 'border-blue-400';
  const textColor = type === 'success' ? 'text-green-700' : type === 'error' ? 'text-red-700' : 'text-blue-700';
  
  alertDiv.className = `fixed top-6 right-6 ${bgColor} border-l-4 ${borderColor} p-4 rounded-lg shadow-lg z-50 max-w-md animate-bounce`;
  alertDiv.innerHTML = `<p class="${textColor} font-medium">${message}</p>`;
  document.body.appendChild(alertDiv);
  
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  setTimeout(() => alertDiv.remove(), 5000);
}

/**
 * Show mood notification
 */
function showMoodNotification(message, type) {
  showMoodAlert(message, type);
}

console.log('✅ Unified mood tracker module loaded');

// Override any conflicting functions from mood-tracker-v2.js that may have loaded
// Ensure the unified functions take precedence
window.selectEmotion = selectEmotion;
window.selectMood = selectMood;
window.saveMoodEntry = saveMoodEntry;
window.clearMoodSelection = clearMoodSelection;
window.showMoodAlert = showMoodAlert;
window.showMoodNotification = showMoodNotification;

console.log('✅ Unified mood tracker functions override complete');

// Add function to clear saved mood (for admin/debug purposes)
window.clearSavedMood = function() {
  console.log('🗑️ Clearing saved mood permanently');
  MoodTrackerState.clear();
  // Reset UI
  document.querySelectorAll('.emotion-btn, .mood-button').forEach(btn => {
    btn.classList.remove('selected');
  });
  console.log('✅ Saved mood cleared');
};
