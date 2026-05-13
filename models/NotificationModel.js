/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const Notification = sequelize.define("Notification", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  conversationId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Allow null for mood_alert type
    references: {
      model: 'conversations',
      key: 'id'
    }
  },
  messageId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Allow null for mood_alert type
    references: {
      model: 'messages',
      key: 'id'
    }
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Allow null for system-generated mood_alert
    references: {
      model: 'users',
      key: 'id'
    }
  },
  senderName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  messagePreview: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  notificationType: {
    type: DataTypes.ENUM('new_message', 'conversation_started', 'mood_alert'),
    defaultValue: 'new_message'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'notifications',
  timestamps: true
});
