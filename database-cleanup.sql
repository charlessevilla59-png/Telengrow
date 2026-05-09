#!/bin/bash
# DATABASE CLEANUP SCRIPT
# Run these SQL commands to fix the "Too many keys" error

echo "🔧 DATABASE CLEANUP - MySQL Commands"
echo "════════════════════════════════════════════════════════"
echo ""

# SQL Commands to run in MySQL client or Workbench
cat > database-cleanup.sql << 'EOF'
-- Remove duplicate or unnecessary indexes from users table
-- MySQL has a 64-key limit per table

-- Step 1: Check current indexes
-- SHOW INDEX FROM users;

-- Step 2: Drop unnecessary indexes (keep only important ones)
-- WARNING: Only drop indexes you're sure about!

-- If you have too many indexes, start by dropping the least important ones:
ALTER TABLE users DROP INDEX IF EXISTS idx_email;
ALTER TABLE users DROP INDEX IF EXISTS idx_email_unique;
ALTER TABLE users DROP INDEX IF EXISTS idx_google_id;
ALTER TABLE users DROP INDEX IF EXISTS idx_role;
ALTER TABLE users DROP INDEX IF EXISTS idx_account_status;

-- Step 3: Verify email still has UNIQUE constraint
-- SHOW INDEX FROM users WHERE Column_name = 'email';

-- Step 4: If email doesn't have UNIQUE, add it
ALTER TABLE users ADD UNIQUE INDEX idx_email_unique (email);

-- Step 5: Check total keys remaining
-- SHOW INDEX FROM users;
EOF

echo "📄 SQL cleanup commands saved to: database-cleanup.sql"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""
echo "✅ QUICK FIX - Run in MySQL Workbench or CLI:"
echo ""
echo "1. Open MySQL Workbench or MySQL CLI"
echo ""
echo "2. Select your database:"
echo "   USE telengrow;"
echo ""
echo "3. Check current indexes:"
echo "   SHOW INDEX FROM users;"
echo ""
echo "4. If you see too many indexes, run:"
echo "   source database-cleanup.sql;"
echo ""
echo "5. Or manually run these commands one by one:"
echo ""
cat database-cleanup.sql | grep -v "^--" | grep -v "^$"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""
echo "✅ AFTER CLEANUP:"
echo "1. Restart server: npm run xian"
echo "2. Database will sync without errors"
echo ""
