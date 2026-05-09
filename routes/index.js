/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import express from "express";
import { Op } from "sequelize";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import * as authController from "../controllers/authController.js";
import * as moodController from "../controllers/moodController.js";
import * as readingCommentController from "../controllers/readingCommentController.js";
import * as progressController from "../controllers/progressController.js";
import { isAuthenticated } from "../middleware/auth.js";
import { isAdmin } from "../middleware/adminAuth.js";
import passport from "../config/passport.js";
import { getModelFileInfo, downloadFaceApiModels } from "../utils/downloadFaceApiModels.js";
import systemStatus from "../utils/systemStatus.js";

const router = express.Router();

// ✅ HELPER FUNCTION: Ensure directory exists (create if needed)
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

// ✅ Ensure all required upload directories exist
ensureDir('public/uploads');
ensureDir('public/uploads/profiles');
ensureDir('public/uploads/videos');
console.log('✅ Upload directories verified');

// ✅ HELPER FUNCTION: Convert YouTube URL to embed URL
function convertToEmbedURL(videoUrl) {
  if (!videoUrl) return videoUrl;
  
  // Already an embed URL
  if (videoUrl.includes('youtube.com/embed/')) {
    return videoUrl;
  }
  
  // Regular YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = videoUrl.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  
  // Short YouTube URL: https://youtu.be/VIDEO_ID
  const shortRegExp = /youtu\.be\/([a-zA-Z0-9_-]{11})/;
  const shortMatch = videoUrl.match(shortRegExp);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }
  
  // Return as-is if it's already a valid embed or other video source
  return videoUrl;
}

// Configure multer for file uploads (Educational Documents)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    ensureDir('public/uploads');
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    // Support PDF, Word documents, PowerPoint, and Excel files
    const allowedTypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt|odt|odp|ods/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    // MIME types mapping for better detection
    const mimeMap = {
      'application/pdf': true,
      'application/msword': true, // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true, // .docx
      'application/vnd.ms-powerpoint': true, // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': true, // .pptx
      'application/vnd.ms-excel': true, // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true, // .xlsx
      'text/plain': true, // .txt
      'application/vnd.oasis.opendocument.text': true, // .odt
      'application/vnd.oasis.opendocument.presentation': true, // .odp
      'application/vnd.oasis.opendocument.spreadsheet': true, // .ods
    };
    
    if ((mimeMap[file.mimetype] || mimetype) && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX and other office documents are allowed!'));
    }
  }
});

// Configure multer for profile picture uploads
const profilePictureStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    ensureDir('public/uploads/profiles');
    cb(null, 'public/uploads/profiles/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadProfilePicture = multer({ 
  storage: profilePictureStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for images
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WEBP) are allowed!'));
    }
  }
});

// Configure multer for video uploads (Counselor Videos)
const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    ensureDir('public/uploads/videos');
    cb(null, 'public/uploads/videos/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadVideo = multer({ 
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
  fileFilter: function (req, file, cb) {
    // Accept common video formats
    const allowedTypes = /mp4|avi|mov|webm|mkv|flv|wmv|m4v|3gp|ogv|ts|m2ts|mts|mpg|mpeg|m2v/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    // Check MIME type
    const videoMimes = /video\//;
    const mimetype = videoMimes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files (MP4, AVI, MOV, WebM, MKV, FLV, etc.) are allowed!'));
    }
  }
});

// ==================== DIAGNOSTIC ROUTES ====================
// Check face-api models status
router.get("/api/models/status", (req, res) => {
  const status = getModelFileInfo();
  res.json(status);
});

// Download face-api models on demand
router.post("/api/models/download", async (req, res) => {
  try {
    console.log("📥 Manual model download triggered");
    
    // Check current status
    let status = getModelFileInfo();
    
    if (status.ready) {
      return res.json({
        success: true,
        message: "All models already downloaded",
        status
      });
    }

    // Start download
    const downloadStartTime = Date.now();
    const success = await downloadFaceApiModels((progress) => {
      if (progress.error) {
        console.error("Download progress error:", progress.error);
      } else {
        console.log(`Download progress: ${progress.downloaded}/${progress.total}`);
      }
    });

    const downloadTime = ((Date.now() - downloadStartTime) / 1000).toFixed(2);
    status = getModelFileInfo();

    res.json({
      success,
      message: success ? "Models downloaded successfully" : "Download completed with some errors",
      downloadTime: `${downloadTime}s`,
      status
    });

  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      status: getModelFileInfo()
    });
  }
});

// ==================== PUBLIC ROUTES ====================
router.get("/", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/user/dashboard");
  }
  res.render("home", { title: "Welcome to Tellngrow" });
});

router.get("/login", authController.loginPage);
router.post("/login", authController.loginUser);

// Firebase Google Authentication Route
router.post("/auth/firebase/google", authController.firebaseGoogleAuth);

// Google OAuth Routes (Legacy - Passport.js)
router.get("/auth/google", 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get("/auth/google/callback",
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    console.log('✅ Google authentication successful');
    console.log('👤 User:', req.user.email);
    res.redirect('/user/dashboard');
  }
);

router.get("/register", authController.registerPage);
router.post("/register", authController.registerUser);

router.get("/forgot-password", authController.forgotPasswordPage);
router.post("/forgot-password/verify", authController.verifyEmailForReset);
router.post("/forgot-password/reset", authController.resetPassword);

router.get("/logout", authController.logoutUser);

// ==================== USER ROUTES (Protected) ====================
router.get("/dashboard", isAuthenticated, authController.dashboardPage);
router.get("/user/dashboard", isAuthenticated, authController.dashboardPage);

// User Profile Routes
router.get("/user/profile", isAuthenticated, async (req, res) => {
  try {
    const { User } = await import("../models/index.js");
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.redirect("/login");
    }
    res.render("user/profile", { title: "My Profile", user });
  } catch (err) {
    console.error("Profile page error:", err);
    res.redirect("/login");
  }
});

// save profile changes
router.post("/user/profile", isAuthenticated, uploadProfilePicture.single('profilePicture'), authController.updateProfile);

// Feedback/Report Route
router.post("/user/feedback", isAuthenticated, authController.submitFeedback);

router.get("/user/progress", isAuthenticated, async (req, res) => {
  try {
    const { UserProgress } = await import('../models/index.js');
    const progress = await UserProgress.findOne({ where: { userId: req.session.userId } });
    res.render("user/progress", { 
      title: "My Progress", 
      user: req.user,
      progress: progress || {}
    });
  } catch (error) {
    console.error('Error loading progress page:', error);
    res.render("user/progress", { 
      title: "My Progress", 
      user: req.user,
      progress: {}
    });
  }
});

router.get("/api/user/progress/dashboard", isAuthenticated, progressController.getProgressDashboard);
router.get("/api/user/achievements", isAuthenticated, progressController.getAchievements);

// ==================== GAME ROUTES (Protected) ====================
router.get("/games", isAuthenticated, (req, res) => {
  res.render("games/game-select", { title: "Select a Game", user: req.user });
});

router.get("/games/breathing-bubble", isAuthenticated, (req, res) => {
  res.render("games/breathing-bubble", { title: "Breathing Bubble", user: req.user });
});

router.get("/games/color-tap", isAuthenticated, (req, res) => {
  res.render("games/color-tap", { title: "Color Tap", user: req.user });
});

router.get("/games/grid-memory", isAuthenticated, (req, res) => {
  res.render("games/grid-memory", { title: "Grid Memory", user: req.user });
});

router.get("/games/stress-ball", isAuthenticated, (req, res) => {
  res.render("games/stress-ball", { title: "Stress Ball", user: req.user });
});

router.get("/games/gratitude-jar", isAuthenticated, (req, res) => {
  res.render("games/gratitude-jar", { title: "Gratitude Jar", user: req.user });
});

router.get("/games/affirmation-cards", isAuthenticated, (req, res) => {
  res.render("games/affirmation-cards", { title: "Affirmation Cards", user: req.user });
});

router.get("/games/zen-garden", isAuthenticated, (req, res) => {
  res.render("games/zen-garden", { title: "Zen Garden", user: req.user });
});

router.get("/games/puzzle-therapy", isAuthenticated, (req, res) => {
  res.render("games/puzzle-therapy", { title: "Puzzle Therapy", user: req.user });
});

// ==================== GAME SCORE API (Protected) ====================
// Save game score and update user progress
router.post("/api/games/save-score", isAuthenticated, async (req, res) => {
  try {
    const { GameSession, UserProgress, Activity } = await import('../models/index.js');
    const { gameType, score, points, duration, difficulty, accuracy } = req.body;
    const userId = req.user?.id || req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    // Validate input
    if (!gameType || score === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    // Create game session record
    const gameSession = await GameSession.create({
      userId,
      gameType,
      score: score || 0,
      points: points || 0,
      duration: duration || 0,
      difficulty: difficulty || 'easy',
      accuracy: accuracy || 0,
      completed: true,
      startTime: new Date(Date.now() - (duration || 0) * 1000),
      endTime: new Date()
    });
    
    console.log(`🎮 Game saved: ${gameType} | Score: ${score} | Points: ${points}`);
    
    // Update user progress
    let userProgress = await UserProgress.findOne({ where: { userId } });
    
    if (!userProgress) {
      userProgress = await UserProgress.create({
        userId,
        totalGamesPlayed: 1,
        totalPoints: points || 0,
        lastActivityDate: new Date()
      });
    } else {
      await userProgress.update({
        totalGamesPlayed: userProgress.totalGamesPlayed + 1,
        totalPoints: userProgress.totalPoints + (points || 0),
        lastActivityDate: new Date()
      });
    }
    
    console.log(`📊 User progress updated | Total Points: ${userProgress.totalPoints} | Games: ${userProgress.totalGamesPlayed}`);
    
    // Create activity log
    await Activity.create({
      userId,
      type: 'game',
      description: `Played ${gameType} and scored ${score} points`,
      metadata: {
        gameType,
        score,
        points,
        difficulty
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Game score saved!',
      points: points || 0,
      totalPoints: userProgress.totalPoints,
      level: userProgress.level,
      message: `You earned ${points || 0} points! 🎉`
    });
  } catch (error) {
    console.error('❌ Error saving game score:', error);
    res.status(500).json({ success: false, message: 'Error saving game score: ' + error.message });
  }
});

// Get user's current progress
router.get("/api/user/progress", isAuthenticated, async (req, res) => {
  try {
    const { UserProgress } = await import('../models/index.js');
    
    const userId = req.user?.id || req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const progress = await UserProgress.findOne({ where: { userId } });
    
    if (!progress) {
      return res.json({
        totalPoints: 0,
        level: 'beginner',
        currentStreak: 0,
        totalGamesPlayed: 0,
        longestStreak: 0,
        totalJournalEntries: 0
      });
    }
    
    res.json({
      totalPoints: progress.totalPoints || 0,
      level: progress.level || 'beginner',
      currentStreak: progress.currentStreak || 0,
      totalGamesPlayed: progress.totalGamesPlayed || 0,
      longestStreak: progress.longestStreak || 0,
      totalJournalEntries: progress.totalJournalEntries || 0
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Error fetching progress' });
  }
});

// ==================== QUIZ ROUTES (Protected) ====================
// Quiz feature removed - routes deprecated

// ==================== JOURNAL ROUTES (Protected) ====================
router.get("/journal", isAuthenticated, async (req, res) => {
  try {
    const { JournalEntry } = await import('../models/index.js');
    const entries = await JournalEntry.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']]
    });
    res.render("journal/entries", { title: "My Journal", user: req.user, entries });
  } catch (error) {
    console.error('Journal fetch error:', error);
    res.render("journal/entries", { title: "My Journal", user: req.user, entries: [] });
  }
});

router.get("/journal/new", isAuthenticated, (req, res) => {
  res.render("journal/new-entry", { title: "New Journal Entry", user: req.user });
});

router.post("/journal/new", isAuthenticated, async (req, res) => {
  try {
    const { JournalEntry } = await import('../models/index.js');
    const { title, mood, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).render("journal/new-entry", { 
        title: "New Journal Entry", 
        user: req.user,
        error_msg: "Title and content are required" 
      });
    }
    
    await JournalEntry.create({
      userId: req.session.userId,
      title,
      mood: mood || 'neutral',
      content
    });
    
    // Render the form again with success message instead of redirecting
    res.render("journal/new-entry", { 
      title: "New Journal Entry", 
      user: req.user,
      success_msg: "Journal entry saved successfully! You can write another entry or view your Journal Library." 
    });
  } catch (error) {
    console.error('Journal save error:', error);
    res.status(500).render("journal/new-entry", { 
      title: "New Journal Entry", 
      user: req.user,
      error_msg: "An error occurred while saving your entry" 
    });
  }
});

router.get("/journal/:id", isAuthenticated, async (req, res) => {
  try {
    const { JournalEntry } = await import('../models/index.js');
    const entry = await JournalEntry.findOne({
      where: { 
        id: req.params.id,
        userId: req.session.userId 
      }
    });
    
    if (!entry) {
      return res.redirect('/journal');
    }
    
    res.render("journal/view-entry", { title: "View Entry", user: req.user, entry });
  } catch (error) {
    console.error('Journal view error:', error);
    res.redirect('/journal');
  }
});

router.get("/journal/edit/:id", isAuthenticated, async (req, res) => {
  try {
    const { JournalEntry } = await import('../models/index.js');
    const entry = await JournalEntry.findOne({
      where: { 
        id: req.params.id,
        userId: req.session.userId 
      }
    });
    
    if (!entry) {
      return res.redirect('/journal');
    }
    
    res.render("journal/edit-entry", { title: "Edit Entry", user: req.user, entry });
  } catch (error) {
    console.error('Journal edit error:', error);
    res.redirect('/journal');
  }
});

router.post("/journal/edit/:id", isAuthenticated, async (req, res) => {
  try {
    const { JournalEntry } = await import('../models/index.js');
    const { title, mood, content } = req.body;
    
    const entry = await JournalEntry.findOne({
      where: { 
        id: req.params.id,
        userId: req.session.userId 
      }
    });
    
    if (!entry) {
      return res.redirect('/journal');
    }
    
    if (!title || !content) {
      return res.status(400).render("journal/edit-entry", { 
        title: "Edit Entry", 
        user: req.user,
        entry,
        error_msg: "Title and content are required" 
      });
    }
    
    await entry.update({
      title,
      mood: mood || 'neutral',
      content
    });
    
    res.redirect(`/journal/${entry.id}`);
  } catch (error) {
    console.error('Journal update error:', error);
    res.redirect('/journal');
  }
});

router.post("/journal/delete/:id", isAuthenticated, async (req, res) => {
  try {
    const { JournalEntry } = await import('../models/index.js');
    
    const entry = await JournalEntry.findOne({
      where: { 
        id: req.params.id,
        userId: req.session.userId 
      }
    });
    
    if (!entry) {
      return res.redirect('/journal');
    }
    
    await entry.destroy();
    
    req.flash('success_msg', 'Journal entry deleted successfully.');
    res.redirect('/journal');
  } catch (error) {
    console.error('Journal delete error:', error);
    res.redirect('/journal');
  }
});

// ==================== READING MATERIAL ROUTES (Protected) ====================
router.get("/reading", isAuthenticated, async (req, res) => {
  try {
    const { ReadingMaterial, User } = await import('../models/index.js');
    const { Op } = await import('sequelize');
    
    console.log('📚 Fetching reading materials (articles & PDFs only)...');
    
    // Get published materials that are NOT videos
    const materials = await ReadingMaterial.findAll({
      where: { 
        isPublished: true,
        fileType: {
          [Op.ne]: 'video'
        }
      },
      include: [{
        model: User,
        as: 'counselor',
        attributes: ['name']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`✅ Found ${materials.length} published materials (non-video)`);
    if (materials.length > 0) {
      console.log('📋 Materials:', materials.map(m => ({ 
        id: m.id, 
        title: m.title, 
        fileType: m.fileType,
        isPublished: m.isPublished 
      })));
    }
    
    // Calculate total views
    const totalViews = materials.reduce((sum, m) => sum + (m.views || 0), 0);
    
    res.render("reading/materials", { 
      title: "Reading Materials", 
      user: req.user,
      materials,
      totalViews
    });
  } catch (error) {
    console.error('❌ Reading materials error:', error);
    res.render("reading/materials", { 
      title: "Reading Materials", 
      user: req.user,
      materials: [],
      totalViews: 0
    });
  }
});

// Library view with sidebar (all books)
router.get("/reading/library", isAuthenticated, async (req, res) => {
  try {
    const { ReadingMaterial, User } = await import('../models/index.js');
    
    const materials = await ReadingMaterial.findAll({
      where: { isPublished: true },
      include: [{
        model: User,
        as: 'counselor',
        attributes: ['name']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate total views
    const totalViews = materials.reduce((sum, m) => sum + (m.views || 0), 0);
    
    // Show library with all materials
    res.render("reading/materials", { 
      title: "Reading Materials Library", 
      user: req.user,
      materials,
      totalViews
    });
  } catch (error) {
    console.error('Library error:', error);
    res.redirect('/reading');
  }
});

// API endpoint for library sidebar
router.get("/api/reading/materials", isAuthenticated, async (req, res) => {
  try {
    const { ReadingMaterial, User } = await import('../models/index.js');
    
    const materials = await ReadingMaterial.findAll({
      where: { isPublished: true },
      attributes: ['id', 'title', 'category', 'fileType', 'readingTime', 'views'],
      include: [{
        model: User,
        as: 'counselor',
        attributes: ['name']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(materials);
  } catch (error) {
    console.error('API materials error:', error);
    res.status(500).json([]);
  }
});

// Download/View uploaded file
router.get("/reading/file/:id", isAuthenticated, async (req, res) => {
  try {
    const { ReadingMaterial } = await import('../models/index.js');
    const path = await import('path');
    const fs = await import('fs');
    
    const material = await ReadingMaterial.findByPk(req.params.id);
    
    if (!material || !material.isPublished) {
      return res.status(404).send('Material not found');
    }
    
    if (material.fileType === 'article') {
      return res.redirect(`/reading/${material.slug}`);
    }
    
    // Increment view count
    await material.increment('views');
    
    // Convert path back to filesystem path
    const filePath = material.filePath.startsWith('/') 
      ? 'public' + material.filePath 
      : material.filePath;
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('❌ File not found:', filePath);
      return res.status(404).send('File not found on server');
    }
    
    // Set headers for inline display (not download)
    const ext = path.extname(material.fileName).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (ext === '.doc') {
      contentType = 'application/msword';
    } else if (ext === '.ppt' || ext === '.pptx') {
      contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else if (ext === '.xls' || ext === '.xlsx') {
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }
    // ✅ VIDEO MIME TYPES
    else if (ext === '.mp4') {
      contentType = 'video/mp4';
    } else if (ext === '.webm') {
      contentType = 'video/webm';
    } else if (ext === '.mov' || ext === '.quicktime') {
      contentType = 'video/quicktime';
    } else if (ext === '.avi') {
      contentType = 'video/x-msvideo';
    } else if (ext === '.mkv') {
      contentType = 'video/x-matroska';
    } else if (ext === '.flv') {
      contentType = 'video/x-flv';
    } else if (ext === '.wmv') {
      contentType = 'video/x-ms-wmv';
    } else if (ext === '.m4v') {
      contentType = 'video/x-m4v';
    } else if (ext === '.3gp') {
      contentType = 'video/3gpp';
    } else if (ext === '.ogv') {
      contentType = 'video/ogg';
    }
    
    // Add CORS headers for Office Online Viewer and video playback
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Send file with inline disposition (display in browser, not download)
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${material.fileName}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Accept-Ranges', 'bytes'); // ✅ Support for streaming large video files
    
    console.log(`✅ Serving ${material.fileType} file: ${material.fileName}`);
    console.log(`   Mime type: ${contentType}`);
    console.log(`   Path: ${filePath}`);
    
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('File view error:', error);
    res.status(500).send('Error loading file');
  }
});

// View uploaded file in browser
router.get("/reading/view/:id", isAuthenticated, async (req, res) => {
  try {
    const { ReadingMaterial, User, SavedMaterial, ReadingSession } = await import('../models/index.js');
    
    const material = await ReadingMaterial.findOne({
      where: { id: req.params.id, isPublished: true },
      include: [{
        model: User,
        as: 'counselor',
        attributes: ['name']
      }]
    });
    
    if (!material) {
      return res.status(404).render("404", { title: "Material Not Found" });
    }
    
    if (material.fileType === 'article') {
      return res.redirect(`/reading/${material.slug}`);
    }
    
    // Check if user has saved this material
    const isSaved = await SavedMaterial.findOne({
      where: { userId: req.user.id, materialId: material.id }
    });
    
    // ✅ Create reading session for tracking videos/PDFs
    await ReadingSession.create({
      userId: req.session.userId,
      materialId: material.id,
      startTime: new Date(),
      duration: 0 // Will be updated on client side
    });
    
    // Increment view count
    await material.increment('views');
    
    res.render("reading/viewer", { 
      title: material.title, 
      user: req.user,
      userId: req.session.userId,
      material,
      isSaved: !!isSaved
    });
  } catch (error) {
    console.error('File view error:', error);
    res.status(500).render("404", { title: "Error" });
  }
});

// Save/Bookmark material
router.post("/reading/save/:id", isAuthenticated, async (req, res) => {
  try {
    const { SavedMaterial } = await import('../models/index.js');
    
    // Check if already saved
    const existing = await SavedMaterial.findOne({
      where: { userId: req.user.id, materialId: req.params.id }
    });
    
    if (existing) {
      return res.json({ success: false, message: 'Already saved' });
    }
    
    await SavedMaterial.create({
      userId: req.user.id,
      materialId: req.params.id
    });
    
    console.log('✅ Material saved:', req.user.id, req.params.id);
    res.json({ success: true, message: 'Material saved successfully' });
  } catch (error) {
    console.error('Save material error:', error);
    res.status(500).json({ success: false, message: 'Error saving material' });
  }
});

// Unsave/Remove bookmark
router.post("/reading/unsave/:id", isAuthenticated, async (req, res) => {
  try {
    const { SavedMaterial } = await import('../models/index.js');
    
    const saved = await SavedMaterial.findOne({
      where: { userId: req.user.id, materialId: req.params.id }
    });
    
    if (!saved) {
      return res.json({ success: false, message: 'Not saved' });
    }
    
    await saved.destroy();
    
    console.log('✅ Material unsaved:', req.user.id, req.params.id);
    res.json({ success: true, message: 'Material removed from saved' });
  } catch (error) {
    console.error('Unsave material error:', error);
    res.status(500).json({ success: false, message: 'Error removing material' });
  }
});

// View saved materials page
router.get("/reading/saved", isAuthenticated, async (req, res) => {
  try {
    const { SavedMaterial, ReadingMaterial, User } = await import('../models/index.js');
    
    const savedMaterials = await SavedMaterial.findAll({
      where: { userId: req.user.id },
      include: [{
        model: ReadingMaterial,
        as: 'material',
        where: { isPublished: true },
        include: [{
          model: User,
          as: 'counselor',
          attributes: ['name']
        }]
      }],
      order: [['savedAt', 'DESC']]
    });
    
    console.log(`📚 User ${req.user.id} has ${savedMaterials.length} saved materials`);
    
    res.render("reading/saved", { 
      title: "Saved Materials", 
      user: req.user,
      savedMaterials
    });
  } catch (error) {
    console.error('Saved materials error:', error);
    res.render("reading/saved", { 
      title: "Saved Materials", 
      user: req.user,
      savedMaterials: []
    });
  }
});

router.get("/reading/:slug", isAuthenticated, async (req, res) => {
  try {
    const { ReadingMaterial, User, ReadingSession } = await import('../models/index.js');
    const MarkdownIt = await import('markdown-it');
    
    const material = await ReadingMaterial.findOne({
      where: { slug: req.params.slug, isPublished: true },
      include: [{
        model: User,
        as: 'counselor',
        attributes: ['name']
      }]
    });
    
    if (!material) {
      return res.status(404).render("404", { title: "Material Not Found" });
    }
    
    // Convert markdown to HTML if it's an article
    let htmlContent = material.content;
    if (material.fileType === 'article' && material.content) {
      const md = new MarkdownIt.default({
        html: true,
        linkify: true,
        breaks: true,
        typographer: true
      });
      htmlContent = md.render(material.content);
    }
    
    // ✅ Create reading session for tracking
    await ReadingSession.create({
      userId: req.session.userId,
      materialId: material.id,
      startTime: new Date(),
      duration: 0 // Will be updated on client side
    });
    
    // Increment view count
    await material.increment('views');
    
    res.render("reading/article", { 
      title: material.title, 
      user: req.user,
      userId: req.session.userId,
      material: {
        ...material.toJSON(),
        htmlContent,
        fileType: material.fileType,
        filePath: material.filePath
      }
    });
  } catch (error) {
    console.error('Article view error:', error);
    res.status(500).render("404", { title: "Error" });
  }
});

// ==================== COUNSELOR ROUTES (Protected + Counselor Only) ====================
router.get("/counselor/dashboard", isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'counselor') {
      return res.status(403).render("403", { title: "Access Denied" });
    }
    
    const { ReadingMaterial, ReadingMaterialComment, ReadingSession, User, Message } = await import('../models/index.js');
    const { Op } = await import('sequelize');
    
    // Get counselor's materials
    const materials = await ReadingMaterial.findAll({
      where: { counselorId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    // Get all materials for this counselor (for engagement calculations)
    const allMaterials = await ReadingMaterial.findAll({
      where: { counselorId: req.user.id }
    });
    
    const totalMaterials = allMaterials.length;
    const materialIds = allMaterials.map(m => m.id);
    
    // Calculate stats
    const publishedMaterials = await ReadingMaterial.count({ 
      where: { counselorId: req.user.id, isPublished: true } 
    });
    const totalViews = await ReadingMaterial.sum('views', { where: { counselorId: req.user.id } }) || 0;
    
    // Count total comments for counselor's materials
    let totalComments = 0;
    if (materialIds.length > 0) {
      totalComments = await ReadingMaterialComment.count({
        where: { materialId: { [Op.in]: materialIds }, isHidden: false }
      }).catch(() => 0);
    }
    
    // ===== REAL-TIME ENGAGEMENT METRICS =====
    // Get total students
    const totalStudents = await User.count({ where: { role: 'student' } });
    
    // Material Completion: Calculate percentage of materials viewed by students
    let materialCompletion = 0;
    if (totalMaterials > 0 && totalStudents > 0) {
      const materialsViewed = await ReadingSession.count({
        where: { materialId: { [Op.in]: materialIds } },
        distinct: true,
        col: 'materialId'
      });
      materialCompletion = Math.round((materialsViewed / totalMaterials) * 100);
    }
    
    // Student Participation: Calculate percentage of students who viewed at least 1 material
    let studentParticipation = 0;
    if (totalStudents > 0 && materialIds.length > 0) {
      const studentsParticipated = await ReadingSession.count({
        where: { materialId: { [Op.in]: materialIds } },
        distinct: true,
        col: 'userId'
      });
      studentParticipation = Math.round((studentsParticipated / totalStudents) * 100);
    }
    
    // Comments & Reactions: Get total comments on all materials
    const commentsAndReactions = totalComments;
    
    // ===== THIS WEEK STATS (Last 7 days) =====
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // New Messages this week
    const newMessagesThisWeek = await Message.count({
      where: { 
        createdAt: { [Op.gte]: sevenDaysAgo }
      }
    }).catch(() => 0);
    
    // Material Views this week
    const materialViewsThisWeek = await ReadingSession.count({
      where: {
        materialId: { [Op.in]: materialIds },
        createdAt: { [Op.gte]: sevenDaysAgo }
      }
    }).catch(() => 0);
    
    // Active Students this week
    const activeStudentsThisWeek = await ReadingSession.count({
      where: {
        materialId: { [Op.in]: materialIds },
        createdAt: { [Op.gte]: sevenDaysAgo }
      },
      distinct: true,
      col: 'userId'
    }).catch(() => 0);
    
    res.render("counselor/dashboard", { 
      title: "Counselor Dashboard", 
      user: req.user,
      stats: {
        totalMaterials,
        publishedMaterials,
        totalViews,
        totalReaders: 0,
        totalComments
      },
      materials,
      engagement: {
        materialCompletion,
        studentParticipation,
        commentsAndReactions,
        newMessagesThisWeek,
        materialViewsThisWeek,
        activeStudentsThisWeek
      }
    });
  } catch (error) {
    console.error('Counselor dashboard error:', error);
    res.status(500).render("404", { title: "Error Loading Dashboard" });
  }
});

// Counselor Materials List
router.get("/counselor/materials", isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'counselor') {
      return res.status(403).render("403", { title: "Access Denied" });
    }
    
    const { ReadingMaterial, ReadingMaterialComment, SavedMaterial } = await import('../models/index.js');
    
    const materials = await ReadingMaterial.findAll({
      where: { counselorId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    // Calculate statistics for each material
    const materialsWithStats = await Promise.all(materials.map(async (m) => {
      const commentCount = await ReadingMaterialComment.count({
        where: { materialId: m.id }
      }).catch(() => 0);
      
      const savedCount = await SavedMaterial.count({
        where: { materialId: m.id }
      }).catch(() => 0);
      
      // Calculate average rating from comments
      const comments = await ReadingMaterialComment.findAll({
        where: { materialId: m.id },
        attributes: ['rating']
      }).catch(() => []);
      
      let avgRating = 0;
      if (comments && comments.length > 0) {
        const totalRating = comments.reduce((sum, c) => sum + (c.rating || 0), 0);
        avgRating = (totalRating / comments.length).toFixed(1);
      }
      
      return {
        id: m.id,
        title: m.title,
        excerpt: m.excerpt,
        category: m.category,
        fileType: m.fileType,
        isPublished: m.isPublished,
        views: m.views || 0,
        avgRating: avgRating,
        commentCount: commentCount,
        savedCount: savedCount,
        readingTime: m.readingTime,
        createdAt: m.createdAt
      };
    }));

    // Calculate overall statistics
    const totalCount = materialsWithStats.length;
    const publishedCount = materialsWithStats.filter(m => m.isPublished).length;
    const videoCount = materialsWithStats.filter(m => m.fileType === 'video').length;
    const pdfCount = materialsWithStats.filter(m => m.fileType === 'pdf').length;
    
    // Get unique categories
    const categories = [...new Set(materialsWithStats.map(m => m.category || 'Other').filter(c => c))];

    // Prepare JSON for filtering and modal data
    const materialsJson = JSON.stringify(materialsWithStats);

    // Get success message from session (if any)
    let successMessage = null;
    let errorMessage = null;
    
    if (req.session.successMessage) {
      successMessage = req.session.successMessage;
      delete req.session.successMessage; // Clear after retrieving
    }
    
    if (req.session.errorMessage) {
      errorMessage = req.session.errorMessage;
      delete req.session.errorMessage; // Clear after retrieving
    }

    // Also check for query parameters
    if (req.query.success === '1') {
      successMessage = {
        type: 'create',
        message: 'Material published successfully! It is now visible to students.',
        icon: '✅'
      };
    }

    if (req.query.error) {
      errorMessage = decodeURIComponent(req.query.error);
    }
    
    res.render("counselor/materials", { 
      title: "Manage Materials", 
      user: req.user,
      materials: materialsWithStats,
      totalCount,
      publishedCount,
      videoCount,
      pdfCount,
      categories,
      materialsJson,
      successMessage,
      errorMessage,
      formatDate: (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    });
  } catch (error) {
    console.error('Counselor materials error:', error);
    res.status(500).render("404", { title: "Error" });
  }
});

// New Material Form
router.get("/counselor/materials/new", isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'counselor') {
      return res.status(403).render("403", { title: "Access Denied" });
    }
    
    res.render("counselor/new-material", { 
      title: "Add New Material", 
      user: req.user
    });
  } catch (error) {
    console.error('New material error:', error);
    res.status(500).render("404", { title: "Error" });
  }
});

// Create Material (with file upload support) - handles both regular files and videos
router.post("/counselor/materials/create", isAuthenticated, (req, res, next) => {
  // First, use any() to capture any file field name
  const multerAny = multer({ 
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        console.log('📤 Multer destination check:', file.fieldname, file.originalname);
        // Determine destination based on file type and MIME
        if (file.mimetype.startsWith('video/')) {
          console.log('   → Video MIME detected, saving to videos folder');
          ensureDir('public/uploads/videos');
          cb(null, 'public/uploads/videos/');
        } else {
          console.log('   → Document file, saving to uploads folder');
          ensureDir('public/uploads');
          cb(null, 'public/uploads/');
        }
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      }
    }),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB for videos, will be caught by request filter
    fileFilter: function (req, file, cb) {
      const fileType = req.body.fileType;
      
      console.log('\n🔍 MULTER FILE FILTER:');
      console.log('  Field name:', file.fieldname);
      console.log('  Original name:', file.originalname);
      console.log('  MIME type:', file.mimetype);
      console.log('  File type from form:', fileType);
      
      if (fileType === 'video' || file.fieldname === 'videoFile') {
        // For videos, check MIME type and extensions
        const videoMimes = /video\//i;
        const allowedExts = /\.(mp4|avi|mov|webm|mkv|flv|wmv|m4v|3gp|ogv|ts|m2ts|mts|mpg|mpeg|m2v|MOV|MP4|AVI|WEBM|MKV|FLV|WMV)$/;
        
        const isMimeOk = videoMimes.test(file.mimetype);
        const isExtOk = allowedExts.test(file.originalname);
        
        console.log('  MIME check:', isMimeOk ? '✓ Video MIME' : '✗ Not video MIME');
        console.log('  Ext check:', isExtOk ? '✓ Allowed extension' : '✗ Not allowed extension');
        
        if (isMimeOk || isExtOk) {
          console.log('  ✅ ACCEPTED - Video file');
          return cb(null, true);
        } else {
          console.log('  ❌ REJECTED - File is not a valid video');
          return cb(new Error('Only video files are allowed! (MP4, AVI, MOV, WebM, MKV, FLV, WMV, etc.)'));
        }
      } else {
        // For documents, check extensions
        const allowedTypes = /pdf|doc|docx|ppt|pptx|xls|xlsx/i;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        
        console.log('  Document ext check:', extname ? '✓ Allowed' : '✗ Not allowed');
        
        if (extname) {
          console.log('  ✅ ACCEPTED - Document file');
          return cb(null, true);
        } else {
          console.log('  ❌ REJECTED - Not an allowed document type');
          return cb(new Error('Only PDF, DOC, DOCX, PPT, XLS files are allowed!'));
        }
      }
    }
  });

  // Use any() to capture all file fields
  multerAny.any()(req, res, (err) => {
    if (err) {
      console.error('❌ MULTER ERROR:', err.message);
      return res.status(400).redirect('/counselor/materials/new?error=' + encodeURIComponent(err.message));
    }
    
    console.log('📁 Files received:', req.files?.length || 0);
    if (req.files && req.files.length > 0) {
      req.files.forEach((f, i) => {
        console.log(`  [${i+1}] ${f.fieldname}: ${f.originalname} (${(f.size / 1024 / 1024).toFixed(2)}MB)`);
      });
    }
    
    next();
  });
}, async (req, res) => {
  try {
    if (req.user.role !== 'counselor') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get the first file from the any() upload
    const file = req.files && req.files.length > 0 ? req.files[0] : null;
    
    const { ReadingMaterial } = await import('../models/index.js');
    const { title, category, excerpt, content, readingTime, isPublished, fileType, videoUrl, videoDuration } = req.body;
    
    console.log('\n========================================');
    console.log('📝 MATERIAL CREATION INITIATED');
    console.log('========================================');
    console.log('📋 Title:', title);
    console.log('🏷️  Category:', category);
    console.log('📄 File Type:', fileType);
    console.log('📤 isPublished from form:', isPublished, '(type:', typeof isPublished + ')');
    console.log('📁 File object:', file ? {
      fieldName: file.fieldname,
      originalName: file.originalname,
      size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
      path: file.path,
      mimetype: file.mimetype
    } : 'No file');
    
    // Create slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Prepare material data
    // ✅ DEFAULT TO PUBLISHED (true) - Materials should be visible immediately
    const publishValue = isPublished === 'true' || isPublished === 'on' || isPublished === true || !isPublished;
    
    console.log('✅ Final isPublished value:', publishValue);
    
    const materialData = {
      counselorId: req.user.id,
      title,
      slug,
      category,
      excerpt,
      content: content || '',
      fileType: fileType || 'article',
      readingTime: parseInt(readingTime) || 5,
      isPublished: publishValue
    };
    
    // Handle video materials
    if (fileType === 'video') {
      console.log('\n🎥 PROCESSING VIDEO MATERIAL');
      console.log('  YouTube URL provided:', videoUrl ? 'Yes' : 'No');
      console.log('  Video file provided:', file ? 'Yes' : 'No');
      
      // Check if either YouTube URL or video file is provided
      if (!videoUrl && !file) {
        console.error('❌ VALIDATION FAILED: No video source');
        return res.status(400).send('❌ Either a YouTube URL or a video file is required');
      }
      
      // If video file was uploaded, store it
      if (file) {
        materialData.fileName = file.filename;
        // Normalize path for cross-platform compatibility (Windows uses \, we need /)
        materialData.filePath = '/' + file.path.replace(/\\/g, '/').replace(/^public\//, '');
        materialData.fileSize = file.size;
        materialData.videoUrl = null; // Don't store URL if file is uploaded
        console.log('✅ Video file uploaded:');
        console.log('   📁 Name:', file.originalname);
        console.log('   💾 Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
        console.log('   📂 Path stored in DB:', materialData.filePath);
        console.log('   📂 File system path:', file.path);
      } else if (videoUrl) {
        // ✅ Convert YouTube URL to embed URL format
        materialData.videoUrl = convertToEmbedURL(videoUrl);
        console.log('✅ YouTube URL provided:');
        console.log('   🔗 Original:', videoUrl.substring(0, 60) + '...');
        console.log('   🔗 Embed URL:', materialData.videoUrl.substring(0, 60) + '...');
      }
      
      // Set duration - use provided duration or default 300 seconds
      const duration = parseInt(videoDuration) || 300;
      materialData.videoDuration = duration;
      materialData.readingTime = Math.ceil(duration / 60); // Convert seconds to minutes
      console.log('   ⏱️  Duration:', duration, 'seconds ~', Math.ceil(duration / 60), 'minutes');
    } else if (file) {
      // Handle regular file uploads (PDF, DOC, PPT, etc.)
      console.log('\n📄 PROCESSING DOCUMENT');
      materialData.fileName = file.filename;
      // Normalize path for cross-platform compatibility (Windows uses \, we need /)
      materialData.filePath = '/' + file.path.replace(/\\/g, '/').replace(/^public\//, '');
      materialData.fileSize = file.size;
      console.log('✅ Document uploaded:');
      console.log('   📁 Name:', file.originalname);
      console.log('   💾 Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('   📂 Path stored in DB:', materialData.filePath);
      console.log('   📂 File system path:', file.path);
    }
    
    const material = await ReadingMaterial.create(materialData);
    
    // Verify material was saved to database
    if (!material || !material.id) {
      console.error('❌ Material save failed - no ID generated');
      return res.status(500).send('Error: Material was not saved properly');
    }

    // ✅ Verify the material is actually published
    const verifyMaterial = await ReadingMaterial.findByPk(material.id);
    
    console.log('========================================');
    console.log('✅ MATERIAL CREATED SUCCESSFULLY');
    console.log('========================================');
    console.log('📋 Material ID:', material.id);
    console.log('📝 Title:', material.title);
    console.log('🏷️  Category:', material.category);
    console.log('📄 Type:', fileType === 'article' ? 'Article' : 
                          fileType === 'video' ? `Video (${file ? 'Uploaded' : 'YouTube'})` : 
                          `File: ${file?.originalname}`);
    console.log('✅ Published:', material.isPublished ? 'YES ✓' : 'NO (Draft)');
    console.log('📊 All fields in database:');
    console.log('   fileType:', verifyMaterial.fileType);
    console.log('   isPublished:', verifyMaterial.isPublished);
    console.log('   category:', verifyMaterial.category);
    console.log('   filePath:', verifyMaterial.filePath);
    console.log('   videoUrl:', verifyMaterial.videoUrl);
    console.log('🔓 Published:', material.isPublished ? 'YES ✓ (Visible to Users)' : 'NO (Draft)');
    console.log('👤 Counselor ID:', req.user.id);
    console.log('👤 Counselor Name:', req.user.name);
    console.log('📅 Created:', new Date(material.createdAt).toLocaleString());
    
    if (file) {
      console.log('📦 File Name:', file.originalname);
      console.log('💾 File Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('📂 File Path:', materialData.filePath);
    }
    
    if (fileType === 'video' && materialData.videoUrl) {
      console.log('🎬 Video Duration:', material.videoDuration, 'seconds');
      console.log('🔗 Video URL:', materialData.videoUrl.substring(0, 70) + '...');
    }
    
    console.log('========================================\n');
    
    // Store success message in session
    req.session.successMessage = {
      title: material.title,
      type: fileType,
      id: material.id,
      isPublished: material.isPublished,
      timestamp: new Date()
    };
    
    res.redirect('/counselor/materials?success=1');
  } catch (error) {
    console.error('========================================');
    console.error('❌ MATERIAL CREATION FAILED');
    console.error('========================================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('========================================\n');
    req.session.errorMessage = 'Failed to create material: ' + error.message;
    res.redirect('/counselor/materials/new?error=' + encodeURIComponent(error.message));
  }
});

// Edit Material Form
router.get("/counselor/materials/edit/:id", isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'counselor') {
      return res.status(403).render("403", { title: "Access Denied" });
    }
    
    const { ReadingMaterial } = await import('../models/index.js');
    
    const material = await ReadingMaterial.findOne({
      where: { id: req.params.id, counselorId: req.user.id }
    });
    
    if (!material) {
      return res.status(404).render("404", { title: "Material Not Found" });
    }
    
    res.render("counselor/edit-material", { 
      title: "Edit Material", 
      user: req.user,
      material
    });
  } catch (error) {
    console.error('Edit material error:', error);
    res.status(500).render("404", { title: "Error" });
  }
});

// Update Material
router.post("/counselor/materials/update/:id", isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'counselor') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { ReadingMaterial } = await import('../models/index.js');
    const { title, category, excerpt, content, readingTime, isPublished, fileType, videoUrl, videoDuration } = req.body;
    
    const material = await ReadingMaterial.findOne({
      where: { id: req.params.id, counselorId: req.user.id }
    });
    
    if (!material) {
      return res.status(404).send('Material not found');
    }
    
    // Update slug if title changed
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const updateData = {
      title,
      slug,
      category,
      excerpt,
      content,
      readingTime: parseInt(readingTime) || 5,
      isPublished: isPublished === 'true' || isPublished === 'on' || isPublished === true || !isPublished,
      fileType: fileType || material.fileType
    };
    
    // ✅ Handle video URL update
    if (fileType === 'video' && videoUrl) {
      updateData.videoUrl = convertToEmbedURL(videoUrl);
      updateData.videoDuration = parseInt(videoDuration) || 300;
      updateData.readingTime = Math.ceil(parseInt(videoDuration || 300) / 60);
    }
    
    await material.update(updateData);
    
    console.log('✅ Material updated:', material.id, material.title);
    res.redirect('/counselor/materials');
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).send('Error updating material');
  }
});

// Publish Material (Quick Action)
router.post("/counselor/materials/publish/:id", isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'counselor') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    const { ReadingMaterial } = await import('../models/index.js');
    
    const material = await ReadingMaterial.findOne({
      where: { id: req.params.id, counselorId: req.user.id }
    });
    
    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    // Check if already published
    if (material.isPublished) {
      return res.json({ 
        success: true, 
        message: 'Material already published',
        isPublished: true,
        materialId: material.id,
        title: material.title
      });
    }
    
    await material.update({ isPublished: true });

    console.log('\n========================================');
    console.log('✅ MATERIAL PUBLISHED');
    console.log('========================================');
    console.log('📋 Material ID:', material.id);
    console.log('📝 Title:', material.title);
    console.log('🔓 Status: Published ✓ (Now visible to students)');
    console.log('👤 Counselor:', req.user.name);
    console.log('📅 Published at:', new Date().toLocaleString());
    console.log('========================================\n');
    
    res.json({ 
      success: true, 
      message: 'Material published successfully! It is now visible to students.',
      isPublished: true,
      materialId: material.id,
      title: material.title
    });
  } catch (error) {
    console.error('❌ Publish material error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error publishing material: ' + error.message 
    });
  }
});

// Delete Material
router.post("/counselor/materials/delete/:id", isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'counselor') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { ReadingMaterial } = await import('../models/index.js');
    
    const material = await ReadingMaterial.findOne({
      where: { id: req.params.id, counselorId: req.user.id }
    });
    
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    await material.destroy();
    
    console.log('✅ Material deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ error: 'Error deleting material' });
  }
});

// Analytics
router.get("/counselor/analytics", isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'counselor') {
      return res.status(403).render("403", { title: "Access Denied" });
    }
    
    const { sequelize: dbSequelize } = await import('../models/db.js');
    const { ReadingMaterial } = await import('../models/index.js');
    const ReadingMaterialCommentModel = (await import('../models/ReadingMaterialCommentModel.js')).default;
    const SavedMaterialModel = (await import('../models/SavedMaterialModel.js')).default;
    
    const ReadingMaterialComment = ReadingMaterialCommentModel(dbSequelize);
    const SavedMaterial = SavedMaterialModel(dbSequelize);
    
    // Get all materials for this counselor
    const allMaterials = await ReadingMaterial.findAll({ 
      where: { counselorId: req.user.id },
      order: [['views', 'DESC']],
      raw: true
    });

    // Calculate basic stats
    const totalMaterials = allMaterials.length;
    const publishedMaterials = allMaterials.filter(m => m.isPublished).length;
    const draftCount = totalMaterials - publishedMaterials;
    const totalViews = allMaterials.reduce((sum, m) => sum + (m.views || 0), 0);
    const avgViewsPerMaterial = totalMaterials > 0 ? Math.round(totalViews / totalMaterials) : 0;

    // Get material IDs for querying comments and saves
    const materialIds = allMaterials.map(m => m.id);
    
    // Query for comments count
    let totalComments = 0;
    if (materialIds.length > 0) {
      totalComments = await ReadingMaterialComment.count({
        where: { materialId: { [Op.in]: materialIds } }
      }).catch(() => 0);
    }

    // Query for saves count
    let totalSaved = 0;
    if (materialIds.length > 0) {
      totalSaved = await SavedMaterial.count({
        where: { materialId: { [Op.in]: materialIds } }
      }).catch(() => 0);
    }

    // Calculate engagement rate
    const engagementRate = totalMaterials > 0 ? Math.round((publishedMaterials / totalMaterials) * 100) : 0;
    const publishedPercent = totalMaterials > 0 ? Math.round((publishedMaterials / totalMaterials) * 100) : 0;
    const draftPercent = totalMaterials > 0 ? Math.round((draftCount / totalMaterials) * 100) : 0;

    // Get detailed top 5 materials with comment and save counts
    const topMaterials = [];
    for (let i = 0; i < Math.min(5, allMaterials.length); i++) {
      const material = allMaterials[i];
      const commentCount = await ReadingMaterialComment.count({
        where: { materialId: material.id }
      }).catch(() => 0);
      const savedCount = await SavedMaterial.count({
        where: { materialId: material.id }
      }).catch(() => 0);

      topMaterials.push({
        id: material.id,
        title: material.title || 'Untitled Material',
        views: material.views || 0,
        avgRating: 4.5,
        savedCount,
        commentCount
      });
    }

    // Get category breakdown
    const categoryData = {};
    allMaterials.forEach(material => {
      const cat = material.category || 'Other';
      categoryData[cat] = (categoryData[cat] || 0) + 1;
    });

    const categoryBreakdown = Object.entries(categoryData).map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count
    }));

    // Prepare chart data - top 10 materials
    const materialsChartData = allMaterials.slice(0, 10).map(m => ({
      title: (m.title || 'Untitled').substring(0, 25),
      views: m.views || 0,
      savedCount: 0,
      commentCount: 0,
      avgRating: 4.5
    }));

    // Calculate additional metrics
    const avgCommentsPerMaterial = totalMaterials > 0 ? Math.round(totalComments / totalMaterials) : 0;
    const saveRate = totalMaterials > 0 ? Math.round((totalSaved / (totalMaterials * 10)) * 100) : 0;
    const maxViews = allMaterials.length > 0 ? Math.max(...allMaterials.map(m => m.views || 0)) : 0;
    const categoryCount = Object.keys(categoryData).length;
    const publishedMaterials_ = publishedMaterials;
    
    // Format updated time
    const now = new Date();
    const updatedAt = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    res.render("counselor/analytics", { 
      title: "Analytics", 
      user: req.user,
      stats: {
        totalMaterials,
        publishedMaterials: publishedMaterials_,
        totalViews,
        avgRating: 4.5
      },
      draftCount,
      avgViewsPerMaterial,
      totalComments,
      totalSaved,
      engagementRate,
      publishedPercent,
      draftPercent,
      publishedMaterials: publishedMaterials_,
      topMaterials,
      materialsData: JSON.stringify(materialsChartData),
      categoryData: JSON.stringify(categoryBreakdown),
      avgCommentsPerMaterial,
      saveRate,
      maxViews,
      categoryCount,
      updatedAt
    });
  } catch (error) {
    console.error('Counselor analytics error:', error);
    res.status(500).render("404", { title: "Error" });
  }
});

// ==================== COUNSELOR STUDENTS ROUTES ====================

// View all students
router.get("/counselor/students", isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'counselor') {
      return res.status(403).render("403", { title: "Access Denied" });
    }

    let User;
    try {
      const models = await import("../models/index.js");
      User = models.User;
      if (!User) {
        throw new Error("User model not found in models/index.js");
      }
    } catch (importError) {
      console.error('Failed to import User model:', importError);
      throw importError;
    }

    const students = await User.findAll({
      where: { role: 'user' },
      attributes: ['id', 'name', 'email', 'course', 'year', 'section', 'contactNumber', 'profilePicture'],
      order: [['name', 'ASC']]
    });

    // Calculate stats
    const totalStudents = students.length;
    const uniqueCourses = [...new Set(students.map(s => s.course).filter(c => c))].length;
    const yearLevels = students.map(s => {
      const yearStr = s.year;
      if (!yearStr) return 0;
      return parseInt(yearStr.charAt(0)) || 0;
    });
    const averageYear = yearLevels.length > 0 
      ? (Math.round(yearLevels.reduce((a, b) => a + b, 0) / yearLevels.length * 10) / 10).toFixed(1)
      : '0';

    res.render("counselor/students", {
      title: "Students Information",
      user: req.user,
      students,
      totalStudents,
      uniqueCourses,
      averageYear
    });
  } catch (error) {
    console.error('Counselor students list error:', error);
    res.status(500).render("404", { title: "Error Loading Students" });
  }
});

// View individual student details
router.get("/counselor/students/:id", isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'counselor') {
      return res.status(403).render("403", { title: "Access Denied" });
    }

    let User;
    try {
      const models = await import("../models/index.js");
      User = models.User;
      if (!User) {
        throw new Error("User model not found in models/index.js");
      }
    } catch (importError) {
      console.error('Failed to import User model:', importError);
      throw importError;
    }

    const student = await User.findByPk(req.params.id);
    
    if (!student || student.role !== 'user') {
      return res.status(404).render("404", { title: "Student Not Found" });
    }

    res.render("counselor/student-detail", {
      title: `${student.name} - Student Profile`,
      user: req.user,
      student
    });
  } catch (error) {
    console.error('Counselor student detail error:', error);
    res.status(500).render("404", { title: "Error Loading Student Profile" });
  }
});

// ==================== STUDENT ACTIVITY ROUTES ====================

// View all student activities list
router.get("/counselor/student-activity", isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'counselor') {
      return res.status(403).render("403", { title: "Access Denied" });
    }

    const { User, JournalEntry, GameSession, ReadingSession, ReadingMaterialComment, ReadingMaterialReaction } = await import("../models/index.js");

    // Get all students
    const students = await User.findAll({
      where: { role: 'user' },
      attributes: ['id', 'name', 'email', 'course', 'year', 'section', 'contactNumber', 'profilePicture'],
      order: [['name', 'ASC']]
    });

    // Get activity data for each student
    const activities = await Promise.all(
      students.map(async (student) => {
        const journalCount = await JournalEntry.count({ where: { userId: student.id } });
        const gameCount = await GameSession.count({ where: { userId: student.id } });
        const readingCount = await ReadingSession.count({ where: { userId: student.id } });
        const videoCount = await ReadingSession.count({ 
          where: { userId: student.id },
          include: [{
            association: 'material',
            where: { fileType: 'video' },
            attributes: [],
            required: true
          }]
        }).catch(() => 0);
        const commentCount = await ReadingMaterialComment.count({ where: { userId: student.id } });
        const reactionCount = await ReadingMaterialReaction.count({ where: { userId: student.id } });

        // Get last activity date
        const lastJournal = await JournalEntry.findOne({
          where: { userId: student.id },
          order: [['createdAt', 'DESC']]
        });

        const lastGame = await GameSession.findOne({
          where: { userId: student.id },
          order: [['createdAt', 'DESC']]
        });
        const lastReading = await ReadingSession.findOne({
          where: { userId: student.id },
          order: [['createdAt', 'DESC']]
        });
        const lastComment = await ReadingMaterialComment.findOne({
          where: { userId: student.id },
          order: [['createdAt', 'DESC']]
        });
        const lastReaction = await ReadingMaterialReaction.findOne({
          where: { userId: student.id },
          order: [['createdAt', 'DESC']]
        });

        const dates = [
          lastJournal?.createdAt,
          lastGame?.createdAt,
          lastReading?.createdAt,
          lastComment?.createdAt,
          lastReaction?.createdAt
        ].filter(d => d);
        
        const lastActivityDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => new Date(d)))) : null;

        return {
          studentId: student.id,
          studentName: student.name,
          email: student.email,
          course: student.course,
          year: student.year,
          section: student.section,
          profilePicture: student.profilePicture,
          journalEntries: journalCount || 0,
          gameSessions: gameCount || 0,
          readingSessions: readingCount || 0,
          videoWatches: videoCount || 0,
          comments: commentCount || 0,
          reactions: reactionCount || 0,
          totalActivities: journalCount + gameCount + readingCount + videoCount + commentCount + reactionCount,
          lastActivityDate,
          streak: 0 // Calculate if needed
        };
      })
    );

    // Filter out students with no activities
    const filteredActivities = activities.filter(a => a.totalActivities > 0);

    const totalStudents = students.length;
    const activeStudents = filteredActivities.length;
    const totalActivities = filteredActivities.reduce((sum, a) => sum + a.totalActivities, 0);

    // Count activities from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayActivities = filteredActivities.filter(a => {
      if (!a.lastActivityDate) return false;
      const actDate = new Date(a.lastActivityDate);
      actDate.setHours(0, 0, 0, 0);
      return actDate.getTime() === today.getTime();
    }).length;

    res.render("counselor/student-activity", {
      title: "Student Activity",
      user: req.user,
      activities: filteredActivities,
      totalStudents,
      activeStudents,
      totalActivities,
      todayActivities
    });
  } catch (error) {
    console.error('Student activity list error:', error);
    res.status(500).render("404", { title: "Error Loading Activities" });
  }
});

// View individual student activity details
router.get("/counselor/student-activity/:id", isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'counselor') {
      return res.status(403).render("403", { title: "Access Denied" });
    }

    const { User, JournalEntry, GameSession, ReadingSession, ReadingMaterialComment, ReadingMaterialReaction } = await import("../models/index.js");

    // Get student info
    const student = await User.findByPk(req.params.id);
    
    if (!student || student.role !== 'user') {
      return res.status(404).render("404", { title: "Student Not Found" });
    }

    // Get all activity types
    const journalEntries = await JournalEntry.findAll({
      where: { userId: student.id },
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    const gameSessions = await GameSession.findAll({
      where: { userId: student.id },
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    const readingSessions = await ReadingSession.findAll({
      where: { userId: student.id },
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    const comments = await ReadingMaterialComment.findAll({
      where: { userId: student.id },
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    const reactions = await ReadingMaterialReaction.findAll({
      where: { userId: student.id },
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    // Calculate stats
    const totalActivities = journalEntries.length + gameSessions.length + readingSessions.length + comments.length + reactions.length;
    
    const allDates = [
      ...journalEntries.map(j => new Date(j.createdAt)),
      ...gameSessions.map(g => new Date(g.createdAt)),
      ...readingSessions.map(r => new Date(r.createdAt)),
      ...comments.map(c => new Date(c.createdAt)),
      ...reactions.map(r => new Date(r.createdAt))
    ].sort((a, b) => b - a);

    const lastActivityDate = allDates.length > 0 ? allDates[0] : null;
    const memberSince = student.createdAt;
    const streak = 0; // Calculate if needed

    res.render("counselor/student-activity-detail", {
      title: `${student.name} - Activity Report`,
      user: req.user,
      student,
      journalEntries: journalEntries.length > 0 ? journalEntries : null,
      gameSessions: gameSessions.length > 0 ? gameSessions : null,
      readingSessions: readingSessions.length > 0 ? readingSessions : null,
      comments: comments.length > 0 ? comments : null,
      reactions: reactions.length > 0 ? reactions : null,
      totalActivities,
      lastActivityDate,
      memberSince,
      streak
    });
  } catch (error) {
    console.error('Student activity detail error:', error);
    res.status(500).render("404", { title: "Error Loading Activity Details" });
  }
});

// ==================== ADMIN ROUTES (Protected + Admin Only) ====================
router.get("/admin/dashboard", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { User, UserProgress, Activity, GameSession, JournalEntry, ReadingSession, ReadingMaterial } = await import('../models/index.js');
    
    // Get pending counselor accounts (exclude current admin)
    const pendingCounselors = await User.findAll({
      where: {
        role: 'counselor',
        accountStatus: 'pending',
        id: { [Op.ne]: req.user.id }
      },
      order: [['createdAt', 'ASC']]
    });
    
    // Get all approved counselors (exclude current admin)
    const approvedCounselors = await User.findAll({
      where: {
        role: 'counselor',
        accountStatus: 'active',
        id: { [Op.ne]: req.user.id }
      },
      include: [{
        model: UserProgress,
        as: 'progress'
      }],
      order: [['lastActive', 'DESC']]
    });
    
    // Get detailed stats for each counselor
    const counselorsWithStats = await Promise.all(approvedCounselors.map(async (counselor) => {
      const gameSessions = await GameSession.findAll({
        where: { userId: counselor.id },
        order: [['createdAt', 'DESC']],
        limit: 10
      });
      
      const journalEntries = await JournalEntry.findAll({
        where: { userId: counselor.id },
        order: [['createdAt', 'DESC']],
        limit: 10
      });
      
      const readingSessions = await ReadingSession.findAll({
        where: { userId: counselor.id },
        include: [{
          model: ReadingMaterial,
          as: 'material',
          attributes: ['title', 'fileType']
        }],
        order: [['createdAt', 'DESC']],
        limit: 10
      });
      
      const totalGameTime = gameSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      const totalReadingTime = readingSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      
      return {
        ...counselor.toJSON(),
        gameSessions,
        journalEntries,
        readingSessions,
        totalGameTime,
        totalReadingTime,
        totalActivities: gameSessions.length + journalEntries.length + readingSessions.length
      };
    }));
    
    // Get all regular users (exclude current admin)
    const users = await User.findAll({
      where: {
        role: 'user',
        id: { [Op.ne]: req.user.id }
      },
      include: [{
        model: UserProgress,
        as: 'progress'
      }],
      order: [['lastActive', 'DESC']]
    });
    
    // Get detailed stats for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const gameSessions = await GameSession.findAll({
        where: { userId: user.id },
        order: [['createdAt', 'DESC']],
        limit: 10
      });
      
      const journalEntries = await JournalEntry.findAll({
        where: { userId: user.id },
        order: [['createdAt', 'DESC']],
        limit: 10
      });
      
      const readingSessions = await ReadingSession.findAll({
        where: { userId: user.id },
        include: [{
          model: ReadingMaterial,
          as: 'material',
          attributes: ['title', 'fileType']
        }],
        order: [['createdAt', 'DESC']],
        limit: 10
      });
      
      // Calculate total time spent
      const totalGameTime = gameSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      const totalReadingTime = readingSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      
      return {
        ...user.toJSON(),
        gameSessions,
        journalEntries,
        readingSessions,
        totalGameTime,
        totalReadingTime,
        totalActivities: gameSessions.length + journalEntries.length + readingSessions.length
      };
    }));
    
    // Get recent activities across all users
    const recentGameSessions = await GameSession.findAll({
      include: [{
        model: User,
        attributes: ['name', 'email'],
        where: { role: 'user' }
      }],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    
    const recentJournals = await JournalEntry.findAll({
      include: [{
        model: User,
        attributes: ['name', 'email'],
        where: { role: 'user' }
      }],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    
    const recentReading = await ReadingSession.findAll({
      include: [
        {
          model: User,
          attributes: ['name', 'email'],
          where: { role: 'user' }
        },
        {
          model: ReadingMaterial,
          as: 'material',
          attributes: ['title', 'fileType']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    
    // Calculate statistics
    const totalUsers = await User.count({ where: { role: 'user' } });
    const totalGames = await GameSession.count();
    const totalJournals = await JournalEntry.count();
    const totalReadingSessions = await ReadingSession.count();
    
    // Get today's active users
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeToday = await User.count({
      where: {
        role: 'user',
        lastActive: {
          [Op.gte]: today
        }
      }
    });
    
    // Game type statistics
    const gameStats = await GameSession.findAll({
      attributes: [
        'gameType',
        [GameSession.sequelize.fn('COUNT', GameSession.sequelize.col('id')), 'count'],
        [GameSession.sequelize.fn('SUM', GameSession.sequelize.col('duration')), 'totalDuration']
      ],
      group: ['gameType']
    });
    
    // Get real system status
    const system = await systemStatus.getSystemStatus(User.sequelize);
    
    // Calculate engagement and retention metrics
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const activeUsers7Days = await User.count({
      where: {
        role: 'user',
        lastActive: { [Op.gte]: last7Days }
      }
    });
    
    const activeUsers30Days = await User.count({
      where: {
        role: 'user',
        lastActive: { [Op.gte]: last30Days }
      }
    });
    
    const retention7Days = totalUsers > 0 ? Math.round((activeUsers7Days / totalUsers) * 100) : 0;
    const retention30Days = totalUsers > 0 ? Math.round((activeUsers30Days / totalUsers) * 100) : 0;
    
    // Calculate total time spent in system
    const totalGameTime = await GameSession.findAll({
      attributes: [[GameSession.sequelize.fn('SUM', GameSession.sequelize.col('duration')), 'total']],
      raw: true
    });
    
    const totalReadingTime = await ReadingSession.findAll({
      attributes: [[ReadingSession.sequelize.fn('SUM', ReadingSession.sequelize.col('duration')), 'total']],
      raw: true
    });
    
    const totalSystemTime = (totalGameTime[0]?.total || 0) + (totalReadingTime[0]?.total || 0);
    
    res.render("admin/admindashboard", { 
      title: "Admin Dashboard", 
      user: req.user,
      users: usersWithStats,
      counselors: counselorsWithStats,
      approvedCounselors,
      pendingCounselors,
      recentGameSessions,
      recentJournals,
      recentReading,
      gameStats,
      stats: {
        totalUsers,
        totalGames,
        totalJournals,
        totalReadingSessions,
        activeToday,
        activeUsers7Days,
        activeUsers30Days,
        retention7Days,
        retention30Days,
        totalSystemTime
      },
      system
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    const system = await systemStatus.getSystemStatus(null);
    
    res.render("admin/admindashboard", { 
      title: "Admin Dashboard", 
      user: req.user,
      users: [],
      approvedCounselors: [],
      pendingCounselors: [],
      recentGameSessions: [],
      recentJournals: [],
      recentReading: [],
      gameStats: [],
      stats: {
        totalUsers: 0,
        totalGames: 0,
        totalJournals: 0,
        totalReadingSessions: 0,
        activeToday: 0,
        activeUsers7Days: 0,
        activeUsers30Days: 0,
        retention7Days: 0,
        retention30Days: 0,
        totalSystemTime: 0
      },
      system
    });
  }
});

router.get("/admin/analytics", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { User, GameSession, JournalEntry, ReadingSession, UserProgress } = await import('../models/index.js');
    
    // Get all game sessions with user data
    const allGameSessions = await GameSession.findAll({
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }]
    });
    
    // Get all journal entries
    const allJournals = await JournalEntry.findAll();
    
    // Get all reading sessions
    const allReadings = await ReadingSession.findAll();
    
    // Calculate game statistics
    const totalGameDuration = allGameSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const avgGameScore = allGameSessions.length > 0 
      ? Math.round(allGameSessions.reduce((sum, session) => sum + (session.score || 0), 0) / allGameSessions.length)
      : 0;
    const avgGameDuration = allGameSessions.length > 0 
      ? Math.round(totalGameDuration / allGameSessions.length)
      : 0;
    const completedGames = allGameSessions.filter(g => g.completed).length;
    const completionRate = allGameSessions.length > 0
      ? Math.round((completedGames / allGameSessions.length) * 100)
      : 0;
    
    // Calculate engagement rate
    const activeUsers = await User.count({
      where: {
        lastActive: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });
    const totalUsers = await User.count({ where: { role: 'user' } });
    const engagementRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
    
    // Get game statistics by type
    const gameStats = await GameSession.findAll({
      attributes: [
        'gameType',
        [GameSession.sequelize.fn('COUNT', GameSession.sequelize.col('id')), 'count'],
        [GameSession.sequelize.fn('SUM', GameSession.sequelize.col('duration')), 'totalDuration'],
        [GameSession.sequelize.fn('SUM', GameSession.sequelize.col('completed')), 'completed']
      ],
      group: ['gameType'],
      raw: true
    });
    
    // Calculate completion rate per game
    const gameStatsWithCompletion = gameStats.map(game => ({
      ...game,
      completionRate: game.count > 0 ? Math.round((game.completed / game.count) * 100) : 0,
      avgDuration: game.count > 0 ? Math.round(game.totalDuration / game.count) : 0
    }));
    
    // Get top engaged users
    const allUsers = await User.findAll({
      where: { role: 'user' },
      include: [{
        model: UserProgress,
        as: 'progress'
      }]
    });
    
    const topUsers = await Promise.all(allUsers.map(async (user) => {
      const gameCount = await GameSession.count({ where: { userId: user.id } });
      const journalCount = await JournalEntry.count({ where: { userId: user.id } });
      const readingCount = await ReadingSession.count({ where: { userId: user.id } });
      
      return {
        name: user.name,
        email: user.email,
        gameCount,
        journalCount,
        readingCount,
        totalPoints: user.progress?.totalPoints || 0,
        level: user.progress?.level || 'beginner'
      };
    }));
    
    // Sort and get top 10
    const topEngagedUsers = topUsers
      .sort((a, b) => (b.gameCount + b.journalCount + b.readingCount) - (a.gameCount + a.journalCount + a.readingCount))
      .slice(0, 10);
    
    // Activity stats
    const activityStats = {
      games: allGameSessions.length,
      journals: allJournals.length,
      reading: allReadings.length
    };
    
    res.render("admin/analytics", { 
      title: "Analytics", 
      user: req.user,
      avgGameScore,
      avgGameDuration,
      completionRate,
      engagementRate,
      gameStats: gameStatsWithCompletion,
      activityStats,
      topUsers: topEngagedUsers
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.render("admin/analytics", { 
      title: "Analytics", 
      user: req.user,
      avgGameScore: 0,
      avgGameDuration: 0,
      completionRate: 0,
      engagementRate: 0,
      gameStats: [],
      activityStats: { games: 0, journals: 0, reading: 0 },
      topUsers: []
    });
  }
});

router.get("/admin/settings", isAuthenticated, isAdmin, (req, res) => {
  res.render("admin/settings", { title: "Settings", user: req.user });
});

router.get("/admin/users", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { User, UserProgress, GameSession, JournalEntry, ReadingSession } = await import('../models/index.js');
    
    // Get all users and counselors with their stats
    const allUsers = await User.findAll({
      where: { 
        role: { [Op.in]: ['user', 'counselor'] }
      },
      include: [{
        model: UserProgress,
        as: 'progress'
      }],
      order: [['lastActive', 'DESC']]
    });
    
    // Get stats for each user
    const usersWithStats = await Promise.all(allUsers.map(async (user) => {
      const gameSessions = await GameSession.count({ where: { userId: user.id } });
      const journalEntries = await JournalEntry.count({ where: { userId: user.id } });
      const readingSessions = await ReadingSession.count({ where: { userId: user.id } });
      
      return {
        ...user.toJSON(),
        totalActivities: gameSessions + journalEntries + readingSessions,
        gameCount: gameSessions,
        journalCount: journalEntries,
        readingCount: readingSessions
      };
    }));
    
    res.render("admin/users-list", { 
      title: "User Management", 
      user: req.user,
      users: usersWithStats
    });
  } catch (error) {
    console.error('Admin users page error:', error);
    res.render("admin/users-list", { 
      title: "User Management", 
      user: req.user,
      users: []
    });
  }
});

router.get("/admin/reports", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { Feedback, User } = await import('../models/index.js');
    
    // Get all reports/feedback with user info
    const reports = await Feedback.findAll({
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Calculate statistics by status
    const stats = {
      new: reports.filter(r => r.status === 'new').length,
      read: reports.filter(r => r.status === 'read').length,
      in_progress: reports.filter(r => r.status === 'in_progress').length,
      resolved: reports.filter(r => r.status === 'resolved').length
    };

    res.render("admin/user-reports", { 
      title: "User Reports", 
      user: req.user,
      reports: reports,
      stats: stats
    });
  } catch (error) {
    console.error('Admin reports page error:', error);
    res.render("admin/user-reports", { 
      title: "User Reports", 
      user: req.user,
      reports: [],
      stats: { new: 0, read: 0, in_progress: 0, resolved: 0 }
    });
  }
});

// View individual report details
router.get("/admin/reports/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { Feedback, User } = await import('../models/index.js');
    
    // Get specific report with user info
    const report = await Feedback.findOne({
      where: { id: req.params.id },
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'name', 'email', 'phone', 'age']
      }]
    });

    if (!report) {
      return res.status(404).render("404", { title: "Report Not Found" });
    }

    // Mark as read if not already
    if (report.status === 'new') {
      await report.update({ status: 'read' });
    }

    res.render("admin/report-detail", { 
      title: "Report Details", 
      user: req.user,
      report: report
    });
  } catch (error) {
    console.error('Admin report detail error:', error);
    res.status(500).render("404", { title: "Error Loading Report" });
  }
});

// Submit admin response to report
router.post("/admin/reports/:id/respond", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { Feedback } = await import('../models/index.js');
    const { adminResponse } = req.body;
    
    if (!adminResponse || adminResponse.trim() === '') {
      return res.redirect(`/admin/reports/${req.params.id}`);
    }

    const report = await Feedback.findByPk(req.params.id);
    
    if (!report) {
      return res.status(404).render("404", { title: "Report Not Found" });
    }

    await report.update({
      adminResponse,
      responseDate: new Date()
    });

    console.log('Admin response added to report:', req.params.id);
    res.redirect(`/admin/reports/${req.params.id}`);
  } catch (error) {
    console.error('Error posting response:', error);
    res.status(500).render("404", { title: "Error" });
  }
});

// Update report status
router.post("/admin/reports/:id/status", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { Feedback } = await import('../models/index.js');
    const { status } = req.body;
    
    const validStatuses = ['new', 'read', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const report = await Feedback.findByPk(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    await report.update({ status });

    console.log('Report status updated:', req.params.id, status);
    res.redirect(`/admin/reports/${req.params.id}`);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).render("404", { title: "Error" });
  }
});

// View reports for a specific user
router.get("/admin/users/:userId/reports", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { Feedback, User } = await import('../models/index.js');
    
    // Get the user
    const targetUser = await User.findByPk(req.params.userId, {
      attributes: ['id', 'name', 'email']
    });

    if (!targetUser) {
      return res.status(404).render("404", { title: "User Not Found" });
    }

    // Get reports for this user
    const reports = await Feedback.findAll({
      where: { userId: req.params.userId },
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Calculate statistics
    const stats = {
      new: reports.filter(r => r.status === 'new').length,
      read: reports.filter(r => r.status === 'read').length,
      in_progress: reports.filter(r => r.status === 'in_progress').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      total: reports.length
    };

    res.render("admin/user-reports", { 
      title: `Reports - ${targetUser.name}`, 
      user: req.user,
      targetUser,
      reports: reports,
      stats: stats,
      isUserReports: true
    });
  } catch (error) {
    console.error('Admin user reports error:', error);
    res.status(500).render("404", { title: "Error Loading Reports" });
  }
});

router.get("/admin/activity-log", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { User, GameSession, JournalEntry, ReadingSession, ReadingMaterial, UserProgress } = await import('../models/index.js');
    
    // Get recent game sessions with user info and points
    const gameActivities = await GameSession.findAll({
      include: [{
        model: User,
        attributes: ['id', 'name', 'email'],
        include: [{
          model: UserProgress,
          as: 'progress',
          attributes: ['totalPoints']
        }]
      }],
      order: [['createdAt', 'DESC']],
      limit: 50,
      raw: false
    });
    
    // Get recent journal entries with user info
    const journalActivities = await JournalEntry.findAll({
      include: [{
        model: User,
        attributes: ['id', 'name', 'email'],
        include: [{
          model: UserProgress,
          as: 'progress',
          attributes: ['totalPoints']
        }]
      }],
      order: [['createdAt', 'DESC']],
      limit: 50,
      raw: false
    });
    
    // Get recent reading sessions with user info
    const readingActivities = await ReadingSession.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
          include: [{
            model: UserProgress,
            as: 'progress',
            attributes: ['totalPoints']
          }]
        },
        {
          model: ReadingMaterial,
          as: 'material',
          attributes: ['title']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50,
      raw: false
    });
    
    // Combine and sort all activities by timestamp
    const allActivities = [];
    
    gameActivities.forEach(game => {
      if (game.User) {
        allActivities.push({
          id: `game-${game.id}`,
          type: 'game',
          timestamp: game.createdAt,
          userName: game.User.name,
          userEmail: game.User.email,
          userPoints: game.User.progress?.totalPoints || 0,
          details: {
            gameType: game.gameType,
            score: game.score,
            duration: game.duration,
            difficulty: game.difficultyLevel,
            completed: game.completed
          }
        });
      }
    });
    
    journalActivities.forEach(journal => {
      if (journal.User) {
        const content = journal.content || '';
        const wordCount = content.split(/\s+/).length;
        allActivities.push({
          id: `journal-${journal.id}`,
          type: 'journal',
          timestamp: journal.createdAt,
          userName: journal.User.name,
          userEmail: journal.User.email,
          userPoints: journal.User.progress?.totalPoints || 0,
          details: {
            title: journal.title,
            mood: journal.mood,
            wordCount: wordCount
          }
        });
      }
    });
    
    readingActivities.forEach(reading => {
      if (reading.User) {
        allActivities.push({
          id: `reading-${reading.id}`,
          type: 'reading',
          timestamp: reading.createdAt,
          userName: reading.User.name,
          userEmail: reading.User.email,
          userPoints: reading.User.progress?.totalPoints || 0,
          details: {
            materialTitle: reading.material?.title || 'Unknown Material',
            duration: reading.duration,
            completed: reading.completed
          }
        });
      }
    });
    
    // Sort by timestamp descending (most recent first)
    const recentActivities = allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 60);
    
    res.render("admin/activity-log", { 
      title: "Activity Log", 
      user: req.user,
      recentActivities
    });
  } catch (error) {
    console.error('Admin activity log error:', error);
    res.render("admin/activity-log", { 
      title: "Activity Log", 
      user: req.user,
      recentActivities: []
    });
  }
});

router.get("/admin/users/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { User, UserProgress, Activity, GameSession, JournalEntry, ReadingSession, ReadingMaterial } = await import('../models/index.js');
    const userId = req.params.id;
    
    // Get user with all their data
    const user = await User.findByPk(userId, {
      include: [{
        model: UserProgress,
        as: 'progress'
      }]
    });

    if (!user) {
      return res.status(404).render("404", { title: "User Not Found" });
    }

    // Get user's activities
    const activities = await Activity.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    // Get user's game sessions
    const gameSessions = await GameSession.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    // Get user's journal entries
    const journalEntries = await JournalEntry.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    // Get user's reading sessions
    const readingSessions = await ReadingSession.findAll({
      where: { userId },
      include: [{
        model: ReadingMaterial,
        as: 'material',
        attributes: ['title', 'fileType']
      }],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    res.render("admin/user-detail", { 
      title: `User Details - ${user.name}`,
      user: req.user,
      targetUser: user,
      activities,
      gameSessions,
      journalEntries,
      readingSessions
    });
  } catch (error) {
    console.error('User detail error:', error);
    res.status(500).render("404", { title: "Error Loading User" });
  }
});

// ==================== COUNSELOR APPROVAL ROUTES (Admin Only) ====================
router.post("/admin/counselor/approve/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { User } = await import('../models/index.js');
    const counselor = await User.findByPk(req.params.id);
    
    if (!counselor || counselor.role !== 'counselor') {
      return res.status(404).json({ message: 'Counselor not found' });
    }
    
    await counselor.update({
      accountStatus: 'active',
      approvedBy: req.user.id,
      approvedAt: new Date()
    });
    
    res.json({ success: true, message: 'Counselor approved successfully' });
  } catch (error) {
    console.error('Approve counselor error:', error);
    res.status(500).json({ message: 'Failed to approve counselor' });
  }
});

router.post("/admin/counselor/reject/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { User } = await import('../models/index.js');
    const { reason } = req.body;
    const counselor = await User.findByPk(req.params.id);
    
    if (!counselor || counselor.role !== 'counselor') {
      return res.status(404).json({ message: 'Counselor not found' });
    }
    
    await counselor.update({
      accountStatus: 'rejected',
      rejectionReason: reason || 'No reason provided'
    });
    
    res.json({ success: true, message: 'Counselor rejected' });
  } catch (error) {
    console.error('Reject counselor error:', error);
    res.status(500).json({ message: 'Failed to reject counselor' });
  }
});

// ==================== CREATE COUNSELOR ROUTES (Admin Only) ====================
router.get("/admin/create-counselor", isAuthenticated, isAdmin, (req, res) => {
  res.render("admin/create-counselor", { 
    title: "Create Counselor",
    user: req.user
  });
});

router.post("/admin/create-counselor", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, email, password, confirmPassword, specialty, contactNumber, notes } = req.body;
    const { User, Activity } = await import('../models/index.js');
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).render("admin/create-counselor", { 
        title: "Create Counselor",
        user: req.user,
        error: "All required fields must be filled"
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).render("admin/create-counselor", { 
        title: "Create Counselor",
        user: req.user,
        error: "Name must be at least 2 characters"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).render("admin/create-counselor", { 
        title: "Create Counselor",
        user: req.user,
        error: "Passwords do not match"
      });
    }

    if (password.length < 6) {
      return res.status(400).render("admin/create-counselor", { 
        title: "Create Counselor",
        user: req.user,
        error: "Password must be at least 6 characters"
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).render("admin/create-counselor", { 
        title: "Create Counselor",
        user: req.user,
        error: "Email already registered in the system"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create counselor account with active status
    const counselor = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'counselor',
      accountStatus: 'active', // Admin created counselors are immediately active
      specialty: specialty || null,
      contactNumber: contactNumber || null,
      createdBy: req.user.id,
      approvedAt: new Date(),
      approvedBy: req.user.id
    });

    // Log the activity
    await Activity.create({
      userId: req.user.id,
      type: 'admin_action',
      description: `Admin created new counselor account for ${counselor.name} (${counselor.email})`,
      metadata: {
        counselorId: counselor.id,
        specialty: specialty,
        notes: notes
      }
    }).catch(err => console.error("Activity log error:", err));

    console.log(`✅ Counselor created: ${counselor.name} (${counselor.email})`);

    // Redirect to user details or users list with success message
    res.redirect(`/admin/users/${counselor.id}?success=Counselor created successfully`);
  } catch (error) {
    console.error('Create counselor error:', error);
    res.status(500).render("admin/create-counselor", { 
      title: "Create Counselor",
      user: req.user,
      error: "An error occurred while creating the counselor account"
    });
  }
});

// ==================== CERTIFICATE ROUTES (Admin Only) ====================
router.post("/admin/generate-certificate", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { User, GameSession, Certificate } = await import('../models/index.js');
    const { generateCertificate } = await import('../utils/certificateGenerator.js');
    const { userId, type, activityName, sessionId } = req.body;

    // Get user details
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get session details to verify perfect score
    let score, maxScore;
    if (type === 'game') {
      const session = await GameSession.findByPk(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Game session not found' });
      }
      score = session.score;
      maxScore = 100; // Default max score for games
    }

    // Check if certificate already exists
    const existing = await Certificate.findOne({
      where: {
        userId,
        type,
        activityName,
        score,
        maxScore
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'Certificate already exists for this achievement' });
    }

    // Generate certificate PDF
    const certificateData = await generateCertificate({
      userName: user.name,
      activityName,
      type,
      score,
      maxScore,
      date: new Date()
    });

    // Save certificate to database
    const certificate = await Certificate.create({
      userId,
      certificateId: certificateData.certificateId,
      type,
      activityName,
      score,
      maxScore,
      fileName: certificateData.fileName,
      filePath: certificateData.filePath,
      url: certificateData.url,
      sentByAdmin: false
    });

    res.json({ 
      success: true, 
      message: 'Certificate generated successfully',
      certificate 
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ message: 'Failed to generate certificate', error: error.message });
  }
});

router.post("/admin/certificates/send/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { Certificate } = await import('../models/index.js');
    const certificate = await Certificate.findByPk(req.params.id);

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Mark certificate as sent
    certificate.sentByAdmin = true;
    certificate.sentAt = new Date();
    await certificate.save();

    res.json({ 
      success: true, 
      message: 'Certificate marked as sent to user' 
    });
  } catch (error) {
    console.error('Send certificate error:', error);
    res.status(500).json({ message: 'Failed to send certificate' });
  }
});

router.get("/admin/certificates/download/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { Certificate } = await import('../models/index.js');
    const path = await import('path');
    
    const certificate = await Certificate.findByPk(req.params.id);

    if (!certificate) {
      return res.status(404).send('Certificate not found');
    }

    // Send file for download
    res.download(certificate.filePath, certificate.fileName);
  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).send('Failed to download certificate');
  }
});

// ==================== FITNESS GUIDE ROUTE ====================
router.get("/fitness-guide", isAuthenticated, async (req, res) => {
  try {
    const { ReadingMaterial, User } = await import('../models/index.js');
    
    console.log('🎥 Fetching fitness videos...');
    
    // Get all published video materials from Fitness category
    const materials = await ReadingMaterial.findAll({
      where: { 
        isPublished: true,
        fileType: 'video',
        category: 'Fitness'
      },
      include: [{
        model: User,
        as: 'counselor',
        attributes: ['name']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`💪 Fitness Guide: Found ${materials.length} fitness videos`);
    
    // Calculate total views
    const totalViews = materials.reduce((sum, m) => sum + (m.views || 0), 0);
    
    res.render("reading/materials", { 
      title: "Fitness Guide - Exercise Videos for Wellness", 
      user: req.user,
      materials,
      totalViews,
      pageDescription: "Watch fitness and exercise videos for stress relief and wellness."
    });
  } catch (error) {
    console.error('Fitness guide error:', error);
    res.render("reading/materials", { 
      title: "Fitness Guide", 
      user: req.user,
      materials: [],
      totalViews: 0
    });
  }
});

// ==================== MOOD TRACKER ROUTES (Protected) ====================

// Get mood tracker page
router.get("/user/mood-tracker", isAuthenticated, moodController.moodTrackerPage);

// API: Save detected emotion
router.post("/user/mood/save", isAuthenticated, moodController.saveMood);

// API: Get mood history
router.get("/user/mood/history", isAuthenticated, moodController.getMoodHistory);

// API: Get mood statistics
router.get("/user/mood/statistics", isAuthenticated, moodController.getMoodStats);

// API: Update mood entry
router.put("/user/mood/:moodId", isAuthenticated, moodController.updateMood);

// ==================== READING MATERIAL COMMENTS ====================
// Get all comments for a material
router.get("/api/reading/:materialId/comments", isAuthenticated, readingCommentController.getComments);

// Get comment count for a material
router.get("/api/reading/:materialId/comments/count", isAuthenticated, readingCommentController.getCommentCount);

// Add a new comment
router.post("/api/reading/:materialId/comments", isAuthenticated, readingCommentController.addComment);

// Edit a comment
router.put("/api/comments/:commentId", isAuthenticated, readingCommentController.editComment);

// Delete a comment
router.delete("/api/comments/:commentId", isAuthenticated, readingCommentController.deleteComment);

// Add a reaction to a comment
router.post("/api/comments/:commentId/react", isAuthenticated, readingCommentController.addReaction);

// Get reaction summary for a comment
router.get("/api/comments/:commentId/reactions", isAuthenticated, readingCommentController.getReactionSummary);

// Add a reaction to a reading material
router.post("/api/reading/:materialId/react", isAuthenticated, readingCommentController.addMaterialReaction);

// Get reactions for a reading material
router.get("/api/reading/:materialId/reactions", isAuthenticated, readingCommentController.getMaterialReactions);

// ==================== COUNSELOR COMMENTS & ENGAGEMENT ====================
// Get comments on a counselor's specific material
router.get("/api/counselor/materials/:materialId/comments", isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'counselor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { ReadingMaterial, ReadingMaterialComment, User, CommentReaction } = await import('../models/index.js');
    const { materialId } = req.params;

    // Verify the material belongs to the counselor
    const material = await ReadingMaterial.findOne({
      where: { id: materialId, counselorId: req.user.id }
    });

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Get all comments with user details
    const comments = await ReadingMaterialComment.findAll({
      where: {
        materialId,
        isHidden: false
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'profilePicture']
        },
        {
          model: CommentReaction,
          as: 'reactions',
          attributes: ['userId', 'emoji']
        },
        {
          model: ReadingMaterialComment,
          as: 'replies',
          where: { isHidden: false },
          required: false,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'profilePicture']
            },
            {
              model: CommentReaction,
              as: 'reactions',
              attributes: ['userId', 'emoji']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      material: { id: material.id, title: material.title },
      comments,
      total: comments.length
    });
  } catch (error) {
    console.error('Error fetching counselor comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Get summary of all comments across counselor's materials
router.get("/api/counselor/materials/comments-summary", isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'counselor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { ReadingMaterial, ReadingMaterialComment, User } = await import('../models/index.js');
    const { Op } = await import('sequelize');

    // Get all materials by this counselor
    const materials = await ReadingMaterial.findAll({
      where: { counselorId: req.user.id },
      attributes: ['id', 'title', 'isPublished']
    });

    const materialIds = materials.map(m => m.id);

    // Get comments for all materials
    const comments = await ReadingMaterialComment.findAll({
      where: {
        materialId: { [Op.in]: materialIds },
        isHidden: false
      },
      include: [
        {
          model: ReadingMaterial,
          as: 'material',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'profilePicture']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Group by material
    const summary = {};
    materials.forEach(material => {
      summary[material.id] = {
        id: material.id,
        title: material.title,
        isPublished: material.isPublished,
        comments: [],
        totalComments: 0,
        uniqueCommenters: new Set()
      };
    });

    comments.forEach(comment => {
      if (summary[comment.materialId]) {
        summary[comment.materialId].comments.push({
          id: comment.id,
          content: comment.content,
          userName: comment.user.name,
          userEmail: comment.user.email,
          userProfile: comment.user.profilePicture,
          createdAt: comment.createdAt
        });
        summary[comment.materialId].totalComments++;
        summary[comment.materialId].uniqueCommenters.add(comment.userId);
      }
    });

    // Convert to array and get counts
    const result = Object.values(summary).map(item => ({
      ...item,
      uniqueCommenters: item.uniqueCommenters.size,
      comments: item.comments.slice(0, 5) // Latest 5 comments
    }));

    res.json({
      success: true,
      totalMaterials: materials.length,
      totalComments: comments.length,
      summary: result
    });
  } catch (error) {
    console.error('Error fetching comments summary:', error);
    res.status(500).json({ error: 'Failed to fetch comments summary' });
  }
});

// Get unique commenters for a specific material
router.get("/api/counselor/materials/:materialId/unique-commenters", isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'counselor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { ReadingMaterial, ReadingMaterialComment, User } = await import('../models/index.js');
    const { materialId } = req.params;

    // Verify the material belongs to the counselor
    const material = await ReadingMaterial.findOne({
      where: { id: materialId, counselorId: req.user.id }
    });

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Get all comments with user details
    const comments = await ReadingMaterialComment.findAll({
      where: {
        materialId,
        isHidden: false,
        parentCommentId: null // Only count top-level comments for unique commenters
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'profilePicture']
        }
      ]
    });

    // Group by user to get unique commenters with comment counts
    const commentersMap = {};
    comments.forEach(comment => {
      if (!commentersMap[comment.userId]) {
        commentersMap[comment.userId] = {
          id: comment.user.id,
          name: comment.user.name,
          email: comment.user.email,
          profilePicture: comment.user.profilePicture,
          commentCount: 0
        };
      }
      commentersMap[comment.userId].commentCount++;
    });

    const commenters = Object.values(commentersMap).sort((a, b) => b.commentCount - a.commentCount);

    res.json({
      success: true,
      uniqueCount: commenters.length,
      commenters: commenters
    });
  } catch (error) {
    console.error('Error fetching unique commenters:', error);
    res.status(500).json({ error: 'Failed to fetch unique commenters' });
  }
});

// Get comments and reactions details for a material (for modal view)
router.get("/api/counselor/materials/:materialId/comments-details", isAuthenticated, async (req, res) => {
  try {
    const { ReadingMaterial, ReadingMaterialComment, User, CommentReaction, ReadingSession } = await import('../models/index.js');
    const { Sequelize } = await import('sequelize');
    const { materialId } = req.params;

    // Get material
    const material = await ReadingMaterial.findByPk(materialId);
    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    // Get unique view count (count of ReadingSession records)
    const viewCount = await ReadingSession.count({
      where: { materialId }
    });

    // Get all comments with user details and reactions
    const comments = await ReadingMaterialComment.findAll({
      where: {
        materialId,
        isHidden: false,
        parentCommentId: null // Get only top-level comments
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'profilePicture']
        },
        {
          model: CommentReaction,
          as: 'reactions',
          attributes: ['userId', 'emoji'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      raw: false
    });

    // Calculate average rating from comments
    const ratingsData = await ReadingMaterialComment.findAll({
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalComments']
      ],
      where: {
        materialId,
        isHidden: false
      },
      raw: true
    });

    const avgRating = ratingsData[0]?.avgRating ? parseFloat(ratingsData[0].avgRating).toFixed(1) : 0;
    const totalComments = parseInt(ratingsData[0]?.totalComments || 0);

    // Format comments with reactions
    const formattedComments = comments.map(comment => {
      const reactionCounts = {};
      if (comment.reactions && comment.reactions.length > 0) {
        comment.reactions.forEach(reaction => {
          reactionCounts[reaction.emoji] = (reactionCounts[reaction.emoji] || 0) + 1;
        });
      }

      return {
        id: comment.id,
        text: comment.content,
        studentName: comment.user?.name || 'Anonymous',
        createdAt: comment.createdAt,
        rating: comment.rating || 0,
        reactions: reactionCounts
      };
    });

    // Get all reactions for the material
    const allReactions = await CommentReaction.findAll({
      include: [
        {
          model: ReadingMaterialComment,
          as: 'comment',
          where: { materialId },
          attributes: ['id'],
          required: true
        }
      ]
    });

    const materialReactionCounts = {};
    allReactions.forEach(reaction => {
      materialReactionCounts[reaction.emoji] = (materialReactionCounts[reaction.emoji] || 0) + 1;
    });

    res.json({
      success: true,
      comments: formattedComments,
      reactions: materialReactionCounts,
      engagement: {
        views: viewCount,
        comments: totalComments,
        avgRating: avgRating,
        totalReactions: Object.values(materialReactionCounts).reduce((a, b) => a + b, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching comments details:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch comments details' });
  }
});

// ==================== 404 HANDLER ====================
router.use((req, res) => {
  res.status(404).render("404", { title: "Page Not Found" });
});

// ==================== RATING ENDPOINTS ====================
// Submit or update a rating for a material
router.post("/api/materials/:materialId/rate", isAuthenticated, async (req, res) => {
  try {
    const { Rating, ReadingMaterial } = await import('../models/index.js');
    const { materialId } = req.params;
    const { rating, review } = req.body;
    const userId = req.session.userId;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    // Check if material exists
    const material = await ReadingMaterial.findByPk(materialId);
    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    // Find or create rating
    const [ratingRecord, created] = await Rating.findOrCreate({
      where: { userId, materialId },
      defaults: { rating, review: review || null }
    });

    // If rating already exists, update it
    if (!created) {
      await ratingRecord.update({ rating, review: review || null });
    }

    res.json({
      success: true,
      message: created ? 'Rating added successfully' : 'Rating updated successfully',
      rating: ratingRecord.rating
    });
  } catch (error) {
    console.error('Error rating material:', error);
    res.status(500).json({ success: false, error: 'Failed to submit rating' });
  }
});

// Get user's rating for a material
router.get("/api/materials/:materialId/user-rating", isAuthenticated, async (req, res) => {
  try {
    const { Rating } = await import('../models/index.js');
    const { materialId } = req.params;
    const userId = req.session.userId;

    const userRating = await Rating.findOne({
      where: { userId, materialId }
    });

    res.json({
      success: true,
      rating: userRating ? userRating.rating : null,
      review: userRating ? userRating.review : null
    });
  } catch (error) {
    console.error('Error fetching user rating:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user rating' });
  }
});

// Get all ratings for a material (with average)
router.get("/api/materials/:materialId/ratings", isAuthenticated, async (req, res) => {
  try {
    const { Rating, Sequelize } = await import('../models/index.js');
    const { materialId } = req.params;

    const ratingStats = await Rating.findAll({
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('rating')), 'averageRating'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalRatings']
      ],
      where: { materialId },
      raw: true
    });

    const stats = ratingStats[0] || { averageRating: 0, totalRatings: 0 };

    res.json({
      success: true,
      averageRating: stats.averageRating ? parseFloat(stats.averageRating).toFixed(1) : 0,
      totalRatings: parseInt(stats.totalRatings || 0)
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ratings' });
  }
});

// Get user's ratings for materials in dashboard
router.get("/api/user/ratings", isAuthenticated, async (req, res) => {
  try {
    const { Rating } = await import('../models/index.js');
    const userId = req.session.userId;

    const userRatings = await Rating.findAll({
      where: { userId },
      attributes: ['materialId', 'rating', 'review'],
      raw: true
    });

    res.json({
      success: true,
      ratings: userRatings
    });
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user ratings' });
  }
});

// Get user's rated materials with details
router.get("/api/user/rated-materials", isAuthenticated, async (req, res) => {
  try {
    const { Rating, ReadingMaterial, User, Sequelize } = await import('../models/index.js');
    const userId = req.session.userId;

    // Get user's ratings with material details
    const ratedMaterials = await Rating.findAll({
      where: { userId },
      include: [{
        model: ReadingMaterial,
        as: 'material',
        attributes: ['id', 'title', 'slug', 'category', 'excerpt', 'fileType', 'views'],
        include: [{
          model: User,
          as: 'counselor',
          attributes: ['name']
        }]
      }],
      order: [['updatedAt', 'DESC']],
      limit: 10,
      raw: false
    });

    // Calculate stats for rated materials
    const ratedCount = await Rating.count({ where: { userId } });
    const avgRating = await Rating.findOne({
      where: { userId },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('rating')), 'average']
      ],
      raw: true
    });

    res.json({
      success: true,
      materials: ratedMaterials.map(r => ({
        id: r.material.id,
        title: r.material.title,
        slug: r.material.slug,
        category: r.material.category,
        excerpt: r.material.excerpt,
        fileType: r.material.fileType,
        views: r.material.views,
        counselor: r.material.counselor.name,
        userRating: r.rating,
        review: r.review,
        ratedAt: r.updatedAt
      })),
      stats: {
        totalRated: ratedCount,
        averageRating: avgRating?.average ? parseFloat(avgRating.average).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching rated materials:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch rated materials' });
  }
});

// ==================== COUNSELOR RATINGS ENDPOINTS ====================

// Get all ratings for counselor's materials
router.get("/api/counselor/materials/ratings/summary", isAuthenticated, async (req, res) => {
  try {
    const { ReadingMaterial, Rating, User, Sequelize } = await import('../models/index.js');
    const counselorId = req.session.userId;

    // Get all counselor's materials with ratings
    const materials = await ReadingMaterial.findAll({
      where: { createdBy: counselorId, isPublished: true },
      include: [
        {
          model: Rating,
          as: 'ratings',
          attributes: ['id', 'userId', 'rating', 'review', 'createdAt'],
          required: false
        }
      ],
      attributes: ['id', 'title', 'category', 'fileType', 'views', 'createdAt'],
      order: [['createdAt', 'DESC']],
      raw: false
    });

    // Calculate stats for each material
    const materialsWithStats = materials.map(material => {
      const ratings = material.ratings || [];
      const totalRatings = ratings.length;
      const averageRating = totalRatings > 0 
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
        : 0;

      return {
        id: material.id,
        title: material.title,
        category: material.category,
        fileType: material.fileType,
        views: material.views,
        totalRatings: totalRatings,
        averageRating: parseFloat(averageRating),
        ratingDistribution: calculateRatingDistribution(ratings),
        createdAt: material.createdAt
      };
    });

    // Calculate overall stats
    const totalMaterials = materialsWithStats.length;
    const totalRatings = materialsWithStats.reduce((sum, m) => sum + m.totalRatings, 0);
    const overallAverage = totalRatings > 0
      ? (materialsWithStats.reduce((sum, m) => sum + (parseFloat(m.averageRating) * m.totalRatings), 0) / totalRatings).toFixed(1)
      : 0;

    res.json({
      success: true,
      materials: materialsWithStats,
      stats: {
        totalMaterials: totalMaterials,
        totalRatings: totalRatings,
        overallAverageRating: parseFloat(overallAverage),
        materialsWithRatings: materialsWithStats.filter(m => m.totalRatings > 0).length
      }
    });
  } catch (error) {
    console.error('Error fetching ratings summary:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ratings' });
  }
});

// Get detailed ratings for a specific material
router.get("/api/counselor/materials/:materialId/ratings", isAuthenticated, async (req, res) => {
  try {
    const { ReadingMaterial, Rating, User, Sequelize } = await import('../models/index.js');
    const { materialId } = req.params;
    const counselorId = req.session.userId;

    // Verify material belongs to counselor
    const material = await ReadingMaterial.findByPk(materialId);
    if (!material || material.createdBy !== counselorId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Get all ratings for this material with user details
    const ratings = await Rating.findAll({
      where: { materialId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'profilePicture']
        }
      ],
      order: [['createdAt', 'DESC']],
      raw: false
    });

    // Calculate statistics
    const totalRatings = ratings.length;
    const ratingDistribution = calculateRatingDistribution(ratings);
    const averageRating = totalRatings > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
      : 0;

    res.json({
      success: true,
      material: {
        id: material.id,
        title: material.title
      },
      ratings: ratings.map(r => ({
        id: r.id,
        userName: r.user?.name || 'Anonymous',
        userProfilePicture: r.user?.profilePicture || '/images/default-avatar.png',
        rating: r.rating,
        review: r.review,
        createdAt: r.createdAt
      })),
      stats: {
        totalRatings: totalRatings,
        averageRating: parseFloat(averageRating),
        ratingDistribution: ratingDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching material ratings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ratings' });
  }
});

// Helper function to calculate rating distribution
function calculateRatingDistribution(ratings) {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach(r => {
    if (r.rating && distribution[r.rating] !== undefined) {
      distribution[r.rating]++;
    }
  });
  return distribution;
}

export default router;
