# 🔧 Google OAuth Setup - Step by Step (Visual Guide)

## Current Issue
You're getting: `Error 401: invalid_client`
**Why?** Your `.env` file has placeholder credentials, not real ones.

---

## ✅ QUICK FIX (Follow These Steps)

### Step 1: Go to Google Cloud Console
```
👉 Visit: https://console.cloud.google.com/
```

### Step 2: Create or Select a Project
- Click the **Project Selector** (top left dropdown)
- Click **"NEW PROJECT"**
- Name: `Tellngrow`
- Click **"CREATE"**
- Wait 30 seconds for it to be created

### Step 3: Enable Google+ API
1. In the **left sidebar**, find **"APIs & Services"**
2. Click **"Enable APIs and Services"** button (top)
3. **Search:** `Google+ API`
4. Click on the result
5. Click **"ENABLE"** button
6. Wait for it to enable

### Step 4: Create OAuth 2.0 Credentials
1. Left sidebar → **"APIs & Services"** → **"Credentials"**
2. Click blue **"+ CREATE CREDENTIALS"** button
3. Select **"OAuth client ID"**
4. If prompted for "OAuth consent screen":
   - Choose **"External"**
   - Fill in App name: `Tellngrow`
   - Add your email for support
   - Click **"SAVE AND CONTINUE"**
   - Skip optional fields
   - Click **"SAVE AND CONTINUE"** again
5. Back to credentials, click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"** again
6. Choose **"Web application"**
7. Under **"Authorized redirect URIs"**, click **"ADD URI"**
8. Paste: `http://localhost:3000/auth/google/callback`
9. Click **"CREATE"**

### Step 5: Copy Your Credentials
A popup appears with:
- **Client ID** (ends with `.apps.googleusercontent.com`)
- **Client Secret** (starts with `GOCSPX-`)

**COPY BOTH!**

### Step 6: Update Your .env File
Open `Tell 'n Grow/.env` and replace:

```env
GOOGLE_CLIENT_ID=PASTE_YOUR_CLIENT_ID_HERE
```
With:
```env
GOOGLE_CLIENT_ID=your_actual_client_id.apps.googleusercontent.com
```

And replace:
```env
GOOGLE_CLIENT_SECRET=PASTE_YOUR_CLIENT_SECRET_HERE
```
With:
```env
GOOGLE_CLIENT_SECRET=GOCSPX_your_actual_secret
```

**Example:**
```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789
```

### Step 7: Restart Your Server
1. **Stop** your server (press `Ctrl+C`)
2. **Run:** `npm run xian`
3. Visit: `http://localhost:3000/login`
4. Click **"Continue with Google"**
5. ✅ Should work now!

---

## 🆘 Still Not Working?

### Check 1: Redirect URI Mismatch
In Google Console, make sure redirect URI is EXACTLY:
```
http://localhost:3000/auth/google/callback
```

### Check 2: .env File Saved
Make sure your `.env` file was saved after changes.

### Check 3: No Extra Spaces
Credentials should have NO extra spaces:
```
❌ GOOGLE_CLIENT_ID=abc xyz
✅ GOOGLE_CLIENT_ID=abcxyz
```

### Check 4: Server Restarted
After updating `.env`, you MUST restart the server for changes to take effect.

### Check 5: Clear Browser Cache
Try opening Google login in an **Incognito/Private** window.

---

## 📝 For Future Reference

**Location of credentials in Google Cloud:**
1. Go to console.cloud.google.com
2. Select your project (top)
3. APIs & Services → Credentials
4. Find "Web application" OAuth client
5. Click the **edit icon** to copy credentials anytime

---

## ⏱️ Estimated Time: 5-10 Minutes
- Create project: 1 min
- Enable API: 1 min
- Create credentials: 2 min
- Update .env and restart: 1 min
- Test: 1 min
