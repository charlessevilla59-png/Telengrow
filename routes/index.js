/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import express from "express";
import { Op } from "sequelize";
import multer from "multer";
import path from "path";
import * as authController from "../controllers/authController.js";
import { isAuthenticated } from "../middleware/auth.js";
import { isAdmin } from "../middleware/adminAuth.js";
import passport from "../config/passport.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
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
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed!'));
    }
  }
});

// Configure multer for profile picture uploads
const profilePictureStorage = multer.diskStorage({
  destination: function (req, file, cb) {
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

router.get("/logout", authController.logoutUser);

// ==================== USER ROUTES (Protected) ====================
router.get("/dashboard", isAuthenticated, authController.dashboardPage);
router.get("/user/dashboard", isAuthenticated, authController.dashboardPage);

// User Profile Routes
router.get("/user/profile", isAuthenticated, (req, res) => {
  res.render("user/profile", { title: "My Profile", user: req.user });
});

// save profile changes
router.post("/user/profile", isAuthenticated, uploadProfilePicture.single('profilePicture'), authController.updateProfile);

router.get("/user/progress", isAuthenticated, (req, res) => {
  res.render("user/progress", { title: "My Progress", user: req.user });
});

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
    
    console.log('📚 Fetching reading materials...');
    
    // Get all published materials
    const materials = await ReadingMaterial.findAll({
      where: { isPublished: true },
      include: [{
        model: User,
        as: 'counselor',
        attributes: ['name']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`✅ Found ${materials.length} published materials`);
    if (materials.length > 0) {
      console.log('📋 Materials:', materials.map(m => ({ 
        id: m.id, 
        title: m.title, 
        fileType: m.fileType,
        isPublished: m.isPublished 
      })));
    }
    
    res.render("reading/materials", { 
      title: "Reading Materials", 
      user: req.user,
      materials
    });
  } catch (error) {
    console.error('❌ Reading materials error:', error);
    res.render("reading/materials", { 
      title: "Reading Materials", 
      user: req.user,
      materials: []
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
    
    // If no materials, redirect back
    if (materials.length === 0) {
      return res.redirect('/reading');
    }
    
    // Redirect to first material with library sidebar
    res.redirect(`/reading/view/${materials[0].id}`);
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
    }
    
    // Add CORS headers for Office Online Viewer
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Send file with inline disposition (display in browser, not download)
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${material.fileName}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('File view error:', error);
    res.status(500).send('Error loading file');
  }
});

// View uploaded file in browser
router.get("/reading/view/:id", isAuthenticated, async (req, res) => {
  try {
    const { ReadingMaterial, User, SavedMaterial } = await import('../models/index.js');
    
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
    
    // Increment view count
    await material.increment('views');
    
    res.render("reading/viewer", { 
      title: material.title, 
      user: req.user,
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
    const { ReadingMaterial, User } = await import('../models/index.js');
    
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
    
    // Increment view count
    await material.increment('views');
    
    res.render("reading/article", { 
      title: material.title, 
      user: req.user,
      material
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
    
    const { ReadingMaterial } = await import('../models/index.js');
    
    // Get counselor's materials
    const materials = await ReadingMaterial.findAll({
      where: { counselorId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    // Calculate stats
    const totalMaterials = await ReadingMaterial.count({ where: { counselorId: req.user.id } });
    const publishedMaterials = await ReadingMaterial.count({ 
      where: { counselorId: req.user.id, isPublished: true } 
    });
    const totalViews = await ReadingMaterial.sum('views', { where: { counselorId: req.user.id } }) || 0;
    
    res.render("counselor/dashboard", { 
      title: "Counselor Dashboard", 
      user: req.user,
      stats: {
        totalMaterials,
        publishedMaterials,
        totalViews,
        totalReaders: 0
      },
      materials
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
    
    const { ReadingMaterial } = await import('../models/index.js');
    
    const materials = await ReadingMaterial.findAll({
      where: { counselorId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    res.render("counselor/materials", { 
      title: "Manage Materials", 
      user: req.user,
      materials
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

// Create Material (with file upload support)
router.post("/counselor/materials/create", isAuthenticated, upload.single('materialFile'), async (req, res) => {
  try {
    if (req.user.role !== 'counselor') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { ReadingMaterial } = await import('../models/index.js');
    const { title, category, excerpt, content, readingTime, isPublished, fileType } = req.body;
    
    // Create slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Prepare material data
    const materialData = {
      counselorId: req.user.id,
      title,
      slug,
      category,
      excerpt,
      content: content || '',
      fileType: fileType || 'article',
      readingTime: parseInt(readingTime) || 5,
      isPublished: isPublished === 'true' || isPublished === 'on'
    };
    
    // If file was uploaded, add file info
    if (req.file) {
      materialData.fileName = req.file.filename; // Actual saved filename (multer generated)
      // Remove 'public/' from path since Express serves public folder as static
      materialData.filePath = req.file.path.replace(/^public[\\/]/, '/');
      materialData.fileSize = req.file.size;
    }
    
    const material = await ReadingMaterial.create(materialData);
    
    console.log('✅ Material created:', material.id, material.title, fileType === 'article' ? '(Article)' : `(File: ${req.file?.originalname})`);
    res.redirect('/counselor/materials');
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).send('Error creating material: ' + error.message);
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
    const { title, category, excerpt, content, readingTime, isPublished } = req.body;
    
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
    
    await material.update({
      title,
      slug,
      category,
      excerpt,
      content,
      readingTime: parseInt(readingTime) || 5,
      isPublished: isPublished === 'true' || isPublished === 'on'
    });
    
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
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { ReadingMaterial } = await import('../models/index.js');
    
    const material = await ReadingMaterial.findOne({
      where: { id: req.params.id, counselorId: req.user.id }
    });
    
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    await material.update({ isPublished: true });
    
    console.log('✅ Material published:', material.id, material.title);
    res.json({ success: true, message: 'Material published successfully' });
  } catch (error) {
    console.error('Publish material error:', error);
    res.status(500).json({ error: 'Error publishing material' });
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
    
    const { ReadingMaterial } = await import('../models/index.js');
    
    const totalMaterials = await ReadingMaterial.count({ where: { counselorId: req.user.id } });
    const publishedMaterials = await ReadingMaterial.count({ 
      where: { counselorId: req.user.id, isPublished: true } 
    });
    const totalViews = await ReadingMaterial.sum('views', { where: { counselorId: req.user.id } }) || 0;
    
    res.render("counselor/analytics", { 
      title: "Analytics", 
      user: req.user,
      stats: {
        totalMaterials,
        publishedMaterials,
        totalViews,
        avgRating: 0
      }
    });
  } catch (error) {
    console.error('Counselor analytics error:', error);
    res.status(500).render("404", { title: "Error" });
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
        activeToday
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
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
        activeToday: 0
      }
    });
  }
});

router.get("/admin/analytics", isAuthenticated, isAdmin, (req, res) => {
  res.render("admin/analytics", { title: "Analytics", user: req.user });
});

router.get("/admin/settings", isAuthenticated, isAdmin, (req, res) => {
  res.render("admin/settings", { title: "Settings", user: req.user });
});

router.get("/admin/users", isAuthenticated, isAdmin, (req, res) => {
  res.render("admin/users", { title: "User Management", user: req.user });
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

// ==================== 404 HANDLER ====================
router.use((req, res) => {
  res.status(404).render("404", { title: "Page Not Found" });
});

export default router;
