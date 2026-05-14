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
    'happy': '😊 You seem happy! Your positive energy is wonderful. Keep sharing that joy with others!',
    'surprised': '😲 You seem surprised! New experiences can bring excitement and growth to your life.',
    'neutral': '😐 You seem calm and balanced. This steady state is perfect for reflection and productive activities. You\'re grounded and focused.',
    'fearful': '😨 You seem a bit fearful. Remember, you\'re safe here. Our counselors are ready to listen and support you through your concerns.',
    'anxious': '😰 You seem anxious. This is natural, but you\'re not alone. Try our breathing exercises or talk to someone who cares about you.',
    'disgusted': '🤢 You seem disgusted. Sometimes we need to process these feelings. Would you like to discuss what\'s bothering you?',
    'angry': '😠 You seem angry. These strong feelings deserve attention. Let\'s channel this energy into something constructive - perhaps journaling or talking it through.',
    'sad': '😢 You seem sad. It\'s okay to feel this way. Reach out to our counselors, or write about your feelings in your journal. You\'re not alone in this.'
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
        description: 'Capture your joy and celebrate what made today special. Document these positive moments so you can revisit them on harder days and remember your strength',
        link: '/journal',
        icon: '✍️',
        color: 'bg-yellow-100 border-yellow-400'
      },
      { 
        name: '💬 Share your Joy', 
        description: 'Connect with your counselor and spread positivity. Sharing happiness creates meaningful connections and strengthens your support system',
        link: '/messages',
        icon: '💬',
        color: 'bg-yellow-100 border-yellow-400'
      },
      { 
        name: '📚 Explore Inspiring Content', 
        description: 'Discover uplifting reading materials that complement your positive mood. Great stories and insights can amplify your happiness',
        link: '/reading',
        icon: '📚',
        color: 'bg-yellow-100 border-yellow-400'
      }
    ],
    'sad': [
      { 
        name: '🧘 Breathing Exercises', 
        description: 'Calm your mind with guided breathing techniques. These proven exercises can help ease emotional pain and bring you back to a centered state',
        link: '/games/breathing-bubble',
        icon: '🧘',
        color: 'bg-blue-100 border-blue-400'
      },
      { 
        name: '📚 Uplifting Stories', 
        description: 'Find comfort and hope through inspiring reading materials. Many people have overcome similar challenges - let their stories inspire you',
        link: '/reading',
        icon: '📚',
        color: 'bg-blue-100 border-blue-400'
      },
      { 
        name: '💬 Talk to Counselor', 
        description: 'Share your feelings with a trained counselor who genuinely cares. You\'re never alone - professional support can make a real difference',
        link: '/messages',
        icon: '💬',
        color: 'bg-blue-100 border-blue-400'
      },
      { 
        name: '🎮 Engaging Games', 
        description: 'Distract yourself with enjoyable activities that lift your mood. Fun and laughter are powerful healing tools',
        link: '/games',
        icon: '🎮',
        color: 'bg-blue-100 border-blue-400'
      }
    ],
    'angry': [
      { 
        name: '🎾 Release Energy', 
        description: 'Use our stress relief game to release your anger productively. Channel your intense emotions into something constructive and satisfying',
        link: '/games/stress-ball',
        icon: '🎾',
        color: 'bg-red-100 border-red-400'
      },
      { 
        name: '🧘 Calm Your Mind', 
        description: 'Regain control through the Zen garden meditation activity. Find peace and perspective to process why you\'re feeling this way',
        link: '/games/zen-garden',
        icon: '🧘',
        color: 'bg-red-100 border-red-400'
      },
      { 
        name: '🫁 Cool Down Breathing', 
        description: 'Deep breathing techniques can quickly reduce anger and restore emotional balance. Science proves this works - give it a try',
        link: '/games/breathing-bubble',
        icon: '🫁',
        color: 'bg-red-100 border-red-400'
      },
      { 
        name: '📝 Journal Your Feelings', 
        description: 'Express your anger on paper without filter. Writing helps you understand what triggered you and find constructive solutions',
        link: '/journal',
        icon: '📝',
        color: 'bg-red-100 border-red-400'
      }
    ],
    'anxious': [
      { 
        name: '🫁 Guided Breathing', 
        description: 'Ease anxiety with proven breathing techniques. This is the fastest way to calm your nervous system and regain control',
        link: '/games/breathing-bubble',
        icon: '🫁',
        color: 'bg-orange-100 border-orange-400'
      },
      { 
        name: '🧩 Focus & Concentration', 
        description: 'Ground yourself by solving puzzles. This redirects anxious thoughts and gives your mind something productive to focus on',
        link: '/games/puzzle-therapy',
        icon: '🧩',
        color: 'bg-orange-100 border-orange-400'
      },
      { 
        name: '✨ Positive Affirmations', 
        description: 'Boost your confidence with powerful affirmations. Replace anxious thoughts with positive, empowering messages',
        link: '/games/affirmation-cards',
        icon: '✨',
        color: 'bg-orange-100 border-orange-400'
      },
      { 
        name: '💬 Get Professional Support', 
        description: 'Connect with a trained counselor who specializes in anxiety. Professional guidance can help you manage these overwhelming feelings',
        link: '/messages',
        icon: '💬',
        color: 'bg-orange-100 border-orange-400'
      }
    ],
    'fearful': [
      { 
        name: '🫁 Grounding Breathing', 
        description: 'Ground yourself with breathing techniques that anchor you in the present moment. Fear thrives on "what if" - breathing brings you back to "what is"',
        link: '/games/breathing-bubble',
        icon: '🫁',
        color: 'bg-purple-100 border-purple-400'
      },
      { 
        name: '✨ Positive Affirmations', 
        description: 'Reassure yourself with kind, empowering words. Positive self-talk counters fearful thoughts and builds your inner strength',
        link: '/games/affirmation-cards',
        icon: '✨',
        color: 'bg-purple-100 border-purple-400'
      },
      { 
        name: '💬 Counselor Support', 
        description: 'Talk through your fears with a compassionate counselor. Naming your fears and getting perspective can significantly reduce them',
        link: '/messages',
        icon: '💬',
        color: 'bg-purple-100 border-purple-400'
      },
      { 
        name: '📚 Courage Stories', 
        description: 'Read inspiring stories of people who overcame their fears. Learn from their experiences and find courage in their journeys',
        link: '/reading',
        icon: '📚',
        color: 'bg-purple-100 border-purple-400'
      }
    ],
    'disgusted': [
      { 
        name: '🧼 Self-Care Ritual', 
        description: 'Refresh yourself with self-care and healthy habits. Taking care of your body can help you process and release these uncomfortable feelings',
        link: '/journal',
        icon: '🧼',
        color: 'bg-green-100 border-green-400'
      },
      { 
        name: '🌿 Wellness Resources', 
        description: 'Explore content about health and well-being. Positive environmental input can shift your emotional state',
        link: '/reading',
        icon: '🌿',
        color: 'bg-green-100 border-green-400'
      },
      { 
        name: '🫁 Reset with Breathing', 
        description: 'Calm yourself with cleansing breathing exercises. This helps you release negative feelings and start fresh',
        link: '/games/breathing-bubble',
        icon: '🫁',
        color: 'bg-green-100 border-green-400'
      },
      { 
        name: '💬 Share & Process', 
        description: 'Talk it out with someone you trust. Processing disgusting feelings with a counselor can help you understand and move past them',
        link: '/messages',
        icon: '💬',
        color: 'bg-green-100 border-green-400'
      }
    ],
    'surprised': [
      { 
        name: '✍️ Capture the Moment', 
        description: 'Document your surprising experience in your journal. Capturing these unexpected moments preserves the memory and helps you process what just happened',
        link: '/journal',
        icon: '✍️',
        color: 'bg-pink-100 border-pink-400'
      },
      { 
        name: '🎮 Keep the Energy', 
        description: 'Channel your excitement through engaging games. Excitement is a great fuel for fun and energizing activities',
        link: '/games',
        icon: '🎮',
        color: 'bg-pink-100 border-pink-400'
      },
      { 
        name: '💬 Share Your Surprise', 
        description: 'Tell your counselor or friends about your amazing surprise! Sharing excitement amplifies the joy and strengthens connections',
        link: '/messages',
        icon: '💬',
        color: 'bg-pink-100 border-pink-400'
      },
      { 
        name: '📚 Explore More', 
        description: 'Discover new and exciting content. Keep feeding that sense of wonder and discovery with fresh perspectives',
        link: '/reading',
        icon: '📚',
        color: 'bg-pink-100 border-pink-400'
      }
    ],
    'neutral': [
      { 
        name: '📚 Explore Reading Materials', 
        description: 'You\'re feeling calm and balanced - a perfect time to explore inspiring stories and insights. Reading can help you discover new perspectives and broaden your understanding',
        link: '/reading',
        icon: '📚',
        color: 'bg-gray-100 border-gray-400'
      },
      { 
        name: '🎮 Explore Wellness Games', 
        description: 'Your mood is steady - try light games to maintain your mental clarity and stimulate your mind. Fun activities can help you stay engaged and focused',
        link: '/games',
        icon: '🎮',
        color: 'bg-gray-100 border-gray-400'
      },
      { 
        name: '✍️ Reflective Journaling', 
        description: 'This is an excellent time for deep reflection. Write about your thoughts, goals, and observations about today. Clear thinking leads to meaningful insights',
        link: '/journal',
        icon: '✍️',
        color: 'bg-gray-100 border-gray-400'
      },
      { 
        name: '🧘 Mindfulness Practice', 
        description: 'Build on your calm state with mindfulness meditation. Strengthen your emotional awareness and cultivate inner peace for long-term well-being',
        link: '/games/breathing-bubble',
        icon: '🧘',
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
