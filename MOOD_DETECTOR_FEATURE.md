# Mood Detector Feature Implementation ✅

## Overview
A comprehensive mood detection system integrated into the student dashboard that displays personalized greetings and notifies counselors when a student's mood trend is declining.

## Features Implemented

### 1. **Mood Greeting System** 👋
Students see a welcoming greeting card when accessing the mood tracker or dashboard:
- **Message:** "Hello [Student Name], how's your day? Would you like me to detect your mood today?"
- **Location:** 
  - On the Mood Tracker page (/user/mood-tracker)
  - On the Student Dashboard (/user/dashboard)
- **Emoji:** Dynamic greeting emoji that changes based on context

### 2. **Mood Trend Analysis** 📊
The system automatically analyzes mood patterns over the last 7-14 days:
- Calculates average mood score (0-100 scale)
- Detects declining, stable, or improving trends
- Compares recent moods with historical data
- Tracks percentage of negative emotions

**Emotion Scores (0-100):**
- 😊 Happy: 90
- 😲 Surprised: 75
- 😐 Neutral: 50
- 😰 Fearful: 30
- 😟 Anxious: 25
- 🤢 Disgusted: 20
- 😠 Angry: 15
- 😢 Sad: 10

### 3. **Critical Mood Alert Detection** ⚠️
System triggers a critical alert when:
- Mood trend is declining AND
- More than 50% of recent entries show negative emotions (sad, angry, anxious, fearful, disgusted)

### 4. **Counselor Notifications** 📢
When a student's mood is critically declining:
- A notification is automatically created in the database
- **Notification Type:** `mood_alert`
- **Content:** Student name, current mood trend, average score, recent emotions
- **Recipient:** The assigned counselor (via conversation relationship)
- **Status:** Marked as unread for immediate attention

### 5. **Activity Suggestions** 🎮
Based on detected mood, the system suggests relevant activities:
- **Happy:** Gratitude Journal, Share your Joy
- **Sad:** Breathing Exercises, Reading Materials, Talk to Counselor
- **Angry:** Stress Ball Game, Zen Garden, Breathing Exercises
- **Anxious:** Breathing Exercises, Puzzle Therapy, Affirmation Cards
- **Fearful:** Breathing Exercises, Positive Affirmations, Connect with Counselor
- **Neutral:** Explore Reading Materials, Try a Game, Wellness Check-in

## Files Created/Modified

### New Files:
1. **`utils/moodAnalysis.js`**
   - Mood trend calculation
   - Critical alert detection
   - Greeting messages
   - Interpretation messages
   - Activity suggestions

### Modified Files:
1. **`controllers/moodController.js`**
   - Enhanced with new functions:
     - `checkMoodTrendAndNotify()` - Analyzes mood and notifies counselor
     - `getMoodGreeting()` - Gets personalized greeting
     - `getMoodDashboardData()` - Gets mood + trend + stats for dashboard
   - Added counselor notification system
   - Integrated mood analysis utility

2. **`models/NotificationModel.js`**
   - Updated ENUM to include `'mood_alert'` type
   - Made foreign key fields nullable for mood_alert type
   - conversationId, messageId, senderId now allow null

3. **`routes/index.js`**
   - Added new API endpoints:
     - `GET /api/user/mood/greeting` - Get greeting message
     - `GET /api/user/mood/trend` - Check mood trend and notify if declining
     - `GET /api/user/mood/dashboard` - Get complete mood dashboard data

4. **`views/user/mood-tracker.xian`**
   - Added greeting card section with:
     - Personalized welcome message
     - Mood status indicator
     - Quick action buttons (Scan Mood, Skip)
   - Added JavaScript to load greeting on page load
   - Displays mood alerts and trend warnings

5. **`views/user/userdashboard.xian`**
   - Added mood greeting card at the top of dashboard
   - Shows personalized greeting
   - Displays mood trend alerts (declining/improving)
   - Quick action buttons to check mood or journal
   - Loads dynamically via JavaScript

## API Endpoints

### 1. Get Mood Greeting
```
GET /api/user/mood/greeting
Response:
{
  success: true,
  greeting: "Hello Student, how's your day...",
  interpretation: "Emoji + mood interpretation",
  hasRecentMood: boolean,
  recentMood: "emotion_string"
}
```

### 2. Check Mood Trend
```
GET /api/user/mood/trend
Response:
{
  success: true,
  trend: {
    averageScore: number,
    isDeclining: boolean,
    trend: "declining|stable|improving",
    recentEmotions: array,
    scores: array
  },
  alert: {
    isCritical: boolean,
    reason: string,
    negativePercentage: number
  },
  notificationSent: boolean
}
```

### 3. Get Mood Dashboard Data
```
GET /api/user/mood/dashboard
Response:
{
  success: true,
  greeting: string,
  moodData: {
    trend: { ... },
    recentMoods: [ ... ],
    stats: { ... }
  }
}
```

## Database Considerations

### Notification Model Changes:
- `conversationId`: Changed from required to optional (nullable)
- `messageId`: Changed from required to optional (nullable)
- `senderId`: Changed from required to optional (nullable)
- `notificationType`: Now includes 'mood_alert' enum value

### Run Migration:
```bash
npm run migrate
# Or manually update the database to make fields nullable
ALTER TABLE notifications MODIFY conversationId INT NULL;
ALTER TABLE notifications MODIFY messageId INT NULL;
ALTER TABLE notifications MODIFY senderId INT NULL;
ALTER TABLE notifications MODIFY notificationType ENUM('new_message', 'conversation_started', 'mood_alert');
```

## User Experience Flow

### 1. Student Opens Mood Tracker:
```
1. Loads page
2. API fetches mood greeting
3. Displays: "Hello [Name], how's your day?"
4. Shows recent mood status if available
5. Student can click "Scan My Mood" to start detection
```

### 2. Student Views Dashboard:
```
1. Loads dashboard
2. API fetches mood greeting + trend data
3. Displays greeting card with mood status
4. If mood is declining: Shows ⚠️ alert with message
5. If mood is improving: Shows ✨ positive message
6. Quick actions available (Check Mood, Journal)
```

### 3. Mood Detection & Counselor Alert:
```
1. Student saves mood entry
2. System checks trend every 7-14 days
3. If critical decline detected:
   - Creates notification in database
   - Counselor sees alert in notifications
   - Contains student name + mood info
   - Counselor can click to reach out to student
```

## Testing Instructions

### Test 1: Greeting Display
1. Navigate to `/user/mood-tracker`
2. Verify greeting card appears with student name
3. Navigate to `/user/dashboard`
4. Verify mood greeting card appears with personalized message

### Test 2: Mood Trend Analysis
1. Save multiple mood entries with negative emotions
2. Access `/api/user/mood/trend` endpoint
3. Verify trend analysis calculates correctly
4. Check if declining trend is detected

### Test 3: Counselor Notification
1. As student: Save 7+ mood entries with >50% negative emotions
2. Access `/api/user/mood/trend` endpoint
3. Check notifications table for mood_alert entry
4. Verify counselor ID and message content

### Test 4: Dashboard Alerts
1. As student: Load dashboard after mood trend decline
2. Verify ⚠️ alert appears in greeting card
3. Verify alert message shows trend info
4. Test alert close functionality

## Customization Options

### Change Mood Scores:
Edit `utils/moodAnalysis.js` - `emotionScores` object

### Change Alert Threshold:
Edit `utils/moodAnalysis.js` - `detectCriticalMoodDeclining()` function
- Current: 50% negative emotions in 7 recent entries

### Change Greeting Message:
Edit `utils/moodAnalysis.js` - `getGreetingMessage()` function

### Change Activity Suggestions:
Edit `utils/moodAnalysis.js` - `suggestActivities()` function

## Performance Notes

- Mood analysis runs on-demand via API calls
- No background jobs needed initially
- Can be optimized with cron jobs if needed
- Notification creation is lightweight (no email sending yet)

## Future Enhancements

1. **Email Notifications:** Send counselor an email when mood alert detected
2. **SMS Alerts:** Text message to counselor for critical cases
3. **Weekly Mood Reports:** Summarize student mood trends
4. **Predictive Alerts:** ML model to predict mood decline before it happens
5. **Peer Support:** Connect students with similar mood patterns
6. **Parent Notifications:** Optional notification to parents/guardians
7. **Mood History Chart:** Visualization of mood trends over time

## Security Considerations

- ✅ All endpoints require authentication (`isAuthenticated` middleware)
- ✅ Student can only see their own mood data
- ✅ Counselor notifications only sent to assigned counselor
- ✅ Notification type validation in controller
- ✅ Emotion validation against allowed list

## Support

For issues or questions about this feature:
1. Check `moodAnalysis.js` for calculation logic
2. Review `moodController.js` for API logic
3. Test endpoints via Postman or browser console
4. Check browser console for any JavaScript errors
