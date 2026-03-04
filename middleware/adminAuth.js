/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import { User } from "../models/index.js";

// Admin authentication middleware - checks if user is admin
export const isAdmin = async (req, res, next) => {
  try {
    // User should already be authenticated by isAuthenticated middleware
    if (!req.user) {
      return res.redirect("/login");
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).render("403", { 
        title: "Access Denied",
        message: "You don't have permission to access this page. Admin access required."
      });
    }
    
    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    res.status(500).send("Server error");
  }
};

