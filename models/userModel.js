/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
    // Removed 'unique: true' here - manage UNIQUE constraint in database migration instead
    // This prevents Sequelize from trying to recreate the index
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true  // Allow null for Google/OAuth users
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: true
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: true
  },
  placeOfBirth: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nationality: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sex: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  civilStatus: {
    type: DataTypes.STRING,
    allowNull: true
  },
  religion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  course: {
    type: DataTypes.STRING,
    allowNull: true
  },
  year: {
    type: DataTypes.STRING,
    allowNull: true
  },
  section: {
    type: DataTypes.STRING,
    allowNull: true
  },
  currentAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  permanentAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contactNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emailAlternate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lgbtqia: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lgbtqiaSpecify: {
    type: DataTypes.STRING,
    allowNull: true
  },
  indigenousGroup: {
    type: DataTypes.STRING,
    allowNull: true
  },
  indigenousGroupName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  personWithDisability: {
    type: DataTypes.STRING,
    allowNull: true
  },
  disabilityType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fatherName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  motherName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fatherOccupation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  motherOccupation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  parentsStatus: {
    type: DataTypes.JSON,
    allowNull: true
  },
  familyIncome: {
    type: DataTypes.JSON,
    allowNull: true
  },
  emergencyContactName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emergencyContactRelation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emergencyContactAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  emergencyContactNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emergencyContactEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  elementarySchool: {
    type: DataTypes.STRING,
    allowNull: true
  },
  elementaryDates: {
    type: DataTypes.STRING,
    allowNull: true
  },
  elementaryHonors: {
    type: DataTypes.STRING,
    allowNull: true
  },
  juniorHighSchool: {
    type: DataTypes.STRING,
    allowNull: true
  },
  juniorDates: {
    type: DataTypes.STRING,
    allowNull: true
  },
  juniorHonors: {
    type: DataTypes.STRING,
    allowNull: true
  },
  seniorHighSchool: {
    type: DataTypes.STRING,
    allowNull: true
  },
  seniorDates: {
    type: DataTypes.STRING,
    allowNull: true
  },
  seniorHonors: {
    type: DataTypes.STRING,
    allowNull: true
  },
  vocationalCourse: {
    type: DataTypes.STRING,
    allowNull: true
  },
  vocationalDates: {
    type: DataTypes.STRING,
    allowNull: true
  },
  vocationalHonors: {
    type: DataTypes.STRING,
    allowNull: true
  },
  collegeName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  collegeDates: {
    type: DataTypes.STRING,
    allowNull: true
  },
  collegeHonors: {
    type: DataTypes.STRING,
    allowNull: true
  },
  healthConcerns: {
    type: DataTypes.JSON,
    allowNull: true
  },
  vision: {
    type: DataTypes.STRING,
    allowNull: true
  },
  hearing: {
    type: DataTypes.STRING,
    allowNull: true
  },
  accidentsOperations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  presentConcerns: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  presentFears: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  healthProblem: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  skillsHobbies: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'counselor'),
    defaultValue: 'user',
    allowNull: false
  },
  accountStatus: {
    type: DataTypes.ENUM('active', 'pending', 'rejected', 'suspended'),
    defaultValue: 'active',
    allowNull: true
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profilePicture: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  authProvider: {
    type: DataTypes.ENUM('local', 'firebase-google', 'google'),
    defaultValue: 'local',
    allowNull: true
  },
  lastActive: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
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
  tableName: 'users',
  timestamps: true
});
