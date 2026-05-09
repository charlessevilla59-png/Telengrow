import bcrypt from 'bcrypt';
import { sequelize } from './models/db.js';
import './models/index.js';
import { User } from './models/userModel.js';
import { UserProgress } from './models/Userprogressmodel.js';

async function createAccounts() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const counselorPassword = await bcrypt.hash('counselor123', 10);

    // Create Admin Account
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@telengrow.com',
      password: adminPassword,
      role: 'admin',
      accountStatus: 'active',
      authProvider: 'local'
    });
    console.log('✅ Admin account created:');
    console.log('   Email: admin@telengrow.com');
    console.log('   Password: admin123');

    // Create UserProgress for Admin
    await UserProgress.create({
      userId: admin.id,
      totalGamesPlayed: 0,
      totalJournalEntries: 0,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      level: 'beginner'
    });

    // Create Counselor Account
    const counselor = await User.create({
      name: 'Counselor User',
      email: 'counselor@telengrow.com',
      password: counselorPassword,
      role: 'counselor',
      accountStatus: 'active',
      authProvider: 'local'
    });
    console.log('✅ Counselor account created:');
    console.log('   Email: counselor@telengrow.com');
    console.log('   Password: counselor123');

    // Create UserProgress for Counselor
    await UserProgress.create({
      userId: counselor.id,
      totalGamesPlayed: 0,
      totalJournalEntries: 0,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      level: 'beginner'
    });

    console.log('\n✅ All accounts created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating accounts:', err.message);
    process.exit(1);
  }
}

createAccounts();
