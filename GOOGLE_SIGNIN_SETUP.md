# Google Sign-In Setup Guide (Passport.js OAuth)

## What Was Fixed
✅ **Feedback form error** - Now properly handles JSON API requests  
✅ **Google Sign-In** - Uses Passport.js OAuth (no Firebase needed!)  
✅ **Error handling** - Better error messages and validation  

---

## Quick Setup (5 minutes)

### Step 1: Get Google OAuth Credentials

1. Go to **https://console.cloud.google.com/**
2. Create a new project (or select existing one)
3. Click the project selector at the top
4. Click **"NEW PROJECT"**
5. Enter project name: "Tellngrow" and click **Create**

### Step 2: Enable Google+ API

1. In Google Cloud Console, go to **APIs & Services**
2. Click **"+ ENABLE APIS AND SERVICES"**
3. Search for **"Google+ API"**
4. Click it and press **ENABLE**

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **"+ CREATE CREDENTIALS"**
3. Select **"OAuth client ID"**
4. If prompted, configure OAuth consent screen:
   - User type: **External**
   - Click **CREATE**
   - Fill in app name: "Tellngrow"
   - Add your email as contact
   - No scope needed
   - Click **SAVE AND CONTINUE**

5. Back to Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "Tellngrow Login"
   - Under "Authorized redirect URIs", click **ADD URI**
   - Add: `http://localhost:3000/auth/google/callback`
   - Click **CREATE**

6. Copy the credentials shown:
   - Client ID
   - Client Secret

### Step 4: Update .env File

Open `.env` and update:

```env
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

Keep the Firebase variables - they can stay as-is (you're not using them).

### Step 5: Restart Server

```bash
npm start
```

That's it! 🎉

---

## Testing Google Sign-In

1. Go to **http://localhost:3000/login**
2. Click **"Sign in with Google"** button
3. You'll be redirected to Google login
4. Sign in with your Google account
5. You'll be redirected back to your dashboard

---

## How It Works

**Without Firebase:**
1. User clicks "Sign in with Google"
2. Redirects to `/auth/google` (Passport.js route)
3. User authenticates with Google
4. Google redirects back to `/auth/google/callback`
5. Passport.js creates session
6. User is logged in ✅

**Simple, no extra services needed!**

---

## Troubleshooting

### ❌ "Redirect URI mismatch"
- Your OAuth credentials have wrong redirect URI
- **Solution**: Go back to Google Cloud Console > Credentials
- Edit your OAuth app
- Make sure redirect URI is: `http://localhost:3000/auth/google/callback`

### ❌ Sign-in redirects to login page
- Wrong Client ID or Secret
- **Solution**: Copy credentials again from Google Cloud Console
- Verify they're exactly in `.env` file

### ❌ "This app isn't verified" warning
- Normal for development apps using external OAuth
- Just click through to continue

### ⚠️ Need to use production domain later?
When deploying to production:

1. Update `.env`:
```env
GOOGLE_CALLBACK_URL=https://your-domain.com/auth/google/callback
```

2. Go to Google Cloud Console > Credentials
3. Edit your OAuth app
4. Add redirect URI: `https://your-domain.com/auth/google/callback`
5. Restart server

---

## File Changes Made

✏️ **`views/login.xian`**
- Removed Firebase code
- Changed to simple Passport.js OAuth redirect
- Much simpler and cleaner

✏️ **`controllers/authController.js`**
- Removed Firebase validation
- Simplified login page render

✏️ **`.env`** 
- Already has Google OAuth variables ready
- Just needs your real credentials

✏️ **`middleware/auth.js`** (from earlier fix)
- Detects JSON requests and returns JSON errors

---

## No Firebase Required ✨

This setup uses **Passport.js with Google OAuth** - no Firebase needed!
- Free
- Simple to configure
- Works with real Google accounts
- Server-side authenticated (more secure)

Enjoy! 🚀

