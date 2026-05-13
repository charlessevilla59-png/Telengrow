# 📖 Journal AI Emotion Detection & Tagalog Enhancement - Complete Feature Guide

## 🎯 Feature Overview

The Telngrow journal feature now includes:
1. **AI Emotion Analysis** - Detects 6 emotions (happy, sad, anxious, angry, calm, neutral) in real-time
2. **Bilingual Support** - Detects English and Tagalog automatically
3. **Tagalog Text Enhancement** - Provides grammar suggestions, writing tips, and reflection prompts for Tagalog entries
4. **Real-time Feedback** - Live analysis updates as users type

---

## ✨ Features

### 1. AI Emotion Detection
- **6 Emotions Detected**: Happy, Sad, Anxious, Angry, Calm, Neutral
- **Keyword-Based Analysis**: Uses 120+ English and 100+ Tagalog emotion keywords
- **Confidence Scoring**: 0-100% confidence level for detected emotion
- **Sentiment Analysis**: -100 (very negative) to +100 (very positive)
- **Emotion Distribution**: Shows breakdown of all 6 emotions as percentages

### 2. Real-Time Analysis
- **Live Updates**: Emotion analysis updates every 300ms as user types
- **Debouncing**: Prevents excessive server calls while maintaining responsiveness
- **Instant Feedback**: Visual indicators with emoji, confidence badges, and score bars
- **No Database Storage Required**: Analysis shown live but can be stored on save

### 3. Bilingual Language Support
- **Automatic Detection**: Identifies English vs Tagalog vs mixed language entries
- **Detection Method**: Keyword frequency analysis on first 50-100 words
- **Bilingual Analysis**: Generates explanations in detected language
- **Language-Specific Keywords**: 120+ English + 100+ Tagalog emotion keywords

### 4. Tagalog Text Enhancement (NEW)
When Tagalog text is detected, users see:

#### 💡 Suggestions
- Fix common typos (masya → masaya, malungkod → malungkot)
- Convert informal to formal language (kase → kasi, d → hindi)
- Correct slang spelling variations

#### ✨ Improvements
- Alert for run-on sentences (> 30 words)
- Suggest adding more detail if entry too short
- Note excessive filler words (eh, ano, hmm)
- Recommend breaking long entries into sections
- Suggest better emotion expression techniques

#### 🎓 Writing Tips
- Encourage descriptive language (colors, sizes, sensations)
- Suggest using action words for vivid storytelling
- Praise reflective thinking when detected
- Provide structural guidance for paragraph organization

#### 📝 Reflection Prompts
Emotion-specific prompts in Tagalog:
- **Happy**: "Alin ang nagpasaya sa inyong araw?"
- **Sad**: "Ano ang nakaursang lungkot sa inyong puso?"
- **Anxious**: "Ano ang nagdudulot sa inyo ng alala?"
- **Angry**: "Ano ang nakakasakit sa inyong damdaman?"
- **Calm**: "Alin ang nagbibigay sa inyo ng kapayapaan?"

---

## 🏗️ Architecture

### Database Schema
**JournalEntry Model** - Added 5 AI Analysis Fields:
```javascript
detectedEmotion:     ENUM('happy', 'sad', 'anxious', 'angry', 'calm', 'neutral')
emotionConfidence:   INTEGER (0-100)
sentimentScore:      INTEGER (-100 to 100)
emotionScores:       JSON { happy, sad, anxious, angry, calm, neutral }
sentimentAnalysis:   TEXT (AI-generated description)
```

### API Endpoints

#### 1. POST /api/journal/analyze-emotion
Real-time emotion analysis (used while typing)
```javascript
Request:  { content: string }
Response: {
  primaryEmotion:  'happy' | 'sad' | 'anxious' | 'angry' | 'calm' | 'neutral',
  confidence:      number (0-100),
  emotionScores:   { happy, sad, anxious, angry, calm, neutral },
  sentiment:       'positive' | 'negative' | 'neutral',
  sentimentScore:  number (-100 to 100),
  analysis:        string,
  language:        'english' | 'tagalog' | 'mixed',
  emoji:           string
}
```

#### 2. POST /api/journal/enhance-tagalog (NEW)
Tagalog text enhancement (only for Tagalog entries)
```javascript
Request:  { content: string }
Response: {
  enhanced:     string,
  suggestions:  [string, ...],    // Grammar/spelling corrections
  improvements: [string, ...],    // Content enhancement suggestions
  tips:         [string, ...],    // Writing tips
  prompts:      [string, ...],    // Reflection prompts
  stats: {
    originalLength:  number,
    enhancedLength:  number,
    words:          number,
    sentences:      number
  }
}
```

### Core Utilities

#### `/utils/sentimentAnalysis.js`
**Key Functions**:
- `detectLanguage(text)` - Identifies language using keyword counting
- `analyzeJournalEmotion(text)` - Main analysis function returning all emotion data
- `getEmotionEmoji(emotion)` - Maps emotions to emojis
- `getEmotionColor(emotion)` - Returns Tailwind color classes
- `analyzeSentimentTrend(entries)` - Analyzes emotion trends across multiple entries
- `generateTrendInsights()` - Bilingual trend analysis and insights

**Data Objects**:
- `englishEmotionKeywords` - 120+ keywords per emotion with weights
- `tagalogEmotionKeywords` - 100+ keywords per emotion with weights
- `intensifiers` - Words that boost emotion scores (very, sobrang, napaka, etc.)
- `negations` - Negation words that reverse polarity (hindi, not, never, etc.)

#### `/utils/tagalogEnhancer.js` (NEW)
**Key Functions**:
- `enhanceTagalogText(text)` - Improves grammar, fixes typos, suggests improvements
- `getTagalogWritingTips(text)` - Returns contextual writing tips
- `getWritingPrompts(emotion, language)` - Emotion-based reflection prompts

**Data Objects**:
- `tagalogCorrections` - Common Tagalog corrections (slang, typos, variations)
- `fillerWords` - Common filler words to reduce
- `tagalogPhrases` - Common Tagalog phrases and structures
- `tagalogPrompts` & `englishPrompts` - Emotion-based reflection questions

---

## 🎨 User Interface

### Journal Entry Creation (`/views/journal/new-entry.xian`)

**Layout Sections**:
1. **Title Input** - Entry title field
2. **AI Emotion Detection Box** - Shows detected emotion with:
   - Large emoji display (😊😢😰😠😌😐)
   - Confidence percentage badge
   - AI-generated analysis text
   - Real-time emotion score bars (6 emotions)
3. **Manual Mood Selection** (Optional) - 5 emotion cards with emojis
4. **Content Textarea** - Main journal entry field with:
   - Word counter in corner
   - Placeholder text guiding users
5. **Tagalog Enhancement Box** (Conditional) - Only shows for Tagalog:
   - 🇵🇭 Title with AI-Powered badge
   - Toggle to show/hide details
   - Suggestions box (grammar/spelling)
   - Improvements box (content suggestions)
   - Tips box (writing guidance)
   - Prompts box (reflection questions)

**Color Scheme**:
- AI Analysis Box: Blue gradient (from-blue-50 to-indigo-50)
- Enhancement Box: Blue accent with blue-50 background
- Prompts Box: Purple gradient (from-purple-50 to-pink-50)
- Emotion Score Bars: Green gradient

### Journal Entry Editing (`/views/journal/edit-entry.xian`)
- Same layout as new-entry
- Pre-populated with existing data
- Real-time re-analysis as content is edited
- Enhanced Tagalog features active

### Journal Entry Viewing (`/views/journal/view-entry.xian`)
- **AI Analysis Display Section** showing:
  - Detected emotion with confidence percentage
  - Sentiment indicator (positive/negative/neutral)
  - AI analysis text
- **Emotion Distribution Chart** - 6 horizontal bars with percentages
- **Sentiment Gauge** - Visual slider from -100 to +100
- **Original Content** - Full journal text display

### Journal Entries List (`/views/journal/entries.xian`)
- Each entry shows quick emotion overview:
  - Purple-bordered AI box
  - 🤖 AI Analysis label
  - Emotion emoji with confidence
  - Sentiment badge (color-coded)
  - Example: "🤖 AI: 😊 Happy (75%) ✨ Positive"

---

## 🔄 Workflow

### Creating a New Journal Entry (with Tagalog)
1. User navigates to `/journal/new`
2. Types title and starts writing content
3. Every 300ms: Frontend debounced call to `/api/journal/analyze-emotion`
4. Backend analyzes text using keyword-based sentiment analysis
5. Backend detects language (English/Tagalog/Mixed)
6. If Tagalog detected:
   - Returns emotion data with `language: 'tagalog'`
   - Frontend shows emotion analysis box
   - Frontend shows Tagalog enhancement box
   - Frontend fetches `/api/journal/enhance-tagalog`
7. Enhancement data displays:
   - Suggestions, improvements, tips, prompts
   - User can toggle visibility with button
8. User submits form with POST to `/journal/new`
9. Server analyzes content, stores all emotion fields:
   - detectedEmotion, emotionConfidence, sentimentScore
   - emotionScores (JSON with all 6 emotions)
   - sentimentAnalysis (AI-generated text)
10. Entry saved to database with all analysis data

### Editing an Existing Entry
1. User clicks edit on entry
2. All fields pre-populated (title, content, mood)
3. JavaScript triggers initial analysis (500ms timeout)
4. Same real-time analysis flow as creation
5. User modifies content
6. Every 300ms: Re-analysis and enhancement suggestions
7. Emotion and enhancement data updates live
8. On submit: Server re-analyzes and updates all emotion fields
9. Entry updated in database

### Viewing a Completed Entry
1. User views `/journal/{id}`
2. All stored emotion data displays:
   - Detected emotion with confidence
   - Full emotion distribution (6 emotions)
   - Sentiment gauge showing -100 to +100
   - AI-generated analysis text
   - Original journal content

---

## 🚀 Getting Started

### 1. Database Migration
```bash
npm run migrate
```
This creates/updates the journal_entries table with new emotion fields.

### 2. Test with English Entry
```
Title: "My Day"
Content: "I'm very happy today! Everything went great and I feel wonderful."
```
Expected: Emotion = Happy, Confidence ~85%, Sentiment ~+70

### 3. Test with Tagalog Entry
```
Title: "Aking Araw"
Content: "Napakasaya ng aking araw! Lahat ay napagandahan at nag-enjoy ako ng bawat oras."
```
Expected: 
- Emotion = Happy, Confidence ~80%
- Sentiment ~+65
- Tagalog enhancement box visible with suggestions/tips/prompts

### 4. Test Mixed Language
```
Title: "Mixed Day"
Content: "I'm masaya today because lahat ay ok. Pero medyo worried about tomorrow."
```
Expected: Emotion = Happy, Language = Mixed, Confidence ~65%

---

## 📊 Emotion Analysis Algorithm

### Keyword Matching
1. Split text into words
2. For each emotion, count matching keywords
3. Apply intensity multipliers if intensifiers present
4. Reverse polarity if negations precede keyword
5. Normalize scores to 0-100 range
6. Return emotion with highest score as primary

### Confidence Calculation
- Based on: keyword match count, intensity, and score margin vs second-highest emotion
- Formula: `min(100, baseScore * (1 + intensityBonus) * confidenceBoost)`

### Sentiment Scoring
- Sum of all keyword sentiment values
- Range: -100 (very negative) to +100 (very positive)
- 0 = neutral

### Language Detection
1. Count Tagalog keywords in first 50-100 words
2. Count English keywords in same text
3. If Tagalog > English × 1.5: **Tagalog**
4. If English > Tagalog × 1.5: **English**
5. Otherwise: **Mixed**

---

## 🛡️ Error Handling

### Graceful Degradation
- If analysis endpoint fails: Shows "Analysis temporarily unavailable"
- If enhancement endpoint fails: Enhancement box still toggles but shows "Error loading"
- Empty text: Shows placeholder messages, no analysis
- No matches: Returns neutral emotion (0% all emotions)

### Validation
- Content must be at least 1 character
- No HTML/script injection possible (sanitized)
- API rate limiting recommended for production

---

## ⚡ Performance Optimization

### Frontend
- **Debouncing**: 300ms delay prevents excessive API calls
- **Lazy Loading**: Enhancement data only fetched for Tagalog entries
- **Conditional Rendering**: Enhancement box hidden for English by default
- **Limited Results**: Max 5 suggestions, improvements, and tips

### Backend
- **No External APIs**: All analysis local (no network latency)
- **Efficient Keyword Matching**: O(n) string operations
- **JSON Storage**: Emotion data stored as compact JSON object
- **Connection Pooling**: MySQL connection reuse

### Caching Opportunities
- Cache emotion keyword lists in memory
- Cache language detection patterns
- Consider Redis for frequently analyzed text

---

## 🧪 Testing Checklist

- [ ] English entries don't show enhancement box
- [ ] Tagalog entries trigger enhancement box automatically
- [ ] Mixed entries detected correctly
- [ ] Emotion confidence scores reasonable (0-100)
- [ ] Sentiment scores range -100 to +100
- [ ] All 6 emotions display with percentages
- [ ] Real-time updates work (debounced to 300ms)
- [ ] Word count updates correctly
- [ ] Enhancement suggestions display without duplicates
- [ ] Writing tips relevant to content
- [ ] Prompts match detected emotion
- [ ] Toggle button shows/hides enhancement details
- [ ] Works on both new-entry and edit-entry pages
- [ ] Database saves emotion data correctly
- [ ] View page displays all emotion information
- [ ] List view shows emotion badges
- [ ] Error handling works gracefully
- [ ] No console errors in browser
- [ ] Performance: Analysis < 100ms
- [ ] Enhancement load: < 200ms

---

## 📚 Keyword Examples

### English Happy Keywords
awesome, wonderful, fantastic, great, excellent, happy, joyful, thrilled, delighted, amazing, brilliant, perfect, love, excited, blessed, cheerful, pleasant, grateful, satisfied, proud, successful, winning, accomplished, etc.

### Tagalog Happy Keywords
masaya, saya, kasiyahan, ligaya, ikinalugod, ikabibigay-kaligayahan, maganda, perpekto, napakaganda, okay, awesome, excellent, magaling, hindi masaya, etc.

### English Sad Keywords
sad, unhappy, miserable, depressed, devastated, heartbroken, lonely, gloomy, melancholy, sorrowful, down, discouraged, disappointed, regret, sorry, unfortunate, bad, terrible, awful, etc.

### Tagalog Sad Keywords
malungkot, lungkot, pagkahihintay, pag-asa, ikinalulungkot, masakit, hamak, sayang, problema, takot, etc.

---

## 🔮 Future Enhancements

1. **Advanced NLP**: Integration with external NLP APIs for better accuracy
2. **Emotion Trends**: Dashboard showing emotion trends over time
3. **Personalization**: Custom keyword lists per user
4. **Social Features**: Share mood insights with counselors
5. **Mobile App**: React Native version with offline support
6. **Voice Journaling**: Speech-to-text with emotion detection
7. **Multi-Language**: Support for more languages (Visayan, Ilonggo, etc.)
8. **AI Suggestions**: Generate actionable suggestions based on emotions
9. **Wellness Integration**: Connect with wellness apps and services
10. **Privacy Controls**: User consent for emotion tracking/analysis

---

## 📖 Documentation Files

- **Sentiment Analysis**: `/utils/sentimentAnalysis.js`
- **Tagalog Enhancer**: `/utils/tagalogEnhancer.js`
- **Routes**: `/routes/index.js` - Lines with `/api/journal/` endpoints
- **Database**: `/models/Journalentrymodel.js`
- **Views**:
  - `/views/journal/new-entry.xian` - Create new entry
  - `/views/journal/edit-entry.xian` - Edit existing entry
  - `/views/journal/view-entry.xian` - View single entry
  - `/views/journal/entries.xian` - List all entries

---

## 💬 Support

For issues or feature requests, contact the development team or create an issue in the repository.

**Last Updated**: 2025
**Version**: 2.0 (With Tagalog Enhancement)
**Status**: Production Ready ✅
