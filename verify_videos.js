import { sequelize } from './models/db.js';
import ReadingMaterialModel from './models/ReadingMaterialModel.js';

// Initialize the model
const ReadingMaterial = ReadingMaterialModel(sequelize);

sequelize.sync().then(async () => {
  const videos = await ReadingMaterial.findAll({
    where: { fileType: 'video' },
    attributes: ['id', 'title', 'category', 'fileType', 'videoUrl', 'videoDuration']
  });
  console.log('📹 Fitness Videos in Database:');
  console.log('===================================');
  videos.forEach((v, idx) => {
    console.log(`${idx+1}. ${v.title}`);
    console.log(`   Type: ${v.fileType} | Duration: ${v.videoDuration}s (${Math.round(v.videoDuration/60)}m)`);
    console.log(`   Category: ${v.category}`);
    console.log(`   URL: ${v.videoUrl}`);
    console.log();
  });
  console.log(`Total Videos: ${videos.length}`);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
