/**
 * DEMO MODE - Generates fake emotions for testing when models can't load
 */

console.log('🎭 Demo mode module ready');

// Override detectEmotion to use demo emotions when in demo mode
const originalDetectEmotion = detectEmotion;

async function detectEmotion() {
  // Check if we're in demo mode
  if (window.isDemoMode || window.modelsLoaded === 'demo') {
    // In demo mode, generate random emotions
    const demoEmotion = generateDemoEmotion();
    
    currentDetectedEmotion = {
      emotion: demoEmotion.emotion,
      confidence: demoEmotion.confidence
    };
    
    console.log(`🎭 Demo: ${demoEmotion.emotion} (${demoEmotion.confidence}%)`);
    
    // Display the emotion
    if (typeof updateEmotionDisplay === 'function') {
      updateEmotionDisplay(currentDetectedEmotion);
    }
    
    return;
  }
  
  // Otherwise use real detection
  return originalDetectEmotion.call(this);
}

console.log('✅ Demo mode detection ready');

