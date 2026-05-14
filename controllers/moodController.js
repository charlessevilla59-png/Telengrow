/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines

    Mood Tracker Controller v4.0 - Enhanced mood tracking with counselor integration
    Features:
    - Face recognition emotion detection
    - Manual emotion selection
    - Mood trend analysis
    - Counselor notifications
    - Comprehensive mood statistics
    - Student mood history
*/

import { MoodEntry } from '../models/MoodEntryModel.js';
import { User } from '../models/userModel.js';
import { Conversation } from '../models/ConversationModel.js';
import { Notification } from '../models/NotificationModel.js';
import { Message } from '../models/MessageModel.js';
import { JournalEntry } from '../models/Journalentrymodel.js';
import { 
  calculateMoodTrend, 
  detectCriticalMoodDeclining,
  getGreetingMessage,
  getMoodInterpretation,
  suggestActivities
} from '../utils/moodAnalysis.js';
import { Op } from 'sequelize';

/**
 * Render mood tracker page
 */
export const moodTrackerPage = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId);
    
    if (!user) {
      return res.redirect('/login');
    }

    res.render('user/mood-tracker', {
      title: 'Mood Tracker',
      user: user.dataValues,
      layout: false
    });
  } catch (error) {
    console.error('❌ Error loading mood tracker:', error);
    res.status(500).render('500', { message: 'Error loading mood tracker' });
  }
};

/**
 * Save detected emotion to database
 */
export const saveMood = async (req, res) => {
  try {
    const { detectedEmotion, emotionConfidence, userResponse, userConfirmed, userNote } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated', message: 'User not authenticated' });
    }

    // Validate emotion
    const validEmotions = ['neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'anxious'];
    if (!validEmotions.includes(detectedEmotion)) {
      return res.status(400).json({ error: 'Invalid emotion', message: 'Invalid emotion value' });
    }

    // Validate response
    if (![null, 'yes', 'no'].includes(userResponse)) {
      return res.status(400).json({ error: 'Invalid response', message: 'Response must be yes or no' });
    }

    // Get suggestions based on emotion
    const suggestions = suggestActivities(detectedEmotion);
    console.log(`📋 Generated suggestions for ${detectedEmotion}:`, suggestions);

    // Create mood entry
    const moodEntry = await MoodEntry.create({
      userId: userId,
      detectedEmotion: detectedEmotion,
      emotionConfidence: Math.min(Math.max(emotionConfidence, 0), 100), // Clamp between 0-100
      userResponse: userResponse,
      userConfirmed: userConfirmed || false,
      userNote: userNote || null,
      activitiesSuggested: suggestions
    });

    console.log(`✅ Mood entry saved: ${detectedEmotion} (${emotionConfidence}%) - User: ${userId}`);

    // Convert to plain object to ensure proper JSON serialization
    const plainMoodEntry = moodEntry.get({ plain: true });

    res.status(201).json({
      success: true,
      message: 'Mood entry saved successfully',
      moodId: moodEntry.id,
      data: {
        ...plainMoodEntry,
        activitiesSuggested: suggestions
      }
    });

  } catch (error) {
    console.error('❌ Error saving mood:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
};

/**
 * Get mood history
 */
export const getMoodHistory = async (req, res) => {
  try {
    const userId = req.session.userId;
    console.log('📋 getMoodHistory called for userId:', userId);

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated', message: 'User not authenticated' });
    }

    // Get moods from last 30 days, sorted by newest first
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    console.log('🔍 Date range: from', thirtyDaysAgo.toISOString(), 'to now');

    console.log('🔍 Executing Sequelize query with [Op.gte]...');
    const moods = await MoodEntry.findAll({
      where: {
        userId: userId,
        createdAt: { [Op.gte]: thirtyDaysAgo }
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    console.log(`✅ Sequelize query returned ${moods.length} moods for user ${userId}`);
    
    if (moods.length > 0) {
      console.log('📥 First mood raw data:', moods[0].dataValues || moods[0]);
      console.log('📥 First mood JSON:', JSON.stringify(moods[0], null, 2));
    }

    // Convert to plain objects
    const plainMoods = moods.map(mood => mood.get({ plain: true }));
    console.log(`✅ Converted to plain objects: ${plainMoods.length} moods`);

    // Calculate mood statistics
    const stats = calculateMoodStats(moods);

    const response = {
      success: true,
      moods: plainMoods,
      statistics: stats
    };
    console.log('📤 Sending response with', plainMoods.length, 'moods');
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error fetching mood history:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
};

/**
 * Get mood statistics
 */
export const getMoodStats = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated', message: 'User not authenticated' });
    }

    // Get moods from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const moods = await MoodEntry.findAll({
      where: {
        userId: userId,
        createdAt: { [Op.gte]: sevenDaysAgo }
      }
    });

    const stats = calculateMoodStats(moods);

    res.status(200).json({
      success: true,
      statistics: stats,
      periodDays: 7
    });

  } catch (error) {
    console.error('❌ Error fetching mood stats:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
};

/**
 * Update mood entry
 */
export const updateMood = async (req, res) => {
  try {
    const { moodId } = req.params;
    const { userResponse, userNote } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Find and verify ownership
    const mood = await MoodEntry.findByPk(moodId);

    if (!mood) {
      return res.status(404).json({ error: 'Mood entry not found' });
    }

    if (mood.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this mood' });
    }

    // Update
    if (userResponse !== undefined) mood.userResponse = userResponse;
    if (userNote !== undefined) mood.userNote = userNote;
    mood.userConfirmed = true;

    await mood.save();

    console.log(`✅ Mood entry updated: ${moodId}`);

    res.status(200).json({
      success: true,
      message: 'Mood entry updated successfully',
      data: mood
    });

  } catch (error) {
    console.error('❌ Error updating mood:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

/**
 * Helper: Calculate mood statistics
 */
function calculateMoodStats(moods) {
  if (moods.length === 0) {
    return {
      totalEntries: 0,
      averageConfidence: 0,
      dominantMood: null,
      confirmationRate: 0,
      moodBreakdown: {}
    };
  }

  // Count emotions
  const moodCounts = {};
  let totalConfidence = 0;
  let confirmedCount = 0;

  moods.forEach(mood => {
    moodCounts[mood.detectedEmotion] = (moodCounts[mood.detectedEmotion] || 0) + 1;
    totalConfidence += mood.emotionConfidence;
    if (mood.userConfirmed) confirmedCount++;
  });

  // Find dominant mood
  let dominantMood = null;
  let maxCount = 0;
  for (const [emotion, count] of Object.entries(moodCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantMood = emotion;
    }
  }

  return {
    totalEntries: moods.length,
    averageConfidence: (totalConfidence / moods.length).toFixed(1),
    dominantMood: dominantMood,
    confirmationRate: ((confirmedCount / moods.length) * 100).toFixed(1),
    moodBreakdown: moodCounts
  };
}

/**
 * Get mood suggestions based on emotion
 */
export const getMoodSuggestions = async (req, res) => {
  try {
    const { emotion } = req.body;

    if (!emotion) {
      return res.status(400).json({ 
        error: 'Missing emotion', 
        message: 'Emotion parameter is required' 
      });
    }

    // Get suggestions using utility function
    const suggestions = suggestActivities(emotion);

    res.status(200).json({
      success: true,
      emotion: emotion,
      activities: suggestions,
      message: `Here are activities suggested for ${emotion} mood`
    });

  } catch (error) {
    console.error('❌ Error getting mood suggestions:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
};

/**
 * Check mood trend and notify counselor if declining
 */
export const checkMoodTrendAndNotify = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get moods from last 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const recentMoods = await MoodEntry.findAll({
      where: {
        userId: userId,
        createdAt: { [Op.gte]: fourteenDaysAgo }
      },
      order: [['createdAt', 'DESC']]
    });

    // Analyze trend
    const trendAnalysis = calculateMoodTrend(recentMoods);
    const criticalAlert = detectCriticalMoodDeclining(recentMoods);

    // If mood is critically declining, notify counselor
    if (criticalAlert.isCritical) {
      await notifyCounselorOfMoodDecline(userId, trendAnalysis, criticalAlert);
    }

    res.status(200).json({
      success: true,
      trend: trendAnalysis,
      alert: criticalAlert,
      notificationSent: criticalAlert.isCritical
    });

  } catch (error) {
    console.error('❌ Error checking mood trend:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

/**
 * Get mood greeting for student
 */
export const getMoodGreeting = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get latest mood entry if any
    const latestMood = await MoodEntry.findOne({
      where: { userId: userId },
      order: [['createdAt', 'DESC']]
    });

    const greeting = getGreetingMessage(user, latestMood?.detectedEmotion);
    const interpretation = latestMood ? getMoodInterpretation(latestMood.detectedEmotion) : null;

    res.status(200).json({
      success: true,
      greeting,
      interpretation,
      hasRecentMood: !!latestMood,
      recentMood: latestMood ? latestMood.detectedEmotion : null
    });

  } catch (error) {
    console.error('❌ Error getting mood greeting:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

/**
 * Get mood dashboard data (for student dashboard integration)
 */
export const getMoodDashboardData = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Import JournalEntry model
    const { JournalEntry } = await import('../models/index.js');

    // Get the LAST mood entry from DASHBOARD (MoodEntry model)
    const lastMoodEntry = await MoodEntry.findOne({
      where: {
        userId: userId,
        detectedEmotion: { [Op.ne]: null }
      },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'detectedEmotion', 'emotionConfidence', 'createdAt']
    });

    // Get the LAST journal entry with detected emotion (fallback)
    const lastJournalEntry = await JournalEntry.findOne({
      where: {
        userId: userId,
        detectedEmotion: { [Op.ne]: null }
      },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'title', 'detectedEmotion', 'emotionConfidence', 'emotionScores', 'sentimentAnalysis', 'createdAt']
    });

    const greeting = getGreetingMessage(user);

    // Use the MOST RECENT emotion (prefer MoodEntry from dashboard)
    let lastEmotion = null;
    let lastEntryDate = null;
    let emotionConfidence = 0;

    if (lastMoodEntry && lastJournalEntry) {
      // Both exist - use the most recent
      if (new Date(lastMoodEntry.createdAt) > new Date(lastJournalEntry.createdAt)) {
        lastEmotion = lastMoodEntry.detectedEmotion;
        lastEntryDate = lastMoodEntry.createdAt;
        emotionConfidence = lastMoodEntry.emotionConfidence || 0;
      } else {
        lastEmotion = lastJournalEntry.detectedEmotion;
        lastEntryDate = lastJournalEntry.createdAt;
        emotionConfidence = lastJournalEntry.emotionConfidence || 0;
      }
    } else if (lastMoodEntry) {
      // Only mood entry exists
      lastEmotion = lastMoodEntry.detectedEmotion;
      lastEntryDate = lastMoodEntry.createdAt;
      emotionConfidence = lastMoodEntry.emotionConfidence || 0;
    } else if (lastJournalEntry) {
      // Only journal entry exists
      lastEmotion = lastJournalEntry.detectedEmotion;
      lastEntryDate = lastJournalEntry.createdAt;
      emotionConfidence = lastJournalEntry.emotionConfidence || 0;
    }

    // Prepare emotion data
    let trendAnalysis = {
      lastEmotion: lastEmotion,
      emotionConfidence: emotionConfidence,
      isPositive: false,
      isBad: false,
      lastEntryDate: lastEntryDate
    };

    // Determine if emotion is positive or negative
    if (lastEmotion) {
      const positiveEmotions = ['happy', 'calm', 'surprised', 'neutral'];
      const badEmotions = ['sad', 'angry', 'anxious', 'fearful', 'disgusted'];
      
      if (positiveEmotions.includes(lastEmotion)) {
        trendAnalysis.isPositive = true;
      } else if (badEmotions.includes(lastEmotion)) {
        trendAnalysis.isBad = true;
      }
    }

    console.log(`📊 Dashboard mood data for user ${userId}:`, trendAnalysis);

    res.status(200).json({
      success: true,
      greeting,
      moodData: {
        trend: trendAnalysis,
        lastEntry: lastMoodEntry || lastJournalEntry
      }
    });

  } catch (error) {
    console.error('❌ Error getting mood dashboard data:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

/**
 * Helper: Notify counselor of mood decline
 */
async function notifyCounselorOfMoodDecline(userId, trendAnalysis, criticalAlert) {
  try {
    const user = await User.findByPk(userId);
    if (!user) return;

    // Find counselor assigned to this student
    // Check if there's a conversation with a counselor
    const counselorConversation = await Conversation.findOne({
      where: { userId: userId }
    });

    if (!counselorConversation) {
      console.log(`⚠️  No assigned counselor for student ${userId}`);
      return;
    }

    const counselorId = counselorConversation.counselorId;
    const counselor = await User.findByPk(counselorId);

    if (!counselor) return;

    // Create alert message
    const message = `⚠️ MOOD ALERT: Student ${user.name} (${user.email}) is showing ${criticalAlert.reason}. 
Average mood score: ${trendAnalysis.averageScore}/100. 
Recent emotions: ${trendAnalysis.recentEmotions?.join(', ')}.
Please check in with the student.`;

    // Create notification (stored in database)
    await Notification.create({
      userId: counselorId,
      conversationId: counselorConversation.id,
      messageId: 0, // Placeholder, as this is a system alert
      senderId: userId,
      senderName: user.name,
      messagePreview: `Mood Alert: ${criticalAlert.reason}`,
      notificationType: 'mood_alert',
      isRead: false
    }).catch(err => {
      console.log('Note: Notification model might need migration for mood_alert type');
    });

    console.log(`📢 Counselor ${counselor.name} notified about student ${user.name}'s mood decline`);

  } catch (error) {
    console.error('❌ Error notifying counselor:', error);
  }
}

/**
 * Get a specific student's mood data for counselor view
 * Used in student activity detail and counselor dashboard
 */
export const getStudentMoodByCounselor = async (req, res) => {
  try {
    const { studentId } = req.params;
    const counselorId = req.session.userId;

    if (!counselorId || req.user.role !== 'counselor') {
      return res.status(403).json({ error: 'Only counselors can access this data' });
    }

    // Verify student exists
    const student = await User.findByPk(studentId);
    if (!student || student.role !== 'user') {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get moods from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const moods = await MoodEntry.findAll({
      where: {
        userId: studentId,
        createdAt: { [Op.gte]: thirtyDaysAgo }
      },
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    // Convert to plain objects
    const plainMoods = moods.map(mood => mood.get({ plain: true }));

    // Calculate comprehensive statistics
    const stats = calculateMoodStats(moods);
    const trend = calculateMoodTrend(moods);

    // Get last 7 moods for display
    const recentMoods = plainMoods.slice(0, 7);

    // Calculate mood streak (consecutive days with mood entries)
    const streak = calculateMoodStreak(moods);

    const response = {
      success: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        course: student.course,
        year: student.year,
        section: student.section
      },
      moods: plainMoods,
      recentMoods: recentMoods,
      statistics: stats,
      trend: trend,
      streak: streak,
      lastUpdated: moods.length > 0 ? moods[0].createdAt : null,
      totalEntries: plainMoods.length
    };

    console.log(`✅ Counselor ${counselorId} accessed mood data for student ${studentId}`);
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error fetching student mood by counselor:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
};

/**
 * Helper: Calculate mood streak (consecutive days with entries)
 */
function calculateMoodStreak(moods) {
  if (moods.length === 0) return 0;

  let streak = 1;
  const sortedMoods = moods.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  for (let i = 1; i < sortedMoods.length; i++) {
    const currentDate = new Date(sortedMoods[i].createdAt);
    const previousDate = new Date(sortedMoods[i - 1].createdAt);

    // Check if dates are consecutive
    const diffDays = Math.floor((previousDate - currentDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else if (diffDays > 1) {
      break;
    }
  }

  return streak;
}

/**
 * Get mood insights - AI-powered mood analysis across time
 */
export const getMoodInsights = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get moods from last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const moods = await MoodEntry.findAll({
      where: {
        userId: userId,
        createdAt: { [Op.gte]: ninetyDaysAgo }
      },
      order: [['createdAt', 'DESC']]
    });

    if (moods.length === 0) {
      return res.status(200).json({
        success: true,
        insights: {
          message: 'No mood data available yet. Start tracking your mood!',
          recommendation: 'Begin using the mood tracker to get personalized insights.'
        }
      });
    }

    // Analyze mood patterns
    const insights = analyzeMoodPatterns(moods);

    res.status(200).json({
      success: true,
      insights: insights,
      dataPoints: moods.length
    });

  } catch (error) {
    console.error('❌ Error getting mood insights:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

/**
 * Helper: Analyze mood patterns and generate insights
 */
function analyzeMoodPatterns(moods) {
  if (moods.length === 0) {
    return {
      pattern: 'no_data',
      message: 'Not enough data yet',
      recommendation: 'Keep tracking your mood daily'
    };
  }

  // Count emotions
  const emotionCounts = {};
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  moods.forEach(mood => {
    emotionCounts[mood.detectedEmotion] = (emotionCounts[mood.detectedEmotion] || 0) + 1;

    if (['happy', 'calm', 'surprised'].includes(mood.detectedEmotion)) {
      positiveCount++;
    } else if (['sad', 'angry', 'fearful', 'disgusted', 'anxious'].includes(mood.detectedEmotion)) {
      negativeCount++;
    } else {
      neutralCount++;
    }
  });

  const total = moods.length;
  const positivePercentage = ((positiveCount / total) * 100).toFixed(1);
  const negativePercentage = ((negativeCount / total) * 100).toFixed(1);

  // Determine overall pattern
  let pattern = 'balanced';
  let message = '';
  let recommendation = '';
  let emoji = '😊';

  if (positivePercentage > 60) {
    pattern = 'positive';
    message = `You're having a great time! ${positivePercentage}% of your moods are positive.`;
    recommendation = 'Keep maintaining this positive energy. What activities help most?';
    emoji = '😊';
  } else if (negativePercentage > 50) {
    pattern = 'negative';
    message = `It looks like you've been going through challenges. ${negativePercentage}% of moods are negative.`;
    recommendation = 'Consider reaching out to a counselor or trying our stress-relief activities.';
    emoji = '😔';
  } else if (positivePercentage > 40) {
    pattern = 'improving';
    message = 'Your mood is showing improvement! Keep it up!';
    recommendation = 'You\'re doing well. Continue the activities that make you feel better.';
    emoji = '📈';
  } else {
    pattern = 'balanced';
    message = 'Your mood is fairly balanced. Some good days, some challenging ones.';
    recommendation = 'Track your mood consistently to identify what affects your well-being.';
    emoji = '⚖️';
  }

  return {
    pattern,
    message,
    recommendation,
    emoji,
    statistics: {
      positive: `${positivePercentage}%`,
      negative: `${negativePercentage}%`,
      neutral: `${((neutralCount / total) * 100).toFixed(1)}%`,
      totalTracked: total,
      dominantEmotion: Object.keys(emotionCounts).reduce((a, b) => 
        emotionCounts[a] > emotionCounts[b] ? a : b
      )
    }
  };
}

/**
 * Link mood entry to journal entry (AI enhancement)
 * Save mood when creating journal entry
 */
export const linkMoodToJournal = async (req, res) => {
  try {
    const { journalId, emotion, confidence } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify journal entry exists and belongs to user
    const journalEntry = await JournalEntry.findByPk(journalId);
    
    if (!journalEntry || journalEntry.userId !== userId) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    // Validate emotion
    const validEmotions = ['neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'anxious'];
    if (!validEmotions.includes(emotion)) {
      return res.status(400).json({ error: 'Invalid emotion' });
    }

    // Create mood entry linked to journal
    const moodEntry = await MoodEntry.create({
      userId: userId,
      detectedEmotion: emotion,
      emotionConfidence: confidence || 0,
      userConfirmed: true,
      userNote: `Linked from journal entry: ${journalEntry.title || 'Untitled'}`,
      linkedJournalId: journalId
    });

    console.log(`✅ Mood linked to journal: ${journalId} - ${emotion}`);

    res.status(201).json({
      success: true,
      message: 'Mood linked to journal entry',
      moodId: moodEntry.id
    });

  } catch (error) {
    console.error('❌ Error linking mood to journal:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

/**
 * Get mood trends for counselor view - enhanced analysis
 */
export const getMoodTrendsForCounselor = async (req, res) => {
  try {
    const { studentId, days = 30 } = req.query;
    const counselorId = req.session.userId;

    if (!counselorId || req.user.role !== 'counselor') {
      return res.status(403).json({ error: 'Only counselors can access this' });
    }

    const student = await User.findByPk(studentId);
    if (!student || student.role !== 'user') {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get moods for specified period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const moods = await MoodEntry.findAll({
      where: {
        userId: studentId,
        createdAt: { [Op.gte]: startDate }
      },
      order: [['createdAt', 'DESC']]
    });

    // Generate trend chart data (by day)
    const dailyData = {};
    moods.forEach(mood => {
      const date = new Date(mood.createdAt).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      dailyData[date].push({
        emotion: mood.detectedEmotion,
        confidence: mood.emotionConfidence
      });
    });

    // Calculate daily averages
    const trendData = Object.entries(dailyData)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, entries]) => {
        const emotionCounts = {};
        entries.forEach(entry => {
          emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
        });

        const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
          emotionCounts[a] > emotionCounts[b] ? a : b
        );

        return {
          date,
          dominantEmotion,
          entries: entries.length,
          breakdown: emotionCounts
        };
      });

    res.status(200).json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email
      },
      period: `${days} days`,
      totalEntries: moods.length,
      trendData: trendData,
      summary: {
        averageEntriesPerDay: (moods.length / days).toFixed(2),
        daysWithEntries: Object.keys(dailyData).length,
        consistencyRate: `${((Object.keys(dailyData).length / days) * 100).toFixed(1)}%`
      }
    });

  } catch (error) {
    console.error('❌ Error getting mood trends for counselor:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

export default {
  moodTrackerPage,
  saveMood,
  getMoodHistory,
  getMoodStats,
  updateMood,
  checkMoodTrendAndNotify,
  getMoodGreeting,
  getMoodDashboardData,
  getStudentMoodByCounselor,
  getMoodInsights,
  linkMoodToJournal,
  getMoodTrendsForCounselor
};
