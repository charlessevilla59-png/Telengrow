/*
    Database Reset Script - Drops and recreates tables
    Run this ONCE to fix the "Too many keys" error
*/

import mysql from 'mysql2/promise';

async function resetDatabase() {
  let connection;
  try {
    console.log("🔄 Starting database cleanup...");

    // Connect directly to MySQL
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'tellngrow'
    });

    console.log("✅ Connected to database");

    // Drop tables with foreign keys first
    console.log("🗑️ Dropping tables...");
    try {
      await connection.query('DROP TABLE IF EXISTS readingsessions');
      console.log("✅ Dropped readingsessions");
    } catch (e) {}

    try {
      await connection.query('DROP TABLE IF EXISTS moodentries');
      console.log("✅ Dropped moodentries");
    } catch (e) {}

    try {
      await connection.query('DROP TABLE IF EXISTS savedmaterials');
      console.log("✅ Dropped savedmaterials");
    } catch (e) {}

    try {
      await connection.query('DROP TABLE IF EXISTS readingmaterials');
      console.log("✅ Dropped readingmaterials");
    } catch (e) {}

    try {
      await connection.query('DROP TABLE IF EXISTS activities');
      console.log("✅ Dropped activities");
    } catch (e) {}

    try {
      await connection.query('DROP TABLE IF EXISTS certificatemodels');
      console.log("✅ Dropped certificatemodels");
    } catch (e) {}

    try {
      await connection.query('DROP TABLE IF EXISTS gamesessions');
      console.log("✅ Dropped gamesessions");
    } catch (e) {}

    try {
      await connection.query('DROP TABLE IF EXISTS journalentries');
      console.log("✅ Dropped journalentries");
    } catch (e) {}

    try {
      await connection.query('DROP TABLE IF EXISTS feedbacks');
      console.log("✅ Dropped feedbacks");
    } catch (e) {}

    try {
      await connection.query('DROP TABLE IF EXISTS userprogresses');
      console.log("✅ Dropped userprogresses");
    } catch (e) {}

    try {
      await connection.query('DROP TABLE IF EXISTS users');
      console.log("✅ Dropped users table");
    } catch (e) {}

    console.log("\n✅ All tables dropped successfully");
    console.log("ℹ️  Tables will be recreated on next server start");
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during cleanup:", error.message);
    process.exit(1);
  }
}

resetDatabase();
