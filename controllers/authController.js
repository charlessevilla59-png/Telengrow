
      /*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import bcrypt from "bcrypt";
import { User, UserProgress, Activity, Feedback, sequelize } from "../models/index.js";

export const loginPage = (req, res) => {
  res.render("login", { 
    title: "Login", 
    email: ''
  });
};
export const registerPage = (req, res) => res.render("register", { title: "Register" });
export const forgotPasswordPage = (req, res) => res.render("forgotpassword", { title: "Forgot Password" });

export const dashboardPage = async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect("/login");
    
    const user = await User.findByPk(req.session.userId);
    if (!user) return res.redirect("/login");
    
    // Redirect based on role
    if (user.role === 'admin') {
      return res.redirect("/admin/dashboard");
    } else if (user.role === 'counselor') {
      return res.redirect("/counselor/dashboard");
    }
    
    // Fetch user progress with all available data
    const progress = await UserProgress.findOne({ where: { userId: req.session.userId } });
    
    // Get recently completed games
    const { GameSession, Activity, ReadingMaterial, JournalEntry, ReadingSession } = await import('../models/index.js');
    const recentGames = await GameSession.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    // ✅ Count real journal entries for this user
    const journalCount = await JournalEntry.count({
      where: { userId: req.session.userId }
    });
    
    // ✅ Count real reading materials viewed by this user
    const readingSessionCount = await ReadingSession.count({
      where: { userId: req.session.userId }
    });
    
    // ✅ Count real games played by this user
    const gamesPlayedCount = await GameSession.count({
      where: { userId: req.session.userId }
    });
    
    // Get published reading materials (limit 6 for dashboard)
    const materials = await ReadingMaterial.findAll({
      where: { isPublished: true },
      order: [['createdAt', 'DESC']],
      limit: 6
    });
    
    // Get published fitness videos (limit 4 for dashboard)
    const fitnessVideos = await ReadingMaterial.findAll({
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
      order: [['createdAt', 'DESC']],
      limit: 4
    });
    
    // Update last active time
    await user.update({ lastActive: new Date() });
    
    res.render("user/userdashboard", { 
      title: "Dashboard",
      user,
      progress: progress || { 
        totalPoints: 0, 
        level: 'beginner', 
        currentStreak: 0,
        totalGamesPlayed: 0,
        totalJournalEntries: 0
      },
      journalCount,
      readingSessionCount,
      gamesPlayedCount,
      todayActivities: recentGames.length,
      recentGames,
      materials,
      fitnessVideos
    });
  } catch (error) {
    console.error(error);
    res.redirect("/login");
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt:', email);
    
    if (!email || !password) {
      return res.status(400).render("login", { 
        title: "Login",
        error_msg: "Email and password are required",
        email: email || '' // Preserve email
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log(`🔍 User not found: ${email}`);
      return res.status(401).render("login", { 
        title: "Login",
        error_msg: "Email or password is incorrect",
        email: email // Preserve email
      });
    }

    // Check account status
    if (user.accountStatus === 'pending') {
      return res.status(403).render("login", { 
        title: "Login",
        error_msg: "Your account is pending admin approval. Please wait for approval before logging in.",
        email: email // Preserve email
      });
    }

    if (user.accountStatus === 'rejected') {
      return res.status(403).render("login", { 
        title: "Login",
        error_msg: "Your account has been rejected. Please contact the administrator.",
        email: email // Preserve email
      });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).render("login", { 
        title: "Login",
        error_msg: "Your account has been suspended. Please contact the administrator.",
        email: email // Preserve email
      });
    }

    console.log(`🔍 User found: ${email}, comparing passwords...`);
    
    // Check if user has a password (could be Google/OAuth user)
    if (!user.password) {
      console.log(`⚠️ User has no password set - must use Google Sign-In`);
      return res.status(401).render("login", { 
        title: "Login",
        error_msg: "This account uses Google Sign-In. Please click 'Sign in with Google' button.",
        email: email // Preserve email
      });
    }
    
    const match = await bcrypt.compare(password, user.password);
    console.log(`✅ Password match result: ${match}`);
    
    if (!match) {
      console.log(`❌ Password mismatch for user: ${email}`);
      return res.status(401).render("login", { 
        title: "Login",
        error_msg: "Email or password is incorrect",
        email: email // Preserve email
      });
    }

    console.log(`✅ Login successful for: ${email} (${user.role})`);
    req.session.userId = user.id;
    
    // Save session before redirecting
    req.session.save((err) => {
      if (err) {
        console.error("❌ Session save error:", err);
        return res.status(500).render("login", { 
          title: "Login",
          error_msg: "Session error occurred. Please try again.",
          email: email // Preserve email
        });
      }

      console.log(`✅ Session saved for user: ${user.id}`);

      // Log activity
      Activity.create({
        userId: user.id,
        type: 'login',
        description: `${user.name} logged in`,
        metadata: { ipAddress: req.ip }
      }).catch(err => console.error("Activity log error:", err));

      // Update last active
      user.update({ lastActive: new Date() })
        .catch(err => console.error("Update lastActive error:", err));

      // Redirect based on role
      console.log(`🚀 Redirecting ${user.role} to dashboard...`);
      if (user.role === 'admin') {
        res.redirect("/admin/dashboard");
      } else if (user.role === 'counselor') {
        res.redirect("/counselor/dashboard");
      } else {
        res.redirect("/user/dashboard");
      }
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).render("login", { 
      title: "Login",
      error_msg: "An error occurred during login. Please try again. Check console for details.",
      email: req.body.email || '' // Preserve email
    });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { 
      name, email, password, confirmPassword, isFaculty,
      nickname, age, dateOfBirth, placeOfBirth, nationality, sex, civilStatus, religion,
      course, year, section,
      currentAddress, permanentAddress, contactNumber, emailAlternate,
      lgbtqia, lgbtqiaSpecify, indigenousGroup, indigenousGroupName,
      personWithDisability, disabilityType,
      fatherName, motherName, fatherOccupation, motherOccupation, parentsStatus, familyIncome,
      emergencyContactName, emergencyContactRelation, emergencyContactAddress, emergencyContactNumber, emergencyContactEmail,
      elementarySchool, elementaryDates, elementaryHonors,
      juniorHighSchool, juniorDates, juniorHonors,
      seniorHighSchool, seniorDates, seniorHonors,
      vocationalCourse, vocationalDates, vocationalHonors,
      collegeName, collegeDates, collegeHonors,
      healthConcerns, vision, hearing,
      accidentsOperations, presentConcerns, presentFears, healthProblem,
      skillsHobbies
    } = req.body;

    console.log('📝 Registration attempt:', { name, email, isFaculty });

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).render("register", { error_msg: "All fields are required" });
    }

    if (!course || !year) {
      return res.status(400).render("register", { error_msg: "Course and Year Level are required" });
    }

    if (name.trim().length < 2) {
      return res.status(400).render("register", { error_msg: "Name must be at least 2 characters" });
    }

    if (password !== confirmPassword) {
      return res.status(400).render("register", { error_msg: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.status(400).render("register", { error_msg: "Password must be at least 6 characters" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).render("register", { error_msg: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    
    // Determine role and status based on counselor checkbox
    const isCounselor = isFaculty === 'true' || isFaculty === 'on' || isFaculty === true;
    const role = isCounselor ? 'counselor' : 'user';
    const accountStatus = isCounselor ? 'pending' : 'active';
    
    console.log('👤 Creating user with:', { role, accountStatus, isFaculty, isCounselor });
    
    // Create user with all form data
    const user = await User.create({ 
      name, 
      email, 
      password: hashed,
      nickname: nickname || null,
      age: age ? parseInt(age) : null,
      dateOfBirth: dateOfBirth || null,
      placeOfBirth: placeOfBirth || null,
      nationality: nationality || null,
      sex: sex || null,
      civilStatus: civilStatus || null,
      religion: religion || null,
      course: course || null,
      year: year || null,
      section: section || null,
      currentAddress: currentAddress || null,
      permanentAddress: permanentAddress || null,
      contactNumber: contactNumber || null,
      emailAlternate: emailAlternate || null,
      lgbtqia: lgbtqia || null,
      lgbtqiaSpecify: lgbtqiaSpecify || null,
      indigenousGroup: indigenousGroup || null,
      indigenousGroupName: indigenousGroupName || null,
      personWithDisability: personWithDisability || null,
      disabilityType: disabilityType || null,
      fatherName: fatherName || null,
      motherName: motherName || null,
      fatherOccupation: fatherOccupation || null,
      motherOccupation: motherOccupation || null,
      parentsStatus: parentsStatus ? (Array.isArray(parentsStatus) ? parentsStatus : [parentsStatus]) : null,
      familyIncome: familyIncome ? (Array.isArray(familyIncome) ? familyIncome : [familyIncome]) : null,
      emergencyContactName: emergencyContactName || null,
      emergencyContactRelation: emergencyContactRelation || null,
      emergencyContactAddress: emergencyContactAddress || null,
      emergencyContactNumber: emergencyContactNumber || null,
      emergencyContactEmail: emergencyContactEmail || null,
      elementarySchool: elementarySchool || null,
      elementaryDates: elementaryDates || null,
      elementaryHonors: elementaryHonors || null,
      juniorHighSchool: juniorHighSchool || null,
      juniorDates: juniorDates || null,
      juniorHonors: juniorHonors || null,
      seniorHighSchool: seniorHighSchool || null,
      seniorDates: seniorDates || null,
      seniorHonors: seniorHonors || null,
      vocationalCourse: vocationalCourse || null,
      vocationalDates: vocationalDates || null,
      vocationalHonors: vocationalHonors || null,
      collegeName: collegeName || null,
      collegeDates: collegeDates || null,
      collegeHonors: collegeHonors || null,
      healthConcerns: healthConcerns ? (Array.isArray(healthConcerns) ? healthConcerns : [healthConcerns]) : null,
      vision: vision || null,
      hearing: hearing || null,
      accidentsOperations: accidentsOperations || null,
      presentConcerns: presentConcerns || null,
      presentFears: presentFears || null,
      healthProblem: healthProblem || null,
      skillsHobbies: skillsHobbies || null,
      role,
      accountStatus,
      authProvider: 'local'
    });
    
    console.log('✅ User created:', { id: user.id, name: user.name, role: user.role, accountStatus: user.accountStatus });
    
    // Only create user progress for regular users (not counselor)
    if (role === 'user') {
      await UserProgress.create({ 
        userId: user.id,
        totalGamesPlayed: 0,
        totalJournalEntries: 0,
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        level: 'beginner',
        breathingBubbleStats: {},
        colorTapStats: {},
        gridMemoryStats: {},
        stressBallStats: {},
        achievements: []
      });
      console.log('📊 User progress created for regular user');
    } else {
      console.log('👨‍⚕️ Counselor user - no progress created');
    }

    // Log activity
    await Activity.create({
      userId: user.id,
      type: 'registration',
      description: `${name} registered as ${role}`,
      metadata: { ipAddress: req.ip, role, accountStatus }
    });

    // Different success messages based on role
    if (role === 'counselor') {
      res.render("login", { 
        success_msg: "Counselor account created! Your account is pending admin approval. You will be able to login once approved." 
      });
    } else {
      res.render("login", { 
        success_msg: "Account created successfully! Please log in with your credentials." 
      });
    }
  } catch (error) {
    console.error("❌ Registration error:", error.message);
    console.error("Full error:", error);
    
    let errorMessage = "An error occurred during registration";
    if (error.message && error.message.includes("email")) {
      errorMessage = "Email validation failed. Please use a valid email.";
    } else if (error.message && error.message.includes("Validation error")) {
      errorMessage = "Please check all fields are filled correctly.";
    } else if (error.message && error.message.includes("unique")) {
      errorMessage = "This email is already registered.";
    }
    
    res.status(500).render("register", { error_msg: errorMessage });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (userId) {
      const user = await User.findByPk(userId);
      if (user) {
        await user.update({ lastActive: new Date() });
      }
    }
    req.session.destroy((err) => {
      if (err) console.error(err);
      res.redirect("/login");
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.redirect("/login");
  }
};

// Firebase Google Authentication Handler
export const firebaseGoogleAuth = async (req, res) => {
  try {
    const { idToken, email, name, photoURL, uid } = req.body;

    console.log('🔵 Firebase Google Auth request received');
    console.log('📧 Email:', email);
    console.log('👤 Name:', name);
    console.log('🆔 Firebase UID:', uid);

    if (!idToken || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required authentication data' 
      });
    }

    // Verify the Firebase ID token (optional but recommended for production)
    // For now, we'll trust the token since it came from Firebase client SDK
    
    // Check if user exists in MySQL
    let user = await User.findOne({ where: { email } });

    if (user) {
      // User exists - update Firebase info if needed
      console.log('✅ Existing user found:', user.email);

      // Check account status
      if (user.accountStatus === 'pending') {
        return res.status(403).json({ 
          success: false, 
          error: 'Your account is pending admin approval. Please wait for approval before logging in.' 
        });
      }

      if (user.accountStatus === 'rejected') {
        return res.status(403).json({ 
          success: false, 
          error: 'Your account has been rejected. Please contact the administrator.' 
        });
      }

      if (user.accountStatus === 'suspended') {
        return res.status(403).json({ 
          success: false, 
          error: 'Your account has been suspended. Please contact the administrator.' 
        });
      }

      // Update Firebase UID and profile picture if not set
      if (!user.googleId || user.googleId !== uid) {
        await user.update({
          googleId: uid,
          profilePicture: photoURL || user.profilePicture,
          authProvider: 'firebase-google',
          lastActive: new Date()
        });
        console.log('🔗 Updated Firebase info for existing user');
      } else {
        await user.update({ lastActive: new Date() });
      }
    } else {
      // Create new user
      console.log('🆕 Creating new user from Firebase Google account');

      user = await User.create({
        name,
        email,
        googleId: uid,
        profilePicture: photoURL,
        authProvider: 'firebase-google',
        role: 'user',
        accountStatus: 'active',
        password: null // No password for Google users
      });

      // Create user progress for new user
      await UserProgress.create({ 
        userId: user.id,
        totalGamesPlayed: 0,
        totalJournalEntries: 0,
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        level: 'beginner',
        breathingBubbleStats: {},
        colorTapStats: {},
        gridMemoryStats: {},
        stressBallStats: {},
        achievements: []
      });

      console.log('✅ New user created:', user.email);
    }

    // Create session
    req.session.userId = user.id;

    // Save session
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('✅ Session created for user:', user.id);

    // Log activity
    await Activity.create({
      userId: user.id,
      type: 'login',
      description: `${user.name} logged in via Firebase Google`,
      metadata: { 
        ipAddress: req.ip,
        authProvider: 'firebase-google'
      }
    });

    // Determine redirect URL based on role
    let redirectUrl = '/user/dashboard';
    if (user.role === 'admin') {
      redirectUrl = '/admin/dashboard';
    } else if (user.role === 'counselor') {
      redirectUrl = '/counselor/dashboard';
    }

    console.log(`🚀 Redirecting ${user.role} to: ${redirectUrl}`);

    return res.json({ 
      success: true, 
      redirectUrl,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Firebase Google Auth error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Authentication failed. Please try again.' 
    });
  }
};

// Handles profile update requests (all registration fields + password/profilePicture)
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) return res.redirect("/login");

    const {
      name, email, currentPassword, newPassword, confirmPassword, selectedAvatar,
      nickname, age, dateOfBirth, placeOfBirth, nationality, sex, civilStatus, religion,
      course, year, section,
      currentAddress, permanentAddress, contactNumber, emailAlternate,
      lgbtqia, lgbtqiaSpecify, indigenousGroup, indigenousGroupName,
      personWithDisability, disabilityType,
      fatherName, motherName, fatherOccupation, motherOccupation, parentsStatus, familyIncome,
      emergencyContactName, emergencyContactRelation, emergencyContactAddress,
      emergencyContactNumber, emergencyContactEmail,
      elementarySchool, elementaryDates, elementaryHonors,
      juniorHighSchool, juniorDates, juniorHonors,
      seniorHighSchool, seniorDates, seniorHonors,
      vocationalCourse, vocationalDates, vocationalHonors,
      collegeName, collegeDates, collegeHonors,
      healthConcerns, vision, hearing,
      accidentsOperations, presentConcerns, presentFears, healthProblem,
      skillsHobbies
    } = req.body;

    let error_msg;

    // Validate required fields
    if (!name || !email) {
      error_msg = "Name and email are required.";
    }

    if (!error_msg && (!course || !year)) {
      error_msg = "Course and Year Level are required.";
    }

    // if email changed, make sure it's not already taken by another account
    if (!error_msg && email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing && existing.id !== user.id) {
        error_msg = "Email is already in use by another account.";
      }
    }

    // handle password change logic
    if (!error_msg && (newPassword || confirmPassword || currentPassword)) {
      if (!currentPassword) {
        error_msg = "You must enter your current password to change your password.";
      } else if (newPassword !== confirmPassword) {
        error_msg = "New password and confirmation do not match.";
      } else {
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
          error_msg = "Current password is incorrect.";
        } else if (newPassword && newPassword.length < 6) {
          error_msg = "New password must be at least 6 characters long.";
        } else if (newPassword) {
          const hashed = await bcrypt.hash(newPassword, 10);
          user.password = hashed;
        }
      }
    }

    if (!error_msg) {
      // Update basic fields
      if (name) user.name = name;
      if (email) user.email = email;
      if (nickname) user.nickname = nickname;
      if (age) user.age = parseInt(age);
      if (dateOfBirth) user.dateOfBirth = dateOfBirth;
      if (placeOfBirth) user.placeOfBirth = placeOfBirth;
      if (nationality) user.nationality = nationality;
      if (sex) user.sex = sex;
      if (civilStatus) user.civilStatus = civilStatus;
      if (religion) user.religion = religion;
      if (course) user.course = course;
      if (year) user.year = year;
      if (section) user.section = section;

      // Address fields
      if (currentAddress) user.currentAddress = currentAddress;
      if (permanentAddress) user.permanentAddress = permanentAddress;
      if (contactNumber) user.contactNumber = contactNumber;
      if (emailAlternate) user.emailAlternate = emailAlternate;

      // Status & Background
      if (lgbtqia) user.lgbtqia = lgbtqia;
      if (lgbtqiaSpecify) user.lgbtqiaSpecify = lgbtqiaSpecify;
      if (indigenousGroup) user.indigenousGroup = indigenousGroup;
      if (indigenousGroupName) user.indigenousGroupName = indigenousGroupName;
      if (personWithDisability) user.personWithDisability = personWithDisability;
      if (disabilityType) user.disabilityType = disabilityType;

      // Parents Information
      if (fatherName) user.fatherName = fatherName;
      if (motherName) user.motherName = motherName;
      if (fatherOccupation) user.fatherOccupation = fatherOccupation;
      if (motherOccupation) user.motherOccupation = motherOccupation;
      
      // Handle arrays - parentsStatus and familyIncome
      if (parentsStatus) {
        user.parentsStatus = Array.isArray(parentsStatus) ? parentsStatus : [parentsStatus];
      }
      if (familyIncome) {
        user.familyIncome = Array.isArray(familyIncome) ? familyIncome : [familyIncome];
      }

      // Emergency Contact
      if (emergencyContactName) user.emergencyContactName = emergencyContactName;
      if (emergencyContactRelation) user.emergencyContactRelation = emergencyContactRelation;
      if (emergencyContactAddress) user.emergencyContactAddress = emergencyContactAddress;
      if (emergencyContactNumber) user.emergencyContactNumber = emergencyContactNumber;
      if (emergencyContactEmail) user.emergencyContactEmail = emergencyContactEmail;

      // Educational Background
      if (elementarySchool) user.elementarySchool = elementarySchool;
      if (elementaryDates) user.elementaryDates = elementaryDates;
      if (elementaryHonors) user.elementaryHonors = elementaryHonors;
      if (juniorHighSchool) user.juniorHighSchool = juniorHighSchool;
      if (juniorDates) user.juniorDates = juniorDates;
      if (juniorHonors) user.juniorHonors = juniorHonors;
      if (seniorHighSchool) user.seniorHighSchool = seniorHighSchool;
      if (seniorDates) user.seniorDates = seniorDates;
      if (seniorHonors) user.seniorHonors = seniorHonors;
      if (vocationalCourse) user.vocationalCourse = vocationalCourse;
      if (vocationalDates) user.vocationalDates = vocationalDates;
      if (vocationalHonors) user.vocationalHonors = vocationalHonors;
      if (collegeName) user.collegeName = collegeName;
      if (collegeDates) user.collegeDates = collegeDates;
      if (collegeHonors) user.collegeHonors = collegeHonors;

      // Health Information
      if (healthConcerns) {
        user.healthConcerns = Array.isArray(healthConcerns) ? healthConcerns : [healthConcerns];
      }
      if (vision) user.vision = vision;
      if (hearing) user.hearing = hearing;
      if (accidentsOperations) user.accidentsOperations = accidentsOperations;
      if (presentConcerns) user.presentConcerns = presentConcerns;
      if (presentFears) user.presentFears = presentFears;
      if (healthProblem) user.healthProblem = healthProblem;

      // Additional Information
      if (skillsHobbies) user.skillsHobbies = skillsHobbies;

      // Handle profile picture upload
      if (req.file) {
        // File was uploaded
        user.profilePicture = '/uploads/profiles/' + req.file.filename;
      } else if (selectedAvatar) {
        // Avatar emoji was selected
        user.profilePicture = selectedAvatar;
      }
      
      await user.save();
    }

    const success_msg = error_msg ? null : "Profile updated successfully.";
    res.render("user/profile", { title: "My Profile", user, error_msg, success_msg });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).render("user/profile", {
      title: "My Profile",
      user: req.user,
      error_msg: "An error occurred while updating your profile."
    });
  }
};

// Handles feedback/report submission
export const submitFeedback = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ 
        success: false, 
        error: "You must be logged in to submit feedback" 
      });
    }

    const { type, subject, message } = req.body;

    // Validation
    if (!type || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        error: "Type, subject, and message are required" 
      });
    }

    if (subject.trim().length < 3) {
      return res.status(400).json({ 
        success: false, 
        error: "Subject must be at least 3 characters" 
      });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({ 
        success: false, 
        error: "Message must be at least 10 characters" 
      });
    }

    const validTypes = ['feedback', 'bug_report', 'feature_request', 'complaint'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid feedback type" 
      });
    }

    // Create feedback record
    const feedback = await Feedback.create({
      userId: req.session.userId,
      type: type,
      subject: subject.trim(),
      message: message.trim(),
      status: 'new'
    });

    // Log activity
    await Activity.create({
      userId: req.session.userId,
      type: 'feedback_submitted',
      description: `User submitted ${type}: ${subject}`,
      metadata: { feedbackId: feedback.id }
    });

    console.log(`✅ Feedback submitted by user ${req.session.userId}: ${feedback.id}`);

    return res.json({ 
      success: true, 
      message: "Thank you! Your feedback has been submitted to the admin team.",
      feedbackId: feedback.id
    });

  } catch (error) {
    console.error("❌ Feedback submission error:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    
    return res.status(500).json({ 
      success: false, 
      error: "An error occurred while submitting your feedback. Please try again." 
    });
  }
};

// ==================== PASSWORD RESET - VERIFY EMAIL ====================
export const verifyEmailForReset = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('🔍 Verifying email for password reset:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Check if user exists
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log('❌ Email not found:', email);
      return res.status(404).json({
        success: false,
        message: "Email not found in our system"
      });
    }

    console.log('✅ Email verified:', email);

    return res.status(200).json({
      success: true,
      message: "Email verified. Please enter your new password."
    });

  } catch (error) {
    console.error("❌ Email verification error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during email verification"
    });
  }
};

// ==================== PASSWORD RESET - UPDATE PASSWORD ====================
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    console.log('🔐 Password reset request for:', email);

    // Validation
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).render("forgotpassword", {
        error_msg: "All fields are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).render("forgotpassword", {
        error_msg: "Passwords do not match"
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).render("forgotpassword", {
        error_msg: "Password must be at least 8 characters long"
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log('❌ User not found for password reset:', email);
      return res.status(404).render("forgotpassword", {
        error_msg: "Email not found"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update({ password: hashedPassword });

    console.log('✅ Password reset successful for:', email);

    // Log activity
    await Activity.create({
      userId: user.id,
      type: 'password-reset',
      description: `${user.name} reset their password`,
      metadata: { ipAddress: req.ip }
    }).catch(err => console.error("Activity log error:", err));

    // Redirect to login with success message
    return res.render("login", {
      success_msg: "Password reset successful! Please log in with your new password."
    });

  } catch (error) {
    console.error("❌ Password reset error:", error);
    return res.status(500).render("forgotpassword", {
      error_msg: "An error occurred during password reset. Please try again."
    });
  }
};
