/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines

    Mood Entry Model - Stores face-recognized emotion data
*/

import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const MoodEntry = sequelize.define("MoodEntry", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  detectedEmotion: {
    type: DataTypes.ENUM(
      'neutral',
      'happy',
      'sad',
      'angry',
      'fearful',
      'disgusted',
      'surprised',
      'anxious'
    ),
    allowNull: false,
    comment: "Primary emotion detected by face recognition"
  },
  emotionConfidence: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: "Confidence percentage of emotion detection (0-100)"
  },
  userConfirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: "Whether the user confirmed the detected emotion"
  },
  userResponse: {
    type: DataTypes.ENUM('yes', 'no'),
    allowNull: true,
    comment: "User's response - yes or no to the detected emotion"
  },
  userNote: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "Optional note from user about their mood"
  },
  activitiesSuggested: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: "Suggested activities based on detected emotion"
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  tableName: 'moodentries',
  timestamps: true
});

export default MoodEntry;
