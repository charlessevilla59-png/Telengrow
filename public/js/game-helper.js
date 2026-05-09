/**
 * Tellngrow Game Helper Functions
 * Provides common utilities for all games
 */

// Save game score to database
async function saveGameScore(gameType, score, points, duration = 0, difficulty = 'easy', accuracy = 0) {
  try {
    const response = await fetch('/api/games/save-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gameType,
        score,
        points,
        duration,
        difficulty,
        accuracy
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Game score saved!', data);
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: '🎉 Points Earned!',
        html: `<div class="text-2xl font-bold text-purple-600">${points} Points 🎯</div><div class="text-sm text-gray-600 mt-2">Total: <span class="font-bold">${data.totalPoints}</span> points</div>`,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        background: '#fff',
        didOpen: () => {
          // Update dashboard in real-time
          if (window.parent !== window) {
            window.parent.postMessage({ type: 'gameCompleted', points }, '*');
          } else {
            localStorage.setItem('gameCompleted', JSON.stringify({ timestamp: Date.now(), points }));
          }
        }
      });

      return data;
    } else {
      console.error('Error saving score:', data.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.message || 'Failed to save game score',
        timer: 2000,
        toast: true,
        position: 'top-end'
      });
      return null;
    }
  } catch (error) {
    console.error('Error saving game score:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to save game score: ' + error.message,
      timer: 2000,
      toast: true,
      position: 'top-end'
    });
    return null;
  }
}

// Show game completion dialog with score
function showGameCompletionDialog(gameType, score, points, stats = {}) {
  Swal.fire({
    title: '🎮 Game Complete!',
    html: `
      <div class="text-left space-y-3">
        <div class="flex justify-between items-center p-3 bg-purple-50 rounded">
          <span class="text-gray-700">Score:</span>
          <span class="text-2xl font-bold text-purple-600">${score}</span>
        </div>
        <div class="flex justify-between items-center p-3 bg-blue-50 rounded">
          <span class="text-gray-700">Points Earned:</span>
          <span class="text-2xl font-bold text-blue-600">+${points} 🎯</span>
        </div>
        ${stats.duration ? `
        <div class="flex justify-between items-center p-3 bg-green-50 rounded">
          <span class="text-gray-700">Duration:</span>
          <span class="text-lg font-semibold text-green-600">${stats.duration}s</span>
        </div>
        ` : ''}
        ${stats.accuracy ? `
        <div class="flex justify-between items-center p-3 bg-orange-50 rounded">
          <span class="text-gray-700">Accuracy:</span>
          <span class="text-lg font-semibold text-orange-600">${stats.accuracy}%</span>
        </div>
        ` : ''}
      </div>
    `,
    icon: 'success',
    confirmButtonText: 'Continue Playing',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: async () => {
      // Save the score
      const result = await saveGameScore(gameType, score, points, stats.duration, stats.difficulty, stats.accuracy);
      if (result) {
        console.log('Points saved and dashboard updated');
      }
    }
  });
}

// Format time in seconds to readable format
function formatGameDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

// Calculate points based on score and game type
function calculatePoints(gameType, score, difficulty = 'easy') {
  const basePoints = {
    'breathing-bubble': Math.floor(score * 5),
    'color-tap': Math.floor(score * 3),
    'grid-memory': Math.floor(score * 4),
    'stress-ball': Math.floor(score * 2),
    'gratitude-jar': 25,
    'affirmation-cards': 15,
    'zen-garden': 20,
    'puzzle-therapy': Math.floor(score * 3)
  };

  let points = basePoints[gameType] || 10;

  // Apply difficulty multiplier
  const difficultyMultiplier = {
    'easy': 1,
    'medium': 1.5,
    'hard': 2,
    'expert': 3
  };

  points = Math.floor(points * (difficultyMultiplier[difficulty] || 1));

  return Math.max(points, 5); // Minimum 5 points
}

// Get game emoji for notifications
function getGameEmoji(gameType) {
  const emojis = {
    'breathing-bubble': '🫧',
    'color-tap': '🎨',
    'grid-memory': '🧠',
    'stress-ball': '⚽',
    'gratitude-jar': '🙏',
    'affirmation-cards': '✨',
    'zen-garden': '🏜️',
    'puzzle-therapy': '🧩'
  };
  return emojis[gameType] || '🎮';
}

// Play notification sound
function playNotificationSound(type = 'success') {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  if (type === 'success') {
    // Success beep
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
  }
}

export { saveGameScore, showGameCompletionDialog, formatGameDuration, calculatePoints, getGameEmoji, playNotificationSound };
