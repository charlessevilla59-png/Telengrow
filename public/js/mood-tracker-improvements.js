/**
 * MOOD TRACKER IMPROVEMENTS & ENHANCEMENTS
 * Adds important features to improve emotion detection accuracy and user experience
 */

console.log('📊 Loading Mood Tracker Improvements Module...');

// ═══════════════════════════════════════════════════════════════════════════
// EMOTION-SPECIFIC TIPS & RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════════

const emotionTips = {
  'happy': {
    tips: [
      '✅ Continue doing what makes you happy',
      '💬 Share your positive energy with others',
      '🎯 Set a positive intention for the day',
      '✍️ Journal about what made you happy'
    ],
    systemRecommendations: [
      'Maintain engagement levels',
      'Share positive experiences with friends',
      'Build on this positive momentum'
    ]
  },
  'sad': {
    tips: [
      '💭 It\'s okay to feel this way - emotions are temporary',
      '👥 Consider reaching out to someone you trust',
      '🚶 Take a walk or engage in light exercise',
      '📚 Read uplifting or inspirational content'
    ],
    systemRecommendations: [
      'Priority: Connect with support network',
      'Suggest relaxing activities',
      'Encourage expression through journaling'
    ]
  },
  'angry': {
    tips: [
      '🫁 Take 5 deep breaths - breathe in for 4, out for 4',
      '🚶 Step away from the situation for a moment',
      '💪 Channel energy into physical activity',
      '⏸️ Pause before making important decisions'
    ],
    systemRecommendations: [
      'Recommend breathing exercises',
      'Suggest physical activities to release tension',
      'Avoid making big decisions right now'
    ]
  },
  'fearful': {
    tips: [
      '🧘 Grounding technique: Notice 5 things you see, 4 you hear, 3 you touch',
      '📝 Write down your fears to externalize them',
      '👥 Talk to someone about what\'s worrying you',
      '🌟 Remember past times you overcame challenges'
    ],
    systemRecommendations: [
      'Provide reassurance and support',
      'Suggest talking to counselor',
      'Recommend grounding exercises'
    ]
  },
  'neutral': {
    tips: [
      '🤔 Check in with yourself - what could enhance your mood?',
      '🎯 Set a small achievable goal for today',
      '🌟 Do something you\'ve been meaning to do',
      '⚡ Try something new or step out of your comfort zone'
    ],
    systemRecommendations: [
      'Good time for reflection and planning',
      'Consider activities for self-improvement',
      'Maintain stable emotional state'
    ]
  },
  'disgusted': {
    tips: [
      '🧼 Create a pleasant environment around you',
      '💆 Practice self-care activities',
      '🎵 Listen to music you enjoy',
      '🌸 Do something that brings you joy'
    ],
    systemRecommendations: [
      'Recommend pleasant activities',
      'Suggest changing environment',
      'Encourage self-care'
    ]
  },
  'surprised': {
    tips: [
      '⏸️ Take a moment to process what happened',
      '📝 Write about your experience',
      '🤔 Reflect on what surprised you',
      '👥 Share the experience with someone'
    ],
    systemRecommendations: [
      'Allow time for processing',
      'Encourage reflection',
      'Support expression of the experience'
    ]
  },
  'anxious': {
    tips: [
      '🫁 Practice the 4-7-8 breathing: In(4) Hold(7) Out(8)',
      '🧘 Try progressive muscle relaxation',
      '📱 Limit distractions and focus on one task',
      '🎯 Break large tasks into smaller steps'
    ],
    systemRecommendations: [
      'Recommend anxiety management techniques',
      'Suggest structured activities',
      'Encourage counselor consultation'
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CAMERA QUALITY DETECTION
// ═══════════════════════════════════════════════════════════════════════════

class CameraQualityChecker {
  constructor() {
    this.luminanceThreshold = 50;
    this.contrastThreshold = 30;
  }

  /**
   * Check if camera feed has good lighting and clarity
   */
  checkCameraQuality(video) {
    try {
      // Safety check: ensure video has loaded
      if (!video || !video.videoWidth || !video.videoHeight) {
        console.warn('⚠️ Video not ready for quality check');
        return null;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.warn('⚠️ Canvas context not available');
        return null;
      }
      
      // Draw video frame to canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (canvas.width === 0 || canvas.height === 0) {
        console.warn('⚠️ Canvas dimensions invalid');
        return null;
      }
      
      try {
        ctx.drawImage(video, 0, 0);
      } catch (drawError) {
        console.warn('⚠️ Cannot draw video to canvas:', drawError.message);
        return null;
      }
      
      // Get image data
      let imageData;
      try {
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch (getError) {
        console.warn('⚠️ Cannot get image data:', getError.message);
        return null;
      }
      
      const data = imageData.data;
      
      // Calculate luminance (brightness)
      let luminance = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        luminance += (r + g + b) / 3;
      }
      luminance = luminance / (data.length / 4);
      
      // Calculate contrast
      let variance = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const avg = (r + g + b) / 3;
        variance += Math.pow(avg - luminance, 2);
      }
      variance = Math.sqrt(variance / (data.length / 4));
      
      return {
        quality: 'good',
        luminance: Math.round(luminance),
        contrast: Math.round(variance),
        isGoodLighting: luminance > this.luminanceThreshold,
        isGoodContrast: variance > this.contrastThreshold,
        recommendation: this.getQualityRecommendation(luminance, variance)
      };
    } catch (error) {
      console.warn('Camera quality check failed:', error);
      return null;
    }
  }

  /**
   * Get recommendation based on quality metrics
   */
  getQualityRecommendation(luminance, contrast) {
    if (luminance < 30) {
      return '🔆 Too dark - improve lighting';
    } else if (luminance > 220) {
      return '🔅 Too bright - reduce glare';
    } else if (contrast < 20) {
      return '🎯 Low contrast - move to better position';
    } else {
      return '✅ Camera quality is good!';
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EMOTION DETECTION ANALYZER
// ═══════════════════════════════════════════════════════════════════════════

class EmotionDetectionAnalyzer {
  constructor() {
    this.detectionHistory = [];
    this.maxHistorySize = 20;
  }

  /**
   * Analyze detection quality and consistency
   */
  analyzeDetectionQuality(emotionData) {
    this.detectionHistory.push({
      emotion: emotionData.emotion,
      confidence: emotionData.confidence,
      timestamp: Date.now()
    });

    // Keep only recent history
    if (this.detectionHistory.length > this.maxHistorySize) {
      this.detectionHistory.shift();
    }

    // Calculate statistics
    const recentEmotions = this.detectionHistory.slice(-5);
    const uniqueEmotions = [...new Set(recentEmotions.map(e => e.emotion))];
    const avgConfidence = recentEmotions.reduce((sum, e) => sum + e.confidence, 0) / recentEmotions.length;
    const consistency = this.calculateConsistency();

    return {
      dominantEmotion: emotionData.emotion,
      uniqueEmotions: uniqueEmotions,
      averageConfidence: Math.round(avgConfidence),
      consistency: consistency,
      isReliable: consistency > 0.6 && avgConfidence > 50
    };
  }

  /**
   * Calculate consistency of detected emotions
   */
  calculateConsistency() {
    if (this.detectionHistory.length < 3) return 0;

    const recentEmotions = this.detectionHistory.slice(-5);
    const emotionCounts = {};

    recentEmotions.forEach(e => {
      emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(emotionCounts));
    return maxCount / recentEmotions.length;
  }

  /**
   * Reset detection history
   */
  reset() {
    this.detectionHistory = [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EMOTION HISTORY MANAGER
// ═══════════════════════════════════════════════════════════════════════════

class EmotionHistoryManager {
  constructor() {
    this.storageKey = 'mood_tracker_history';
    this.loadHistory();
  }

  /**
   * Save emotion entry
   */
  addEntry(emotion, confidence, userConfirmed, userNote = '') {
    const entry = {
      id: Date.now(),
      emotion: emotion,
      confidence: confidence,
      userConfirmed: userConfirmed,
      userNote: userNote,
      timestamp: new Date().toISOString()
    };

    this.history.push(entry);
    this.saveHistory();
    return entry;
  }

  /**
   * Get emotion statistics
   */
  getStatistics() {
    if (this.history.length === 0) return null;

    const emotionCounts = {};
    const emotionConfidences = {};

    this.history.forEach(entry => {
      emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
      if (!emotionConfidences[entry.emotion]) {
        emotionConfidences[entry.emotion] = [];
      }
      emotionConfidences[entry.emotion].push(entry.confidence);
    });

    // Calculate average confidence per emotion
    const avgConfidences = {};
    Object.keys(emotionConfidences).forEach(emotion => {
      const values = emotionConfidences[emotion];
      avgConfidences[emotion] = Math.round(
        values.reduce((sum, conf) => sum + conf, 0) / values.length
      );
    });

    return {
      totalEntries: this.history.length,
      uniqueEmotions: Object.keys(emotionCounts),
      emotionCounts: emotionCounts,
      averageConfidences: avgConfidences,
      mostFrequentEmotion: Object.keys(emotionCounts).reduce((a, b) =>
        emotionCounts[a] > emotionCounts[b] ? a : b
      )
    };
  }

  /**
   * Get recent entries
   */
  getRecentEntries(limit = 10) {
    return this.history.slice(-limit).reverse();
  }

  /**
   * Load history from localStorage
   */
  loadHistory() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.history = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load mood history:', error);
      this.history = [];
    }
  }

  /**
   * Save history to localStorage
   */
  saveHistory() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    } catch (error) {
      console.warn('Failed to save mood history:', error);
    }
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.history = [];
    this.saveHistory();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════════

class SystemRecommendations {
  /**
   * Generate recommendations based on emotion
   */
  static generateRecommendations(emotion) {
    const tips = emotionTips[emotion] || emotionTips.neutral;
    
    return {
      emotionTips: tips.tips,
      systemRecommendations: tips.systemRecommendations,
      resources: this.getResources(emotion)
    };
  }

  /**
   * Get helpful resources for emotion
   */
  static getResources(emotion) {
    const resources = {
      happy: [
        { name: 'Share Joy', link: '/messages', icon: '💬' },
        { name: 'Your Progress', link: '/user/progress', icon: '🏆' },
        { name: 'Play Games', link: '/games', icon: '🎮' }
      ],
      sad: [
        { name: 'Counselor', link: '/messages', icon: '💬' },
        { name: 'Journal', link: '/journal/new', icon: '📔' },
        { name: 'Reading', link: '/reading', icon: '📚' }
      ],
      angry: [
        { name: 'Breathing Exercise', link: '/games/breathing-bubble', icon: '🫁' },
        { name: 'Journal', link: '/journal/new', icon: '✍️' },
        { name: 'Relaxing Games', link: '/games', icon: '🎮' }
      ],
      fearful: [
        { name: 'Counselor Support', link: '/messages', icon: '💬' },
        { name: 'Breathing Techniques', link: '/games/breathing-bubble', icon: '🫁' },
        { name: 'Grounding Resources', link: '/reading', icon: '📚' }
      ],
      neutral: [
        { name: 'Journal', link: '/journal', icon: '📝' },
        { name: 'Games', link: '/games', icon: '🎮' },
        { name: 'Reading Materials', link: '/reading', icon: '📚' }
      ]
    };

    return resources[emotion] || resources.neutral;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MODULES TO WINDOW
// ═══════════════════════════════════════════════════════════════════════════

window.emotionTips = emotionTips;
window.CameraQualityChecker = CameraQualityChecker;
window.EmotionDetectionAnalyzer = EmotionDetectionAnalyzer;
window.EmotionHistoryManager = EmotionHistoryManager;
window.SystemRecommendations = SystemRecommendations;

// Initialize global instances
window.cameraQualityChecker = new CameraQualityChecker();
window.emotionAnalyzer = new EmotionDetectionAnalyzer();
window.emotionHistoryManager = new EmotionHistoryManager();

console.log('✅ Mood Tracker Improvements loaded successfully');
console.log('📊 Available: CameraQualityChecker, EmotionDetectionAnalyzer, EmotionHistoryManager, SystemRecommendations');
