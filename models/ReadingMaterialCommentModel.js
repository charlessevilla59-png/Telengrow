/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ReadingMaterialComment = sequelize.define("ReadingMaterialComment", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "reading_materials",
        key: "id"
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      }
    },
    parentCommentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "reading_material_comments",
        key: "id"
      },
      comment: "For nested replies"
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    editedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isHidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
    tableName: "reading_material_comments",
    timestamps: true
  });

  return ReadingMaterialComment;
};
