/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import { DataTypes } from "sequelize";

export default (sequelize) => {
  const CommentReaction = sequelize.define("CommentReaction", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    commentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "reading_material_comments",
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
    emoji: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Emoji reaction (👍, ❤️, 😂, 😮, 😢, 😡, etc.)"
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: "comment_reactions",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["commentId", "userId", "emoji"]
      }
    ]
  });

  return CommentReaction;
};
