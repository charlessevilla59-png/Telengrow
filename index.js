/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
    */

import dotenv from 'dotenv';
dotenv.config();
    
import express from "express";
import path from "path";
import session from "express-session";
import flash from "connect-flash";
import router from "./routes/index.js";
import messageRoutes from "./routes/messageRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import fs from 'fs';
import hbs from "hbs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import passport from "./config/passport.js";
import { syncModels, sequelize } from "./models/index.js";
import { downloadFaceApiModels, getModelFileInfo } from "./utils/downloadFaceApiModels.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { initializeSocketHandlers } from "./utils/socketManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware MUST come before routes
app.use(session({
  secret: process.env.SESSION_SECRET || "xianfire-secret-key-change-this-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Initialize Passport AFTER session middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(express.static(path.join(process.cwd(), "public")));
app.use('/models', express.static(path.join(process.cwd(), "public", "models"), {
  setHeaders: (res, filePath) => {
    // Set correct headers for model files
    if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'max-age=86400'); // 24 hours
    } else if (filePath.endsWith('.bin') || filePath.endsWith('-shard1') || filePath.match(/-shard\d+$/)) {
      // Handle both old .bin files and new .shard1 files
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Cache-Control', 'max-age=86400'); // 24 hours
    } else {
      // Default binary type
      res.setHeader('Content-Type', 'application/octet-stream');
    }
  }
}));

app.engine("xian", async (filePath, options, callback) => {
  try {
    const originalPartialsDir = hbs.partialsDir;
    hbs.partialsDir = path.join(__dirname, 'views');

    // Register helpers on handlebars instance
    hbs.handlebars.registerHelper('ifEquals', function(a, b, options) {
      return a === b ? options.fn(this) : options.inverse(this);
    });

    hbs.handlebars.registerHelper('replaceHyphens', function(str) {
      return str ? str.replace(/-/g, ' ').toUpperCase() : '';
    });

    hbs.handlebars.registerHelper('dateFormatFull', function(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    });

    hbs.handlebars.registerHelper('dateFormatLong', function(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    });

    hbs.handlebars.registerHelper('dateFormatTime', function(date) {
      if (!date) return '';
      return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    });

    hbs.handlebars.registerHelper('wordCount', function(text) {
      if (!text) return 0;
      return text.trim().split(/\s+/).length;
    });

    hbs.handlebars.registerHelper('characterCount', function(text) {
      if (!text) return 0;
      return text.length;
    });

    hbs.handlebars.registerHelper('readingTime', function(text) {
      if (!text) return 0;
      const words = text.trim().split(/\s+/).length;
      const wordsPerMinute = 200;
      return Math.ceil(words / wordsPerMinute);
    });

    hbs.handlebars.registerHelper('gt', function(a, b, options) {
      if (options && typeof options.fn === 'function') {
        return a > b ? options.fn(this) : options.inverse(this);
      }
      return a > b;
    });

    hbs.handlebars.registerHelper('lt', function(a, b, options) {
      if (options && typeof options.fn === 'function') {
        return a < b ? options.fn(this) : options.inverse(this);
      }
      return a < b;
    });

    hbs.handlebars.registerHelper('gte', function(a, b, options) {
      if (options && typeof options.fn === 'function') {
        return a >= b ? options.fn(this) : options.inverse(this);
      }
      return a >= b;
    });

    hbs.handlebars.registerHelper('lte', function(a, b, options) {
      if (options && typeof options.fn === 'function') {
        return a <= b ? options.fn(this) : options.inverse(this);
      }
      return a <= b;
    });

    hbs.handlebars.registerHelper('plus', function(a, b) {
      return a + b;
    });

    hbs.handlebars.registerHelper('add', function(...args) {
      // Remove the last argument which is the options object
      const numbers = args.slice(0, -1);
      return numbers.reduce((sum, num) => sum + (parseInt(num) || 0), 0);
    });

    hbs.handlebars.registerHelper('minus', function(a, b) {
      return a - b;
    });

    hbs.handlebars.registerHelper('divide', function(a, b, options) {
      const roundUp = options === 'roundUp';
      const result = a / b;
      return roundUp ? Math.ceil(result) : Math.floor(result);
    });

    hbs.handlebars.registerHelper('remainder', function(a, b) {
      return a % b;
    });

    hbs.handlebars.registerHelper('range', function(start, end, options) {
      let result = '';
      for (let i = start; i <= end; i++) {
        result += options.fn ? options.fn(i) : '';
      }
      return result;
    });

    hbs.handlebars.registerHelper('times', function(n, options) {
      let result = '';
      for (let i = 0; i < n; i++) {
        result += options.fn(i);
      }
      return result;
    });

    hbs.handlebars.registerHelper('random', function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    });

    hbs.handlebars.registerHelper('dayName', function(index) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date();
      const date = new Date(today.getTime() - (6 - index) * 24 * 60 * 60 * 1000);
      return days[date.getDay()];
    });

    // Helper for admin dashboard - format date with time
    hbs.handlebars.registerHelper('formatDate', function(date) {
      if (!date) return 'Never';
      const d = new Date(date);
      const now = new Date();
      const diff = now - d;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes} min ago`;
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
      
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    });

    // Helper for comparing values (eq) - support both subexpression and block syntax
    hbs.handlebars.registerHelper('eq', function(a, b, options) {
      // Check if this is being used as a block helper (has fn and inverse properties)
      if (options && typeof options.fn === 'function') {
        return a === b ? options.fn(this) : options.inverse(this);
      }
      // Otherwise, just return the boolean value for use in subexpressions
      return a === b;
    });

    // Helper for substring operations
    hbs.handlebars.registerHelper('substring', function(str, start, end) {
      if (!str) return '';
      if (end === undefined) {
        return str.substring(start);
      }
      return str.substring(start, end);
    });

    // Helper to get first character of string
    hbs.handlebars.registerHelper('substring', function(str, start, end) {
      if (!str) return '';
      return str.substring(start, end).toUpperCase();
    });

    // Helper to check if user is online (active in last 5 minutes)
    hbs.handlebars.registerHelper('isOnline', function(lastActive) {
      if (!lastActive) return false;
      const now = new Date();
      const last = new Date(lastActive);
      const diff = now - last;
      const minutes = Math.floor(diff / 60000);
      return minutes < 5; // Online if active in last 5 minutes
    });

    // Helper to slice arrays
    hbs.handlebars.registerHelper('slice', function(array, start, end) {
      if (!Array.isArray(array)) return array;
      return array.slice(start, end);
    });

    const result = await new Promise((resolve, reject) => {
      hbs.__express(filePath, options, (err, html) => {
        if (err) return reject(err);
        resolve(html);
      });
    });

    hbs.partialsDir = originalPartialsDir;
    callback(null, result);
  } catch (err) {
    callback(err);
  }
});

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "xian");

// Register Handlebars helpers
hbs.registerHelper('formatDateForInput', function(date) {
  if (!date) return '';
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
});

hbs.registerHelper('formatDate', function(date) {
  if (!date) return 'Never';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
});

hbs.registerHelper('formatDuration', function(seconds) {
  if (!seconds || seconds === 0) return '0s';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
});

hbs.registerHelper('formatGameName', function(gameType) {
  if (!gameType) return '';
  return gameType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
});

hbs.registerHelper('truncate', function(text, length) {
  if (!text) return '';
  length = length || 100;
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
});

hbs.registerHelper('substring', function(str, start, end) {
  if (!str) return '';
  return str.substring(start, end).toUpperCase();
});

hbs.registerHelper('eq', function(a, b) {
  return a === b;
});

hbs.registerHelper('not', function(value, options) {
  if (typeof options === 'object' && options.fn) {
    return !value ? options.fn(this) : options.inverse(this);
  }
  return !value;
});

hbs.registerHelper('includes', function(array, value) {
  if (!array) return false;
  if (!Array.isArray(array)) return false;
  return array.includes(value);
});

hbs.registerHelper('isOnline', function(lastActive) {
  if (!lastActive) return false;
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return new Date(lastActive) > fiveMinutesAgo;
});

hbs.registerHelper('json', function(context) {
  return JSON.stringify(context);
});

hbs.registerHelper('capitalize', function(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
});

hbs.registerHelper('or', function(...args) {
  // Remove the last argument (options object)
  const options = args.pop();
  // Check if any of the remaining arguments are truthy
  for (let arg of args) {
    if (arg) return true;
  }
  return false;
});

// ✅ FIXED: Register partials synchronously with proper error handling
const partialsDir = path.resolve(__dirname, "views", "partials");
console.log("📁 Looking for partials in:", partialsDir);

try {
  const files = fs.readdirSync(partialsDir);
  console.log("📄 Found files:", files);
  
  files
    .filter(file => file.endsWith('.xian'))
    .forEach(file => {
      const partialName = file.replace('.xian', ''); 
      const fullPath = path.resolve(partialsDir, file);
      console.log(`🔍 Processing partial: ${partialName} from ${fullPath}`);
      
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        hbs.registerPartial(partialName, content);
        console.log(`✅ Successfully registered partial: ${partialName}`);
      } catch (err) {
        console.error(`❌ Failed to read partial: ${file}`, err.message);
      }
    });
  
  // Log registered partials
  console.log("📋 Registered partials:", Object.keys(hbs.handlebars.partials));
  
} catch (err) {
  console.error("❌ Could not read partials directory:", err.message);
  console.error("Make sure the folder contains .xian files");
}

// Mount messageRoutes BEFORE main router so it catches /conversations first
app.use("/", messageRoutes);
app.use("/", exportRoutes);
app.use("/", router);

export default app;

// Sync database and start server
async function startServer() {
  try {
    // Sync all models with database
    console.log("🔄 Syncing database models...");
    // Use force: false and alter: false to avoid schema modification issues
    // If you need to add new fields, create manual migrations instead
    await sequelize.sync({ alter: false, force: false });
    console.log("✅ Database synchronized successfully");
    
    // Face recognition disabled - using manual mood selection instead
    console.log("\n📱 Manual mood tracking enabled (Face recognition disabled)");
    
    if (!process.env.ELECTRON) {
      // Create HTTP server for Socket.io compatibility
      const httpServer = createServer(app);
      const io = new Server(httpServer, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"]
        },
        transports: ['websocket', 'polling']
      });

      // Make io instance available globally for use in routes
      app.locals.io = io;

      // Initialize Socket.io handlers
      initializeSocketHandlers(io);

      httpServer.listen(PORT, () => {
        console.log(`\n🔥 XianFire running at http://localhost:${PORT}`);
        console.log(`📁 Models available at: http://localhost:${PORT}/models/`);
        console.log(`🔌 WebSocket server running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();