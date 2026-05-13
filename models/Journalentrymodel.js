import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";
import { User } from "./userModel.js";

export const JournalEntry = sequelize.define("JournalEntry", {
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: User, key: 'id' }
  },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  mood: { 
    type: DataTypes.ENUM('happy', 'sad', 'anxious', 'calm', 'stressed', 'neutral'),
    defaultValue: 'neutral',
    comment: 'User-selected or AI-detected primary mood'
  },
  // AI-Detected Emotion Analysis Fields
  detectedEmotion: {
    type: DataTypes.ENUM('happy', 'sad', 'anxious', 'calm', 'angry', 'neutral'),
    defaultValue: 'neutral',
    comment: 'AI-detected emotion from journal content'
  },
  emotionConfidence: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0, max: 100 },
    comment: 'AI confidence score (0-100)'
  },
  sentimentScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Overall sentiment score (-100 to 100)'
  },
  emotionScores: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Detailed emotion scores for all emotion types'
  },
  sentimentAnalysis: {
    type: DataTypes.TEXT,
    comment: 'AI-generated analysis description'
  },
  tags: { type: DataTypes.JSON }, // Array of strings
  isPrivate: { type: DataTypes.BOOLEAN, defaultValue: true },
  wordCount: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'journal_entries',
  timestamps: true
});

JournalEntry.belongsTo(User, { foreignKey: 'userId' });
export { sequelize };

