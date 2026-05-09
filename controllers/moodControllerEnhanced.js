/*
 * ENHANCED MOOD CONTROLLER - IMPROVEMENTS & FIXES
 * Adds comprehensive emotion analysis, statistics, and better data handling
 */

import { MoodEntry } from '../models/MoodEntryModel.js';
import { User } from '../models/userModel.js';

/**
 * ENHANCED: Save detected emotion with better validation and analytics
 */
export const saveMoodEnhanced = async (req, res) => {
  try {
    const { detectedEmotion, emotionConfidence, userResponse, userConfirmed, userNote } = req.body;
    const userId = req.session.userId;

    // ═════════════════════════════════════════════════════════════════
    // VALIDATION LAYER
    // ═════════════════════════════════════════════════════════════════

    if (!userId) {
      console.warn('⚠️ Unauthorized mood save attempt');
      return res.status(401).json({ 
        error: 'Not authenticated',
        message: 'User session not found'
      });
    }

    // Validate emotion with case-insensitive check
    const validEmotions = ['neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'anxious'];
    const normalizedEmotion = detectedEmotion?.toLowerCase().trim();
    
    if (!normalizedEmotion || !validEmotions.includes(normalizedEmotion)) {
      console.warn(`⚠️ Invalid emotion: ${detectedEmotion}`);
      return res.status(400).json({ 
        error: 'Invalid emotion',
        message: `Emotion must be one of: ${validEmotions.join(', ')}`
      });
    }

    // Validate confidence is a number between 0-100
    const confidence = parseFloat(emotionConfidence);
    if (isNaN(confidence) || confidence < 0 || confidence > 100) {
      console.warn(`⚠️ Invalid confidence: ${emotionConfidence}`);
      return res.status(400).json({ 
        error: 'Invalid confidence',
        message: 'Confidence must be a number between 0 and 100'
      });
    }

    // Validate response
    if (userResponse && !['yes', 'no', 'maybe'].includes(userResponse.toLowerCase())) {
      console.warn(`⚠️ Invalid response: ${userResponse}`);
      return res.status(400).json({ 
        error: 'Invalid response',
        message: 'Response must be yes, no, or maybe'
      });
    }

    // ═════════════════════════════════════════════════════════════════
    // DATA ENRICHMENT
    // ═════════════════════════════════════════════════════════════════

    // Get user to check context
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    // Determine confidence level
    let confidenceLevel = 'low';
    if (confidence > 75) confidenceLevel = 'high';
    else if (confidence > 50) confidenceLevel = 'medium';

    // Generate suggested activities based on emotion
    const activities = generateActivitiesForEmotion(normalizedEmotion);

    // ═════════════════════════════════════════════════════════════════
    // CREATE MOOD ENTRY
    // ═════════════════════════════════════════════════════════════════

    const moodEntry = await MoodEntry.create({
      userId: userId,
      detectedEmotion: normalizedEmotion,
      emotionConfidence: confidence,
      confidenceLevel: confidenceLevel,
      userResponse: userResponse?.toLowerCase() || null,
      userConfirmed: userConfirmed === true,
      userNote: (userNote || '').substring(0, 500), // Limit to 500 chars
      activitiesSuggested: activities,
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || 'unknown',
        timestamp: new Date().toISOString()
      }
    });

    // ═════════════════════════════════════════════════════════════════
    // LOGGING & ANALYTICS
    // ═════════════════════════════════════════════════════════════════

    console.log(`✅ Mood entry saved successfully`);
    console.log(`📊 Emotion: ${normalizedEmotion} (${confidence}% - ${confidenceLevel})`);
    console.log(`👤 User: ${user.name} (ID: ${userId})`);
    console.log(`🎯 User confirmed: ${userConfirmed ? 'Yes' : 'No'}`);
    console.log(`📝 Activities suggested: ${activities.length}`);

    // ═════════════════════════════════════════════════════════════════
    // RESPONSE
    // ═════════════════════════════════════════════════════════════════

    res.status(201).json({
      success: true,
      message: 'Mood entry saved successfully',
      moodId: moodEntry.id,
      data: {
        id: moodEntry.id,
        emotion: moodEntry.detectedEmotion,
        confidence: moodEntry.emotionConfidence,
        confidenceLevel: moodEntry.confidenceLevel,
        userConfirmed: moodEntry.userConfirmed,
        activitiesSuggested: moodEntry.activitiesSuggested,
        createdAt: moodEntry.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error saving mood:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to save mood'
    });
  }
};

/**
 * ENHANCED: Get mood history with filtering and pagination
 */
export const getMoodHistoryEnhanced = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { days = 30, limit = 50, offset = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get moods with pagination
    const { count, rows: moods } = await MoodEntry.findAndCountAll({
      where: {
        userId: userId,
        createdAt: { $gte: startDate }
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate statistics
    const stats = calculateAdvancedMoodStats(moods);

    console.log(`✅ Retrieved ${moods.length} mood entries for user ${userId}`);

    res.status(200).json({
      success: true,
      count: count,
      moods: moods,
      statistics: stats,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching mood history:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
};

/**
 * Get emotional trends and insights
 */
export const getEmotionalTrends = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { days = 7 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get moods
    const moods = await MoodEntry.findAll({
      where: {
        userId: userId,
        createdAt: { $gte: startDate }
      },
      order: [['createdAt', 'ASC']]
    });

    if (moods.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No mood data for the specified period',
        trends: [],
        insights: []
      });
    }

    // Calculate trends
    const emotionCounts = {};
    const dailyAverages = {};
    const confidenceByEmotion = {};

    moods.forEach(mood => {
      // Count emotions
      emotionCounts[mood.detectedEmotion] = (emotionCounts[mood.detectedEmotion] || 0) + 1;

      // Track confidence by emotion
      if (!confidenceByEmotion[mood.detectedEmotion]) {
        confidenceByEmotion[mood.detectedEmotion] = [];
      }
      confidenceByEmotion[mood.detectedEmotion].push(mood.emotionConfidence);

      // Daily averages
      const date = new Date(mood.createdAt).toISOString().split('T')[0];
      if (!dailyAverages[date]) {
        dailyAverages[date] = { emotions: [], confidences: [] };
      }
      dailyAverages[date].emotions.push(mood.detectedEmotion);
      dailyAverages[date].confidences.push(mood.emotionConfidence);
    });

    // Generate insights
    const insights = generateEmotionInsights(emotionCounts, confidenceByEmotion, moods.length);

    console.log(`✅ Generated emotional trends for user ${userId} (${days} days)`);

    res.status(200).json({
      success: true,
      period: days,
      trends: {
        emotionCounts: emotionCounts,
        averageConfidence: calculateAverageConfidence(moods),
        mostFrequentEmotion: getMostFrequentEmotion(emotionCounts),
        averageConfidenceByEmotion: Object.keys(confidenceByEmotion).reduce((acc, emotion) => {
          const values = confidenceByEmotion[emotion];
          acc[emotion] = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
          return acc;
        }, {})
      },
      insights: insights,
      dataPoints: moods.length
    });

  } catch (error) {
    console.error('❌ Error calculating emotional trends:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
};

/**
 * Get mood by ID (for detailed view)
 */
export const getMoodById = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { moodId } = req.params;

    const mood = await MoodEntry.findOne({
      where: {
        id: moodId,
        userId: userId
      }
    });

    if (!mood) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Mood entry not found'
      });
    }

    res.status(200).json({
      success: true,
      mood: mood
    });

  } catch (error) {
    console.error('❌ Error fetching mood:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
};

/**
 * Generate activities for emotion (helper)
 */
function generateActivitiesForEmotion(emotion) {
  const activityMap = {
    happy: ['Share with friends', 'Celebrate achievement', 'Journal about it', 'Play games'],
    sad: ['Talk to counselor', 'Journal feelings', 'Read uplifting content', 'Breathing exercise'],
    angry: ['Breathing exercise', 'Physical activity', 'Journal', 'Take a break'],
    fearful: ['Grounding techniques', 'Talk to counselor', 'Breathing exercise', 'Call a friend'],
    anxious: ['Breathing exercise', 'Meditation', 'Progressive relaxation', 'Structured activity'],
    neutral: ['Reflection', 'Set goals', 'Try something new', 'Self-care'],
    disgusted: ['Change environment', 'Self-care', 'Pleasant activity', 'Relaxation'],
    surprised: ['Process feelings', 'Journal experience', 'Talk to someone', 'Take time']
  };

  return activityMap[emotion] || activityMap.neutral;
}

/**
 * Calculate advanced mood statistics
 */
function calculateAdvancedMoodStats(moods) {
  if (moods.length === 0) return null;

  const emotionCounts = {};
  const confirmationCounts = { yes: 0, no: 0, maybe: 0 };
  let totalConfidence = 0;
  const confidenceByEmotion = {};

  moods.forEach(mood => {
    // Count emotions
    emotionCounts[mood.detectedEmotion] = (emotionCounts[mood.detectedEmotion] || 0) + 1;

    // Track confirmations
    if (mood.userResponse) {
      confirmationCounts[mood.userResponse] = (confirmationCounts[mood.userResponse] || 0) + 1;
    }

    // Average confidence
    totalConfidence += mood.emotionConfidence;

    // Confidence by emotion
    if (!confidenceByEmotion[mood.detectedEmotion]) {
      confidenceByEmotion[mood.detectedEmotion] = [];
    }
    confidenceByEmotion[mood.detectedEmotion].push(mood.emotionConfidence);
  });

  // Calculate averages
  const avgConfidenceByEmotion = {};
  Object.keys(confidenceByEmotion).forEach(emotion => {
    const values = confidenceByEmotion[emotion];
    avgConfidenceByEmotion[emotion] = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  });

  return {
    totalEntries: moods.length,
    emotionCounts: emotionCounts,
    averageConfidence: Math.round(totalConfidence / moods.length),
    averageConfidenceByEmotion: avgConfidenceByEmotion,
    mostFrequentEmotion: Object.keys(emotionCounts).reduce((a, b) => 
      emotionCounts[a] > emotionCounts[b] ? a : b
    ),
    accuracyRate: Math.round((confirmationCounts.yes / (confirmationCounts.yes + confirmationCounts.no)) * 100 || 0),
    confirmationBreakdown: confirmationCounts
  };
}

/**
 * Generate emotional insights
 */
function generateEmotionInsights(emotionCounts, confidenceByEmotion, totalEntries) {
  const insights = [];

  // Find most frequent emotion
  const mostFrequent = Object.keys(emotionCounts).reduce((a, b) => 
    emotionCounts[a] > emotionCounts[b] ? a : b
  );
  const percentage = Math.round((emotionCounts[mostFrequent] / totalEntries) * 100);
  insights.push(`Your most frequent emotion is ${mostFrequent} (${percentage}% of entries)`);

  // Check for patterns
  if (emotionCounts['happy'] > totalEntries * 0.4) {
    insights.push('✅ Great! You\'ve been feeling quite positive recently.');
  }
  if (emotionCounts['sad'] > totalEntries * 0.3 || emotionCounts['angry'] > totalEntries * 0.3) {
    insights.push('💬 It looks like you might be going through a challenging time. Consider reaching out to our counselors.');
  }
  if (emotionCounts['anxious'] > totalEntries * 0.3) {
    insights.push('🫁 You might benefit from our breathing and relaxation exercises.');
  }

  // Confidence trends
  const avgConfidence = Object.values(confidenceByEmotion).reduce((sum, arr) => {
    return sum + arr.reduce((a, b) => a + b, 0) / arr.length;
  }, 0) / Object.keys(confidenceByEmotion).length;

  if (avgConfidence > 75) {
    insights.push('🎯 Our emotion detection has been very accurate for you.');
  } else if (avgConfidence < 50) {
    insights.push('💡 Try positioning your face more clearly in the camera for better detection.');
  }

  return insights;
}

/**
 * Helper functions
 */
function calculateAverageConfidence(moods) {
  if (moods.length === 0) return 0;
  const sum = moods.reduce((acc, mood) => acc + mood.emotionConfidence, 0);
  return Math.round(sum / moods.length);
}

function getMostFrequentEmotion(emotionCounts) {
  return Object.keys(emotionCounts).reduce((a, b) => 
    emotionCounts[a] > emotionCounts[b] ? a : b, null
  );
}

console.log('✅ Enhanced Mood Controller loaded');
