/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines

    AI Sentiment Analysis - Analyzes journal entries to detect emotions and sentiment
    Now with Tagalog language support and comprehensive emotion vocabulary!
    INCLUDES: Crisis Detection & Mental Health Safety Features
*/

import { emotionVocabulary, intensityModifiers, negationWords, getIntensityModifier, isNegation } from './emotionVocabulary.js';

/**
 * Get crisis message based on severity
 */
const getCrisisMessage = (severity) => {
  const messages = {
    high: '🚨 URGENT: We detected concerning thoughts in your entry. Please chat with a counselor immediately. Your safety matters. You\'re not alone in this.',
    medium: '⚠️ IMPORTANT: We notice you may be struggling. Please consider chatting with a counselor to talk about what you\'re feeling. Help is available.',
    low: '💙 We care about you. If you\'re feeling down, our counselors are here to listen and support you.'
  };
  return messages[severity] || messages.medium;
};

/**
 * MENTAL HEALTH SAFETY: Detect crisis/harmful phrases
 * Checks for self-harm, suicide, or concerning mental health indicators
 * @param {string} text - Text to analyze
 * @returns {Object} Crisis detection result
 */
export const detectCrisisKeywords = (text) => {
  const lowerText = text.toLowerCase();
  
  // ==================== SELF-HARM / SUICIDE KEYWORDS (English) ====================
  const selfHarmKeywords = [
    'kill myself', 'kill me', 'want to die', 'wanna die', 'want die',
    'end it all', 'end it', 'end my life', 'end my suffering',
    'hurt myself', 'harm myself', 'cut myself', 'cut me',
    'i want to kill', 'i want to hurt', 'i want to harm',
    'suicide', 'suicidal', 'suicidal thoughts', 'suicidal ideation',
    'no point living', 'no point to live', 'better off dead',
    'everyone would be better off without me', 'better without me',
    'overdose', 'poison myself', 'jump', 'hang myself', 'hanging',
    'self harm', 'self-harm', 'self destructive', 'self destruction',
    'despair', 'hopeless', 'hopelessness', 'lost cause',
    'not worth living', 'don\'t deserve to live', 'should be dead'
  ];
  
  // ==================== SELF-HARM / SUICIDE KEYWORDS (Tagalog) ====================
  const tagalogCrisisKeywords = [
    'gusto ko maging patay', 'gusto ko mamamatay', 'nais ko mamamatay',
    'ayaw ko nang buhay', 'ayaw ko na ng buhay', 'ayaw ko buhay',
    'nais ko maging alaala', 'gusto ko maging alaala', 'nais ko magsama', 'gusto ko mawala',
    'takot ko sa buhay', 'hindi na kaya', 'pagod na', 'pagod na talaga',
    'walang point', 'walang punto', 'walang pag-asa', 'desperate',
    'sakit na', 'hindi na', 'huli na', 'wala nang hope',
    'gusto ko ng pumatay', 'gusto ko patay', 'gusto ko matapos',
    'magsama sa', 'magsama', 'sumama', 'sumama na',
    'iwanan na kayo', 'iwan na', 'bagakin na',
    'walang halaga', 'walang silbi', 'walang kwenta',
    'mas maganda kung wala ako', 'mas maganda kung patay ako',
    'lahat mas maganda kung wala ako', 'burden', 'problema',
    'kasalanan', 'sisi', 'nagsisisi', 'hindi dapat nandito',
    'dapat wala akong buhay', 'dapat patay na ako'
  ];
  
  // ==================== SELF-HARM / SUICIDE KEYWORDS (Taglish Mixed) ====================
  const taglishCrisisKeywords = [
    'i want to kill myself', 'i want to die', 'i want to end it',
    'gusto ko mag-kill', 'gusto ko mag-die', 'gusto ko mag-end',
    'want ko maging patay', 'want ko mawala', 'can\'t do this anymore',
    'hindi ko na kaya', 'hindi na ako kaya', 'kaya ko na',
    'parang hindi na', 'feeling ko hindi na', 'para sa akin tapos na'
  ];
  
  // Combine all crisis keywords
  const allCrisisKeywords = [
    ...selfHarmKeywords,
    ...tagalogCrisisKeywords,
    ...taglishCrisisKeywords
  ];
  
  // Check for crisis keywords
  const detectedCrisisKeywords = allCrisisKeywords.filter(keyword => {
    // For multi-word phrases, use simple substring matching
    if (keyword.includes(' ')) {
      return lowerText.includes(keyword);
    }
    // For single words, use word boundary regex
    const pattern = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    return pattern.test(lowerText);
  });
  
  // ==================== SEVERITY LEVELS ====================
  const HIGH_SEVERITY = [
    'kill myself', 'kill me', 'suicide', 'suicidal', 'want to die',
    'end my life', 'end it all', 'end it', 'gusto ko mamamatay', 'gusto ko patay',
    'i want to kill', 'nais ko mamamatay', 'hurt myself', 'harm myself'
  ];
  
  const MEDIUM_SEVERITY = [
    'hurt myself', 'harm myself', 'cut myself', 'no point living',
    'better off dead', 'ayaw ko nang buhay', 'walang pag-asa',
    'desperate', 'hopeless', 'i want to end'
  ];
  
  const hasSeverity = {
    high: detectedCrisisKeywords.some(kw => 
      HIGH_SEVERITY.some(sk => kw.toLowerCase().includes(sk.toLowerCase()))
    ),
    medium: detectedCrisisKeywords.some(kw => 
      MEDIUM_SEVERITY.some(sk => kw.toLowerCase().includes(sk.toLowerCase()))
    )
  };
  
  const severityLevel = hasSeverity.high ? 'high' : (hasSeverity.medium ? 'medium' : 'low');
  
  if (detectedCrisisKeywords.length > 0) {
    console.log(`🚨 [CRISIS DETECTION] ${detectedCrisisKeywords.length} crisis keyword(s) detected!`);
    console.log(`   Keywords: ${detectedCrisisKeywords.join(', ')}`);
    console.log(`   Severity: ${severityLevel.toUpperCase()}`);
    
    return {
      hasCrisisKeywords: true,
      keywords: detectedCrisisKeywords,
      severity: severityLevel,
      recommendation: 'IMMEDIATE COUNSELOR CHAT RECOMMENDED',
      message: getCrisisMessage(severityLevel)
    };
  }
  
  return {
    hasCrisisKeywords: false,
    keywords: [],
    severity: 'none',
    recommendation: null,
    message: null
  };
};

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
 * Analyze context clues when no direct emotion keywords are found
 * Uses punctuation, sentence structure, and common words to infer emotion
 * @param {string} text - Text to analyze
 * @param {string} language - Text language
 * @returns {Object} Context-detected emotion with confidence
 */
const analyzeContext = (text, language) => {
  const lowerText = text.toLowerCase();
  
  // ==================== LAUGHTER DETECTION ====================
  // Detect laughter patterns (haha, hehe, hihihi, lol, lmao, etc.)
  const laughterPatterns = [
    /\bhaha+\b/gi,        // haha, hahaha, hahahaha
    /\bhehe+\b/gi,        // hehe, hehehe
    /\bhihi+\b/gi,        // hihi, hihihi
    /\bhuhu+\b/gi,        // huhu, huhuh
    /\blol+\b/gi,         // lol, lolol
    /\blmao\b/gi,         // lmao
    /\brofl\b/gi,         // rofl
    /\blmfao\b/gi         // lmfao
  ];
  
  const laughterCount = laughterPatterns.reduce((count, pattern) => {
    const matches = lowerText.match(pattern);
    return count + (matches ? matches.length : 0);
  }, 0);
  
  if (laughterCount > 0) {
    const confidence = Math.min(50 + (laughterCount * 15), 95);
    console.log(`😂 [CONTEXT] Detected ${laughterCount} laughter patterns - Happy emotion (${confidence}%)`);
    return { detectedEmotion: 'happy', confidence };
  }
  
  // ==================== TAGALOG/TAGLISH REJECTION DETECTION ====================
  // Detect "ayaw ko" and similar rejection patterns in Tagalog
  const tagalogRejectionPatterns = [
    /\bayaw\s*ko\b/gi,              // ayaw ko
    /\bayaw\s*ko\s*na\b/gi,         // ayaw ko na
    /\bayaw\s*nang\b/gi,            // ayaw nang
    /\baywain\b/gi,                 // aywain
    /\baywain\s*na\b/gi,            // aywain na
    /\bwala\s*nang\s*pag.asa\b/gi,  // wala nang pag-asa
    /\bwala\s*nang\s*lasa\b/gi,     // wala nang lasa
    /\bwala\s*na\b/gi,              // wala na (context dependent)
    /\bsawa\s*na\b/gi,              // sawa na
    /\btired\s*na\b/gi              // tired na
  ];
  
  const tagalogRejectionCount = tagalogRejectionPatterns.reduce((count, pattern) => {
    const matches = lowerText.match(pattern);
    return count + (matches ? matches.length : 0);
  }, 0);
  
  if (tagalogRejectionCount > 0) {
    const confidence = 55 + (tagalogRejectionCount * 10);
    console.log(`😢 [CONTEXT] Detected ${tagalogRejectionCount} Tagalog rejection patterns - Sad emotion (${confidence}%)`);
    return { detectedEmotion: 'sad', confidence: Math.min(confidence, 90) };
  }
  
  // ==================== TAGALOG ANNOYANCE/IRRITATION DETECTION ====================
  // Detect Tagalog words for annoyance/irritation
  const tagalogAnnoyancePatterns = [
    /\bnakakainis\b/gi,              // nakakainis
    /\bnakakabwisit\b/gi,            // nakakabwisit
    /\bbwisit\b/gi,                  // bwisit
    /\bkinikilabutan\b/gi,           // kinikilabutan
    /\bsirang\s*loob\b/gi,           // sirang loob
    /\bgago\b/gi,                    // gago (can be anger/annoyance)
    /\btanga\b/gi,                   // tanga (can indicate annoyance)
    /\bbobo\b/gi,                    // bobo
    /\bnasasama\s*ang\s*loob\b/gi,   // nasasama ang loob
    /\bnasama\s*ang\s*loob\b/gi,     // nasama ang loob
    /\bnag.*galit\b/gi,              // nag-galit, nagagalit
    /\bgalit\b/gi                    // galit
  ];
  
  const tagalogAnnoyanceCount = tagalogAnnoyancePatterns.reduce((count, pattern) => {
    const matches = lowerText.match(pattern);
    return count + (matches ? matches.length : 0);
  }, 0);
  
  if (tagalogAnnoyanceCount > 0) {
    const confidence = 55 + (tagalogAnnoyanceCount * 10);
    console.log(`😠 [CONTEXT] Detected ${tagalogAnnoyanceCount} Tagalog annoyance patterns - Angry emotion (${confidence}%)`);
    return { detectedEmotion: 'angry', confidence: Math.min(confidence, 90) };
  }
  
  // ==================== PUNCTUATION ANALYSIS ====================
  // Check for exclamation marks (usually positive energy)
  const exclamationCount = (lowerText.match(/!/g) || []).length;
  if (exclamationCount >= 2) {
    const confidence = 45 + Math.min(exclamationCount * 8, 25);
    console.log(`😊 [CONTEXT] Detected ${exclamationCount} exclamation marks - Happy emotion (${confidence}%)`);
    return { detectedEmotion: 'happy', confidence };
  }
  
  // Check for question marks (often indicates curiosity or anxiety)
  const questionCount = (lowerText.match(/\?/g) || []).length;
  if (questionCount >= 3) {
    const confidence = 40 + Math.min(questionCount * 5, 20);
    console.log(`😰 [CONTEXT] Detected ${questionCount} question marks - Anxious emotion (${confidence}%)`);
    return { detectedEmotion: 'anxious', confidence };
  }
  
  // Check for ellipses (often indicates hesitation or trailing thoughts - calm/neutral)
  if (lowerText.includes('...')) {
    console.log(`😌 [CONTEXT] Detected ellipsis - Calm emotion (35%)`);
    return { detectedEmotion: 'calm', confidence: 35 };
  }
  
  // ==================== POSITIVE KEYWORD DETECTION ====================
  // Check for common positive words
  const positiveWords = [
    'wonderful', 'amazing', 'great', 'love', 'perfect', 'best', 'awesome', 
    'fun', 'enjoy', 'excited', 'thrilled', 'delighted',
    'maganda', 'ganap', 'perpekto', 'espesyal', 'kahanga-hanga',
    'napakasaya', 'sobrang saya', 'tuwang-tuwa'
  ];
  const hasPositive = positiveWords.some(word => lowerText.includes(word));
  if (hasPositive) {
    console.log(`😊 [CONTEXT] Detected positive word - Happy emotion (50%)`);
    return { detectedEmotion: 'happy', confidence: 50 };
  }
  
  // ==================== NEGATIVE KEYWORD DETECTION ====================
  // Check for common negative words
  const negativeWords = [
    'hate', 'terrible', 'worst', 'awful', 'horrible', 'disgusting', 
    'disappointing', 'bad', 'evil', 'ugly',
    'pangit', 'nakakayamot', 'nakakatuwa ng masakit'
  ];
  const hasNegative = negativeWords.some(word => lowerText.includes(word));
  if (hasNegative) {
    console.log(`😢 [CONTEXT] Detected negative word - Sad emotion (50%)`);
    return { detectedEmotion: 'sad', confidence: 50 };
  }
  
  // ==================== REPETITION DETECTION ====================
  // Check for word/character repetition (usually indicates strong feeling)
  const words = lowerText.split(/\s+/);
  const wordCounts = {};
  for (const word of words) {
    if (word.length > 3) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  }
  const repeatedWord = Object.entries(wordCounts).find(([word, count]) => count >= 3);
  if (repeatedWord) {
    console.log(`😰 [CONTEXT] Detected repeated word "${repeatedWord[0]}" - Anxious emotion (40%)`);
    return { detectedEmotion: 'anxious', confidence: 40 };
  }
  
  // ==================== CHARACTER ELONGATION DETECTION ====================
  // Detect elongated characters (e.g., "noooooo", "aaaah", "whyyyy")
  if (/[a-z]{2,}(.)\1{2,}/gi.test(lowerText)) {
    console.log(`😭 [CONTEXT] Detected character elongation - Sad/Anxious emotion (45%)`);
    return { detectedEmotion: 'sad', confidence: 45 };
  }
  
  // ==================== DEFAULT NEUTRAL ====================
  // Default: truly neutral when no emotion indicators found
  console.log(`😐 [CONTEXT] No emotion patterns detected - Truly Neutral (0%)`);
  return { detectedEmotion: 'neutral', confidence: 0 };
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
      details: {},
      crisis: {
        isCrisis: false,
        keywords: [],
        severity: 'none'
      }
    };
  }

  // 🚨 MENTAL HEALTH SAFETY CHECK: Detect crisis keywords FIRST (highest priority)
  const crisisCheck = detectCrisisKeywords(text);
  
  if (crisisCheck.hasCrisisKeywords) {
    console.log(`\n🚨🚨🚨 [CRITICAL] CRISIS KEYWORDS DETECTED 🚨🚨🚨`);
    return {
      primaryEmotion: 'crisis',
      confidence: 100,
      emotionScores: {
        happy: 0,
        sad: 0,
        anxious: 0,
        angry: 0,
        calm: 0,
        neutral: 0
      },
      sentiment: 'critical',
      sentimentScore: -100,
      analysis: crisisCheck.message,
      language: detectLanguage(text),
      details: {
        detectedCrisisKeywords: crisisCheck.keywords,
        crisisType: 'self-harm/suicide-related',
        urgency: crisisCheck.severity === 'high' ? 'IMMEDIATE' : 'HIGH'
      },
      crisis: {
        isCrisis: true,
        keywords: crisisCheck.keywords,
        severity: crisisCheck.severity,
        recommendation: crisisCheck.recommendation,
        message: crisisCheck.message
      }
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
    // Calculate total score from all emotions
    const totalScore = Object.values(emotionScores).reduce((sum, score) => sum + score, 0);
    
    // Normalize scores proportionally based on their actual weights
    for (const [emotion, score] of Object.entries(emotionScores)) {
      if (score > 0) {
        // Proportional distribution based on actual scores
        normalizedScores[emotion] = Math.round((score / totalScore) * 100);
      }
    }
    
    // Ensure total is exactly 100% by adjusting primary emotion if needed
    const calculatedTotal = Object.values(normalizedScores).reduce((a, b) => a + b, 0);
    if (calculatedTotal !== 100) {
      normalizedScores[primaryEmotion] += (100 - calculatedTotal);
    }
  } else {
    // No emotion detected - use contextual analysis to determine most likely emotion
    const contextAnalysis = analyzeContext(text, language);
    
    if (contextAnalysis.detectedEmotion && contextAnalysis.confidence > 0) {
      primaryEmotion = contextAnalysis.detectedEmotion;
      normalizedScores[contextAnalysis.detectedEmotion] = contextAnalysis.confidence;
      for (const emotion of Object.keys(normalizedScores)) {
        if (emotion !== contextAnalysis.detectedEmotion) {
          normalizedScores[emotion] = Math.round((100 - contextAnalysis.confidence) / 5);
        }
      }
    } else {
      // True neutral when no emotion indicators found
      normalizedScores.neutral = 100;
    }
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
    },
    crisis: {
      isCrisis: false,
      keywords: [],
      severity: 'none',
      recommendation: null,
      message: null
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

  if (confidence < 30) {
    if (isTagalog) {
      analysis = "🤔 Pinagsasaluhang emosyon. Maraming iba't ibang damdamin ang nakita sa iyong entry. Ang iyong damdamang ito ay kompleks at may maraming layer.";
    } else {
      analysis = '🤔 Mixed emotions detected. Your entry contains a blend of different feelings. Your emotional state appears layered and complex.';
    }
  } else if (confidence >= 30 && confidence < 60) {
    if (isTagalog) {
      analysis = `😌 Malinaw na ${labels[emotion].toLowerCase()} na damdamin. Ang iyong entry ay nagpapakita ng ${labels[emotion].toLowerCase()} na sentimyento. Ito ay magandang emosyon na pag-aralan.`;
    } else {
      analysis = `😌 Moderate ${emotion} emotion detected. Your entry shows clear ${emotion} feelings. This is valuable for understanding yourself.`;
    }
  } else {
    if (isTagalog) {
      analysis = `😊 Malakas na ${labels[emotion].toLowerCase()} na emosyon (${confidence}%). Ang iyong entry ay strongly nagpapahayag ng ${labels[emotion].toLowerCase()} na damdamin. Malinaw na nararamdaman mo ito.`;
    } else {
      analysis = `😊 Strong ${emotion} emotion detected (${confidence}% confidence). Your entry clearly expresses ${emotion} sentiments. Your feelings are prominent and significant.`;
    }
  }

  // Add secondary emotion if significant
  const sortedEmotions = Object.entries(emotionScores)
    .filter(([e]) => e !== emotion)
    .sort((a, b) => b[1] - a[1]);

  if (sortedEmotions.length > 0 && sortedEmotions[0][1] > 20) {
    if (isTagalog) {
      analysis += ` May ${sortedEmotions[0][0]} na elemento rin (${Math.round(sortedEmotions[0][1])}%). Kumplikado ang iyong emosyon.`;
    } else {
      analysis += ` There are also ${sortedEmotions[0][0]} elements present (${Math.round(sortedEmotions[0][1])}%). Your emotional landscape is nuanced.`;
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

