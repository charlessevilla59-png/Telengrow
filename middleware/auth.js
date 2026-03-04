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
      return res.redirect("/login");
    }
    
    const user = await User.findByPk(req.session.userId);
    
    if (!user) {
      req.session.destroy();
      return res.redirect("/login");
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.redirect("/login");
  }
};
