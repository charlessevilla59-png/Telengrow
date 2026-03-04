/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
    
    Google OAuth Configuration
*/

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/index.js';

// Load environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your_client_id_here';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your_client_secret_here';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback';

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔵 Google OAuth callback received');
      console.log('📧 Google Email:', profile.emails[0].value);
      console.log('👤 Google Name:', profile.displayName);
      
      // Extract user info from Google profile
      const email = profile.emails[0].value;
      const googleId = profile.id;
      const name = profile.displayName;
      const profilePicture = profile.photos[0]?.value || null;
      
      // Check if user already exists
      let user = await User.findOne({ where: { email } });
      
      if (user) {
        // User exists - update Google info if not set
        console.log('✅ Existing user found:', user.email);
        
        if (!user.googleId) {
          await user.update({
            googleId,
            profilePicture,
            authProvider: 'google'
          });
          console.log('🔗 Linked Google account to existing user');
        }
        
        return done(null, user);
      } else {
        // Create new user
        console.log('🆕 Creating new user from Google account');
        
        user = await User.create({
          name,
          email,
          googleId,
          profilePicture,
          authProvider: 'google',
          role: 'user',
          accountStatus: 'active',
          password: null // No password for Google users
        });
        
        console.log('✅ New user created:', user.email);
        return done(null, user);
      }
    } catch (error) {
      console.error('❌ Google OAuth error:', error);
      return done(error, null);
    }
  }
));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
