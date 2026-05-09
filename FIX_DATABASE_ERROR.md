🔧 SERVER ERROR FIX - "Too many keys specified; max 64 keys allowed"
═══════════════════════════════════════════════════════════════════

## 🆘 ERROR EXPLANATION

Your MySQL table has too many indexes/constraints (max 64 per table in MySQL).
The error happens when Sequelize tries to add the UNIQUE constraint on email column.

---

## ✅ QUICK FIX (3 Steps)

### **Step 1: Open MySQL Workbench or MySQL CLI**

```bash
# If using MySQL CLI:
mysql -u root -p
```

### **Step 2: Run Cleanup Commands**

```sql
-- Select your database
USE telengrow;

-- Drop unnecessary/duplicate indexes
ALTER TABLE users DROP INDEX IF EXISTS idx_email;
ALTER TABLE users DROP INDEX IF EXISTS idx_email_unique;
ALTER TABLE users DROP INDEX IF EXISTS idx_google_id;
ALTER TABLE users DROP INDEX IF EXISTS idx_role;
ALTER TABLE users DROP INDEX IF EXISTS idx_account_status;

-- Check indexes remaining
SHOW INDEX FROM users;
```

### **Step 3: Restart Server**

```bash
npm run xian
```

---

## 🔍 WHAT WAS CHANGED

**1. index.js**
```javascript
// Before:
await sequelize.sync({ alter: true, force: false });

// After:
await sequelize.sync({ alter: false, force: false });
```
✅ Prevents automatic schema modifications that hit the 64-key limit

**2. models/userModel.js**
```javascript
// Before:
email: {
  unique: true,
  ...
}

// After:
email: {
  // Removed 'unique: true'
  // Manage in database instead
}
```
✅ Prevents Sequelize from trying to recreate the constraint

---

## 📊 DETAILED FIX

### **If Simple Fix Doesn't Work:**

**1. Check how many indexes you have:**

```sql
USE telengrow;
SELECT COUNT(*) as total_keys FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'telengrow' AND TABLE_NAME = 'users';

-- Should show less than 64
```

**2. List all indexes:**

```sql
SHOW INDEX FROM users;
```

**3. Drop unnecessary ones:**

```sql
-- Keep only essential indexes
ALTER TABLE users DROP INDEX idx_email;
ALTER TABLE users DROP INDEX idx_name;  
-- etc... drop non-critical ones
```

**4. Add back UNIQUE on email if missing:**

```sql
ALTER TABLE users ADD UNIQUE INDEX idx_email_unique (email);
```

---

## 🚨 IF DATABASE WON'T START

### **Option A: Reset Migrations (Recommended)**

```bash
# 1. Backup your database first!
# 2. Drop and recreate:

mysql -u root -p

USE telengrow;
DROP TABLE users;
# (It will recreate on next sync)

# 3. Restart server:
npm run xian
```

### **Option B: Force Recreate**

```javascript
// TEMPORARILY in index.js:
await sequelize.sync({ 
  force: true,  // THIS WILL DELETE DATA!
  alter: false 
});

// Then change back to:
await sequelize.sync({ 
  force: false, 
  alter: false 
});
```

⚠️ **WARNING:** `force: true` deletes all data!

---

## 🔧 TROUBLESHOOTING

### **Still getting "Too many keys" error?**

1. List all indexes:
```sql
SHOW INDEX FROM users;
```

2. Count them:
```sql
SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_NAME = 'users' AND TABLE_SCHEMA = 'telengrow';
```

3. If > 64, drop non-critical ones:
```sql
-- Drop by key name (from SHOW INDEX output)
ALTER TABLE users DROP INDEX index_name;
```

4. Keep only:
   - PRIMARY KEY (id)
   - UNIQUE on email
   - FOREIGN KEYs
   - Indexes on frequently queried columns

---

## ✅ FILES UPDATED

1. ✅ **index.js** - Changed `alter: true` to `alter: false`
2. ✅ **models/userModel.js** - Removed `unique: true` from email field
3. ✅ **database-cleanup.sql** - Cleanup commands provided

---

## 🚀 AFTER FIX

```bash
# 1. Make sure cleanup SQL was run in MySQL

# 2. Start server:
npm run xian

# 3. Should see:
# ✅ Database synchronized successfully

# 4. Go to mood tracker:
# http://localhost:3000/user/mood
```

---

## 📞 IF STILL FAILING

Check these:

1. **MySQL is running?**
   ```bash
   mysql -u root -p -e "SELECT 1"
   ```

2. **Database exists?**
   ```bash
   mysql -u root -p -e "SHOW DATABASES LIKE 'telengrow'"
   ```

3. **User has permissions?**
   ```bash
   mysql -u root -p -e "SHOW GRANTS FOR 'telengrow'@'localhost'"
   ```

4. **Check error logs:**
   ```bash
   tail -f /var/log/mysql/error.log  # Linux
   # or check MySQL Workbench logs
   ```

---

**Status:** Ready to fix ✅
**Next:** Run the SQL commands above, then restart server
