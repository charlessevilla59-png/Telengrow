/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines

    Mood Analysis Utilities - Analyzes mood trends and detects declining patterns
*/

/**
 * Emotion scores for trend analysis (0-100 scale)
 * Higher scores = better mental health
 */
const emotionScores = {
  'happy': 90,
  'surprised': 75,
  'neutral': 50,
  'fearful': 30,
  'anxious': 25,
  'disgusted': 20,
  'angry': 15,
  'sad': 10
};

/**
 * Calculate average mood score
 * @param {Array} moods - Array of mood entries
 * @returns {Object} Average score and trend info
 */
export const calculateMoodTrend = (moods) => {
  if (!moods || moods.length === 0) {
    return {
      averageScore: 0,
      trend: 'none',
      dataPoints: 0,
      isDeclining: false
    };
  }

  // Sort by date (oldest first)
  const sortedMoods = moods.sort((a, b) => 
    new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Calculate scores
  const scores = sortedMoods.map(mood => emotionScores[mood.detectedEmotion] || 50);
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  // Determine trend
  let trend = 'stable';
  let isDeclining = false;

  if (scores.length >= 3) {
    // Compare recent scores with older scores
    const midpoint = Math.floor(scores.length / 2);
    const olderAvg = scores.slice(0, midpoint).reduce((a, b) => a + b, 0) / midpoint;
    const recentAvg = scores.slice(midpoint).reduce((a, b) => a + b, 0) / (scores.length - midpoint);
    
    const difference = olderAvg - recentAvg;
    const percentChange = (difference / olderAvg) * 100;

    if (percentChange > 15) {
      trend = 'declining';
      isDeclining = true;
    } else if (percentChange < -15) {
      trend = 'improving';
    }
  }

  return {
    averageScore: Math.round(averageScore),
    trend,
    isDeclining,
    dataPoints: scores.length,
    scores,
    recentEmotions: sortedMoods.slice(-7).map(m => m.detectedEmotion) // Last 7 moods
  };
};

/**
 * Detect if mood is critically declining
 * @param {Array} moods - Array of recent mood entries (last 7-14 days)
 * @returns {Object} Alert information
 */
export const detectCriticalMoodDeclining = (moods) => {
  if (!moods || moods.length < 3) {
    return {
      isCritical: false,
      reason: 'Insufficient data'
    };
  }

  const analysis = calculateMoodTrend(moods);
  
  // Check for multiple negative moods
  const negativeEmotions = ['sad', 'angry', 'anxious', 'fearful', 'disgusted'];
  const recentMoods = moods.slice(-7);
  const negativeCount = recentMoods.filter(m => 
    negativeEmotions.includes(m.detectedEmotion)
  ).length;

  const negativePercentage = (negativeCount / recentMoods.length) * 100;

  // Critical if: declining trend AND more than 50% negative moods in recent entries
  const isCritical = analysis.isDeclining && negativePercentage > 50;

  return {
    isCritical,
    reason: isCritical ? `Critical mood decline detected: ${negativePercentage.toFixed(0)}% negative moods` : null,
    trend: analysis.trend,
    averageScore: analysis.averageScore,
    negativePercentage: Math.round(negativePercentage),
    recentEmotions: analysis.recentEmotions
  };
};

/**
 * Get mood interpretation message
 * @param {string} emotion - Detected emotion
 * @returns {string} Interpretation message
 */
export const getMoodInterpretation = (emotion) => {
  const interpretations = {
    'happy': '😊 You seem happy! Keep up the positive energy!',
    'surprised': '😲 You seem surprised! That\'s interesting.',
    'neutral': '😐 You seem calm and neutral. That\'s good!',
    'fearful': '😨 You seem a bit fearful. Remember, you\'re safe here.',
    'anxious': '😰 You seem anxious. Would you like to try a relaxation activity?',
    'disgusted': '🤢 You seem disgusted. Is everything okay?',
    'angry': '😠 You seem angry. Let\'s talk about it if you need to.',
    'sad': '😢 You seem sad. Remember, it\'s okay to feel this way. We\'re here for you.'
  };
  
  return interpretations[emotion] || '👋 How are you feeling today?';
};

/**
 * Get personalized greeting message
 * @param {Object} user - User object
 * @param {string} currentEmotion - Current detected emotion (optional)
 * @returns {string} Greeting message
 */
export const getGreetingMessage = (user, currentEmotion = null) => {
  const name = user.nickname || user.name || 'Student';
  const timeOfDay = getTimeOfDay();
  
  let greeting = `Good ${timeOfDay}, ${name}! 👋\n`;
  greeting += `How's your day going? Would you like me to tell your mood today?\n`;
  
  if (currentEmotion) {
    greeting += `I detected you might be feeling ${currentEmotion}. `;
    greeting += `Would you confirm if that's accurate?`;
  }
  
  return greeting;
};

/**
 * Get time of day greeting
 * @returns {string} Part of day (morning, afternoon, evening)
 */
export const getTimeOfDay = () => {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

/**
 * Suggest activities based on mood
 * @param {string} emotion - Detected emotion
 * @returns {Array} Suggested activities with descriptions
 */
export const suggestActivities = (emotion) => {
  const activities = {
    'happy': [
      { 
        name: '✍️ Gratitude Journal', 
        description: 'Capture your joy - Write what made you happy today',
        link: '/journal',
        icon: '✍️',
        color: 'bg-yellow-100 border-yellow-400'
      },
      { 
        name: '💬 Share your Joy', 
        description: 'Connect with counselor - Spread positivity',
        link: '/messages',
        icon: '💬',
        color: 'bg-yellow-100 border-yellow-400'
      },
      { 
        name: '📚 Explore Content', 
        description: 'Discover inspiring reading materials',
        link: '/reading',
        icon: '📚',
        color: 'bg-yellow-100 border-yellow-400'
      }
    ],
    'sad': [
      { 
        name: '🧘 Breathing Exercises', 
        description: 'Calm your mind with guided breathing',
        link: '/games/breathing-bubble',
        icon: '🧘',
        color: 'bg-blue-100 border-blue-400'
      },
      { 
        name: '📚 Reading Materials', 
        description: 'Find comfort in inspiring stories',
        link: '/reading',
        icon: '📚',
        color: 'bg-blue-100 border-blue-400'
      },
      { 
        name: '💬 Talk to Counselor', 
        description: 'Share your feelings - You\'re not alone',
        link: '/messages',
        icon: '💬',
        color: 'bg-blue-100 border-blue-400'
      },
      { 
        name: '🎮 Play a Game', 
        description: 'Lift your mood with fun activities',
        link: '/games',
        icon: '🎮',
        color: 'bg-blue-100 border-blue-400'
      }
    ],
    'angry': [
      { 
        name: '🎾 Stress Ball Game', 
        description: 'Release energy - Channel your anger positively',
        link: '/games/stress-ball',
        icon: '🎾',
        color: 'bg-red-100 border-red-400'
      },
      { 
        name: '🧘 Zen Garden', 
        description: 'Find peace through mindful activity',
        link: '/games/zen-garden',
        icon: '🧘',
        color: 'bg-red-100 border-red-400'
      },
      { 
        name: '🫁 Breathing Exercises', 
        description: 'Cool down with deep breathing',
        link: '/games/breathing-bubble',
        icon: '🫁',
        color: 'bg-red-100 border-red-400'
      },
      { 
        name: '📝 Journal it Out', 
        description: 'Express your feelings in writing',
        link: '/journal',
        icon: '📝',
        color: 'bg-red-100 border-red-400'
      }
    ],
    'anxious': [
      { 
        name: '🫁 Breathing Exercises', 
        description: 'Ease anxiety with breathing techniques',
        link: '/games/breathing-bubble',
        icon: '🫁',
        color: 'bg-orange-100 border-orange-400'
      },
      { 
        name: '🧩 Puzzle Therapy', 
        description: 'Focus your mind on solving puzzles',
        link: '/games/puzzle-therapy',
        icon: '🧩',
        color: 'bg-orange-100 border-orange-400'
      },
      { 
        name: '✨ Affirmation Cards', 
        description: 'Boost confidence with positive affirmations',
        link: '/games/affirmation-cards',
        icon: '✨',
        color: 'bg-orange-100 border-orange-400'
      },
      { 
        name: '💬 Connect with Counselor', 
        description: 'Get professional support',
        link: '/messages',
        icon: '💬',
        color: 'bg-orange-100 border-orange-400'
      }
    ],
    'fearful': [
      { 
        name: '🫁 Breathing Exercises', 
        description: 'Ground yourself with breathing techniques',
        link: '/games/breathing-bubble',
        icon: '🫁',
        color: 'bg-purple-100 border-purple-400'
      },
      { 
        name: '✨ Positive Affirmations', 
        description: 'Reassure yourself with kind words',
        link: '/games/affirmation-cards',
        icon: '✨',
        color: 'bg-purple-100 border-purple-400'
      },
      { 
        name: '💬 Connect with Counselor', 
        description: 'Talk through your fears',
        link: '/messages',
        icon: '💬',
        color: 'bg-purple-100 border-purple-400'
      },
      { 
        name: '📚 Inspiring Stories', 
        description: 'Find courage through others\' experiences',
        link: '/reading',
        icon: '📚',
        color: 'bg-purple-100 border-purple-400'
      }
    ],
    'disgusted': [
      { 
        name: '🧼 Self-Care Reminder', 
        description: 'Practice self-care and hygiene habits',
        link: '/journal',
        icon: '🧼',
        color: 'bg-green-100 border-green-400'
      },
      { 
        name: '🌿 Wellness Check', 
        description: 'Refresh your mind with nature content',
        link: '/reading',
        icon: '🌿',
        color: 'bg-green-100 border-green-400'
      },
      { 
        name: '🫁 Cleansing Breathing', 
        description: 'Reset with calming exercises',
        link: '/games/breathing-bubble',
        icon: '🫁',
        color: 'bg-green-100 border-green-400'
      },
      { 
        name: '💬 Talk it Out', 
        description: 'Discuss your feelings with someone',
        link: '/messages',
        icon: '💬',
        color: 'bg-green-100 border-green-400'
      }
    ],
    'surprised': [
      { 
        name: '✍️ Capture the Moment', 
        description: 'Write about your surprising experience',
        link: '/journal',
        icon: '✍️',
        color: 'bg-pink-100 border-pink-400'
      },
      { 
        name: '🎮 Fun & Games', 
        description: 'Keep the excitement going',
        link: '/games',
        icon: '🎮',
        color: 'bg-pink-100 border-pink-400'
      },
      { 
        name: '💬 Share the News', 
        description: 'Tell others about your surprise',
        link: '/messages',
        icon: '💬',
        color: 'bg-pink-100 border-pink-400'
      },
      { 
        name: '📚 Explore More', 
        description: 'Discover new and exciting content',
        link: '/reading',
        icon: '📚',
        color: 'bg-pink-100 border-pink-400'
      }
    ],
    'neutral': [
      { 
        name: '📚 Explore Reading Materials', 
        description: 'Discover interesting content',
        link: '/reading',
        icon: '📚',
        color: 'bg-gray-100 border-gray-400'
      },
      { 
        name: '🎮 Try a Game', 
        description: 'Engage with fun activities',
        link: '/games',
        icon: '🎮',
        color: 'bg-gray-100 border-gray-400'
      },
      { 
        name: '✍️ Journal Check-in', 
        description: 'Reflect on your day',
        link: '/journal',
        icon: '✍️',
        color: 'bg-gray-100 border-gray-400'
      },
      { 
        name: '🔄 Wellness Check-in', 
        description: 'Track your mood regularly',
        link: '/user/mood-tracker',
        icon: '🔄',
        color: 'bg-gray-100 border-gray-400'
      }
    ]
  };

  return activities[emotion] || activities['neutral'];
};

export default {
  calculateMoodTrend,
  detectCriticalMoodDeclining,
  getMoodInterpretation,
  getGreetingMessage,
  getTimeOfDay,
  suggestActivities,
  emotionScores
};
