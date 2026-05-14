/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines

    Comprehensive Emotion Vocabulary - Tagalog & English
    Extended emotion keywords for accurate sentiment analysis
*/

/**
 * Comprehensive emotion vocabulary database
 * Includes primary words, synonyms, and related emotion words
 */
export const emotionVocabulary = {
  happy: {
    tagalog: [
      // Primary words
      'masaya', 'saya', 'ligaya', 'tuwa', 'kasiyahan', 'aliw', 'maginhawa',
      // Synonyms & variations
      'masayang', 'masayahan', 'tuwang-tuwa', 'napakasaya', 'sobrang saya',
      'lubos na masaya', 'masayang-masaya', 'tuwali', 'tuwang tuwa',
      // Related emotions
      'excited', 'excited na', 'nagugulat', 'natutuwa', 'napapasiyahan',
      'nakakaligaya', 'nakakatuwa', 'nakakamangha', 'nakakabighani',
      'nakakakuha ng ginhawa', 'walang alalahanin',
      // Joy related
      'kasiyahang', 'aliwa', 'aliwan', 'ginhawahan', 'kaligayahan',
      'pagpapasaya', 'kasiyahan na', 'ligayag', 'tuwan', 'sayan',
      // Celebration/festive
      'masaya sa puso', 'puso ay masaya', 'puso ay tumutugon', 'puso ay umaagos',
      'tunay na masaya', 'tunay na saya', 'totoo na saya', 'literal na masaya',
      // Positive feelings
      'positibo', 'positive', 'optimista', 'optimistic', 'hopeful', 'may pag-asa',
      'may liyag', 'maliwanag', 'maliwanag na', 'mataas ang puso', 'mataas ang loob',
      // Laughter patterns
      'haha', 'hehe', 'hihi', 'huhu', 'hehehe', 'hahaha', 'hihihi',
      'lol', 'lmao', 'lmfao', 'rofl', 'hahaha hahaha',
      'laughing', 'laugh', 'laughter', 'funny', 'hilarious', 'hilarity'
    ],
    english: [
      // Primary words
      'happy', 'happiness', 'joy', 'joyful', 'joyfully', 'cheerful',
      'delighted', 'thrilled', 'elated', 'ecstatic', 'blissful',
      // Synonyms
      'glad', 'pleased', 'satisfied', 'content', 'peaceful', 'serene',
      'wonderful', 'amazing', 'fantastic', 'excellent', 'awesome',
      'great', 'good', 'wonderful', 'superb', 'magnificent',
      // Strong intensity
      'extremely happy', 'incredibly happy', 'so happy', 'very happy',
      'utterly happy', 'absolutely delighted', 'purely happy',
      // Positive states
      'excited', 'exhilarated', 'eager', 'optimistic', 'hopeful',
      'uplifted', 'inspired', 'motivated', 'energized', 'invigorated',
      // Love & connection
      'love', 'loved', 'beloved', 'cherished', 'affectionate', 'tender',
      'warm hearted', 'caring', 'compassionate', 'empathetic',
      // Laughter
      'haha', 'hehe', 'hihi', 'lol', 'lmao', 'rofl',
      'laughing', 'laugh', 'laughter', 'funny', 'hilarious'
    ],
    weight: 1.5
  },

  sad: {
    tagalog: [
      // Primary words
      'malungkot', 'lungkot', 'kalungkutan', 'malungkutin', 'malungkotan',
      // Emotional states
      'nagsisisi', 'pagsisisi', 'pagsisihan', 'mapapahirap', 'mahirap',
      'nag-aasa', 'asa', 'pag-asa', 'walang pag-asa', 'walang asa',
      'nag-iisa', 'nag-iisang', 'mabagal', 'nabagal', 'mailap',
      // Variations
      'sobrang malungkot', 'napakamadungot', 'napakahirap', 'lubos na malungkot',
      'tunay na malungkot', 'tunay na lungkot', 'totong lunggutan',
      // Related sadness
      'maiwan', 'maiwan ang', 'iniwanan', 'iniwan', 'iniwan nang',
      'nag-iiwan', 'iniwan ako', 'nagsisisi ng', 'nagmamaktol',
      'nag-uusapan', 'iniisip ang masakit', 'iniisip ang masama',
      // Emotional depth
      'puso ay dumapo', 'puso ay humihit', 'puso ay lumalim',
      'puso ay nakakugon', 'puso ay nagsusuka', 'puso ay sumisigaw',
      // Pain related
      'sakit', 'sakitan', 'sakit na', 'masakit', 'masakit ang',
      'dumudugo ang puso', 'nagsisiksik ang puso', 'nangangaluluwa',
      // Despair
      'walang pag-asa', 'walang asa na', 'desperate', 'desperation',
      'desperate na', 'katapusan', 'huli na', 'lubos na huli na',
      // Don't want to / rejection
      'ayaw ko', 'ayaw ko na', 'ayaw na', 'ayaw', 'hindi ko gusto',
      'hindi gusto', 'ayaw nang', 'ayaw ko nang', 'wala nang lasa',
      'wala nang pag-asa', 'ayoko na'
    ],
    english: [
      // Primary words
      'sad', 'sadness', 'unhappy', 'sorrowful', 'sorrow', 'grief',
      'depressed', 'depression', 'gloomy', 'gloom', 'miserable',
      // Emotional states
      'heartbroken', 'broken hearted', 'devastated', 'distraught',
      'forlorn', 'dejected', 'desolate', 'downcast', 'downhearted',
      // Pain related
      'hurt', 'hurting', 'pain', 'ache', 'aching', 'sore', 'painful',
      'anguish', 'agony', 'torment', 'suffering', 'suffer',
      // Regret & remorse
      'regret', 'regretful', 'remorse', 'remorseful', 'sorry',
      'apologetic', 'shameful', 'ashamed', 'guilty', 'guilt',
      // Hopelessness
      'hopeless', 'hopelessness', 'despair', 'desperation', 'desperate',
      'doomed', 'cursed', 'damned', 'lost', 'broken', 'shattered',
      // Crying related
      'cry', 'crying', 'tears', 'tearful', 'weeping', 'sobbing',
      'mournful', 'mourn', 'lament', 'lamentation',
      // Rejection
      'don\'t want', 'don\'t care', 'don\'t like', 'i hate', 'i despise'
    ],
    weight: 1.4
  },

  anxious: {
    tagalog: [
      // Primary words
      'alala', 'nag-aalala', 'nag-aalangan', 'mag-alala', 'alahanin',
      'takot', 'natatakot', 'natatakutan', 'takutan', 'takot na',
      'kinilala', 'nerbyoso', 'nervous', 'na nervous', 'napaka nervous',
      // Stress related
      'stress', 'stressed', 'stressed na', 'napaka stressed',
      'pressured', 'pressure', 'under pressure', 'presyurado',
      'napaka stressed', 'sobrang stressed', 'lubos na stressed',
      // Worry related
      'inaalala', 'iniisip', 'iniisip ang masakit', 'iniisip ang problema',
      'nag-iisip ng masama', 'nag-iisip ng hindi maganda',
      'nag-aalala ng', 'nag-aalala tungkol sa',
      // Fear related
      'takot sa', 'takut ko', 'takot akong', 'natatakot na',
      'natatakot akong', 'natatakutan', 'takut na takut',
      'takot talaga', 'takot akong',
      // Uncertainty
      'hindi sigurado', 'hindi alam', 'walang sigurado', 'pag-aalinlangan',
      'nag-aalinlangan', 'nag-aalinlangan ako', 'nag-aalinlangang',
      'pagdududa', 'nag-dududa', 'nag-dududa na',
      // Tension
      'tensyon', 'tense', 'tense na', 'tense ang', 'napaka tense',
      'nervousness', 'nerbiyoso', 'nerbiyoso ang', 'napaka nerbiyoso',
      // Restlessness
      'hindi makakatalog', 'hindi makahiga', 'hindi makaturog',
      'walang tulog', 'walang katahimikan', 'walang peace',
      'uneasy', 'uneasy na'
    ],
    english: [
      // Primary words
      'anxious', 'anxiety', 'anxiously', 'nervous', 'nervousness',
      'worried', 'worry', 'worried about', 'worrying', 'worrisome',
      // Fear related
      'fear', 'feared', 'fearful', 'terrified', 'terrifying',
      'scared', 'scaring', 'afraid', 'frightened', 'frightening',
      'panic', 'panicked', 'panicking', 'panicky', 'panicked state',
      // Dread related
      'dread', 'dreaded', 'dreading', 'apprehensive', 'apprehension',
      'uneasy', 'unease', 'unsettled', 'unsettling',
      // Stress related
      'stressed', 'stress', 'stressful', 'under stress', 'stressed out',
      'pressured', 'pressure', 'under pressure', 'overwhelmed',
      // Tension
      'tension', 'tense', 'tensely', 'taut', 'wound up', 'tight',
      'keyed up', 'on edge', 'on pins and needles',
      // Uncertainty
      'uncertain', 'uncertainty', 'unsure', 'hesitant', 'hesitation',
      'doubtful', 'doubt', 'suspicious', 'suspicion', 'insecure', 'insecurity'
    ],
    weight: 1.3
  },

  angry: {
    tagalog: [
      // Primary words
      'galit', 'nagagalit', 'galit na', 'napaka galit', 'sobrang galit',
      'maiinit ang ulo', 'mainit ang ulo', 'init ang ulo', 'may init ang ulo',
      // Fury related
      'puno ng galit', 'labas ng galit', 'galit na galit', 'galit talaga',
      'tunay na galit', 'totong galit', 'literal na galit',
      // Irritation / Annoyance
      'nasasama', 'nasama', 'nasasama ang loob', 'nasama ang loob',
      'nasayang ang puso', 'nawawalan ng tiwala', 'umaaray', 'umaray',
      'nasasari', 'nasisira', 'napapagod', 'napagod na',
      'nakakainis', 'nakakabwisit', 'nakakasigla', 'napaka annoying',
      'nakakainis talaga', 'nakakabwisit na', 'kinikilabutan',
      // Frustration
      'frustrated', 'frustration', 'frustrated na', 'napaka frustrated',
      'pagod', 'pagod na', 'napagod na', 'pagod na pagod', 'sobrang pagod',
      'napapagod na', 'pagod na ako', 'pagod na talaga',
      // Annoyance specific
      'bwisit', 'bwisit na bwisit', 'nakabwisit', 'bwisit talaga',
      'gago', 'tanga', 'bobo', 'sira', 'sirang', 'sirang loob',
      // Resentment
      'kaibigan', 'kinakalaban', 'laban', 'labanan', 'nakakalaban',
      'nilayon', 'ninyayamang', 'niyayari', 'niyari', 'niyari ang',
      'resent', 'resentment', 'resenting', 'resentful', 'vengeful', 'revenge',
      // Disgust
      'kakaiba', 'iba', 'kailanman', 'kailanman nang', 'di na', 'hindi na',
      'disgusted', 'disgust', 'disgusting', 'repulsive', 'repulsion',
      'mukhang nababagsak ang mundo', 'walang katumbas na galit'
    ],
    english: [
      // Primary words
      'angry', 'anger', 'angrily', 'furious', 'fury', 'enraged',
      'mad', 'madness', 'livid', 'lividity', 'seething', 'seething with',
      // Intense anger
      'extremely angry', 'very angry', 'so angry', 'incredibly angry',
      'absolutely furious', 'utterly enraged', 'pure anger',
      // Frustration
      'frustrated', 'frustration', 'frustrating', 'exasperated',
      'exasperation', 'fed up', 'sick of', 'tired of', 'exhausted by',
      // Irritation
      'irritated', 'irritation', 'irritating', 'annoyed', 'annoying',
      'annoyed by', 'irritated by', 'bugged', 'bug me', 'bugs me',
      'agitated', 'agitation', 'agitated state',
      // Resentment
      'resentment', 'resentful', 'resent', 'bitter', 'bitterness',
      'bitter about', 'grudge', 'resentful of', 'hateful',
      // Hate & disgust
      'hate', 'hatred', 'hateful', 'despise', 'despicable',
      'disgust', 'disgusted', 'disgusting', 'repulsive', 'repulsion',
      // Contempt
      'contempt', 'contemptuous', 'disdain', 'disdainful', 'scorn',
      'scornful', 'dismissive', 'disrespect', 'disrespectful'
    ],
    weight: 1.3
  },

  calm: {
    tagalog: [
      // Primary words
      'tahimik', 'kalmado', 'payapa', 'payapang', 'kapayapaan',
      'katahimikan', 'ginhawa', 'maginhawa', 'maginhawang',
      // Peace related
      'walang alala', 'walang pag-aalala', 'walang stress', 'walang tensyon',
      'peaceful', 'peacefully', 'peaceful na', 'napakapeaceful',
      'tulad ng peace', 'puno ng peace', 'puno ng kapayapaan',
      // Relaxed
      'relaxed', 'relaxing', 'relaxing na', 'napaka relaxing',
      'nakatuon', 'nakatuon sa', 'focused', 'focused na', 'napaka focused',
      'organized', 'organized na', 'maayos', 'maayos ang',
      // Balanced
      'balanseng', 'balanced', 'balanseng loob', 'balanseng puso',
      'stability', 'stable', 'stable na', 'napaka stable', 'stable ang',
      // Serenity
      'serene', 'serenity', 'serene na', 'napaka serene',
      'tranquil', 'tranquility', 'tranquil na', 'napaka tranquil',
      'composed', 'composure', 'composed na', 'napaka composed',
      // Comfort
      'komportable', 'comfortable', 'comfortable na', 'napaka comfortable',
      'cozy', 'cozy na', 'comfortable ang', 'comfort', 'comforted',
      // Clear mind
      'malinaw ang isip', 'malinaw ang puso', 'malinaw ang konsensya',
      'clear mind', 'clear thinking', 'clear thoughts',
      'walang alalahanin sa puso', 'clean conscience', 'clear conscience'
    ],
    english: [
      // Primary words
      'calm', 'calmly', 'calmness', 'peaceful', 'peace', 'peaceful state',
      'serene', 'serenity', 'tranquil', 'tranquility', 'placid',
      // Relaxed
      'relaxed', 'relaxing', 'at ease', 'at peace', 'easy going',
      'laid back', 'chill', 'chilled', 'chilling out',
      // Composed
      'composed', 'composure', 'cool', 'coolness', 'controlled',
      'self-controlled', 'in control', 'in control of emotions',
      // Balanced
      'balanced', 'balanced state', 'equilibrium', 'stable', 'grounded',
      'centered', 'centered state', 'centered self',
      // Mindful
      'mindful', 'mindfulness', 'meditative', 'meditation', 'contemplative',
      'reflective', 'reflection', 'introspective', 'introspection',
      // Satisfied
      'satisfied', 'satisfaction', 'content', 'contentment', 'pleased',
      'gratified', 'gratification', 'fulfilled', 'fulfillment'
    ],
    weight: 1.2
  },

  neutral: {
    tagalog: [
      // Primary words
      'okay', 'okay lang', 'okey', 'fine', 'fine lang', 'normal',
      'karaniwan', 'ordinaryong', 'regular', 'regular lang',
      'ganoon lang', 'basta', 'parang ganoon', 'parang ganoon lang',
      // Uncertainty
      'hindi alam', 'walang alam', 'walang idea', 'walang ideya',
      'hindi sigurado', 'hindi ako sigurado', 'walang tiyak',
      // Indifference
      'walang alaga', 'walang interes', 'walang importansya',
      'di na mahalaga', 'hindi na mahalaga', 'walang halaga',
      // Middle ground
      'parang pareho', 'pareho lang', 'both', 'both sides', 'either way',
      'either or', 'one or the other', 'it\'s all the same',
      // Average
      'average', 'mediocre', 'so-so', 'so so', 'neither good nor bad',
      'in between', 'in the middle', 'middling'
    ],
    english: [
      // Primary words
      'okay', 'fine', 'alright', 'neutral', 'neutrality', 'neutral state',
      'normal', 'ordinary', 'regular', 'average', 'mediocre',
      // Indifference
      'indifferent', 'indifference', 'unconcerned', 'unbiased', 'objective',
      'detached', 'detachment', 'uninvolved', 'uninvested',
      // Uncertainty
      'uncertain', 'uncertainty', 'unsure', 'unknown', 'undecided',
      'maybe', 'perhaps', 'possibly', 'probably', 'might',
      // Neither/Nor
      'neither', 'nor', 'either way', 'either or', 'both', 'both sides',
      'middle ground', 'in the middle', 'halfway', 'in between'
    ],
    weight: 0.8
  }
};

/**
 * Word intensity modifiers
 */
export const intensityModifiers = {
  tagalog: {
    'napaka': 1.6,      // very, extremely
    'sobrang': 1.6,     // so, very much
    'muito': 1.5,       // very (Portuguese influence)
    'talaga': 1.4,      // really, truly
    'talagang': 1.4,    // really, truly
    'tunay': 1.5,       // true, real
    'tunay na': 1.5,    // truly, really
    'totoo': 1.4,       // true
    'totong': 1.4,      // truly
    'literal': 1.5,     // literally
    'literally': 1.5,   // literally
    'lagi': 1.3,        // always
    'palagi': 1.3,      // always
    'mabuti': 1.2,      // good, well
    'siyang': 1.2,      // that
    'kadali': 1.1,      // easily
    'napakamabuti': 1.7, // very good
    'napakasama': 1.7,  // very bad
    'lubos': 1.5,       // completely, thoroughly
    'lubos na': 1.5     // completely, thoroughly
  },
  english: {
    'very': 1.3,
    'really': 1.3,
    'extremely': 1.5,
    'absolutely': 1.5,
    'totally': 1.3,
    'completely': 1.3,
    'so': 1.2,
    'such': 1.2,
    'just': 1.1,
    'incredibly': 1.5,
    'deeply': 1.3,
    'profoundly': 1.3,
    'utterly': 1.5,
    'quite': 1.2,
    'rather': 1.2,
    'somewhat': 0.9,
    'fairly': 1.1,
    'pretty': 1.2,
    'extremely': 1.5,
    'strongly': 1.4
  }
};

/**
 * Negation words that reverse emotion polarity
 */
export const negationWords = {
  tagalog: [
    'hindi', 'hindi ko', 'hindi pa', 'hindi na', 'hindi nang',
    'wala', 'walang', 'wala nang', 'walang nang', 'basta hindi',
    'hindi talaga', 'totoo hindi', 'ayaw', 'ayaw ko', 'ayaw ng',
    'huwag', 'huwag nang', 'meron', 'd', 'di', 'didn\'t',
    'hindi na', 'wala nang', 'ayaw na', 'hindi na ngang',
    'against', 'against ko', 'kontra', 'kontra ko'
  ],
  english: [
    'not', 'never', 'no', 'none', 'neither', 'nobody', 'nothing',
    'nowhere', 'cannot', 'can\'t', 'cant', 'didn\'t', 'did not',
    'don\'t', 'do not', 'doesn\'t', 'does not', 'won\'t', 'will not',
    'wouldn\'t', 'would not', 'shouldn\'t', 'should not',
    'couldn\'t', 'could not', 'isn\'t', 'is not', 'aren\'t',
    'are not', 'wasn\'t', 'was not', 'weren\'t', 'were not',
    'haven\'t', 'has not', 'doesn\'t', 'does not', 'lacking',
    'lack', 'against', 'opposed', 'opposite', 'un-', 'dis-'
  ]
};

/**
 * Get emotion category for a word
 * @param {string} word - Word to check
 * @param {string} language - Language (tagalog or english)
 * @returns {Object|null} Emotion data if found, null otherwise
 */
export const getEmotionForWord = (word, language = 'english') => {
  const lowerWord = word.toLowerCase().trim().replace(/[.,!?;:'"-]/g, '');
  
  for (const [emotion, data] of Object.entries(emotionVocabulary)) {
    const keywords = language === 'tagalog' ? data.tagalog : data.english;
    if (keywords.includes(lowerWord)) {
      return {
        emotion,
        weight: data.weight,
        isFromLanguage: language
      };
    }
  }
  
  return null;
};

/**
 * Get all emotions with their vocabularies for a specific language
 * @param {string} language - Language (tagalog or english)
 * @returns {Object} Emotion keywords for the language
 */
export const getEmotionKeywordsByLanguage = (language = 'english') => {
  const result = {};
  
  for (const [emotion, data] of Object.entries(emotionVocabulary)) {
    result[emotion] = {
      keywords: language === 'tagalog' ? data.tagalog : data.english,
      weight: data.weight
    };
  }
  
  return result;
};

/**
 * Get intensity modifier value
 * @param {string} word - Word to check
 * @param {string} language - Language (tagalog or english)
 * @returns {number} Modifier value (1.0 if not found)
 */
export const getIntensityModifier = (word, language = 'english') => {
  const lowerWord = word.toLowerCase().trim();
  const modifiers = language === 'tagalog' ? intensityModifiers.tagalog : intensityModifiers.english;
  return modifiers[lowerWord] || 1.0;
};

/**
 * Check if word is a negation
 * @param {string} word - Word to check
 * @param {string} language - Language (tagalog or english)
 * @returns {boolean} True if word is negation
 */
export const isNegation = (word, language = 'english') => {
  const lowerWord = word.toLowerCase().trim();
  const negations = language === 'tagalog' ? negationWords.tagalog : negationWords.english;
  return negations.includes(lowerWord);
};

export default emotionVocabulary;
