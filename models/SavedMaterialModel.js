/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const SavedMaterial = sequelize.define('SavedMaterial', {
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
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'reading_materials',
        key: 'id'
      }
    }
  }, {
    tableName: 'saved_materials',
    timestamps: true,
    createdAt: 'savedAt',
    updatedAt: false
  });

  return SavedMaterial;
};
