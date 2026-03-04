# Firebase Authentication Setup - Tagalog Guide

## Ano ang Ginawa?

Nag-integrate na tayo ng Firebase Authentication para sa Google Sign-In. Ang MySQL database mo ay hindi na-touch, lahat ng user data ay nandoon pa rin.

## Ano ang Kailangan Mong Gawin?

### 1. Gumawa ng Firebase Project

1. Pumunta sa https://console.firebase.google.com/
2. Click "Add project"
3. Lagay ang project name (e.g., "Tellngrow")
4. I-disable ang Google Analytics (optional)
5. Click "Create project"

### 2. I-enable ang Google Sign-In

1. Sa Firebase Console, click "Authentication"
2. Click "Get started"
3. Click "Sign-in method" tab
4. Click "Google"
5. I-toggle ang "Enable"
6. Lagay ang support email mo
7. Click "Save"

### 3. I-register ang Web App

1. Click Settings icon (⚙️) > "Project settings"
2. Scroll down, click Web icon (`</>`)
3. Lagay ang app nickname: "Tellngrow Web"
4. Click "Register app"
5. **I-copy ang configuration** - makikita mo yan dito:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "tellngrow-xxxxx.firebaseapp.com",
  projectId: "tellngrow-xxxxx",
  storageBucket: "tellngrow-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxx"
};
```

### 4. I-update ang .env File

1. Buksan ang `.env` file mo (kung wala, copy from `.env.example`)
2. I-paste ang Firebase config:

```env
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=tellngrow-xxxxx.firebaseapp.com
FIREBASE_PROJECT_ID=tellngrow-xxxxx
FIREBASE_STORAGE_BUCKET=tellngrow-xxxxx.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:xxxxx
```

### 5. I-restart ang Server

```bash
npm run xian
```

### 6. Test!

1. Buksan ang browser: `http://localhost:3000/login`
2. Click "Sign in with Google"
3. Piliin ang Google account mo
4. Dapat ma-redirect ka sa dashboard

## Ano ang Nabago?

### ✅ Mga Bagong Files:
- `config/firebase.js` - Firebase configuration
- `FIREBASE_SETUP.md` - English setup guide
- `FIREBASE_SETUP_TAGALOG.md` - Tagalog setup guide (ito)

### ✅ Mga Na-update na Files:
- `views/login.xian` - May Firebase Google Sign-In button na
- `controllers/authController.js` - May Firebase auth handler na
- `routes/index.js` - May `/auth/firebase/google` route na
- `.env.example` - May Firebase variables na
- `package.json` - May firebase at firebase-admin packages na

### ✅ Ano ang Hindi Nabago?
- MySQL database - walang binago!
- Existing email/password login - gumagana pa rin!
- User data structure - same pa rin!
- Lahat ng features - working pa rin!

## Paano Gumagana?

1. **User clicks "Sign in with Google"**
   - Firebase popup ang lalabas
   - User pipili ng Google account

2. **Firebase mag-authenticate**
   - Firebase mag-verify ng Google account
   - Firebase mag-generate ng ID token

3. **Frontend mag-send sa Backend**
   - ID token at user info (email, name, photo)
   - POST request sa `/auth/firebase/google`

4. **Backend mag-process**
   - Check kung existing user sa MySQL
   - Kung wala, gumawa ng bagong user
   - Kung meron, i-update ang info
   - Gumawa ng session
   - I-redirect based sa role (admin/counselor/user)

## Common Issues

### "Pop-up blocked"
- I-allow ang pop-ups sa browser settings mo

### "Firebase configuration not found"
- Check kung naka-set ang lahat ng variables sa `.env`
- I-restart ang server

### "Unauthorized domain"
- Sa Firebase Console > Authentication > Settings
- I-add ang `localhost` sa Authorized domains

## Security

✅ `.env` file ay naka-gitignore na - safe!
✅ Firebase API key ay safe i-expose sa client
✅ MySQL database credentials ay naka-hide pa rin
✅ Session-based authentication pa rin

## Benefits

✅ Mas secure kaysa old Google OAuth
✅ Walang binago sa MySQL database
✅ Free tier ng Firebase (50,000 users/month)
✅ Pwede pang mag-add ng ibang providers (Facebook, etc.)
✅ Built-in security features ng Firebase

## Need Help?

1. Check Firebase Console logs
2. Check browser console (F12)
3. Check server terminal logs
4. Basahin ang `FIREBASE_SETUP.md` para sa detailed guide

---

**Note:** Ang old Passport.js Google OAuth ay nandyan pa rin pero hindi na ginagamit. Pwede mo siyang tanggalin later kung gusto mo, pero safe naman na hayaan lang.
