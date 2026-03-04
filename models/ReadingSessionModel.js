import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";
import { User } from "./userModel.js";

export const ReadingSession = sequelize.define("ReadingSession", {
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  materialId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: 'reading_materials', key: 'id' }
  },
  startTime: { 
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  endTime: { 
    type: DataTypes.DATE,
    allowNull: true
  },
  duration: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0,
    comment: 'Duration in seconds'
  },
  completed: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  }
}, {
  tableName: 'reading_sessions',
  timestamps: true
});

// Associations will be set up in models/index.js
export { sequelize };
