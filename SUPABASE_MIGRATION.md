# 🔄 Migration: Prisma → Supabase SDK Refactoring Guide

## ✅ Changes Completed

### 1. **Configuration Files**

#### [src/config/env.ts](src/config/env.ts)
- ✅ Removed `databaseUrl` 
- ✅ Added Supabase configuration object:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_ANON_KEY`
- ✅ Updated `validateConfig()` to check Supabase vars instead of DATABASE_URL

#### [src/config/supabase.ts](src/config/supabase.ts) - NEW
- ✅ Creates Supabase client with SERVICE_ROLE_KEY
- ✅ Includes `testSupabaseConnection()` for health checks

#### [src/config/db.ts](src/config/db.ts)
- ✅ Deprecated: Now exports null placeholder
- ✅ Kept for import compatibility only

#### [src/config/postgres.ts](src/config/postgres.ts)
- ✅ Deprecated: Now exports null placeholder
- ✅ Kept for build compatibility

### 2. **Repository Refactoring**

All repositories now use Supabase SDK instead of Prisma:

#### [src/modules/auth/auth.repository.ts](src/modules/auth/auth.repository.ts)
```typescript
// OLD: prisma.user.create()
// NEW: supabase.from('User').insert([...]).select().single()
```
- ✅ `createUser()` - INSERT with validation
- ✅ `findByEmail()` - SELECT with error handling (PGRST116)
- ✅ `findById()` - SELECT by ID
- ✅ `getAll()` - SELECT all with ordering

#### [src/modules/events/events.repository.ts](src/modules/events/events.repository.ts)
- ✅ `create()` - INSERT event
- ✅ `findById()` - SELECT by ID
- ✅ `findAll()` - Paginated SELECT with count
- ✅ `findByCreator()` - Filter by createdBy
- ✅ `update()` - UPDATE with dynamic fields
- ✅ `delete()` - DELETE with error handling

#### [src/modules/payments/payments.repository.ts](src/modules/payments/payments.repository.ts)
- ✅ `create()` - INSERT payment with PENDING status
- ✅ `findById()` - SELECT by ID
- ✅ `findByMoMoReference()` - Find by momoReference
- ✅ `findByUserId()` - Filter by user
- ✅ `updateStatus()` - Update status
- ✅ `updateWithExternalId()` - Update with externalId
- ✅ `getAll()` - Paginated list for admin

#### [src/modules/tickets/tickets.repository.ts](src/modules/tickets/tickets.repository.ts)
- ✅ `create()` - INSERT ticket with QR code
- ✅ `findById()` - SELECT by ID
- ✅ `findByUserId()` - Filter by user
- ✅ `findByEventId()` - Filter by event
- ✅ `findByPaymentId()` - Find by payment
- ✅ `updateStatus()` - Update status
- ✅ `markAsUsed()` - Mark ticket as USED

### 3. **Server Setup**

#### [src/server.ts](src/server.ts)
- ✅ Added `testSupabaseConnection()` on startup
- ✅ Updated console logs to show Supabase status instead of DATABASE_URL

### 4. **Services & Controllers**
- ✅ No changes needed - Services use repository interfaces which remain the same
- ✅ Controllers unchanged - Business logic layer unchanged

---

## 🔌 Database Table Names (Supabase)

Used in `.from('TableName')`:

| Module | Table Name | Model |
|--------|-----------|-------|
| Auth | `User` | CreateUserDto |
| Events | `Event` | CreateEventDto |
| Payments | `Payment` | CreatePaymentDto |
| Tickets | `Ticket` | CreateTicketDto |

⚠️ **Important**: Table names are case-sensitive in Supabase queries!

---

## 🚀 Environment Variables Required

```env
# Supabase (NEW - replaces DATABASE_URL)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# MTN MoMo (unchanged)
MOMO_API_USER=your-api-user
MOMO_API_KEY=your-api-key
MOMO_SUBSCRIPTION_KEY=your-subscription-key
MOMO_ENVIRONMENT=sandbox
MOMO_COLLECTION_CURRENCY=XAF
MOMO_CALLBACK_URL=https://your-domain/momo/callback

# JWT (optional)
JWT_SECRET=your-jwt-secret
```

❌ **REMOVED**: DATABASE_URL (no longer needed)

---

## 🔍 Error Handling Pattern

All repositories use Supabase error codes:
- `PGRST116`: No rows returned (treated as null, not error)
- Other errors: Throw with descriptive message

Example:
```typescript
const { data, error } = await supabase
  .from('User')
  .select()
  .eq('email', email)
  .single();

if (error && error.code !== 'PGRST116') {
  throw new Error(`Failed to find user: ${error.message}`);
}
```

---

## ✨ Benefits of Migration

| Aspect | Prisma | Supabase SDK | Benefit |
|--------|--------|-------------|---------|
| Setup | Complex schema sync | Direct SQL queries | ⚡ Faster development |
| Bundle Size | ~5MB | ~200KB | 📦 Smaller deployment |
| Type Safety | Full generated types | Manual interfaces | 🎯 Simpler for small projects |
| Real-time | Requires addon | Built-in with Supabase | 🔄 Easy real-time features |
| RLS | Complex setup | Native support | 🔐 Better security |
| Deploy | Need to migrate DB | No migration files | 🚀 Simpler DevOps |

---

## 🧪 Testing

### Build
```bash
npm run build  # ✅ Should succeed, no errors
```

### Run Development Server
```bash
npm run dev
```

### Check Supabase Connection
Look for in logs:
```
Testing Supabase connection...
✅ Supabase connected successfully
```

### Test Registration Endpoint
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "237690123456",
    "school": "Test School"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "name": "Test User",
    "email": "test@example.com",
    "phone": "237690123456",
    "school": "Test School",
    "createdAt": "2026-03-19T..."
  }
}
```

---

## 📋 Remaining Tasks

- [ ] Test all endpoints with actual Supabase instance
- [ ] Verify table schema matches expected fields in database
- [ ] Test MTN MoMo integration with Supabase payment storage
- [ ] Test QR code ticket generation with Supabase storage
- [ ] Set up Supabase RLS (Row Level Security) policies for production
- [ ] Remove Prisma dependency from package.json (npm uninstall prisma @prisma/client)
- [ ] Delete prisma/ folder from repository

---

## 🔐 Production Checklist

- [ ] Use SUPABASE_SERVICE_ROLE_KEY only for backend (never expose in frontend)
- [ ] Enable RLS on all tables
- [ ] Set up backup/recovery in Supabase dashboard
- [ ] Monitor Supabase logs for API usage
- [ ] Test edge cases (duplicate emails, missing fields, etc.)
- [ ] Load test with expected user volume

---

## 📞 Support

For Supabase documentation: https://supabase.com/docs
For error debugging: Check `error.message` and `error.code` in responses
