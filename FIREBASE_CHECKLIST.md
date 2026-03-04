# ✅ Firebase Setup Checklist

## Mga Kailangan Mong Gawin Para Gumana ang Google Sign-In

### Step 1: Firebase Console Setup
- [ ] Pumunta sa https://console.firebase.google.com/
- [ ] Gumawa ng bagong project (name: "Tellngrow" o kahit ano)
- [ ] I-enable ang Authentication
- [ ] I-enable ang Google sign-in provider
- [ ] I-register ang web app
- [ ] I-copy ang Firebase configuration

### Step 2: Local Setup
- [ ] I-copy ang `.env.example` to `.env`
- [ ] I-paste ang Firebase credentials sa `.env` file:
  ```
  FIREBASE_API_KEY=...
  FIREBASE_AUTH_DOMAIN=...
  FIREBASE_PROJECT_ID=...
  FIREBASE_STORAGE_BUCKET=...
  FIREBASE_MESSAGING_SENDER_ID=...
  FIREBASE_APP_ID=...
  ```
- [ ] I-save ang `.env` file

### Step 3: Firebase Console - Authorized Domains
- [ ] Sa Firebase Console > Authentication > Settings
- [ ] I-add ang `localhost` sa Authorized domains
- [ ] Kung may production domain ka, i-add din

### Step 4: Test
- [ ] I-restart ang server: `npm run xian`
- [ ] Buksan ang browser: `http://localhost:3000/login`
- [ ] Click "Sign in with Google"
- [ ] Piliin ang Google account
- [ ] Check kung naka-redirect sa dashboard

### Step 5: Verify Database
- [ ] Buksan ang phpMyAdmin
- [ ] Check ang `Users` table
- [ ] Dapat may bagong user na may:
  - `googleId` = Firebase UID
  - `authProvider` = "firebase-google"
  - `profilePicture` = Google profile picture URL

## Troubleshooting

### Hindi gumagana ang Google Sign-In button?
1. Check browser console (F12) for errors
2. Verify Firebase credentials sa `.env`
3. I-restart ang server

### "Pop-up blocked" error?
1. I-allow ang pop-ups sa browser
2. Try ulit

### "Unauthorized domain" error?
1. Sa Firebase Console > Authentication > Settings
2. I-add ang domain mo sa Authorized domains

### User naka-create pero hindi naka-login?
1. Check server logs sa terminal
2. Check kung may error sa MySQL connection
3. Verify ang session configuration

## Mga Na-install na Packages

✅ `firebase` - Client-side Firebase SDK
✅ `firebase-admin` - Server-side Firebase SDK (for future use)

## Mga Bagong Files

✅ `config/firebase.js` - Firebase configuration
✅ `FIREBASE_SETUP.md` - English setup guide
✅ `FIREBASE_SETUP_TAGALOG.md` - Tagalog setup guide
✅ `FIREBASE_CHECKLIST.md` - This checklist

## Mga Na-update na Files

✅ `views/login.xian` - Firebase Google Sign-In button
✅ `controllers/authController.js` - Firebase auth handler
✅ `routes/index.js` - Firebase auth route
✅ `.env.example` - Firebase variables
✅ `README.md` - Updated instructions
✅ `package.json` - Firebase packages

## Important Notes

⚠️ **NEVER commit your `.env` file to GitHub!**
- Already in `.gitignore`
- Contains sensitive credentials

✅ **Firebase API Key is safe to expose**
- It's meant for client-side use
- Firebase has built-in security rules

✅ **MySQL database unchanged**
- All user data still in MySQL
- Firebase only for authentication

✅ **Old email/password login still works**
- Users can still login with email/password
- Google Sign-In is just an additional option

## Next Steps (Optional)

- [ ] Add email verification
- [ ] Add password reset via Firebase
- [ ] Add Facebook/Twitter sign-in
- [ ] Add phone number authentication
- [ ] Implement Firebase security rules

---

**Need help?** Read `FIREBASE_SETUP_TAGALOG.md` for detailed instructions in Tagalog!
