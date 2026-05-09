/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import { Message, Conversation, User, Notification } from "../models/index.js";
import { Op } from "sequelize";

// Get all conversations for the logged-in user
export const getConversations = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let conversations;
    
    if (user.role === 'user') {
      // Users see conversations with counselors
      conversations = await Conversation.findAll({
        where: { 
          userId: userId,
          status: { [Op.ne]: 'archived' }
        },
        include: [
          { 
            model: User, 
            as: 'counselor', 
            attributes: ['id', 'name', 'email', 'profilePicture']
          },
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['lastMessageTime', 'DESC']]
      });
    } else if (user.role === 'counselor') {
      // Counselors see conversations with users
      conversations = await Conversation.findAll({
        where: { 
          counselorId: userId,
          status: { [Op.ne]: 'archived' }
        },
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'name', 'email', 'profilePicture']
          },
          { 
            model: User, 
            as: 'counselor', 
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['lastMessageTime', 'DESC']]
      });
    } else {
      return res.status(403).json({ error: "Admins cannot use messaging" });
    }

    res.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

// Get all available counselors (for users to start conversations)
export const getAvailableCounselors = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findByPk(userId);

    if (!user || user.role !== 'user') {
      return res.status(403).json({ error: "Only users can view counselors" });
    }

    // Get approved counselors only
    const counselors = await User.findAll({
      where: {
        role: 'counselor',
        accountStatus: 'active'
      },
      attributes: ['id', 'name', 'email', 'profilePicture'],
      order: [['name', 'ASC']]
    });

    res.json({ counselors });
  } catch (error) {
    console.error("Error fetching counselors:", error);
    res.status(500).json({ error: "Failed to fetch counselors" });
  }
};

// Get messages from a conversation
export const getMessages = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // Default to 100 messages per request
    const offset = (page - 1) * limit;

    // Verify user is part of this conversation
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation || (conversation.userId !== userId && conversation.counselorId !== userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Get messages with pagination
    const messages = await Message.findAll({
      where: { conversationId: conversationId },
      include: [
        { 
          model: User, 
          as: 'sender', 
          attributes: ['id', 'name', 'profilePicture']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limit,
      offset: offset
    });

    // Reverse to show chronological order
    const reversedMessages = messages.reverse();

    res.json({ messages: reversedMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { conversationId, content, receiverId } = req.body;
    const io = req.app.locals.io;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Message content cannot be empty" });
    }

    // Verify conversation exists and user is part of it
    let conversation = await Conversation.findByPk(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (conversation.userId !== userId && conversation.counselorId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Get sender user info
    const sender = await User.findByPk(userId, { attributes: ['id', 'name', 'profilePicture'] });

    // Create message
    const message = await Message.create({
      conversationId: conversationId,
      senderId: userId,
      receiverId: receiverId,
      content: content.trim(),
      messageType: 'text'
    });

    // Update conversation last message
    await conversation.update({
      lastMessage: content.substring(0, 100),
      lastMessageSenderId: userId,
      lastMessageTime: new Date()
    });

    // Create notification for offline message delivery
    // This allows the receiver to see the message even if they're offline
    const messagePreview = content.substring(0, 150);
    await Notification.create({
      userId: receiverId,
      conversationId: conversationId,
      messageId: message.id,
      senderId: userId,
      senderName: sender.name,
      messagePreview: messagePreview,
      notificationType: 'new_message',
      isRead: false
    });

    // Fetch the created message with sender info
    const populatedMessage = await Message.findByPk(message.id, {
      include: [
        { 
          model: User, 
          as: 'sender', 
          attributes: ['id', 'name', 'profilePicture']
        }
      ]
    });

    const messageData = {
      id: populatedMessage.id,
      conversationId: conversationId,
      senderId: userId,
      receiverId: receiverId,
      content: populatedMessage.content,
      messageType: 'text',
      isRead: false,
      createdAt: populatedMessage.createdAt,
      sender: {
        id: sender.id,
        name: sender.name,
        profilePicture: sender.profilePicture
      }
    };

    // Emit real-time message via Socket.io
    if (io) {
      // Send to conversation room (both users)
      io.to(`conversation-${conversationId}`).emit("message-received", messageData);
      
      // Also send to receiver's user room for notifications
      io.to(`user-${receiverId}`).emit("new-message-notification", {
        conversationId: conversationId,
        senderId: userId,
        senderName: sender.name,
        messagePreview: messagePreview,
        timestamp: new Date()
      });

      console.log(`📨 Real-time message sent from ${userId} to ${receiverId}`);
    }

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Start a new conversation between user and counselor
export const startConversation = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { counselorId } = req.body;
    const user = await User.findByPk(userId);

    if (!user || user.role !== 'user') {
      return res.status(403).json({ error: "Only users can start conversations" });
    }

    // Verify counselor exists and is active
    const counselor = await User.findOne({
      where: {
        id: counselorId,
        role: 'counselor',
        accountStatus: 'active'
      }
    });

    if (!counselor) {
      return res.status(404).json({ error: "Counselor not found or not available" });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      where: {
        userId: userId,
        counselorId: counselorId
      }
    });

    if (conversation) {
      // If conversation exists but is closed/archived, reactivate it
      if (conversation.status !== 'active') {
        await conversation.update({ status: 'active' });
      }
      return res.json({ conversation, isNew: false });
    }

    // Create new conversation
    conversation = await Conversation.create({
      userId: userId,
      counselorId: counselorId,
      status: 'active'
    });

    res.status(201).json({ conversation, isNew: true });
  } catch (error) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ error: "Failed to start conversation" });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { conversationId } = req.params;
    const io = req.app.locals.io;

    // Verify user is part of this conversation
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation || (conversation.userId !== userId && conversation.counselorId !== userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Get unread messages before updating
    const unreadMessages = await Message.findAll({
      where: {
        conversationId: conversationId,
        receiverId: userId,
        isRead: false
      },
      attributes: ['id']
    });

    // Update unread messages from other user
    await Message.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          conversationId: conversationId,
          receiverId: userId,
          isRead: false
        }
      }
    );

    // Update conversation read timestamp
    if (conversation.userId === userId) {
      await conversation.update({ userLastReadAt: new Date() });
    } else {
      await conversation.update({ counselorLastReadAt: new Date() });
    }

    // Emit read status via Socket.io
    if (io) {
      const otherUserId = conversation.userId === userId ? conversation.counselorId : conversation.userId;
      io.to(`user-${otherUserId}`).emit("messages-read", {
        conversationId: conversationId,
        messageIds: unreadMessages.map(msg => msg.id)
      });

      console.log(`✅ Messages marked as read by ${userId} in conversation ${conversationId}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.session.userId;

    const unreadCount = await Message.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
};

// Get available users (for counselors)
export const getAvailableUsers = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findByPk(userId);

    if (!user || user.role !== 'counselor') {
      return res.status(403).json({ error: "Only counselors can view users" });
    }

    // Get users (only active ones)
    const users = await User.findAll({
      where: {
        role: 'user',
        accountStatus: 'active'
      },
      attributes: ['id', 'name', 'email', 'profilePicture'],
      order: [['name', 'ASC']]
    });

    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Get all notifications (for offline message delivery)
export const getNotifications = async (req, res) => {
  try {
    const userId = req.session.userId;

    const notifications = await Notification.findAll({
      where: { userId: userId },
      include: [
        { 
          model: User, 
          as: 'sender', 
          attributes: ['id', 'name', 'profilePicture']
        },
        {
          model: Conversation,
          attributes: ['id']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.session.userId;

    const unreadCount = await Notification.count({
      where: {
        userId: userId,
        isRead: false
      }
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    res.status(500).json({ error: "Failed to fetch unread notification count" });
  }
};

// Mark notifications as read for a conversation
export const markNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { conversationId } = req.params;

    // Verify conversation exists and user is part of it
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation || (conversation.userId !== userId && conversation.counselorId !== userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Mark all notifications for this conversation as read
    await Notification.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          userId: userId,
          conversationId: conversationId,
          isRead: false
        }
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
};

// Mark all unread notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.session.userId;

    await Notification.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          userId: userId,
          isRead: false
        }
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
};
