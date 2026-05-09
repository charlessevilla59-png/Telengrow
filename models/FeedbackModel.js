import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

const Feedback = sequelize.define("Feedback", {
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
  type: {
    type: DataTypes.ENUM("feedback", "bug_report", "feature_request", "complaint"),
    defaultValue: "feedback",
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("new", "read", "in_progress", "resolved"),
    defaultValue: "new",
    allowNull: false,
  },
  adminResponse: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  responseDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default Feedback;
