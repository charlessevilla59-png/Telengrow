/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ReadingMaterial = sequelize.define('ReadingMaterial', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    counselorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    fileType: {
      type: DataTypes.ENUM('article', 'pdf', 'document'),
      defaultValue: 'article'
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    readingTime: {
      type: DataTypes.INTEGER,
      defaultValue: 5
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'reading_materials',
    timestamps: true
  });

  return ReadingMaterial;
};
