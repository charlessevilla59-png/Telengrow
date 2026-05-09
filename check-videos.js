import { ReadingMaterial, User } from './models/index.js';

async function checkVideos() {
  try {
    console.log('\n========================================');
    console.log('📊 CHECKING ALL VIDEO MATERIALS');
    console.log('========================================\n');
    
    // Get ALL video materials (no filters)
    const allVideos = await ReadingMaterial.findAll({
      where: { fileType: 'video' },
      include: [{ model: User, as: 'counselor', attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Total Videos Created: ${allVideos.length}`);
    console.log('');
    
    allVideos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   ID: ${video.id}`);
      console.log(`   Category: ${video.category}`);
      console.log(`   Type: ${video.fileType}`);
      console.log(`   Published: ${video.isPublished ? '✅ YES' : '❌ NO (DRAFT)'}`);
      console.log(`   File Path: ${video.filePath || 'N/A'}`);
      console.log(`   Video URL: ${video.videoUrl ? 'Yes' : 'No'}`);
      console.log(`   Created: ${video.createdAt}`);
      console.log(`   Views: ${video.views}`);
      console.log(`   Counselor: ${video.counselor?.name || 'N/A'}`);
      console.log('');
    });
    
    console.log('\n========================================');
    console.log('📍 CHECKING FITNESS CATEGORY VIDEOS');
    console.log('========================================\n');
    
    // Get FITNESS category videos
    const fitnessVideos = await ReadingMaterial.findAll({
      where: { 
        fileType: 'video',
        category: 'Fitness',
        isPublished: true
      },
      include: [{ model: User, as: 'counselor', attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Fitness Videos (Published): ${fitnessVideos.length}`);
    console.log('');
    
    fitnessVideos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   Published: ✅ YES`);
      console.log(`   File: ${video.filePath ? '📁 Local File' : '🎥 YouTube'}`);
      console.log('');
    });
    
    console.log('\n========================================');
    console.log('⚠️  CHECKING UNPUBLISHED OR UNCATEGORIZED');
    console.log('========================================\n');
    
    // Get videos that might be hidden
    const hiddenVideos = await ReadingMaterial.findAll({
      where: { fileType: 'video' },
      include: [{ model: User, as: 'counselor', attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });
    
    const problemVideos = hiddenVideos.filter(v => !v.isPublished || v.category !== 'Fitness');
    
    if (problemVideos.length > 0) {
      console.log(`Found ${problemVideos.length} videos with issues:\n`);
      problemVideos.forEach((video) => {
        console.log(`❌ ${video.title}`);
        if (!video.isPublished) console.log(`   Issue: NOT PUBLISHED (Draft)`);
        if (video.category !== 'Fitness') console.log(`   Issue: Category is "${video.category}" (not "Fitness")`);
        console.log('');
      });
    } else {
      console.log('✅ All videos are properly published and categorized!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkVideos();
