/*
  Create Fitness Video Tips
  Run: node create_fitness_videos.js
  
  Adds video fitness tips that counselors can share with users
*/

import { User, ReadingMaterial, sequelize } from './models/index.js';

// ✅ Hard-coded fitness videos have been removed
// Counselors can now create custom fitness materials through the admin panel
const fitnessVideos = [];

async function createFitnessVideos() {
  try {
    await sequelize.sync();
    
    console.log('🎥 Creating Fitness Video Tips...\n');

    // Find counselor user (usually first admin or counselor)
    let counselor = await User.findOne({ where: { role: 'counselor' } });
    if (!counselor) {
      // If no counselor exists, find admin
      counselor = await User.findOne({ where: { role: 'admin' } });
    }
    if (!counselor) {
      // If no admin/counselor, use first user
      counselor = await User.findOne();
    }

    if (!counselor) {
      console.error('❌ No users found. Please create a user first.');
      process.exit(1);
    }

    console.log(`Using counselor: ${counselor.name} (${counselor.email})\n`);

    let createdCount = 0;

    for (const video of fitnessVideos) {
      try {
        // Check if already exists
        const existing = await ReadingMaterial.findOne({ where: { slug: video.slug } });
        if (existing) {
          console.log(`⏭️  Skipped (already exists): ${video.title}`);
          continue;
        }

        // Create video material
        const created = await ReadingMaterial.create({
          counselorId: counselor.id,
          title: video.title,
          slug: video.slug,
          category: video.category,
          excerpt: video.excerpt,
          content: `Video: ${video.title} - Watch to learn about this fitness topic.`,
          fileType: video.fileType,
          videoUrl: video.videoUrl,
          videoDuration: video.videoDuration,
          isPublished: video.isPublished,
          readingTime: Math.ceil(video.videoDuration / 60) // Convert to minutes
        });

        console.log(`✅ Created: ${video.title}`);
        console.log(`   URL: ${video.videoUrl}`);
        console.log(`   Duration: ${Math.ceil(video.videoDuration / 60)} minutes\n`);
        createdCount++;

      } catch (error) {
        console.error(`❌ Error creating ${video.title}:`, error.message);
      }
    }

    console.log(`\n✅ Created ${createdCount}/${fitnessVideos.length} fitness video tips!`);
    console.log('🎥 Videos are ready for users to watch in the Fitness section.');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating fitness videos:', error);
    process.exit(1);
  }
}

createFitnessVideos();
