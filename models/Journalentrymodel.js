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
    defaultValue: 'neutral'
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

