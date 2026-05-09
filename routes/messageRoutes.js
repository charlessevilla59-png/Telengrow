/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import * as messageController from "../controllers/messageController.js";

const router = express.Router();

// Get all conversations for the logged-in user
router.get("/api/conversations", isAuthenticated, messageController.getConversations);

// Get available counselors (for users)
router.get("/api/counselors", isAuthenticated, messageController.getAvailableCounselors);

// Get available users (for counselors)
router.get("/api/users", isAuthenticated, messageController.getAvailableUsers);

// Start a new conversation
router.post("/api/conversations/start", isAuthenticated, messageController.startConversation);

// Get messages from a conversation
router.get("/api/conversations/:conversationId/messages", isAuthenticated, messageController.getMessages);

// Send a message
router.post("/api/conversations/:conversationId/messages", isAuthenticated, messageController.sendMessage);

// Mark messages as read
router.put("/api/conversations/:conversationId/read", isAuthenticated, messageController.markMessagesAsRead);

// Get unread message count
router.get("/api/messages/unread-count", isAuthenticated, messageController.getUnreadCount);

// Notification endpoints - for offline message delivery
router.get("/api/notifications", isAuthenticated, messageController.getNotifications);
router.get("/api/notifications/unread-count", isAuthenticated, messageController.getUnreadNotificationCount);
router.put("/api/notifications/read/:conversationId", isAuthenticated, messageController.markNotificationsAsRead);
router.put("/api/notifications/read-all", isAuthenticated, messageController.markAllNotificationsAsRead);

// View messaging interface for users
router.get("/messages", isAuthenticated, async (req, res) => {
  try {
    const { User } = await import('../models/index.js');
    const user = await User.findByPk(req.session.userId, {
      attributes: ['id', 'name', 'email', 'profilePicture', 'role']
    });
    res.render("messages/chat", { 
      title: "Messages",
      userId: req.session.userId,
      user: user
    });
  } catch (error) {
    console.error('Error loading messages page:', error);
    res.render("messages/chat", { 
      title: "Messages",
      userId: req.session.userId
    });
  }
});

// View messaging interface for counselors
router.get("/counselor/messages", isAuthenticated, async (req, res) => {
  try {
    const { User } = await import('../models/index.js');
    const user = await User.findByPk(req.session.userId, {
      attributes: ['id', 'name', 'email', 'profilePicture', 'role']
    });
    res.render("counselor/messages", { 
      title: "Messages",
      userId: req.session.userId,
      user: user
    });
  } catch (error) {
    console.error('Error loading messages page:', error);
    res.render("counselor/messages", { 
      title: "Messages",
      userId: req.session.userId
    });
  }
});

// View conversations list
router.get("/conversations", isAuthenticated, async (req, res) => {
  try {
    const { User } = await import('../models/index.js');
    const user = await User.findByPk(req.session.userId, {
      attributes: ['id', 'name', 'email', 'profilePicture', 'role']
    });
    res.render("messages/conversations", { 
      title: "Conversations",
      userId: req.session.userId,
      user: user,
      userProfilePicture: user?.profilePicture || '/images/default-avatar.png'
    });
  } catch (error) {
    console.error('Error loading conversations page:', error);
    res.render("messages/conversations", { 
      title: "Conversations",
      userId: req.session.userId
    });
  }
});

export default router;
