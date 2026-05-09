/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines

    Mood Tracker Controller - Handles face recognition emotion detection
*/

import { MoodEntry } from '../models/MoodEntryModel.js';
import { User } from '../models/userModel.js';

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

    // Create mood entry
    const moodEntry = await MoodEntry.create({
      userId: userId,
      detectedEmotion: detectedEmotion,
      emotionConfidence: Math.min(Math.max(emotionConfidence, 0), 100), // Clamp between 0-100
      userResponse: userResponse,
      userConfirmed: userConfirmed || false,
      userNote: userNote || null,
      activitiesSuggested: suggestActivities(detectedEmotion)
    });

    console.log(`✅ Mood entry saved: ${detectedEmotion} (${emotionConfidence}%) - User: ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Mood entry saved successfully',
      moodId: moodEntry.id,
      data: moodEntry
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

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated', message: 'User not authenticated' });
    }

    // Get moods from last 30 days, sorted by newest first
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const moods = await MoodEntry.findAll({
      where: {
        userId: userId,
        createdAt: { $gte: thirtyDaysAgo }
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    // Calculate mood statistics
    const stats = calculateMoodStats(moods);

    res.status(200).json({
      success: true,
      moods: moods,
      statistics: stats
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
        createdAt: { $gte: sevenDaysAgo }
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
 * Helper: Suggest activities based on emotion
 */
function suggestActivities(emotion) {
  const activityMap = {
    'neutral': [
      'Take a moment for reflection',
      'Practice mindfulness meditation',
      'Journal your thoughts'
    ],
    'happy': [
      'Share your joy with others',
      'Engage in your favorite hobby',
      'Celebrate your achievements',
      'Try gratitude journaling'
    ],
    'sad': [
      'Listen to uplifting music',
      'Journal about your feelings',
      'Reach out to a friend or counselor',
      'Try the breathing bubble game'
    ],
    'angry': [
      'Practice deep breathing exercises',
      'Take a walk or exercise',
      'Write down your frustrations',
      'Try progressive muscle relaxation'
    ],
    'fearful': [
      'Practice grounding techniques',
      'Try the breathing bubble game',
      'Talk to a counselor',
      'Read anxiety management materials'
    ],
    'disgusted': [
      'Take a break from the situation',
      'Practice self-care',
      'Do something pleasant',
      'Try a relaxing activity'
    ],
    'surprised': [
      'Take a moment to process',
      'Write about the experience',
      'Share with a friend',
      'Reflect on the event'
    ],
    'anxious': [
      'Practice the breathing bubble',
      'Try progressive muscle relaxation',
      'Read anxiety management materials',
      'Talk to a counselor'
    ]
  };

  return activityMap[emotion] || ['Take care of yourself', 'Practice self-compassion'];
}

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

export default {
  moodTrackerPage,
  saveMood,
  getMoodHistory,
  getMoodStats,
  updateMood
};
