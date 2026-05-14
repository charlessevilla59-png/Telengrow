#!/usr/bin/env node

/*
    Crisis Phrase Detection - Test Suite
    Tests English, Tagalog, and Taglish harmful phrase detection
*/

import { analyzeJournalEmotion, detectCrisisKeywords } from './utils/sentimentAnalysis.js';

console.log('\n' + '='.repeat(80));
console.log('🚨 CRISIS PHRASE DETECTION TEST SUITE 🚨');
console.log('='.repeat(80) + '\n');

const testCases = [
  // ==================== ENGLISH - SELF-HARM / SUICIDE ====================
  {
    text: 'i want to kill myself',
    language: 'English (Self-harm)',
    expectedCrisis: true,
    expectedSeverity: 'high'
  },
  {
    text: 'i want to die',
    language: 'English (Suicide)',
    expectedCrisis: true,
    expectedSeverity: 'high'
  },
  {
    text: 'i want to end it all',
    language: 'English (Suicide)',
    expectedCrisis: true,
    expectedSeverity: 'high'
  },
  {
    text: 'no point living anymore',
    language: 'English (Hopelessness)',
    expectedCrisis: true,
    expectedSeverity: 'medium'
  },
  {
    text: 'better off dead',
    language: 'English (Suicidal ideation)',
    expectedCrisis: true,
    expectedSeverity: 'medium'
  },
  {
    text: 'hurt myself badly',
    language: 'English (Self-harm)',
    expectedCrisis: true,
    expectedSeverity: 'high'
  },

  // ==================== TAGALOG - SELF-HARM / SUICIDE ====================
  {
    text: 'gusto ko mamamatay na',
    language: 'Tagalog (Suicide)',
    expectedCrisis: true,
    expectedSeverity: 'high'
  },
  {
    text: 'ayaw ko nang buhay',
    language: 'Tagalog (Life rejection)',
    expectedCrisis: true,
    expectedSeverity: 'medium'
  },
  {
    text: 'walang pag-asa na',
    language: 'Tagalog (Hopelessness)',
    expectedCrisis: true,
    expectedSeverity: 'medium'
  },
  {
    text: 'gusto ko maging alaala na lang',
    language: 'Tagalog (Suicide ideation)',
    expectedCrisis: true,
    expectedSeverity: 'high'
  },

  // ==================== TAGLISH - MIXED ====================
  {
    text: 'i want to kill myself talaga',
    language: 'Taglish (Self-harm)',
    expectedCrisis: true,
    expectedSeverity: 'high'
  },
  {
    text: 'gusto ko na ng end it all',
    language: 'Taglish (Mixed)',
    expectedCrisis: true,
    expectedSeverity: 'high'
  },
  {
    text: 'hindi ko na kaya, want to die',
    language: 'Taglish (Mixed)',
    expectedCrisis: true,
    expectedSeverity: 'high'
  },

  // ==================== NORMAL JOURNAL ENTRIES (No Crisis) ====================
  {
    text: 'i had a bad day but im okay now',
    language: 'English (Normal)',
    expectedCrisis: false,
    expectedSeverity: 'none'
  },
  {
    text: 'ayaw ko ng steak today, mas gusto ko chicken',
    language: 'Taglish (Normal preference)',
    expectedCrisis: false,
    expectedSeverity: 'none'
  },
  {
    text: 'hahaha im so happy today',
    language: 'English (Happy)',
    expectedCrisis: false,
    expectedSeverity: 'none'
  }
];

let passed = 0;
let failed = 0;

console.log('Running crisis detection tests...\n');

for (let i = 0; i < testCases.length; i++) {
  const test = testCases[i];
  const result = analyzeJournalEmotion(test.text);
  
  const crisisDetected = result.crisis.isCrisis;
  const severityMatch = result.crisis.severity === test.expectedSeverity;
  const pass = crisisDetected === test.expectedCrisis && 
               (test.expectedCrisis === false || severityMatch);
  
  const status = pass ? '✅ PASS' : '❌ FAIL';
  
  console.log(`${status} [${i + 1}/${testCases.length}] ${test.language}`);
  console.log(`    Text: "${test.text}"`);
  console.log(`    Expected Crisis: ${test.expectedCrisis}, Got: ${crisisDetected}`);
  
  if (test.expectedCrisis) {
    console.log(`    Expected Severity: ${test.expectedSeverity}, Got: ${result.crisis.severity}`);
    if (crisisDetected) {
      console.log(`    Keywords Detected: ${result.crisis.keywords.join(', ')}`);
      console.log(`    Message: ${result.crisis.message}`);
    }
  }
  
  console.log(`    Primary Emotion: ${result.primaryEmotion}`);
  console.log('');
  
  if (pass) {
    passed++;
  } else {
    failed++;
  }
}

console.log('='.repeat(80));
console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED out of ${testCases.length}`);
console.log('='.repeat(80) + '\n');

if (failed === 0) {
  console.log('🎉 All tests passed! Crisis detection system working correctly.');
} else {
  console.log(`⚠️  ${failed} test(s) failed. Please review the detection logic.`);
}
