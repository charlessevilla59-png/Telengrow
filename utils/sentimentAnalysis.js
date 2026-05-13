/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines

    AI Sentiment Analysis - Analyzes journal entries to detect emotions and sentiment
    Now with Tagalog language support and comprehensive emotion vocabulary!
*/

import { emotionVocabulary, intensityModifiers, negationWords, getIntensityModifier, isNegation } from './emotionVocabulary.js';

/**
 * Detect text language (English or Tagalog)
 * @param {string} text - Text to detect
 * @returns {string} 'tagalog', 'english', or 'mixed'
 */
const detectLanguage = (text) => {
  // Get all Tagalog emotion words from vocabulary
  const allTagalogEmotions = [];
  const allEnglishEmotions = [];
  
  for (const emotion of Object.values(emotionVocabulary)) {
    allTagalogEmotions.push(...emotion.tagalog);
    allEnglishEmotions.push(...emotion.english);
  }
  
  const tagalogEmotionWords = [...new Set(allTagalogEmotions)];
  const englishEmotionWords = [...new Set(allEnglishEmotions)];
  const tagalogIndicators = ['ako', 'ikay', 'siya', 'kami', 'kayo', 'sila', 'ang', 'ng', 'sa', 'ay', 'nang', 'na', 'pa', 'rin', 'talaga', 'daw', 'kasi', 'dahil', 'pero', 'kaya', 'bago', 'pagkatapos', 'habang', 'kung', 'kapag', ...tagalogEmotionWords];
  const englishIndicators = ['the', 'is', 'are', 'was', 'were', 'be', 'have', 'has', 'do', 'does', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', ...englishEmotionWords];
  
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/).map(w => w.replace(/[.,!?;:()'"—\-]/g, '')).filter(w => w.length > 0);
  
  let tagalogCount = 0;
  let englishCount = 0;
  
  // Check each word
  for (const word of words) {
    if (word.length > 1) {
      if (tagalogIndicators.includes(word)) {
        tagalogCount++;
      } else if (englishIndicators.includes(word)) {
        englishCount++;
      } else if (tagalogEmotionWords.some(w => word.includes(w))) {
        // Check if word contains a Tagalog emotion word
        tagalogCount++;
      }
    }
  }
  
  console.log(`🔍 [LANG] Words: [${words.join(', ')}], Tagalog: ${tagalogCount}, English: ${englishCount}`);
  
  // Tagalog is preferred if ANY Tagalog indicator is found
  if (tagalogCount > 0) return 'tagalog';
  if (englishCount > 0) return 'english';
  
  // Default based on word patterns - check if any word looks Tagalog (has 'ng', 'ay', etc)
  for (const word of words) {
    if (word.includes('ng') || word.includes('ay') || word.includes('ung') || word.includes('um')) {
      return 'tagalog';
    }
  }
  
  return 'english';
};

/**
/**
 * Build emotion keywords from comprehensive vocabulary
 */
const buildEmotionKeywords = (language = 'english') => {
  const keywords = {};
  
  for (const [emotion, data] of Object.entries(emotionVocabulary)) {
    keywords[emotion] = {
      keywords: language === 'tagalog' ? data.tagalog : data.english,
      weight: data.weight
    };
  }
  
  return keywords;
};

// Emotion keywords using comprehensive vocabulary
const englishEmotionKeywords = buildEmotionKeywords('english');
const tagalogEmotionKeywords = buildEmotionKeywords('tagalog');

/**
 * Get intensifier value from comprehensive modifiers
 */
const getIntensifierValue = (word, language = 'english') => {
  return getIntensityModifier(word, language);
};

/**
 * Check if word is a negation from comprehensive list
 */
const isNegationWord = (word, language = 'english') => {
  return isNegation(word, language);
};

/**
 * Analyze journal entry text and detect emotions (Supports English & Tagalog)
 * @param {string} text - Journal entry content
 * @returns {Object} Analysis results with emotion, confidence, and detailed scores
 */
export const analyzeJournalEmotion = (text) => {
  if (!text || text.trim().length === 0) {
    return {
      primaryEmotion: 'neutral',
      confidence: 0,
      emotionScores: {
        happy: 0,
        sad: 0,
        anxious: 0,
        angry: 0,
        calm: 0,
        neutral: 100
      },
      sentiment: 'neutral',
      sentimentScore: 0,
      analysis: 'No text provided for analysis',
      language: 'unknown',
      details: {}
    };
  }

  // ✅ Detect language
  const language = detectLanguage(text);
  const emotionKeywords = language === 'tagalog' ? tagalogEmotionKeywords : englishEmotionKeywords;

  const lowerText = text.toLowerCase().trim();
  const words = lowerText.split(/\s+/).map(w => w.replace(/[.,!?;:()'"—\-]/g, '').trim()).filter(w => w.length > 0);
  
  console.log(`🔍 [SENTIMENT] Language: ${language.toUpperCase()}`);
  console.log(`🔍 [SENTIMENT] Text: "${lowerText.substring(0, 50)}"`);
  console.log(`🔍 [SENTIMENT] Words: [${words.join(', ')}]`);
  
  // Initialize emotion scores
  const emotionScores = {
    happy: 0,
    sad: 0,
    anxious: 0,
    angry: 0,
    calm: 0,
    neutral: 0
  };

  const foundEmotions = {};

  // DIRECT KEYWORD MATCHING: Check each word against emotion keywords
  for (let i = 0; i < words.length; i++) {
    const currentWord = words[i];
    
    // Check for intensifier from previous word (using comprehensive modifiers)
    let intensifier = 1;
    if (i > 0) {
      const prevWord = words[i - 1];
      const modifierValue = getIntensifierValue(prevWord, language);
      if (modifierValue !== 1.0) {
        intensifier = modifierValue;
        console.log(`    🔥 Intensifier: "${prevWord}" (×${intensifier})`);
      }
    }

    // Check for negation from previous word (using comprehensive negations)
    let negationFactor = 1;
    if (i > 0) {
      const prevWord = words[i - 1];
      if (isNegationWord(prevWord, language)) {
        negationFactor = 0.3;
        console.log(`    ❌ Negation: "${prevWord}"`);
      }
    }

    // Check this word against all emotion keywords
    for (const [emotion, data] of Object.entries(emotionKeywords)) {
      if (data.keywords.includes(currentWord)) {
        const score = data.weight * intensifier * negationFactor;
        emotionScores[emotion] += score;

        console.log(`    ✅ MATCH! "${currentWord}" → ${emotion.toUpperCase()} (+${score})`);

        if (!foundEmotions[emotion]) {
          foundEmotions[emotion] = [];
        }
        foundEmotions[emotion].push(currentWord);
        break; // Found match, move to next word
      }
    }
  }

  console.log('📊 [SENTIMENT] Raw emotion scores:', emotionScores);

  // Find the emotion with the highest score
  let maxScore = 0;
  let primaryEmotion = 'neutral';
  
  for (const [emotion, score] of Object.entries(emotionScores)) {
    if (score > maxScore) {
      maxScore = score;
      primaryEmotion = emotion;
    }
  }

  // Normalize scores to percentages
  let normalizedScores = {
    happy: 0,
    sad: 0,
    anxious: 0,
    angry: 0,
    calm: 0,
    neutral: 0
  };

  if (maxScore > 0) {
    // An emotion was detected - make it dominant (70-95%)
    const primaryPercent = Math.min(95, Math.max(70, Math.round((maxScore / (maxScore + 2)) * 100)));
    normalizedScores[primaryEmotion] = primaryPercent;
    
    // Distribute remaining percentage to other detected emotions
    const remaining = 100 - primaryPercent;
    let otherEmotions = [];
    
    for (const [emotion, score] of Object.entries(emotionScores)) {
      if (emotion !== primaryEmotion && score > 0) {
        otherEmotions.push({ emotion, score });
      }
    }
    
    if (otherEmotions.length > 0) {
      const totalOtherScore = otherEmotions.reduce((sum, e) => sum + e.score, 0);
      for (const { emotion, score } of otherEmotions) {
        normalizedScores[emotion] = Math.round((score / totalOtherScore) * remaining);
      }
    }
    
    // Fill remaining to reach 100%
    const currentTotal = Object.values(normalizedScores).reduce((a, b) => a + b, 0);
    if (currentTotal < 100) {
      normalizedScores[primaryEmotion] += (100 - currentTotal);
    }
  } else {
    // No emotion detected - all neutral
    normalizedScores.neutral = 100;
  }

  console.log('📊 [SENTIMENT] Normalized scores:', normalizedScores);
  console.log(`✨ [SENTIMENT] Primary emotion: ${primaryEmotion} (${normalizedScores[primaryEmotion]}% confidence)`);

  // Calculate overall sentiment
  const sentimentScore = calculateSentimentScore(normalizedScores);
  let sentiment = 'neutral';
  if (sentimentScore > 15) sentiment = 'positive';
  else if (sentimentScore < -15) sentiment = 'negative';

  return {
    primaryEmotion,
    confidence: normalizedScores[primaryEmotion] || 50,
    emotionScores: normalizedScores,
    sentiment,
    sentimentScore: Math.round(sentimentScore),
    analysis: generateAnalysisText(primaryEmotion, normalizedScores[primaryEmotion], normalizedScores, foundEmotions, language),
    language,
    details: {
      foundEmotions,
      wordCount: words.length,
      processedWords: maxScore > 0
    }
  };
};

/**
 * Calculate overall sentiment score
 * @param {Object} emotionScores - Emotion scores object
 * @returns {number} Sentiment score (-100 to 100)
 */
const calculateSentimentScore = (emotionScores) => {
  // Positive emotions
  const positive = (emotionScores.happy || 0) + (emotionScores.calm || 0) * 0.5;
  
  // Negative emotions
  const negative = (emotionScores.sad || 0) + (emotionScores.anxious || 0) + (emotionScores.angry || 0);
  
  return positive - negative;
};

/**
 * Generate human-readable analysis text (in detected language)
 * @param {string} emotion - Primary emotion
 * @param {number} confidence - Confidence score
 * @param {Object} emotionScores - All emotion scores
 * @param {Object} foundEmotions - Found emotion keywords
 * @param {string} language - Detected language
 * @returns {string} Analysis description
 */
const generateAnalysisText = (emotion, confidence, emotionScores, foundEmotions, language = 'english') => {
  let analysis = '';

  const emotionLabels = {
    english: {
      happy: 'Happy',
      sad: 'Sad',
      anxious: 'Anxious',
      angry: 'Angry',
      calm: 'Calm',
      neutral: 'Neutral'
    },
    tagalog: {
      happy: 'Masaya',
      sad: 'Malungkot',
      anxious: 'Nervous',
      angry: 'Galit',
      calm: 'Kalmado',
      neutral: 'Neutral'
    }
  };

  const isTagalog = language === 'tagalog' || language === 'mixed';
  const labels = isTagalog ? emotionLabels.tagalog : emotionLabels.english;

  if (isTagalog) {
    if (confidence < 30) {
      analysis = "🤔 Pinagsasaluhang emosyon. Maraming iba't ibang damdamin ang nakita sa iyong entry.";
    } else if (confidence >= 30 && confidence < 60) {
      analysis = `😌 Malinaw na ${labels[emotion].toLowerCase()} na damdamin. Ang iyong entry ay nagpapakita ng ${labels[emotion].toLowerCase()} na sentimyento.`;
    } else {
      analysis = `😊 Malakas na ${labels[emotion].toLowerCase()} na emosyon (${confidence}%). Ang iyong entry ay strongly nagpapahayag ng ${labels[emotion].toLowerCase()} na damdamin.`;
    }
  } else {
    // English version
    if (confidence < 30) {
      analysis = '🤔 Mixed emotions detected. Your entry contains a blend of different feelings.';
    } else if (confidence >= 30 && confidence < 60) {
      analysis = `😌 Moderate ${emotion} emotion detected. Your entry shows clear ${emotion} feelings.`;
    } else {
      analysis = `😊 Strong ${emotion} emotion detected (${confidence}% confidence). Your entry strongly expresses ${emotion} sentiments.`;
    }
  }

  // Add secondary emotion if significant
  const sortedEmotions = Object.entries(emotionScores)
    .filter(([e]) => e !== emotion)
    .sort((a, b) => b[1] - a[1]);

  if (sortedEmotions.length > 0 && sortedEmotions[0][1] > 20) {
    if (isTagalog) {
      analysis += ` May ${sortedEmotions[0][0]} na elemento rin.`;
    } else {
      analysis += ` Also contains ${sortedEmotions[0][0]} elements.`;
    }
  }

  return analysis;
};

/**
 * Get emoji representation for emotion
 * @param {string} emotion - Emotion name
 * @returns {string} Emoji representation
 */
export const getEmotionEmoji = (emotion) => {
  const emojiMap = {
    happy: '😊',
    sad: '😢',
    anxious: '😰',
    angry: '😠',
    calm: '😌',
    neutral: '😐'
  };
  return emojiMap[emotion] || '😐';
};

/**
 * Get color representation for emotion
 * @param {string} emotion - Emotion name
 * @returns {string} Tailwind color class
 */
export const getEmotionColor = (emotion) => {
  const colorMap = {
    happy: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    sad: 'bg-blue-100 text-blue-800 border-blue-300',
    anxious: 'bg-orange-100 text-orange-800 border-orange-300',
    angry: 'bg-red-100 text-red-800 border-red-300',
    calm: 'bg-green-100 text-green-800 border-green-300',
    neutral: 'bg-gray-100 text-gray-800 border-gray-300'
  };
  return colorMap[emotion] || 'bg-gray-100 text-gray-800 border-gray-300';
};

/**
 * Get sentiment trend analysis from multiple entries
 * @param {Array} entries - Array of journal entries with emotion analysis
 * @returns {Object} Trend analysis
 */
export const analyzeSentimentTrend = (entries) => {
  if (!entries || entries.length === 0) {
    return {
      trend: 'none',
      averageSentiment: 0,
      dominantEmotion: 'neutral',
      language: 'unknown',
      insights: 'No entries to analyze'
    };
  }

  // Detect language from entries
  const allText = entries.map(e => e.content || '').join(' ');
  const language = detectLanguage(allText);

  const sentiments = entries.map(e => e.sentimentScore || 0);
  const emotions = entries.map(e => e.detectedEmotion || 'neutral');

  const avgSentiment = Math.round(sentiments.reduce((a, b) => a + b, 0) / sentiments.length);

  // Count emotion occurrences
  const emotionCounts = {};
  emotions.forEach(e => {
    emotionCounts[e] = (emotionCounts[e] || 0) + 1;
  });

  const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) => 
    emotionCounts[a] > emotionCounts[b] ? a : b
  );

  // Detect trend
  let trend = 'stable';
  if (sentiments.length >= 3) {
    const recent = sentiments.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const older = sentiments.slice(0, -3).reduce((a, b) => a + b, 0) / (sentiments.length - 3);
    
    if (recent > older + 10) trend = 'improving';
    else if (recent < older - 10) trend = 'declining';
  }

  return {
    trend,
    averageSentiment: avgSentiment,
    dominantEmotion,
    emotionCounts,
    language,
    insights: generateTrendInsights(trend, avgSentiment, dominantEmotion, language)
  };
};

/**
 * Generate insights from trend data (supports both languages)
 * @param {string} trend - Trend type
 * @param {number} sentiment - Average sentiment
 * @param {string} emotion - Dominant emotion
 * @param {string} language - Detected language
 * @returns {string} Insight text
 */
const generateTrendInsights = (trend, sentiment, emotion, language = 'english') => {
  const isTagalog = language === 'tagalog' || language === 'mixed';

  if (isTagalog) {
    if (trend === 'improving') {
      return `📈 Magandang progress! Ang iyong emotional well-being ay patuloy na tumataas, na may ${emotion} bilang dominant emotion.`;
    } else if (trend === 'declining') {
      return `📉 Ang iyong entries ay nagpapakita ng declining trend. Isaalang-alang na makipag-ugnayan sa isang counselor kung nararamdaman mo ang ${emotion}.`;
    } else {
      return `😐 Ang iyong emotional state ay stable. Dominant emotion: ${emotion}.`;
    }
  } else {
    if (trend === 'improving') {
      return `📈 Great progress! Your emotional well-being has been improving, with ${emotion} as the dominant emotion.`;
    } else if (trend === 'declining') {
      return `📉 Your entries show a declining trend. Consider reaching out to a counselor if you're feeling ${emotion}.`;
    } else {
      return `😐 Your emotional state has been stable. Dominant emotion: ${emotion}.`;
    }
  }
};

