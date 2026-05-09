/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import { ReadingMaterialComment, CommentReaction, User } from "../models/index.js";

// Get all comments for a material
export const getComments = async (req, res) => {
  try {
    const { materialId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const comments = await ReadingMaterialComment.findAll({
      where: {
        materialId: materialId,
        parentCommentId: null, // Only get top-level comments
        isHidden: false
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'profilePicture']
        },
        {
          model: CommentReaction,
          as: 'reactions',
          attributes: ['userId', 'emoji'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          }]
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
              attributes: ['id', 'name', 'profilePicture']
            },
            {
              model: CommentReaction,
              as: 'reactions',
              attributes: ['userId', 'emoji']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limit,
      offset: offset
    });

    const total = await ReadingMaterialComment.count({
      where: {
        materialId: materialId,
        parentCommentId: null,
        isHidden: false
      }
    });

    res.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

// Add a comment
export const addComment = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { materialId } = req.params;
    const { content, parentCommentId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Comment cannot be empty" });
    }

    if (!userId) {
      return res.status(401).json({ error: "You must be logged in to comment" });
    }

    if (!materialId) {
      return res.status(400).json({ error: "Material ID is required" });
    }

    const comment = await ReadingMaterialComment.create({
      materialId: parseInt(materialId),
      userId,
      parentCommentId: parentCommentId || null,
      content: content.trim()
    });

    const populatedComment = await ReadingMaterialComment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'profilePicture']
        },
        {
          model: CommentReaction,
          as: 'reactions',
          attributes: ['userId', 'emoji']
        }
      ]
    });

    res.status(201).json({ comment: populatedComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

// Edit a comment
export const editComment = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Comment cannot be empty" });
    }

    const comment = await ReadingMaterialComment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: "You can only edit your own comments" });
    }

    await comment.update({
      content: content.trim(),
      isEdited: true,
      editedAt: new Date()
    });

    const updatedComment = await ReadingMaterialComment.findByPk(commentId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'profilePicture']
        },
        {
          model: CommentReaction,
          as: 'reactions',
          attributes: ['userId', 'emoji']
        }
      ]
    });

    res.json({ comment: updatedComment });
  } catch (error) {
    console.error("Error editing comment:", error);
    res.status(500).json({ error: "Failed to edit comment" });
  }
};

// Delete a comment (soft delete)
export const deleteComment = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { commentId } = req.params;

    const comment = await ReadingMaterialComment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: "You can only delete your own comments" });
    }

    await comment.update({ isHidden: true });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};

// Add a reaction to a comment
export const addReaction = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { commentId } = req.params;
    const { emoji } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "You must be logged in to react" });
    }

    if (!emoji) {
      return res.status(400).json({ error: "Emoji is required" });
    }

    const comment = await ReadingMaterialComment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if reaction already exists
    let reaction = await CommentReaction.findOne({
      where: {
        commentId,
        userId,
        emoji
      }
    });

    if (reaction) {
      // If it exists, remove it
      await reaction.destroy();
      return res.json({ success: true, action: "removed" });
    }

    // Create new reaction
    reaction = await CommentReaction.create({
      commentId,
      userId,
      emoji
    });

    const populatedReaction = await CommentReaction.findByPk(reaction.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name']
      }]
    });

    res.status(201).json({ reaction: populatedReaction, action: "added" });
  } catch (error) {
    console.error("Error adding reaction:", error);
    res.status(500).json({ error: "Failed to add reaction" });
  }
};

// Get reaction summary for a comment
export const getReactionSummary = async (req, res) => {
  try {
    const { commentId } = req.params;

    const reactions = await CommentReaction.findAll({
      where: { commentId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name']
      }],
      raw: true
    });

    // Group reactions by emoji
    const summary = {};
    reactions.forEach(reaction => {
      if (!summary[reaction.emoji]) {
        summary[reaction.emoji] = {
          count: 0,
          users: []
        };
      }
      summary[reaction.emoji].count += 1;
      summary[reaction.emoji].users.push({
        id: reaction['user.id'],
        name: reaction['user.name']
      });
    });

    res.json({ summary });
  } catch (error) {
    console.error("Error fetching reaction summary:", error);
    res.status(500).json({ error: "Failed to fetch reaction summary" });
  }
};

// Get comment count for a material
export const getCommentCount = async (req, res) => {
  try {
    const { materialId } = req.params;

    const count = await ReadingMaterialComment.count({
      where: {
        materialId,
        parentCommentId: null,
        isHidden: false
      }
    });

    res.json({ count });
  } catch (error) {
    console.error("Error fetching comment count:", error);
    res.status(500).json({ error: "Failed to fetch comment count" });
  }
};

// Add a reaction to a reading material
export const addMaterialReaction = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { materialId } = req.params;
    const { emoji } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "You must be logged in to react" });
    }

    if (!emoji) {
      return res.status(400).json({ error: "Emoji is required" });
    }

    const { ReadingMaterialReaction } = await import('../models/index.js');

    // Check if reaction already exists
    let reaction = await ReadingMaterialReaction.findOne({
      where: {
        materialId,
        userId,
        emoji
      }
    });

    if (reaction) {
      // If it exists, remove it
      await reaction.destroy();
      return res.json({ success: true, action: "removed" });
    }

    // Create new reaction
    reaction = await ReadingMaterialReaction.create({
      materialId,
      userId,
      emoji
    });

    res.status(201).json({ reaction, action: "added" });
  } catch (error) {
    console.error("Error adding material reaction:", error);
    res.status(500).json({ error: "Failed to add reaction" });
  }
};

// Get material reactions
export const getMaterialReactions = async (req, res) => {
  try {
    const { materialId } = req.params;
    const { ReadingMaterialReaction } = await import('../models/index.js');

    const reactions = await ReadingMaterialReaction.findAll({
      where: { materialId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'profilePicture']
      }],
      raw: false
    });

    // Group reactions by emoji
    const summary = {};
    reactions.forEach(reaction => {
      if (!summary[reaction.emoji]) {
        summary[reaction.emoji] = {
          count: 0,
          users: []
        };
      }
      summary[reaction.emoji].count += 1;
      summary[reaction.emoji].users.push({
        id: reaction.user.id,
        name: reaction.user.name
      });
    });

    res.json({ summary, total: reactions.length });
  } catch (error) {
    console.error("Error fetching material reactions:", error);
    res.status(500).json({ error: "Failed to fetch reactions" });
  }
};
