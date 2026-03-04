# Firebase Authentication Setup Guide

## Overview
Ang Tellngrow app ay gumagamit na ng Firebase Authentication para sa Google Sign-In. Ang MySQL database ay nananatiling ginagamit para sa lahat ng user data.

## Step 1: Create Firebase Project

1. Pumunta sa [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" o "Create a project"
3. Enter project name: `tellngrow` (o kahit anong gusto mo)
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Google Authentication

1. Sa Firebase Console, click "Authentication" sa left sidebar
2. Click "Get started"
3. Click "Sign-in method" tab
4. Click "Google" provider
5. Toggle "Enable"
6. Enter support email (your email)
7. Click "Save"

## Step 3: Register Your Web App

1. Sa Firebase Console, click Settings icon (⚙️) > "Project settings"
2. Scroll down to "Your apps" section
3. Click the Web icon (`</>`)
4. Enter app nickname: `Tellngrow Web`
5. Check "Also set up Firebase Hosting" (optional)
6. Click "Register app"
7. Copy the Firebase configuration object

## Step 4: Get Firebase Configuration

You'll see something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tellngrow-xxxxx.firebaseapp.com",
  projectId: "tellngrow-xxxxx",
  storageBucket: "tellngrow-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

## Step 5: Update Your .env File

1. Open your `.env` file (create one if it doesn't exist, copy from `.env.example`)
2. Add the Firebase configuration:

```env
# Firebase Configuration (for Google Sign-In)
FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FIREBASE_AUTH_DOMAIN=tellngrow-xxxxx.firebaseapp.com
FIREBASE_PROJECT_ID=tellngrow-xxxxx
FIREBASE_STORAGE_BUCKET=tellngrow-xxxxx.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
```

## Step 6: Add Authorized Domains

1. Sa Firebase Console > Authentication > Settings tab
2. Scroll to "Authorized domains"
3. Add your domains:
   - `localhost` (for development)
   - Your production domain (e.g., `tellngrow.com`)

## Step 7: Test the Integration

1. Restart your server:
   ```bash
   npm run xian
   ```

2. Open browser and go to `http://localhost:3000/login`

3. Click "Sign in with Google" button

4. Select your Google account

5. You should be redirected to the dashboard

## How It Works

### Frontend (login.xian)
- Uses Firebase JavaScript SDK (v10.8.0)
- `signInWithPopup()` opens Google sign-in popup
- Gets Firebase ID token after successful authentication
- Sends token to backend via `/auth/firebase/google`

### Backend (authController.js)
- Receives Firebase ID token and user info
- Checks if user exists in MySQL database
- Creates new user or updates existing user
- Creates session for the user
- Redirects based on user role (admin/counselor/user)

### Database (MySQL)
- All user data remains in MySQL
- Firebase UID is stored in `googleId` field
- `authProvider` field is set to `firebase-google`

## Troubleshooting

### Error: "Pop-up blocked"
- Allow pop-ups for localhost in your browser settings

### Error: "Firebase configuration not found"
- Make sure `.env` file has all Firebase variables
- Restart the server after updating `.env`

### Error: "Unauthorized domain"
- Add your domain to Firebase Console > Authentication > Authorized domains

### Error: "Account pending approval"
- This is normal for counselor accounts
- Admin needs to approve the account first

## Security Notes

1. **Never commit `.env` file to GitHub** - It's already in `.gitignore`
2. **Firebase API Key is safe to expose** - It's meant for client-side use
3. **ID Token verification** - Currently trusting Firebase client SDK, but you can add server-side verification for production
4. **HTTPS in production** - Always use HTTPS for production deployments

## Benefits of Firebase Auth

✅ More secure than traditional OAuth
✅ No need to manage OAuth credentials
✅ Built-in security features
✅ Easy to add more providers (Facebook, Twitter, etc.)
✅ Free tier is generous (50,000 MAU)
✅ MySQL database remains unchanged

## Next Steps (Optional)

1. Add email/password authentication via Firebase
2. Add Facebook/Twitter sign-in
3. Add phone number authentication
4. Implement email verification
5. Add password reset functionality via Firebase

## Support

If you encounter any issues:
1. Check Firebase Console logs
2. Check browser console for errors
3. Check server logs for backend errors
4. Verify all environment variables are set correctly
