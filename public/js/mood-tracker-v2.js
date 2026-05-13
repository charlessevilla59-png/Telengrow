// ===== MOOD TRACKER V2 - Manual Mood Selection =====

let selectedMood = null;

// Debug helper - Log suggestions structure
function logSuggestionsDebug(suggestions) {
  console.log('🔍 SUGGESTIONS DEBUG INFO:');
  console.log('Type:', typeof suggestions);
  console.log('Is Array:', Array.isArray(suggestions));
  if (Array.isArray(suggestions)) {
    console.log('Length:', suggestions.length);
    suggestions.forEach((s, i) => {
      console.log(`[${i}]`, {
        name: s?.name,
        description: s?.description,
        link: s?.link,
        icon: s?.icon,
        fullObject: s
      });
    });
  } else {
    console.log('Full object:', suggestions);
  }
}

// Enhanced showAlert function
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-50' : type === 'error' ? 'bg-red-50' : 'bg-blue-50';
  const borderColor = type === 'success' ? 'border-green-400' : type === 'error' ? 'border-red-400' : 'border-blue-400';
  const textColor = type === 'success' ? 'text-green-700' : type === 'error' ? 'text-red-700' : 'text-blue-700';
  
  alertDiv.className = `fixed top-6 right-6 ${bgColor} border-l-4 ${borderColor} p-4 rounded-lg shadow-lg z-50 max-w-md`;
  alertDiv.innerHTML = `<p class="${textColor} font-medium">${message}</p>`;
  document.body.appendChild(alertDiv);
  
  console.log(`[${type.toUpperCase()}] ${message}`);
  setTimeout(() => alertDiv.remove(), 5000);
}

// Show mood-based activity suggestions
function showSuggestions(moodData) {
  console.log('🎯 showSuggestions called with moodData:', moodData);
  
  const suggestions = moodData.activitiesSuggested;
  const emotion = moodData.detectedEmotion;
  
  console.log('📋 Suggestions array:', suggestions);
  console.log('🧠 Emotion:', emotion);
  logSuggestionsDebug(suggestions);
  
  if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
    console.log('⚠️ No suggestions available or suggestions is not an array');
    showAlert('No suggestions available at this moment', 'info');
    return;
  }

  const emojiMap = {
    happy: '😊', sad: '😢', angry: '😠', anxious: '😰',
    neutral: '😐', disgusted: '🤢', fearful: '😨', surprised: '😮'
  };
  const emoji = emojiMap[emotion] || '📊';

  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'suggestions-modal-overlay';
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
  `;

  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 p-8 overflow-y-auto max-h-[85vh]';
  modal.style.animation = 'slideUp 0.4s ease';

  // Modal header
  let headerHTML = `
    <div class="text-center mb-8">
      <div class="text-5xl mb-4">${emoji}</div>
      <h2 class="text-3xl font-bold text-gray-900 mb-2 capitalize">That's ${emotion}!</h2>
      <p class="text-lg text-gray-600">Here are some activities to help you feel better:</p>
    </div>
  `;

  // Suggestions grid - FIXED to properly access object properties
  let suggestionsHTML = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">';
  
  suggestions.forEach((suggestion, index) => {
    console.log(`📌 Suggestion ${index}:`, suggestion);
    
    // Safely extract properties with fallbacks
    const name = suggestion?.name || `Activity ${index + 1}`;
    const description = suggestion?.description || 'Try this activity';
    const link = suggestion?.link || '#';
    const icon = suggestion?.icon || '🎯';
    
    // Safety check - log and skip if critical data is missing
    if (!name || name === 'undefined' || link === 'undefined') {
      console.warn(`⚠️ Skipping suggestion ${index}: invalid data`, {name, link, suggestion});
      return;
    }
    
    suggestionsHTML += `
      <button 
        onclick="navigateToSuggestion('${link}')"
        class="suggestion-btn p-4 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-lg active:scale-95 text-left"
        style="border-color: #e5e7eb; background: #f9fafb; min-height: 140px;"
        title="${name}"
      >
        <div class="text-3xl mb-2">${icon}</div>
        <div class="font-bold text-gray-900 text-sm" style="line-height: 1.3;">${name}</div>
        <div class="text-xs text-gray-600 mt-2" style="line-height: 1.4;">${description}</div>
      </button>
    `;
  });
  
  suggestionsHTML += '</div>';

  // Modal footer with close button
  let footerHTML = `
    <div class="flex gap-3 justify-center">
      <button 
        onclick="closeSuggestionsModal()"
        class="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
      >
        Maybe Later
      </button>
      <button 
        onclick="closeSuggestionsModal()"
        class="px-6 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition"
      >
        ✓ Got it!
      </button>
    </div>
  `;

  modal.innerHTML = headerHTML + suggestionsHTML + footerHTML;
  modalOverlay.appendChild(modal);
  document.body.appendChild(modalOverlay);

  console.log('✅ Modal rendered successfully with', suggestions.length, 'suggestions');

  // Add animations and styles (only once)
  if (!document.querySelector('style[data-mood-suggestions-styles]')) {
    const style = document.createElement('style');
    style.setAttribute('data-mood-suggestions-styles', 'true');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .suggestion-btn {
        cursor: pointer;
        text-align: left;
        transition: all 0.3s ease;
      }
      .suggestion-btn:hover {
        border-color: #10b981 !important;
        background: #ecfdf5 !important;
      }
      .suggestion-btn:active {
        transform: scale(0.95);
      }
    `;
    document.head.appendChild(style);
  }
}

// Navigate to suggestion and close modal
function navigateToSuggestion(link) {
  console.log('🔗 Navigating to:', link);
  closeSuggestionsModal();
  showAlert(`🚀 Taking you to ${link}...`, 'info');
  setTimeout(() => {
    window.location.href = link;
  }, 500);
}

// Close suggestions modal
function closeSuggestionsModal() {
  console.log('❌ Closing suggestions modal');
  const modal = document.getElementById('suggestions-modal-overlay');
  if (modal) {
    modal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      modal.remove();
      console.log('✅ Modal removed');
    }, 300);
  }
}

// Select mood and highlight button
function selectMood(emotion) {
  selectedMood = emotion;
  console.log('Selected mood:', emotion);
  
  // Remove previous selection styles from all buttons
  document.querySelectorAll('.mood-button').forEach(btn => {
    btn.style.borderColor = '#e5e7eb';
    btn.style.backgroundColor = 'transparent';
    btn.style.transform = 'scale(1)';
  });

  // Highlight selected mood
  const btn = document.querySelector(`[data-emotion="${emotion}"]`);
  if (btn) {
    const colorMap = {
      happy: { border: '#fbbf24', bg: '#fef3c7' },
      sad: { border: '#60a5fa', bg: '#dbeafe' },
      angry: { border: '#ef4444', bg: '#fee2e2' },
      anxious: { border: '#fb923c', bg: '#ffedd5' },
      neutral: { border: '#d1d5db', bg: '#f3f4f6' },
      disgusted: { border: '#34d399', bg: '#d1fae5' },
      fearful: { border: '#a78bfa', bg: '#ede9fe' },
      surprised: { border: '#f472b6', bg: '#fce7f3' }
    };
    const color = colorMap[emotion] || colorMap.neutral;
    btn.style.borderColor = color.border;
    btn.style.backgroundColor = color.bg;
    btn.style.transform = 'scale(1.05)';
    btn.style.transition = 'all 0.2s ease';
    console.log(`✅ Highlighted mood button: ${emotion}`);
  }
}

// Save mood entry
async function saveMoodEntry() {
  if (!selectedMood) {
    showAlert('Please select a mood first', 'error');
    return;
  }

  const notes = document.getElementById('mood-notes')?.value || '';
  const confidence = parseInt(document.getElementById('mood-confidence')?.value || '75');

  try {
    console.log('📤 Saving mood:', { selectedMood, confidence, notes });
    
    const response = await fetch('/user/mood/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        detectedEmotion: selectedMood,
        emotionConfidence: confidence,
        userConfirmed: true,
        userNote: notes || null,
        userResponse: 'yes'
      })
    });

    const data = await response.json();
    console.log('📥 Response:', data);
    console.log('📊 Full response data:', JSON.stringify(data, null, 2));

    if (data.success) {
      showAlert(`✅ Mood saved: ${selectedMood}!`, 'success');
      
      // Reset form
      document.getElementById('mood-notes').value = '';
      document.getElementById('mood-confidence').value = '75';
      document.getElementById('confidence-value').textContent = '75';
      
      // Reset buttons
      document.querySelectorAll('.mood-button').forEach(btn => {
        btn.style.borderColor = '#e5e7eb';
        btn.style.backgroundColor = 'transparent';
        btn.style.transform = 'scale(1)';
      });
      
      selectedMood = null;

      // Show suggestions after a delay - WITH VALIDATION
      if (data.data) {
        console.log('🎯 MoodData object:', data.data);
        console.log('📋 Suggestions in data:', data.data.activitiesSuggested);
        
        setTimeout(() => {
          if (data.data.activitiesSuggested && Array.isArray(data.data.activitiesSuggested)) {
            console.log('✅ Showing suggestions modal...');
            showSuggestions(data.data);
          } else {
            console.warn('⚠️ Suggestions not available or not an array');
          }
        }, 1500);
      } else {
        console.warn('⚠️ No data object in response');
      }

      // Reload mood history after a short delay
      setTimeout(() => {
        loadMoodHistory();
        loadMoodDashboardData();
      }, 500);
    } else {
      showAlert(data.message || 'Error saving mood', 'error');
      console.error('Save error:', data);
    }
  } catch (error) {
    console.error('❌ Error saving mood:', error);
    showAlert('Error saving mood. Please try again.', 'error');
  }
}

// Load mood history
async function loadMoodHistory() {
  try {
    console.log('📋 Loading mood history...');
    const response = await fetch('/user/mood/history', {
      credentials: 'include'
    });
    const data = await response.json();
    console.log('📥 History response:', data);

    const historyDiv = document.getElementById('mood-history');
    const noHistoryDiv = document.getElementById('no-history');
    
    if (!historyDiv || !noHistoryDiv) {
      console.error('❌ History divs not found');
      return;
    }

    if (data.success && data.moods && data.moods.length > 0) {
      console.log(`✅ Loaded ${data.moods.length} mood entries`);
      
      historyDiv.innerHTML = data.moods.slice(0, 10).map(mood => {
        const date = new Date(mood.createdAt);
        const emojiMap = {
          happy: '😊', sad: '😢', angry: '😠', anxious: '😰',
          neutral: '😐', disgusted: '🤢', fearful: '😨', surprised: '😲'
        };
        const emoji = emojiMap[mood.detectedEmotion] || '❓';
        return `
          <div class="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-l-4 border-emerald-600 shadow-sm hover:shadow-md transition">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-3xl">${emoji}</span>
                <div>
                  <p class="font-semibold text-gray-900 capitalize">${mood.detectedEmotion}</p>
                  <p class="text-xs text-gray-500">${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  ${mood.userNote ? `<p class="text-sm text-gray-700 mt-1 italic">"${mood.userNote}"</p>` : ''}
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">${mood.emotionConfidence}%</p>
              </div>
            </div>
          </div>
        `;
      }).join('');

      historyDiv.classList.remove('hidden');
      noHistoryDiv.classList.add('hidden');
    } else {
      console.log('No mood entries found');
      historyDiv.innerHTML = '';
      historyDiv.classList.add('hidden');
      noHistoryDiv.classList.remove('hidden');
    }
  } catch (error) {
    console.error('❌ Error loading mood history:', error);
    showAlert('Error loading mood history', 'error');
  }
}

// Initialize page on load
document.addEventListener('DOMContentLoaded', () => {
  console.log('📱 Mood Tracker page loaded, initializing...');
  loadMoodHistory();
  loadMoodDashboardData();
  
  // Setup event listeners for confidence slider
  const confidenceSlider = document.getElementById('mood-confidence');
  if (confidenceSlider) {
    confidenceSlider.addEventListener('input', (e) => {
      const confidenceValue = document.getElementById('confidence-value');
      if (confidenceValue) {
        confidenceValue.textContent = e.target.value;
      }
    });
  }
});

// Load mood dashboard data (greeting + trend + stats)
async function loadMoodDashboardData() {
  try {
    const response = await fetch('/api/user/mood/dashboard', {
      credentials: 'include'
    });
    const data = await response.json();
    
    if (data.success) {
      // Update greeting
      const greetingMessage = document.getElementById('greeting-message');
      if (greetingMessage && data.greeting) {
        greetingMessage.innerHTML = data.greeting.split('\n').join('<br>');
      }

      // Check for mood alerts
      if (data.moodData && data.moodData.trend && data.moodData.trend.isDeclining) {
        const moodStatus = document.getElementById('mood-status');
        const moodStatusText = document.getElementById('mood-status-text');
        if (moodStatus && moodStatusText) {
          moodStatusText.innerHTML = `
            <span class="text-yellow-700 font-bold">⚠️ Mood Trend Alert:</span><br>
            Your mood has been trending lower recently. 
            We recommend talking to your counselor or trying some wellness activities.
          `;
          moodStatus.classList.remove('hidden');
          moodStatus.classList.add('bg-yellow-50', 'border-yellow-500');
        }
      }
    }
  } catch (error) {
    console.error('Error loading mood dashboard data:', error);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Mood tracker initialized');
  loadMoodHistory();
  loadMoodDashboardData();
});
