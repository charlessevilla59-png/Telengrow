/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines

    Tagalog Text Enhancement - Enhances and improves Tagalog journal entries
*/

/**
 * Common Tagalog corrections and improvements
 */
const tagalogCorrections = {
  // Slang/informal to formal
  'yun': 'yoon',
  'yan': 'yan',
  'dito': 'dito',
  'dyan': 'doon',
  'kaya': 'kaya',
  'kase': 'kasi',
  'd': 'hindi',
  'di': 'hindi',
  'wla': 'wala',
  'walang': 'walang',
  'ok': 'okay',
  'tapos': 'tapos na',
  'sabi': 'sabi niya',
  'sabing': 'sinabi na',
  
  // Common typos
  'masya': 'masaya',
  'malungkod': 'malungkot',
  'lungkod': 'lungkot',
  'iniwan': 'iniwan',
  'hirap': 'mahirap',
  'mga': 'mga',
  'ang': 'ang',
  'sa': 'sa',
  'ng': 'ng',
  
  // Double consonants
  'ff': 'f',
  'ss': 's',
  'tt': 't',
  'pp': 'p',
  'dd': 'd',
  'gg': 'g',
  'bb': 'b'
};

/**
 * Tagalog sentence structure suggestions
 */
const tagalogPhrases = {
  starting: [
    'Ang aking araw ay nagsimula',
    'Naramdaman ko na',
    'Ngayong araw, ako ay',
    'Kasama ang aking mga kaibigan',
    'Sa aking mga iniisip',
    'Ang totoo ay'
  ],
  improvements: [
    'Mas mahusay na pagsasalita',
    'Mas malinaw na pag-iisip',
    'Mas malalim na pag-unawa'
  ]
};

/**
 * Common filler words and phrases in Tagalog
 */
const fillerWords = ['eh', 'ano', 'hmm', 'ehhh', 'kaya', 'diba', 'parang', 'kumbabang'];

/**
 * Enhance Tagalog text - improves grammar and clarity
 * @param {string} text - Tagalog text to enhance
 * @returns {Object} Enhanced text with suggestions
 */
export const enhanceTagalogText = (text) => {
  if (!text || text.trim().length === 0) {
    return {
      original: text,
      enhanced: text,
      suggestions: [],
      improvements: []
    };
  }

  let enhanced = text;
  const suggestions = [];
  const improvements = [];

  // 1. Fix common typos and slang
  for (const [slang, formal] of Object.entries(tagalogCorrections)) {
    const regex = new RegExp(`\\b${slang}\\b`, 'gi');
    if (regex.test(enhanced)) {
      suggestions.push(`Mataas na aksyon: Magpalit ng "${slang}" sa "${formal}"`);
      enhanced = enhanced.replace(regex, formal);
    }
  }

  // 2. Detect and improve filler words
  let fillerCount = 0;
  fillerWords.forEach(filler => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = enhanced.match(regex);
    if (matches) {
      fillerCount += matches.length;
    }
  });

  if (fillerCount > 2) {
    suggestions.push(`💡 Napansin: Maraming filler words. Subukang gumamit ng mas direktang wording para sa mas malinaw na mensahe.`);
  }

  // 3. Suggest better phrasing for common patterns
  if (text.toLowerCase().includes('parang')) {
    improvements.push('Gumamit ng mas tukoy na pagwawamit sa halip na "parang"');
  }

  // 4. Check for run-on sentences (very long sentences without punctuation)
  const sentences = text.split(/[.!?]/);
  sentences.forEach((sentence, index) => {
    const words = sentence.trim().split(/\s+/).length;
    if (words > 30) {
      suggestions.push(`⚠️ Pangungusap ${index + 1} ay napakahaba. Subukan ninyong hatiin ito sa mas maliit na pangungusap para sa mas madaling pagbasa.`);
    }
  });

  // 5. Capitalization check
  const lines = enhanced.split('\n');
  lines.forEach((line, index) => {
    if (line.trim().length > 0 && line.trim()[0] === line.trim()[0].toLowerCase() && index === 0) {
      enhanced = enhanced.substring(0, 1).toUpperCase() + enhanced.substring(1);
      suggestions.push('✅ Unang titik na capitalized');
    }
  });

  // 6. Proper spacing after punctuation
  enhanced = enhanced.replace(/([.!?])([A-Za-z])/g, '$1 $2');

  // 7. Remove extra spaces
  enhanced = enhanced.replace(/  +/g, ' ');

  // 8. Paragraph improvement suggestions
  if (text.length < 50) {
    improvements.push('💭 Subukan ninyong palawakin ang inyong entry para mas malinaw ang inyong damdaman.');
  } else if (text.length > 2000) {
    improvements.push('📝 Ang entry ay medyo mahabang-mahaba. Isaalang-alang na bawasan o hatiin ito para sa mas madaling pagbasa.');
  } else if (text.split(/[.!?]/).length < 3) {
    improvements.push('💬 Magdagdag ng mas maraming detalye at iniisip para sa mas kompletuong entry.');
  }

  // 9. Emotion expression enhancement
  const emotionPhrases = {
    'masaya': 'napakagandang pakiramdam',
    'malungkot': 'malalim na kalooban',
    'takot': 'pananakot na damdaman',
    'galit': 'mataas na emosyon',
    'kalmado': 'mapayagang isip'
  };

  for (const [emotion, enhanced_phrase] of Object.entries(emotionPhrases)) {
    if (text.toLowerCase().includes(emotion)) {
      improvements.push(`✨ Higit pang ganda: Ang "${emotion}" ay maaaring isulat bilang "${enhanced_phrase}" para sa mas makabuluhang kahulugan.`);
    }
  }

  return {
    original: text,
    enhanced: enhanced.trim(),
    suggestions: suggestions.slice(0, 5), // Limit to 5 suggestions
    improvements: improvements.slice(0, 5), // Limit to 5 improvements
    stats: {
      originalLength: text.length,
      enhancedLength: enhanced.trim().length,
      words: enhanced.trim().split(/\s+/).length,
      sentences: enhanced.split(/[.!?]/).filter(s => s.trim().length > 0).length
    }
  };
};

/**
 * Get Tagalog writing tips based on content
 * @param {string} text - Journal text
 * @returns {Array} Array of helpful tips
 */
export const getTagalogWritingTips = (text) => {
  const tips = [];

  if (!text || text.trim().length === 0) {
    tips.push('🖊️ Simulan ang pagsusulat ng inyong mga damdaman at karanasan.');
    return tips;
  }

  // Check for dialog
  if (text.includes('"') || text.includes('"')) {
    tips.push('💬 Magandang gumamit ng dialogue. Siguraduhin ang tamang punctuation sa paligid.');
  }

  // Check for descriptions
  if (text.match(/kulay|malaki|maliit|malamig|mainit|malambot|matigas/gi)) {
    tips.push('🎨 Magandang paglalarawan! Patuloy na gumamit ng descriptive words.');
  }

  // Check for reflective content
  if (text.match(/naisip ko|naramdaman ko|natutunan ko|napagsisihan ko/gi)) {
    tips.push('🧠 Maganda ang inyong reflective thinking. Ito ay nagpapakita ng malalim na pag-iisip.');
  }

  // Check for action words
  if (!text.match(/ginawa|gumawa|lumakad|bumili|kumain/gi)) {
    tips.push('🎯 Subukan ninyong magdagdag ng action words para mas buhay na maging ang inyong kwento.');
  }

  // Length based tip
  const words = text.split(/\s+/).length;
  if (words < 50) {
    tips.push('📝 Ang entry ay medyo maigsi. Dagdagan ang detalye para mas makabuluhan.');
  }

  // Paragraph structure
  const paragraphs = text.split('\n').filter(p => p.trim().length > 0).length;
  if (paragraphs > 5) {
    tips.push('📰 Maraming paragraphe! Magandang strukturado ang inyong entry.');
  }

  // Emotion expression
  if (text.match(/masaya|malungkot|excited|nervous|takot|proud/gi)) {
    tips.push('❤️ Magandang nagsalita kayo ng inyong emosyon. Ito ay importante sa journaling.');
  }

  return tips;
};

/**
 * Suggest Tagalog writing prompts based on emotion
 * @param {string} emotion - Detected emotion
 * @param {string} language - Text language
 * @returns {Array} Array of writing prompts
 */
export const getWritingPrompts = (emotion, language = 'english') => {
  const tagalogPrompts = {
    happy: [
      'Alin ang nagpasaya sa inyong araw?',
      'Sino ang nakatulong sa inyong kaligayahan?',
      'Paano nyo ipakikita ang pasasalamat ninyo?',
      'Anong sandali ang hindi ninyo makakalimutan?'
    ],
    sad: [
      'Ano ang nakaursang lungkot sa inyong puso?',
      'Sino ang maaari ninyong pagkatiwalaan sa panahon ng kalungkutan?',
      'Paano kayo makakaharap sa paghihintay ng ginhawa?',
      'Ano ang inyong inaasahan sa kinabukasan?'
    ],
    anxious: [
      'Ano ang nagdudulot sa inyo ng alala?',
      'Paano kayo makakapag-stay calm sa ganitong oras?',
      'Sino ang maaari ninyong kontakin para sa suporta?',
      'Ano ang positibong aspeto ng sitwasyon?'
    ],
    angry: [
      'Ano ang nakakasakit sa inyong damdaman?',
      'Paano kayo makakahanap ng kapayapaan?',
      'Ano ang inyong gustong mangyari?',
      'Paano kayo makakatulong sa sarili nyo na umayos?'
    ],
    calm: [
      'Alin ang nagbibigay sa inyo ng kapayapaan?',
      'Paano ninyo mai-eenjoy ang sandaling ito?',
      'Ano ang naprendahan nyo mula sa katahimikan?',
      'Paano ninyo ibabahagi ang inyong kapayapaan?'
    ]
  };

  const englishPrompts = {
    happy: [
      'What made you smile today?',
      'Who made your day special?',
      'How will you celebrate this feeling?',
      'What moment will you never forget?'
    ],
    sad: [
      'What is weighing on your heart?',
      'Who can you turn to for support?',
      'What brings you hope?',
      'What do you wish could change?'
    ],
    anxious: [
      'What is causing you worry?',
      'How can you find calm?',
      'Who can help you through this?',
      'What is the silver lining?'
    ],
    angry: [
      'What hurt you today?',
      'How can you find peace?',
      'What do you need right now?',
      'How can you help yourself heal?'
    ],
    calm: [
      'What brings you peace?',
      'How can you savor this moment?',
      'What did you learn today?',
      'How will you share this calmness?'
    ]
  };

  const prompts = language === 'tagalog' ? tagalogPrompts : englishPrompts;
  return prompts[emotion] || [];
};

export default {
  enhanceTagalogText,
  getTagalogWritingTips,
  getWritingPrompts
};
