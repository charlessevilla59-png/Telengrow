/*
  Remove Hardcoded Fitness Videos
  Run: node remove_hardcoded_fitness.js
  
  Removes all hardcoded fitness videos from the database.
  Keeps only counselor-uploaded fitness materials.
*/

import { ReadingMaterial, sequelize } from './models/index.js';

async function removeHardcodedFitnessVideos() {
  try {
    await sequelize.sync();
    
    console.log('🗑️  Removing hardcoded fitness videos...\n');

    // List of hardcoded fitness video titles to remove
    const hardcodedTitles = [
      '10-Minute Morning Yoga for Stress Relief',
      'Quick 5-Minute Breathing & Stretching Exercises',
      '15-Minute Home Workout - No Equipment',
      'Walking Meditation for Mental Health',
      'Dance Cardio for Mood Boost',
      'Pilates Core Strength for Better Posture',
      'Evening Relaxation Stretches Before Sleep',
      'HIIT Workout - 20 Minutes Max Intensity'
    ];

    let removedCount = 0;

    for (const title of hardcodedTitles) {
      try {
        const deleted = await ReadingMaterial.destroy({
          where: { 
            title: title,
            category: 'Fitness',
            fileType: 'video'
          }
        });

        if (deleted > 0) {
          console.log(`✅ Removed: ${title}`);
          removedCount++;
        } else {
          console.log(`⏭️  Not found: ${title}`);
        }
      } catch (error) {
        console.error(`❌ Error removing ${title}:`, error.message);
      }
    }

    console.log(`\n✅ Successfully removed ${removedCount} hardcoded fitness videos!`);
    console.log('📝 Only counselor-uploaded fitness materials will now appear.');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

removeHardcodedFitnessVideos();
