import { UserProgress, Activity, JournalEntry, MoodEntry } from '../models/index.js';
import { Op } from 'sequelize';

// Fallback empty dashboard data structure
const getEmptyDashboard = () => ({
  success: true,
  data: {
    overview: {
      level: 'beginner',
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalGamesPlayed: 0,
      totalJournalEntries: 0,
      achievements: [],
      levelDetails: {
        name: 'Beginner',
        description: 'Just starting your wellness journey',
        icon: '🌱',
        minPoints: 0,
        maxPoints: 499
      },
      progressToNextLevel: {
        nextLevel: 'intermediate',
        pointsNeeded: 500,
        pointsInLevel: 500,
        percentage: 0
      }
    },
    statistics: {
      gameStats: {},
      totalActivities: 0,
      thisWeekActivities: 0,
      journalEntriesCount: 0,
      averageMoodScore: 0,
      recentActivities: []
    },
    charts: {
      dailyActivity: [],
      moodTrend: [],
      gamePerformance: {}
    },
    recommendations: [
      {
        title: 'Start Your Journey',
        description: 'Begin building your wellness streak by playing a game today',
        action: 'Play a Game',
        link: '/games'
      },
      {
        title: 'Reflect in Your Journal',
        description: 'Writing in your journal helps process emotions and track your growth',
        action: 'Write Journal Entry',
        link: '/journal/new'
      },
      {
        title: 'Explore Different Activities',
        description: 'Try different games and features to discover what works best for you',
        action: 'Explore Activities',
        link: '/games'
      }
    ]
  }
});

// Get detailed progress data for dashboard
export const getProgressDashboard = async (req, res) => {
  try {
    const userId = req.user?.id || req.session.userId;
    
    console.log('📊 Fetching progress for userId:', userId);

    if (!userId) {
      console.error('❌ No userId found, returning empty dashboard');
      return res.json(getEmptyDashboard());
    }

    try {
      // Fetch all data in parallel with error handling
      const [progress, activities, journalEntries, moodEntries] = await Promise.all([
        UserProgress.findOne({ where: { userId } }).catch(err => {
          console.warn('⚠️ Error fetching progress:', err.message);
          return null;
        }),
        Activity.findAll({
          where: { userId },
          order: [['createdAt', 'DESC']],
          limit: 100
        }).catch(err => {
          console.warn('⚠️ Error fetching activities:', err.message);
          return [];
        }),
        JournalEntry.findAll({
          where: { userId },
          order: [['createdAt', 'DESC']]
        }).catch(err => {
          console.warn('⚠️ Error fetching journal entries:', err.message);
          return [];
        }),
        MoodEntry.findAll({
          where: { userId },
          order: [['createdAt', 'DESC']],
          limit: 30
        }).catch(err => {
          console.warn('⚠️ Error fetching mood entries:', err.message);
          return [];
        })
      ]);

      console.log('✅ Data fetched - Progress:', progress ? 'Found' : 'Not found', 'Activities:', activities?.length || 0);

      // Get this week's activities
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const thisWeekActivities = (activities || []).filter(a => new Date(a.createdAt) >= weekAgo);

      // Calculate stats
      const gameActivities = (activities || []).filter(a => a.type === 'game');
      const gameStats = calculateGameStats(gameActivities);
      const dailyActivity = calculateDailyActivity(thisWeekActivities);
      const levelDetails = getLevelDetails(progress?.level || 'beginner');
      const progressToNextLevel = calculateProgressToNextLevel(progress?.totalPoints || 0, progress?.level || 'beginner');
      const recommendations = getRecommendations(progress, activities || []);

      console.log('✅ All calculations done, sending response');

      return res.json({
        success: true,
        data: {
          overview: {
            level: progress?.level || 'beginner',
            totalPoints: progress?.totalPoints || 0,
            currentStreak: progress?.currentStreak || 0,
            longestStreak: progress?.longestStreak || 0,
            totalGamesPlayed: progress?.totalGamesPlayed || 0,
            totalJournalEntries: (journalEntries || []).length,
            achievements: progress?.achievements || [],
            levelDetails,
            progressToNextLevel
          },
          statistics: {
            gameStats,
            totalActivities: (activities || []).length,
            thisWeekActivities: thisWeekActivities.length,
            journalEntriesCount: (journalEntries || []).length,
            averageMoodScore: calculateAverageMoodScore(moodEntries || []),
            recentActivities: (activities || []).slice(0, 10).map(a => ({
              type: a.type,
              subType: a.subType,
              description: a.description,
              createdAt: a.createdAt,
              metadata: a.metadata
            }))
          },
          charts: {
            dailyActivity,
            moodTrend: calculateMoodTrend(moodEntries || []),
            gamePerformance: calculateGamePerformance(gameActivities)
          },
          recommendations
        }
      });
    } catch (dbError) {
      console.warn('⚠️ Database error, returning empty dashboard:', dbError.message);
      return res.json(getEmptyDashboard());
    }
  } catch (error) {
    console.error('❌ Error in getProgressDashboard:', error.message);
    return res.json(getEmptyDashboard());
  }
};

// Get achievements
export const getAchievements = async (req, res) => {
  try {
    const userId = req.user?.id || req.session.userId;
    
    if (!userId) {
      return res.json({ success: true, achievements: [] });
    }

    const [progress, activities, journalEntries, moodEntries] = await Promise.all([
      UserProgress.findOne({ where: { userId } }).catch(() => null),
      Activity.findAll({ where: { userId } }).catch(() => []),
      JournalEntry.findAll({ where: { userId } }).catch(() => []),
      MoodEntry.findAll({ where: { userId } }).catch(() => [])
    ]);

    const achievements = calculateAchievements(progress, activities || [], journalEntries || [], moodEntries || []);

    res.json({
      success: true,
      achievements
    });
  } catch (error) {
    console.error('❌ Error fetching achievements:', error.message);
    res.json({ success: true, achievements: [] });
  }
};

// Helper functions
function calculateGameStats(gameActivities) {
  const stats = {};
  
  gameActivities.forEach(activity => {
    if (!stats[activity.subType]) {
      stats[activity.subType] = {
        name: activity.subType,
        timesPlayed: 0,
        totalScore: 0,
        bestScore: 0,
        averageScore: 0,
        totalPoints: 0
      };
    }
    
    stats[activity.subType].timesPlayed++;
    
    if (activity.metadata?.score) {
      stats[activity.subType].totalScore += activity.metadata.score;
      stats[activity.subType].bestScore = Math.max(stats[activity.subType].bestScore, activity.metadata.score);
    }
    
    if (activity.metadata?.points) {
      stats[activity.subType].totalPoints += activity.metadata.points;
    }
  });

  // Calculate averages
  Object.keys(stats).forEach(key => {
    stats[key].averageScore = stats[key].totalScore / stats[key].timesPlayed;
  });

  return stats;
}

function calculateDailyActivity(activities) {
  const daily = {};
  const today = new Date();

  // Initialize last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    daily[dateStr] = 0;
  }

  // Count activities per day
  activities.forEach(activity => {
    const dateStr = activity.createdAt.toISOString().split('T')[0];
    if (daily[dateStr] !== undefined) {
      daily[dateStr]++;
    }
  });

  return Object.entries(daily)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

function calculateMoodTrend(moodEntries) {
  const emotionToScore = {
    'neutral': 3,
    'happy': 5,
    'sad': 2,
    'angry': 1,
    'fearful': 2,
    'disgusted': 1,
    'surprised': 3,
    'anxious': 2
  };

  return moodEntries.slice(0, 30).map(entry => ({
    date: entry.createdAt.toISOString().split('T')[0],
    mood: entry.detectedEmotion,
    intensity: emotionToScore[entry.detectedEmotion] || 3
  })).reverse();
}

function calculateGamePerformance(gameActivities) {
  const performance = {};

  gameActivities.forEach(activity => {
    if (!performance[activity.subType]) {
      performance[activity.subType] = [];
    }

    if (activity.metadata?.score) {
      performance[activity.subType].push({
        date: activity.createdAt,
        score: activity.metadata.score
      });
    }
  });

  return performance;
}

function calculateAverageMoodScore(moodEntries) {
  if (moodEntries.length === 0) return 0;
  
  const emotionToScore = {
    'neutral': 3,
    'happy': 5,
    'sad': 2,
    'angry': 1,
    'fearful': 2,
    'disgusted': 1,
    'surprised': 3,
    'anxious': 2
  };

  const sum = moodEntries.reduce((acc, entry) => {
    const score = emotionToScore[entry.detectedEmotion] || 3;
    return acc + score;
  }, 0);

  return (sum / moodEntries.length).toFixed(2);
}

function getLevelDetails(level) {
  const levels = {
    beginner: {
      name: 'Beginner',
      description: 'Just starting your wellness journey',
      icon: '🌱',
      minPoints: 0,
      maxPoints: 499
    },
    intermediate: {
      name: 'Intermediate',
      description: 'You\'re making steady progress',
      icon: '🌿',
      minPoints: 500,
      maxPoints: 1999
    },
    pro: {
      name: 'Pro',
      description: 'You\'re a wellness enthusiast',
      icon: '🌳',
      minPoints: 2000,
      maxPoints: 4999
    },
    master: {
      name: 'Master',
      description: 'You\'ve mastered wellness habits',
      icon: '🏆',
      minPoints: 5000,
      maxPoints: Infinity
    }
  };

  return levels[level] || levels.beginner;
}

function getPointsForLevel(currentLevel) {
  const points = {
    beginner: 500,
    intermediate: 2000,
    pro: 5000,
    master: Infinity
  };

  return points[currentLevel] || 500;
}

function calculateProgressToNextLevel(currentPoints, currentLevel) {
  const levels = {
    beginner: { next: 'intermediate', target: 500 },
    intermediate: { next: 'pro', target: 2000 },
    pro: { next: 'master', target: 5000 },
    master: { next: null, target: Infinity }
  };

  const levelInfo = levels[currentLevel] || levels.beginner;
  const currentLevelMin = currentLevel === 'beginner' ? 0 : 
                          currentLevel === 'intermediate' ? 500 : 
                          currentLevel === 'pro' ? 2000 : 5000;

  const pointsNeeded = levelInfo.target - currentPoints;
  const pointsInLevel = levelInfo.target - currentLevelMin;
  const progress = Math.max(0, ((currentPoints - currentLevelMin) / pointsInLevel) * 100);

  return {
    nextLevel: levelInfo.next,
    pointsNeeded: Math.max(0, pointsNeeded),
    pointsInLevel,
    percentage: Math.min(100, Math.max(0, progress))
  };
}

function getRecommendations(progress, activities) {
  const recommendations = [];

  if (!progress || progress.currentStreak === 0) {
    recommendations.push({
      title: 'Start Your Journey',
      description: 'Begin building your wellness streak by playing a game today',
      action: 'Play a Game',
      link: '/games'
    });
  }

  if (!progress || progress.totalJournalEntries < 5) {
    recommendations.push({
      title: 'Reflect in Your Journal',
      description: 'Writing in your journal helps process emotions and track your growth',
      action: 'Write Journal Entry',
      link: '/journal/new'
    });
  }

  if (activities.length < 10) {
    recommendations.push({
      title: 'Explore Different Activities',
      description: 'Try different games and features to discover what works best for you',
      action: 'Explore Activities',
      link: '/games'
    });
  }

  return recommendations;
}

function calculateAchievements(progress, activities, journalEntries, moodEntries) {
  const achievements = [];

  // First game played
  if (activities.some(a => a.type === 'game')) {
    achievements.push({
      id: 'first_game',
      name: 'Game Pioneer',
      description: 'Played your first game',
      icon: '🎮',
      date: activities.filter(a => a.type === 'game')[activities.filter(a => a.type === 'game').length - 1].createdAt,
      unlocked: true
    });
  }

  // First journal entry
  if (journalEntries.length > 0) {
    achievements.push({
      id: 'first_journal',
      name: 'Reflective Mind',
      description: 'Wrote your first journal entry',
      icon: '📝',
      date: journalEntries[journalEntries.length - 1].createdAt,
      unlocked: true
    });
  }

  // Streak achievements
  if (progress?.currentStreak >= 7) {
    achievements.push({
      id: 'streak_7',
      name: 'Consistency Champion',
      description: 'Maintained a 7-day streak',
      icon: '🔥',
      date: new Date(),
      unlocked: true
    });
  }

  if (progress?.longestStreak >= 14) {
    achievements.push({
      id: 'streak_14',
      name: 'Dedication',
      description: 'Achieved a 14-day streak',
      icon: '⚡',
      date: new Date(),
      unlocked: true
    });
  }

  // Points achievements
  if (progress?.totalPoints >= 500) {
    achievements.push({
      id: 'points_500',
      name: 'Point Master',
      description: 'Earned 500 points',
      icon: '⭐',
      date: new Date(),
      unlocked: true
    });
  }

  if (progress?.totalPoints >= 2000) {
    achievements.push({
      id: 'points_2000',
      name: 'Point Legend',
      description: 'Earned 2000 points',
      icon: '👑',
      date: new Date(),
      unlocked: true
    });
  }

  // Games played
  const gameCount = activities.filter(a => a.type === 'game').length;
  if (gameCount >= 5) {
    achievements.push({
      id: 'games_5',
      name: 'Game Enthusiast',
      description: 'Played 5 games',
      icon: '🎯',
      date: new Date(),
      unlocked: true
    });
  }

  if (gameCount >= 20) {
    achievements.push({
      id: 'games_20',
      name: 'Gaming Master',
      description: 'Played 20 games',
      icon: '🚀',
      date: new Date(),
      unlocked: true
    });
  }

  // Mood tracker
  if (moodEntries.length >= 10) {
    achievements.push({
      id: 'mood_10',
      name: 'Self-Aware',
      description: 'Tracked mood 10 times',
      icon: '💭',
      date: new Date(),
      unlocked: true
    });
  }

  return achievements;
}
