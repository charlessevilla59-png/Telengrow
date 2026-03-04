import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";
import { User } from "./userModel.js";

export const GameSession = sequelize.define("GameSession", {
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: User, key: 'id' }
  },
  gameType: { 
    type: DataTypes.ENUM('breathing-bubble', 'color-tap', 'grid-memory', 'stress-ball', 'gratitude-jar', 'affirmation-cards', 'zen-garden', 'puzzle-therapy'),
    allowNull: false 
  },
  startTime: { type: DataTypes.DATE },
  endTime: { type: DataTypes.DATE },
  duration: { type: DataTypes.INTEGER }, // seconds
  difficulty: { 
    type: DataTypes.ENUM('easy', 'medium', 'hard', 'expert'),
    defaultValue: 'easy'
  },
  score: { type: DataTypes.INTEGER, defaultValue: 0 },
  points: { type: DataTypes.INTEGER, defaultValue: 0 },
  performanceLevel: { 
    type: DataTypes.ENUM('beginner', 'intermediate', 'pro'),
    defaultValue: 'beginner'
  },
  accuracy: { type: DataTypes.FLOAT },
  speed: { type: DataTypes.FLOAT },
  consistency: { type: DataTypes.FLOAT },
  mistakes: { type: DataTypes.INTEGER, defaultValue: 0 },
  completed: { type: DataTypes.BOOLEAN, defaultValue: false }
});

GameSession.belongsTo(User, { foreignKey: 'userId' });
export { sequelize };