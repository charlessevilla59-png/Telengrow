/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import { User } from "../models/index.js";

// Authentication middleware - checks if user is logged in
export const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      // If it's an AJAX/JSON request, return JSON error instead of redirect
      if (req.headers['content-type']?.includes('application/json') || req.xhr) {
        return res.status(401).json({ 
          success: false, 
          error: "You must be logged in to perform this action" 
        });
      }
      return res.redirect("/login");
    }
    
    const user = await User.findByPk(req.session.userId);
    
    if (!user) {
      req.session.destroy();
      // If it's an AJAX/JSON request, return JSON error instead of redirect
      if (req.headers['content-type']?.includes('application/json') || req.xhr) {
        return res.status(401).json({ 
          success: false, 
          error: "Session expired. Please log in again." 
        });
      }
      return res.redirect("/login");
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    // If it's an AJAX/JSON request, return JSON error instead of redirect
    if (req.headers['content-type']?.includes('application/json') || req.xhr) {
      return res.status(500).json({ 
        success: false, 
        error: "Authentication error" 
      });
    }
    res.redirect("/login");
  }
};
