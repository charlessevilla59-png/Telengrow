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

// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();
    
import express from "express";
import path from "path";
import session from "express-session";
import flash from "connect-flash";
import router from "./routes/index.js";
import fs from 'fs';
import hbs from "hbs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import passport from "./config/passport.js";

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

    hbs.handlebars.registerHelper('gt', function(a, b) {
      return a > b;
    });

    hbs.handlebars.registerHelper('lt', function(a, b) {
      return a < b;
    });

    hbs.handlebars.registerHelper('plus', function(a, b) {
      return a + b;
    });

    hbs.handlebars.registerHelper('minus', function(a, b) {
      return a - b;
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

    // Helper for comparing values (eq)
    hbs.handlebars.registerHelper('eq', function(a, b) {
      return a === b;
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

hbs.registerHelper('substring', function(str, start, end) {
  if (!str) return '';
  return str.substring(start, end).toUpperCase();
});

hbs.registerHelper('eq', function(a, b) {
  return a === b;
});

hbs.registerHelper('isOnline', function(lastActive) {
  if (!lastActive) return false;
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return new Date(lastActive) > fiveMinutesAgo;
});

hbs.registerHelper('json', function(context) {
  return JSON.stringify(context);
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
  console.error("Make sure the folder exists and contains .xian files");
}

app.use("/", router);

export default app;

if (!process.env.ELECTRON) {
  app.listen(PORT, () => console.log(`🔥 XianFire running at http://localhost:${PORT}`));
}