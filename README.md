# 🌱 Tellngrow - Mental Wellness Platform

A mental health and wellness platform with games, journaling, and reading materials.

---

## 🚀 Quick Start

### 1. Install Dependencies
```cmd
npm install
```

### 2. Setup Database
- Create database: `tellngrow` (lowercase)
- Import: `database/create_database.sql`
- Import: `database/insert_sample_data.sql`

### 3. Setup Firebase (for Google Sign-In)
- Follow the guide: `FIREBASE_SETUP_TAGALOG.md` (Tagalog)
- Or: `FIREBASE_SETUP.md` (English)
- Copy `.env.example` to `.env` and add Firebase credentials

### 4. Create Admin User
```cmd
node SIMPLE_CREATE_ADMIN.js
```

### 5. Run Server
```cmd
npm run xian
```

### 6. Open Browser
```
http://localhost:3000
```

---

## 👤 Login Credentials

### Email/Password Login:

#### Admin Account:
- Email: `angelica@gmail.com`
- Password: `pogi123`

### Test User:
- Email: `marvin@gmail.com`
- Password: `password123`

### Google Sign-In:
- Click "Sign in with Google" button on login page
- Uses Firebase Authentication
- Automatically creates account if first time
- See `FIREBASE_SETUP_TAGALOG.md` for setup instructions

---

## 🎮 Features

### For Users:
- 🎮 **Games**: Color Tap, Grid Memory, Breathing Bubble, Stress Ball
- 📔 **Journal**: Personal mood and thought tracking
- 📚 **Reading Materials**: Mental health articles
- 📊 **Progress Tracking**: Points, levels, streaks

### For Admin:
- 👥 **User Monitoring**: View all user activities
- 📊 **Statistics**: Games, journals, active users
- 👤 **User Details**: Click user name to see full record
- 🏆 **Certificates**: Generate certificates for perfect scores

---

## 🔊 Adding Sounds

### Breathing Bubble Game:
1. Download TikTok audio from: https://snaptik.app/
2. Rename to: `breathing-sound.mp3`
3. Put in: `public/sounds/breathing-sound.mp3`
4. Restart server

### Other Games:
- Color Tap: Already has online sounds
- Grid Memory: Optional (add later)
- Stress Ball: Optional (add later)

**See:** `HOW_TO_ADD_SOUNDS.md` for details

---

## 📁 Project Structure

```
Tellngrow/
├── controllers/        # Route controllers
├── database/          # SQL files
├── middleware/        # Auth middleware
├── models/           # Database models
├── public/           # Static files
│   └── sounds/       # Sound files
├── routes/           # Express routes
├── utils/            # Utilities (certificate generator)
├── views/            # Handlebars templates
│   ├── admin/        # Admin pages
│   ├── games/        # Game pages
│   ├── journal/      # Journal pages
│   ├── quiz/         # (removed)
│   ├── reading/      # Reading materials
│   ├── user/         # User pages
│   └── partials/     # Reusable components
├── index.js          # Main server file
└── package.json      # Dependencies
```

---

## 🗄️ Database

### Tables:
- `users` - User accounts
- `UserProgresses` - User progress tracking
- `GameSessions` - Game play records
- `JournalEntries` - Journal entries
- `Activities` - User activity log
- `certificates` - Generated certificates

### Important:
- Database name: `tellngrow` (lowercase)

---

## 🛠️ Troubleshooting

### Port Already in Use:
```cmd
taskkill /IM node.exe /F
npm run xian
```

### Admin Can't Login:
```cmd
node SIMPLE_CREATE_ADMIN.js
```

### No Sound in Games:
- Check internet connection (Color Tap uses online sounds)
- Add sound files to `public/sounds/` folder
- Restart server

### Database Errors:
- Check database name is `tellngrow` (lowercase)
- Check all SQL files imported
- Check MySQL is running

---

## 📚 Documentation Files

### Essential:
- `HOW_TO_RUN.md` - Detailed setup guide
- `HOW_TO_ADD_SOUNDS.md` - Sound system guide
- `DOWNLOAD_TIKTOK_SOUND_NOW.md` - TikTok audio download
- `GAMES_SOUNDS_SUMMARY.md` - Games sound overview
- `CERTIFICATE_SYSTEM_COMPLETE.md` - Certificate system guide

### Database:
- `database/README.md` - Database setup
- `database/DATABASE_STRUCTURE.md` - Database schema
- `database/QUICK_SETUP.md` - Quick database setup

---

## 🎯 Key Features Implemented

✅ User authentication and authorization
✅ Admin dashboard with user monitoring
✅ 4 interactive mental wellness games
✅ Quiz system with scoring
✅ Journal with mood tracking
✅ Reading materials library
✅ Progress tracking (points, levels, streaks)
✅ Certificate generation for perfect scores
✅ Sound system for games
✅ Responsive design
✅ Session management

---

## 🔧 Tech Stack

- **Backend**: Node.js, Express
- **Database**: MySQL, Sequelize ORM
- **Frontend**: Handlebars, TailwindCSS
- **Auth**: Express-session, bcrypt
- **PDF**: PDFKit (certificates)

---

## 📝 Notes

- Admin users don't appear in user list (filtered out)
- Certificates auto-generate for perfect quiz/game scores
- All games have mute buttons (🔊/🔇)
- Sound files are optional - games work without them

---

## 🚀 Deployment

1. Set environment variables
2. Update database credentials
3. Run migrations
4. Start server with PM2 or similar

---

## 📞 Support

Check documentation files for detailed guides on specific features.

---

**Version**: 1.0.0
**License**: MIT
**Author**: Tellngrow Team
