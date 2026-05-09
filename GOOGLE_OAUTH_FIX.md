# Fix Google OAuth Error (invalid_client)

## Problem
Getting error: "Error 401: invalid_client" - The OAuth client was not found

## Solution: Set Up Google Cloud OAuth Credentials

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account
3. Click on the project selector at the top
4. Click "NEW PROJECT"
5. Name it: "Tellngrow" (or your preferred name)
6. Click "CREATE"

### Step 2: Enable Google+ API
1. In the left sidebar, click "APIs & Services"
2. Click "Enable APIs and Services"
3. Search for "Google+ API"
4. Click on it
5. Click "ENABLE"

### Step 3: Create OAuth 2.0 Credentials
1. Go back to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" button
3. Select "OAuth client ID"
4. If prompted, click "Configure Consent Screen" first:
   - Choose "External" user type
   - Fill in basic info (App name, user support email, etc.)
   - Click "SAVE AND CONTINUE"
   - Skip optional info, click "SAVE AND CONTINUE"
5. Back to credentials: Click "CREATE CREDENTIALS" → "OAuth client ID"
6. Choose "Web application"
7. Under "Authorized redirect URIs", click "ADD URI"
8. Add: `http://localhost:3000/auth/google/callback`
9. Click "CREATE"

### Step 4: Copy Your Credentials
1. A dialog will appear with:
   - **Client ID** (looks like: `xxxx.apps.googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-xxxx`)
2. Copy both values

### Step 5: Update .env File
Replace in your `.env` file:
```env
GOOGLE_CLIENT_ID=<paste_your_client_id_here>
GOOGLE_CLIENT_SECRET=<paste_your_client_secret_here>
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

### Step 6: Restart Your Server
1. Stop your server (Ctrl+C)
2. Run: `npm run xian` (or your start command)
3. Test Google login again

---

## Troubleshooting

### Still getting "invalid_client"?
- ✅ Verify Client ID is correct (should end with `.apps.googleusercontent.com`)
- ✅ Verify Client Secret is correct
- ✅ Verify Redirect URI is exactly: `http://localhost:3000/auth/google/callback`
- ✅ Make sure Google+ API is ENABLED
- ✅ Restart your server after updating .env

### Getting "redirect_uri_mismatch"?
- Make sure redirect URI in Google Console matches exactly:
  - Local: `http://localhost:3000/auth/google/callback`
  - Production: `https://yourdomain.com/auth/google/callback`

### Getting different error?
- Check your .env file is saved and server restarted
- Check credentials are not accidentally copied with extra spaces
