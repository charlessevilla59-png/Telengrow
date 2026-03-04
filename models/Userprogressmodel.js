import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";
import { User } from "./userModel.js";

export const UserProgress = sequelize.define("UserProgress", {
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    unique: true,
    references: { model: User, key: 'id' }
  },
  totalGamesPlayed: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalJournalEntries: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalPoints: { type: DataTypes.INTEGER, defaultValue: 0 },
  currentStreak: { type: DataTypes.INTEGER, defaultValue: 0 },
  longestStreak: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastActivityDate: { type: DataTypes.DATE },
  level: { 
    type: DataTypes.ENUM('beginner', 'intermediate', 'pro', 'master'),
    defaultValue: 'beginner'
  },
  
  // Game Stats stored as JSON
  breathingBubbleStats: { type: DataTypes.JSON, defaultValue: {} },
  colorTapStats: { type: DataTypes.JSON, defaultValue: {} },
  gridMemoryStats: { type: DataTypes.JSON, defaultValue: {} },
  stressBallStats: { type: DataTypes.JSON, defaultValue: {} },
  
  
  achievements: { type: DataTypes.JSON, defaultValue: [] }
});

UserProgress.belongsTo(User, { foreignKey: 'userId' });

// Hook to calculate level based on points
UserProgress.beforeSave((progress) => {
  if (progress.totalPoints >= 5000) {
    progress.level = 'master';
  } else if (progress.totalPoints >= 2000) {
    progress.level = 'pro';
  } else if (progress.totalPoints >= 500) {
    progress.level = 'intermediate';
  } else {
    progress.level = 'beginner';
  }
});

export { sequelize };