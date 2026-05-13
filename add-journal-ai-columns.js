/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines

    Add AI emotion analysis columns to journal_entries table
*/

import { sequelize } from "./models/db.js";

const addJournalAIColumns = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to MySQL database!");

    // Add missing columns to journal_entries table
    const queries = [
      // Add detectedEmotion column
      `ALTER TABLE journal_entries ADD COLUMN detectedEmotion ENUM('happy', 'sad', 'anxious', 'calm', 'angry', 'neutral') DEFAULT 'neutral' COMMENT 'AI-detected emotion from journal content'`,
      
      // Add emotionConfidence column
      `ALTER TABLE journal_entries ADD COLUMN emotionConfidence INT DEFAULT 0 COMMENT 'AI confidence score (0-100)'`,
      
      // Add sentimentScore column
      `ALTER TABLE journal_entries ADD COLUMN sentimentScore INT DEFAULT 0 COMMENT 'Overall sentiment score (-100 to 100)'`,
      
      // Add emotionScores column (without default value - MySQL doesn't allow defaults for JSON)
      `ALTER TABLE journal_entries ADD COLUMN emotionScores JSON COMMENT 'Detailed emotion scores for all emotion types'`,
      
      // Add sentimentAnalysis column
      `ALTER TABLE journal_entries ADD COLUMN sentimentAnalysis TEXT COMMENT 'AI-generated analysis description'`
    ];

    for (const query of queries) {
      try {
        await sequelize.query(query);
        console.log("✅ Column added/verified:", query.split(' ADD COLUMN')[1]?.split(' ')[2] || query);
      } catch (err) {
        if (err.message.includes('Duplicate column')) {
          console.log("⚠️  Column already exists:", query.split(' ADD COLUMN')[1]?.split(' ')[2] || query);
        } else {
          throw err;
        }
      }
    }

    console.log("✅ All AI emotion columns successfully added to journal_entries table!");
    
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

addJournalAIColumns();
