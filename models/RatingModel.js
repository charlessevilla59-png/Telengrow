/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Rating = sequelize.define('Rating', {
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
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      },
      comment: 'Rating from 1 to 5 stars'
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Optional review text'
    }
  }, {
    tableName: 'ratings',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'materialId']
      }
    ]
  });

  return Rating;
};
