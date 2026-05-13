import bcrypt from 'bcrypt';
import { User } from './models/userModel.js';
import { sequelize } from './models/db.js';

async function createTestUser() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const hashedPassword = await bcrypt.hash('Test123456', 10);
    
    const user = await User.create({
      name: 'Test Student',
      email: 'testmood@example.com',
      password: hashedPassword,
      role: 'user', // Role is 'user' for students based on model
      accountStatus: 'active'
    });

    console.log('User created:', user.email);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestUser();
