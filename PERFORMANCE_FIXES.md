# Performance Fixes After Hardware Outage

## Problem Analysis

Your website was loading very slowly (taking a minute+) after a hardware outage. This was likely caused by:

1. **Registration Endpoint Performance Issue** ⚠️ **CRITICAL**: The registration endpoint was hashing passwords BEFORE checking if users exist, causing:
   - Expensive bcrypt operations on every registration attempt (even for existing users)
   - Database connection pool exhaustion from multiple failed INSERT attempts
   - CPU spikes from unnecessary password hashing
   - This was likely the **primary cause** based on your testing scenario

2. **Database Connection Issues**: After hardware outages, database connections can be slow to re-establish
3. **Blocking Auth Checks**: Every page load triggers database queries for authentication, which were hanging
4. **Short Timeouts**: 2-second connection timeout was too short for post-outage recovery

## Changes Made

### 1. Database Connection Improvements (`src/lib/db/index.ts`)
- ✅ Increased connection timeout from **2s → 10s** (better for post-outage recovery)
- ✅ Added query timeout wrapper (5 seconds default) to prevent hanging queries
- ✅ Added slow query logging (warns if queries take >1 second)
- ✅ Better error logging with timeout detection

### 2. Auth API Timeout Protection (`src/app/api/auth/me/route.ts`)
- ✅ Added 3-second timeout for database operations
- ✅ Returns 503 (Service Unavailable) instead of hanging when DB is slow
- ✅ Better error messages for temporary service issues

### 3. Registration Endpoint Fix (`src/app/api/auth/register/route.ts`) ⚠️ **CRITICAL FIX**
- ✅ **Fixed**: Now checks if user exists FIRST (cheap SELECT query) before hashing password
- ✅ **Before**: Every registration attempt (even duplicates) did expensive password hashing
- ✅ **After**: Only hashes password if user doesn't exist
- ✅ Added 5-second timeout protection for database operations
- ✅ Better error handling for race conditions and timeouts
- ✅ This fix prevents connection pool exhaustion from rapid registration attempts

### 4. Client-Side Auth Check Improvements
- ✅ Added 5-second timeout to auth check (`src/hooks/useAuth.ts`)
- ✅ Auth failures no longer block page rendering (`src/contexts/AuthContext.tsx`)
- ✅ Added abort controller to cancel slow requests

## What This Fixes

- **Before**: Page loads could hang indefinitely waiting for database
- **After**: Pages load within 5 seconds even if database is slow, showing content without auth if needed

## VPS Checks You Should Do

### 1. Check PM2 Status
```bash
pm2 status
pm2 logs transfrmr --lines 100
```

Look for:
- Database connection errors
- Query timeout warnings
- Memory usage (should be < 1GB based on your config)

### 2. Check Database Connection
```bash
# If using PostgreSQL directly
psql $DATABASE_URL -c "SELECT 1;"

# Check connection pool status in logs
grep "DB Pool" /root/.pm2/logs/transfrmr-error.log
```

### 3. Restart Application (if needed)
```bash
pm2 restart transfrmr
```

### 4. Monitor Performance
Watch for these log messages:
- `Slow query detected` - indicates database performance issues
- `Database timeout` - indicates connection problems
- `Auth service temporarily unavailable` - temporary issue, should recover

## Next Steps

1. **Deploy these changes** to your VPS
2. **Restart the application**: `pm2 restart transfrmr`
3. **Monitor logs** for the first few minutes to ensure stable operation
4. **Test page loads** - they should complete within 5 seconds even if database is slow

## If Issues Persist

If you still see slow loading after deploying:

1. **Check database server status** - it might need restarting
2. **Check network connectivity** between app and database
3. **Review PM2 logs** for specific error patterns
4. **Consider database connection pooling** at the database level (PgBouncer)

## Code vs VPS Issue?

**This was likely BOTH, but primarily a CODE issue:**

- **Code Issue (PRIMARY)**: Registration endpoint was doing expensive operations (password hashing) before checking if user exists. Multiple rapid registration attempts with the same email would:
  - Exhaust database connection pool
  - Waste CPU on unnecessary password hashing
  - Cause database locks from failed INSERT attempts
  - This explains why it affected multiple browsers on the same laptop (server-side issue)

- **VPS Issue (SECONDARY)**: Hardware outage may have exacerbated the problem, but the registration endpoint bug would cause issues even without the outage

The fixes ensure:
1. Registration is efficient (checks before expensive operations)
2. Code handles slow database gracefully with timeouts
3. Even if there are infrastructure problems, your site remains usable
