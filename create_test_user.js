/*
  Create Test User Script
  Run: node create_test_user.js
*/

import bcrypt from 'bcrypt';
import { User, UserProgress, sequelize } from './models/index.js';

async function createTestUser() {
  try {
    await sequelize.sync();
    
    const email = 'toy@gmail.com';
    const password = 'test123';
    const name = 'Toy User';
    
    // Check if user exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log('❌ User already exists:', email);
      console.log('User details:', {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        role: existing.role,
        accountStatus: existing.accountStatus
      });
      process.exit(0);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      accountStatus: 'active'
    });
    
    // Create user progress
    await UserProgress.create({
      userId: user.id,
      totalGamesPlayed: 0,
      totalJournalEntries: 0,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      level: 'beginner',
      breathingBubbleStats: {},
      colorTapStats: {},
      gridMemoryStats: {},
      stressBallStats: {},
      achievements: []
    });
    
    console.log('✅ Test user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', user.role);
    console.log('Status:', user.accountStatus);
    console.log('\nYou can now login with these credentials.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();
