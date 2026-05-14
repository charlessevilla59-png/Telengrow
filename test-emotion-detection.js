/*
    Test Emotion Detection - Verify fixes for Tagalog, Taglish, and Laughter
    Run with: node test-emotion-detection.js
*/

import { analyzeJournalEmotion } from './utils/sentimentAnalysis.js';

console.log('='.repeat(80));
console.log('🧪 EMOTION DETECTION TEST SUITE'.padEnd(80));
console.log('='.repeat(80));

const testCases = [
  {
    input: 'hahaha',
    expectedEmotion: 'happy',
    description: 'Laughter pattern - should detect as HAPPY'
  },
  {
    input: 'ayaw ko na',
    expectedEmotion: 'sad',
    description: 'Tagalog rejection - should detect as SAD'
  },
  {
    input: 'nakakainis',
    expectedEmotion: 'angry',
    description: 'Tagalog annoyance - should detect as ANGRY'
  },
  {
    input: 'hehehe napakasaya',
    expectedEmotion: 'happy',
    description: 'Mixed laughter + Tagalog happy - should detect as HAPPY'
  },
  {
    input: 'nakakabwisit talaga',
    expectedEmotion: 'angry',
    description: 'Tagalog irritation - should detect as ANGRY'
  },
  {
    input: 'lol amazing!!!',
    expectedEmotion: 'happy',
    description: 'English lol + positive + exclamation - should detect as HAPPY'
  },
  {
    input: 'ayaw ko na talaga ng buhay',
    expectedEmotion: 'sad',
    description: 'Strong Tagalog rejection - should detect as SAD'
  },
  {
    input: 'rofl hahaha',
    expectedEmotion: 'happy',
    description: 'Multiple laughter patterns - should detect as HAPPY'
  },
  {
    input: 'galit na galit',
    expectedEmotion: 'angry',
    description: 'Tagalog anger phrase - should detect as ANGRY'
  },
  {
    input: 'napakasaya akong ngayon',
    expectedEmotion: 'happy',
    description: 'Tagalog happiness phrase - should detect as HAPPY'
  }
];

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  console.log(`\n📝 Test ${index + 1}: ${test.description}`);
  console.log(`   Input: "${test.input}"`);
  
  const result = analyzeJournalEmotion(test.input);
  
  console.log(`   Expected Emotion: ${test.expectedEmotion}`);
  console.log(`   Detected Emotion: ${result.primaryEmotion}`);
  console.log(`   Confidence: ${result.confidence}%`);
  console.log(`   Sentiment: ${result.sentiment}`);
  console.log(`   Scores:`, result.emotionScores);
  
  const isCorrect = result.primaryEmotion === test.expectedEmotion;
  const hasConfidence = result.confidence > 30;
  
  if (isCorrect && hasConfidence) {
    console.log(`   ✅ PASSED`);
    passed++;
  } else {
    console.log(`   ❌ FAILED`);
    failed++;
  }
});

console.log('\n' + '='.repeat(80));
console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED out of ${testCases.length}`);
console.log(`Success Rate: ${Math.round((passed / testCases.length) * 100)}%`);
console.log('='.repeat(80));

if (failed === 0) {
  console.log('✅ All tests passed! Emotion detection is working correctly.');
  process.exit(0);
} else {
  console.log(`⚠️ ${failed} test(s) failed. Check the output above.`);
  process.exit(1);
}
