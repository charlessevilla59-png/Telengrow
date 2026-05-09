/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import { Message, Conversation, User } from "../models/index.js";

// Store active socket connections by userId
const activeUsers = new Map();

/**
 * Initialize Socket.io connection handlers
 * @param {SocketIO.Server} io - Socket.io server instance
 */
export const initializeSocketHandlers = (io) => {
  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    const token = socket.handshake.auth.token;
    
    if (!userId) {
      return next(new Error("Authentication error"));
    }
    
    socket.userId = userId;
    next();
  });

  io.on("connection", (socket) => {
    console.log(`✅ User ${socket.userId} connected. Socket ID: ${socket.id}`);
    
    // Store user's socket connection
    activeUsers.set(socket.userId, socket.id);
    
    // Join user-specific room
    socket.join(`user-${socket.userId}`);
    
    // Broadcast user online status
    io.emit("user-online", { userId: socket.userId });

    // Handle message sending
    socket.on("send-message", async (data) => {
      try {
        const { conversationId, content, receiverId } = data;
        const senderId = socket.userId;

        if (!content || !content.trim()) {
          socket.emit("error", { message: "Message cannot be empty" });
          return;
        }

        // Verify conversation exists
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) {
          socket.emit("error", { message: "Conversation not found" });
          return;
        }

        // Verify user is part of conversation
        if (conversation.userId !== senderId && conversation.counselorId !== senderId) {
          socket.emit("error", { message: "Unauthorized" });
          return;
        }

        // Get sender user info
        const sender = await User.findByPk(senderId, { 
          attributes: ['id', 'name', 'profilePicture']
        });

        // Create message in database
        const message = await Message.create({
          conversationId: conversationId,
          senderId: senderId,
          receiverId: receiverId,
          content: content.trim(),
          messageType: 'text'
        });

        // Update conversation
        await conversation.update({
          lastMessage: content.substring(0, 100),
          lastMessageSenderId: senderId,
          lastMessageTime: new Date()
        });

        // Prepare message object for socket emission
        const messageData = {
          id: message.id,
          conversationId: conversationId,
          senderId: senderId,
          receiverId: receiverId,
          content: message.content,
          messageType: 'text',
          isRead: false,
          createdAt: message.createdAt,
          sender: {
            id: sender.id,
            name: sender.name,
            profilePicture: sender.profilePicture
          }
        };

        // Emit message to both users in the conversation
        io.to(`user-${senderId}`).emit("message-sent", messageData);
        io.to(`user-${receiverId}`).emit("message-received", messageData);

        console.log(`📨 Message sent from ${senderId} to ${receiverId}`);
      } catch (error) {
        console.error("Error in send-message handler:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle message read
    socket.on("mark-read", async (data) => {
      try {
        const { conversationId, messageIds } = data;
        const userId = socket.userId;

        if (!messageIds || messageIds.length === 0) return;

        // Update messages as read
        await Message.update(
          { isRead: true, readAt: new Date() },
          {
            where: {
              id: messageIds,
              receiverId: userId
            }
          }
        );

        // Update conversation read timestamp
        const conversation = await Conversation.findByPk(conversationId);
        if (conversation) {
          if (conversation.userId === userId) {
            await conversation.update({ userLastReadAt: new Date() });
          } else {
            await conversation.update({ counselorLastReadAt: new Date() });
          }
        }

        // Notify other user that messages were read
        const otherUserId = conversation.userId === userId ? conversation.counselorId : conversation.userId;
        io.to(`user-${otherUserId}`).emit("messages-read", { 
          conversationId: conversationId,
          messageIds: messageIds
        });

        console.log(`✅ Messages marked as read by ${userId}`);
      } catch (error) {
        console.error("Error in mark-read handler:", error);
      }
    });

    // Handle typing indicator
    socket.on("typing", (data) => {
      try {
        const { conversationId, receiverId, isTyping } = data;
        const senderId = socket.userId;

        io.to(`user-${receiverId}`).emit("user-typing", {
          conversationId: conversationId,
          senderId: senderId,
          isTyping: isTyping
        });
      } catch (error) {
        console.error("Error in typing handler:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`❌ User ${socket.userId} disconnected`);
      activeUsers.delete(socket.userId);
      io.emit("user-offline", { userId: socket.userId });
    });

    // Handle join conversation room
    socket.on("join-conversation", (data) => {
      try {
        const { conversationId } = data;
        socket.join(`conversation-${conversationId}`);
        console.log(`👥 User ${socket.userId} joined conversation ${conversationId}`);
      } catch (error) {
        console.error("Error in join-conversation handler:", error);
      }
    });

    // Handle leave conversation room
    socket.on("leave-conversation", (data) => {
      try {
        const { conversationId } = data;
        socket.leave(`conversation-${conversationId}`);
        console.log(`👋 User ${socket.userId} left conversation ${conversationId}`);
      } catch (error) {
        console.error("Error in leave-conversation handler:", error);
      }
    });
  });
};

/**
 * Check if user is online
 * @param {number} userId - User ID
 * @returns {boolean} - True if user is online
 */
export const isUserOnline = (userId) => {
  return activeUsers.has(userId);
};

/**
 * Get all active users
 * @returns {Map} - Map of userId -> socketId
 */
export const getActiveUsers = () => {
  return activeUsers;
};

/**
 * Emit notification to user
 * @param {SocketIO.Server} io - Socket.io instance
 * @param {number} userId - User ID
 * @param {string} event - Event name
 * @param {object} data - Event data
 */
export const notifyUser = (io, userId, event, data) => {
  io.to(`user-${userId}`).emit(event, data);
};

/**
 * Emit message to conversation
 * @param {SocketIO.Server} io - Socket.io instance
 * @param {number} conversationId - Conversation ID
 * @param {string} event - Event name
 * @param {object} data - Event data
 */
export const notifyConversation = (io, conversationId, event, data) => {
  io.to(`conversation-${conversationId}`).emit(event, data);
};
