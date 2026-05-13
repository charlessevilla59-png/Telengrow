/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
    
    Image Handler - Utility for saving base64 images to disk
*/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define uploads directory
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'profiles');

// Ensure uploads directory exists
export const ensureUploadsDir = () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
};

/**
 * Save base64 image to disk and return the file path
 * @param {string} base64Data - Base64 image data (with or without data URL prefix)
 * @param {string} userId - User ID for unique filename
 * @returns {string|null} - Relative file path or null if failed
 */
export const saveBase64Image = (base64Data, userId) => {
  try {
    if (!base64Data) return null;

    ensureUploadsDir();

    // Extract base64 string from data URL if present
    let imageBuffer;
    let extension = 'jpg';

    if (base64Data.startsWith('data:')) {
      // Parse data URL format: data:image/jpeg;base64,XXXXX
      const matches = base64Data.match(/data:image\/([a-z]+);base64,(.+)/);
      if (!matches) {
        console.error('Invalid base64 data URL format');
        return null;
      }
      extension = matches[1];
      imageBuffer = Buffer.from(matches[2], 'base64');
    } else {
      // Plain base64 string
      imageBuffer = Buffer.from(base64Data, 'base64');
    }

    // Validate image size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (imageBuffer.length > MAX_SIZE) {
      console.error('Image too large:', imageBuffer.length);
      return null;
    }

    // Create unique filename with timestamp and random hash
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(4).toString('hex');
    const filename = `profile_${userId}_${timestamp}_${randomHash}.${extension}`;
    const filepath = path.join(uploadsDir, filename);

    // Write file
    fs.writeFileSync(filepath, imageBuffer);
    console.log('✅ Image saved:', filepath);

    // Return relative path for database storage
    return `/uploads/profiles/${filename}`;
  } catch (error) {
    console.error('❌ Error saving image:', error);
    return null;
  }
};

/**
 * Delete image file from disk
 * @param {string} imagePath - Relative path of the image (e.g., /uploads/profiles/...)
 * @returns {boolean} - True if deleted successfully
 */
export const deleteImage = (imagePath) => {
  try {
    if (!imagePath) return false;

    const fullPath = path.join(__dirname, '..', 'public', imagePath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log('✅ Image deleted:', fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error deleting image:', error);
    return false;
  }
};

export default {
  saveBase64Image,
  deleteImage,
  ensureUploadsDir
};
