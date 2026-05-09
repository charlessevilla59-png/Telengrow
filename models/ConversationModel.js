/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const Conversation = sequelize.define("Conversation", {
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
  counselorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  lastMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lastMessageSenderId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  lastMessageTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  userLastReadAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  counselorLastReadAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('active', 'closed', 'archived'),
    defaultValue: 'active'
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
  tableName: 'conversations',
  timestamps: true
});
