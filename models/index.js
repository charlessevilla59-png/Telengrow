/*
    MIT License
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
*/

import { sequelize } from "./db.js";
import { User } from "./userModel.js";
import { UserProgress } from "./Userprogressmodel.js";
import { GameSession } from "./Gamesessionmodel.js";
import { JournalEntry } from "./Journalentrymodel.js";
import { Activity } from "./Activitymodel.js";
import Certificate from "./Certificatemodel.js";
import ReadingMaterialModel from "./ReadingMaterialModel.js";
import SavedMaterialModel from "./SavedMaterialModel.js";
import { ReadingSession } from "./ReadingSessionModel.js";
import Feedback from "./FeedbackModel.js";
import { MoodEntry } from "./MoodEntryModel.js";
import { Message } from "./MessageModel.js";
import { Conversation } from "./ConversationModel.js";
import { Notification } from "./NotificationModel.js";
import ReadingMaterialCommentModel from "./ReadingMaterialCommentModel.js";
import CommentReactionModel from "./CommentReactionModel.js";
import ReadingMaterialReactionModel from "./ReadingMaterialReactionModel.js";
import RatingModel from "./RatingModel.js";

// Initialize ReadingMaterial model
const ReadingMaterial = ReadingMaterialModel(sequelize);
const SavedMaterial = SavedMaterialModel(sequelize);
const ReadingMaterialComment = ReadingMaterialCommentModel(sequelize);
const CommentReaction = CommentReactionModel(sequelize);
const ReadingMaterialReaction = ReadingMaterialReactionModel(sequelize);
const Rating = RatingModel(sequelize);

// Setup relationships
User.hasOne(UserProgress, { foreignKey: 'userId', as: 'progress', onDelete: 'CASCADE' });
UserProgress.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(GameSession, { foreignKey: 'userId', onDelete: 'CASCADE' });
GameSession.belongsTo(User, { foreignKey: 'userId' });


User.hasMany(JournalEntry, { foreignKey: 'userId', onDelete: 'CASCADE' });
JournalEntry.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Activity, { foreignKey: 'userId', onDelete: 'CASCADE' });
Activity.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Certificate, { foreignKey: 'userId', onDelete: 'CASCADE' });
Certificate.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ReadingMaterial, { foreignKey: 'counselorId', onDelete: 'CASCADE' });
ReadingMaterial.belongsTo(User, { foreignKey: 'counselorId', as: 'counselor' });

User.hasMany(SavedMaterial, { foreignKey: 'userId', onDelete: 'CASCADE' });
SavedMaterial.belongsTo(User, { foreignKey: 'userId' });

ReadingMaterial.hasMany(SavedMaterial, { foreignKey: 'materialId', onDelete: 'CASCADE' });
SavedMaterial.belongsTo(ReadingMaterial, { foreignKey: 'materialId', as: 'material' });

User.hasMany(ReadingSession, { foreignKey: 'userId', onDelete: 'CASCADE' });
ReadingSession.belongsTo(User, { foreignKey: 'userId' });

ReadingMaterial.hasMany(ReadingSession, { foreignKey: 'materialId', onDelete: 'CASCADE' });
ReadingSession.belongsTo(ReadingMaterial, { foreignKey: 'materialId', as: 'material' });

User.hasMany(Feedback, { foreignKey: 'userId', onDelete: 'CASCADE' });
Feedback.belongsTo(User, { foreignKey: 'userId', as: 'User' });

User.hasMany(MoodEntry, { foreignKey: 'userId', onDelete: 'CASCADE' });
MoodEntry.belongsTo(User, { foreignKey: 'userId' });

// Messaging and Conversation relationships
User.hasMany(Conversation, { foreignKey: 'userId', as: 'userConversations', onDelete: 'CASCADE' });
User.hasMany(Conversation, { foreignKey: 'counselorId', as: 'counselorConversations', onDelete: 'CASCADE' });
Conversation.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Conversation.belongsTo(User, { foreignKey: 'counselorId', as: 'counselor' });
Conversation.hasMany(Message, { foreignKey: 'conversationId', onDelete: 'CASCADE' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages', onDelete: 'CASCADE' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages', onDelete: 'CASCADE' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

// Notification relationships
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Notification.belongsTo(Message, { foreignKey: 'messageId' });
Notification.belongsTo(Conversation, { foreignKey: 'conversationId' });

// Reading Material Comments relationships
User.hasMany(ReadingMaterialComment, { foreignKey: 'userId', as: 'comments', onDelete: 'CASCADE' });
ReadingMaterialComment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ReadingMaterial.hasMany(ReadingMaterialComment, { foreignKey: 'materialId', as: 'comments', onDelete: 'CASCADE' });
ReadingMaterialComment.belongsTo(ReadingMaterial, { foreignKey: 'materialId', as: 'material' });
ReadingMaterialComment.hasMany(ReadingMaterialComment, { foreignKey: 'parentCommentId', as: 'replies', onDelete: 'CASCADE' });
ReadingMaterialComment.belongsTo(ReadingMaterialComment, { foreignKey: 'parentCommentId', as: 'parentComment' });

// Comment Reactions relationships
User.hasMany(CommentReaction, { foreignKey: 'userId', as: 'reactions', onDelete: 'CASCADE' });
CommentReaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ReadingMaterialComment.hasMany(CommentReaction, { foreignKey: 'commentId', as: 'reactions', onDelete: 'CASCADE' });
CommentReaction.belongsTo(ReadingMaterialComment, { foreignKey: 'commentId', as: 'comment' });

// Reading Material Reactions relationships
User.hasMany(ReadingMaterialReaction, { foreignKey: 'userId', as: 'materialReactions', onDelete: 'CASCADE' });
ReadingMaterialReaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ReadingMaterial.hasMany(ReadingMaterialReaction, { foreignKey: 'materialId', as: 'reactions', onDelete: 'CASCADE' });
ReadingMaterialReaction.belongsTo(ReadingMaterial, { foreignKey: 'materialId', as: 'material' });

// Rating relationships
User.hasMany(Rating, { foreignKey: 'userId', as: 'ratings', onDelete: 'CASCADE' });
Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ReadingMaterial.hasMany(Rating, { foreignKey: 'materialId', as: 'userRatings', onDelete: 'CASCADE' });
Rating.belongsTo(ReadingMaterial, { foreignKey: 'materialId', as: 'material' });

// Sync models
export const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced successfully");
  } catch (error) {
    console.error("❌ Error syncing database:", error);
  }
};

export { sequelize, User, UserProgress, GameSession, JournalEntry, Activity, Certificate, ReadingMaterial, SavedMaterial, ReadingSession, Feedback, MoodEntry, Message, Conversation, Notification, ReadingMaterialComment, CommentReaction, ReadingMaterialReaction, Rating };
