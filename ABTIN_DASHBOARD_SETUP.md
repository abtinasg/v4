# Abtin Personal Dashboard - Setup Guide

## Overview

The Abtin Personal Dashboard has been completely redesigned to provide a comprehensive personal management system with:

- **Daily Planning & Task Management** - Organize your day with priorities and schedules
- **Psychology AI Chat** - Multiple AI chat sessions with full conversation history
- **Portfolio & Financial Management** - Integrated financial overview (uses existing system)
- **Enhanced Security** - JWT-based authentication, rate limiting, password hashing

## What's Been Implemented

### 1. Database Schema (src/lib/db/schema.ts)

New tables added for Abtin features:
- `abtin_users` - User management with hashed passwords
- `abtin_chat_sessions` - Multiple chat conversations (ChatGPT-like)
- `abtin_chat_messages` - Persistent message history
- `abtin_daily_tasks` - Task management with priorities
- `abtin_user_settings` - Personalized dashboard preferences
- `abtin_auth_logs` - Security audit trail

### 2. Enhanced Security (src/lib/auth/abtin-enhanced-auth.ts)

- JWT-based session tokens (24-hour expiry)
- SHA-256 password hashing
- Rate limiting (5 failed attempts per 5 minutes)
- IP-based tracking
- HTTP-only secure cookies
- Authentication logging

### 3. API Endpoints

#### Authentication
- `POST /api/abtin/auth/login` - Login with username/password
- `POST /api/abtin/auth/logout` - Logout and clear session
- `GET /api/abtin/auth/verify` - Verify current session

#### Chat Sessions
- `GET /api/abtin/sessions` - List all chat sessions
- `POST /api/abtin/sessions` - Create new session
- `GET /api/abtin/sessions/[id]` - Get session with messages
- `PATCH /api/abtin/sessions/[id]` - Update session (title, mode, etc.)
- `DELETE /api/abtin/sessions/[id]` - Delete session

#### Tasks
- `GET /api/abtin/tasks` - List tasks (supports filters: today, pending, date range)
- `POST /api/abtin/tasks` - Create new task
- `PATCH /api/abtin/tasks/[id]` - Update task
- `DELETE /api/abtin/tasks/[id]` - Delete task

### 4. Dashboard UI Components

- `DashboardSidebar` - Collapsible navigation sidebar
- `OverviewDashboard` - Main dashboard with stats and quick actions
- Responsive layout with proper authentication flow

## Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Environment Variables

Add to your `.env` file:

```env
# Database (should already be configured)
DATABASE_URL=your_neon_postgresql_url

# JWT Secret for Abtin sessions
ABTIN_JWT_SECRET=your-secret-key-here-change-in-production

# OpenRouter API (should already be configured for chat)
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Step 3: Run Database Migrations

```bash
npm run db:push
```

This will create all the new Abtin tables in your database.

### Step 4: Create Your First Abtin User

```bash
npx tsx scripts/create-abtin-user.ts abtin your_secure_password abtin@example.com "Your Name"
```

Replace `abtin`, `your_secure_password`, etc. with your desired credentials.

### Step 5: Start Development Server

```bash
npm run dev
```

### Step 6: Access the Dashboard

Navigate to `http://localhost:3000/abtin` and login with the credentials you created.

## Features to Complete

### High Priority

1. **Chat Page with Session Management** (`/abtin/chat`)
   - ChatGPT-like interface with session sidebar
   - Message persistence to database
   - Session switching without losing context
   - Update `/api/abtin/chat/route.ts` to save messages

2. **Daily Planning Page** (`/abtin/planning`)
   - Calendar view
   - Task list with filtering
   - Create/edit/delete tasks UI
   - Priority and category management

3. **Portfolio Page** (`/abtin/portfolio`)
   - Integrate with existing portfolio tables
   - Financial overview widgets
   - Transaction history
   - Performance charts

### Medium Priority

4. **Settings Page** (`/abtin/settings`)
   - Profile management
   - Default chat preferences
   - Dashboard customization
   - Theme selection

5. **Mobile Responsiveness**
   - Optimize sidebar for mobile
   - Touch-friendly interactions
   - Responsive task cards

### Low Priority

6. **Advanced Features**
   - Task reminders/notifications
   - Chat export functionality
   - Data backup/export
   - Dark/light theme toggle

## Security Considerations

### Current Implementation

✅ Password hashing (PBKDF2 with 100,000 iterations and random salt)
✅ JWT session tokens (24-hour expiry)
✅ HTTP-only secure cookies
✅ Rate limiting on login (5 attempts per 5 minutes)
✅ Authentication logging with IP tracking
✅ SQL injection protection (via Drizzle ORM)

### Recommendations for Production

1. **HTTPS Only** - Ensure all traffic is over HTTPS
2. **Consider Stronger Hashing** - For even better security, consider bcrypt or argon2
3. **CSRF Protection** - Add CSRF tokens for state-changing operations
4. **Session Refresh** - Implement token refresh mechanism
5. **2FA** - Add two-factor authentication option
6. **Backup Strategy** - Regular database backups
7. **Monitoring** - Set up alerts for suspicious login patterns
8. **Audit Logs** - Regularly review `abtin_auth_logs` for suspicious activity

## File Structure

```
src/
├── app/
│   └── abtin/
│       ├── layout.tsx              # Simple passthrough layout
│       ├── page.tsx                # Main dashboard (overview)
│       ├── chat/page.tsx           # TODO: Chat interface
│       ├── planning/page.tsx       # TODO: Task management
│       ├── portfolio/page.tsx      # TODO: Portfolio view
│       └── settings/page.tsx       # TODO: Settings
├── components/
│   └── abtin/
│       ├── DashboardSidebar.tsx    # Navigation sidebar
│       ├── OverviewDashboard.tsx   # Main dashboard stats
│       └── ...                     # TODO: Other components
├── lib/
│   ├── auth/
│   │   ├── abtin-auth.ts          # Old basic auth (deprecated)
│   │   └── abtin-enhanced-auth.ts # New JWT auth
│   └── db/
│       ├── schema.ts               # Database schema with Abtin tables
│       └── abtin-queries.ts        # Query helpers
└── app/api/abtin/
    ├── auth/                       # Authentication endpoints
    ├── sessions/                   # Chat session management
    ├── tasks/                      # Task management
    └── chat/route.ts               # TODO: Update for sessions
```

## Migration from Old System

The old `/abtin` page used:
- Basic HTTP authentication with environment variables
- No persistent state
- Single chat interface
- Client-side message storage

The new system provides:
- Database-backed user accounts
- Persistent chat sessions and messages
- Multiple simultaneous conversations
- Task management and planning features
- Integrated financial dashboard

All existing OpenRouter chat functionality remains compatible.

## Troubleshooting

### Database Connection Issues

If you see database connection errors:
1. Verify `DATABASE_URL` in `.env`
2. Check Neon dashboard for connection status
3. Ensure IP is whitelisted in Neon settings

### Authentication Not Working

1. Clear browser cookies
2. Verify JWT secret is set in `.env`
3. Check database for user account
4. Review auth logs in `abtin_auth_logs` table

### Chat Not Saving

The chat endpoint needs to be updated to use the new session system:
- Currently uses old in-memory approach
- Needs to call `addChatMessage()` after each response
- Should load context from `getChatMessages()`

## Next Steps

1. **Run migrations** to create database tables
2. **Create test user** using the setup script
3. **Implement remaining pages**:
   - Chat with session management
   - Planning/task management
   - Portfolio integration
   - Settings page
4. **Test thoroughly** on different devices
5. **Deploy** with proper environment variables

## Support

For issues or questions about the Abtin dashboard implementation, refer to:
- This setup guide
- API endpoint documentation in route files
- Database schema comments in `schema.ts`
- Query helpers in `abtin-queries.ts`
