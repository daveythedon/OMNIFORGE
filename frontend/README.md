# TradeFlow Frontend

Modern React frontend for the TradeFlow automation platform.

## Features

### Implemented
- **Team Management** - Add team members, view stats, and assign jobs
- **Notifications Center** - Real-time notification system with Socket.io
- **Dashboard Layout** - Responsive sidebar navigation with unread badges
- **Clerk Authentication** - Secure user authentication and session management
- **API Integration** - Complete REST API client with axios interceptors
- **Socket.io Integration** - Real-time updates for notifications and job assignments

### Coming Soon
- Jobs Board (Kanban-style drag-and-drop)
- Analytics Dashboard
- Client Management
- Revenue & Invoicing
- Messaging Center
- Automations Hub

## Tech Stack

- **React 18** with Hooks
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Clerk** - Authentication
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications
- **date-fns** - Date formatting

## Prerequisites

- Node.js 18+
- npm or yarn
- TradeFlow backend running (see backend README)
- Clerk account

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

### 3. Get Clerk Keys

1. Sign up at https://clerk.com
2. Create new application
3. Copy Publishable Key to `.env`
4. Add `http://localhost:3000` to allowed origins in Clerk Dashboard

### 4. Start Development Server

```bash
npm run dev
```

App will open at `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   │   └── DashboardLayout.jsx
│   ├── pages/             # Page components
│   │   ├── TeamManagement.jsx
│   │   ├── NotificationsCenter.jsx
│   │   ├── JobsBoard.jsx
│   │   ├── Analytics.jsx
│   │   ├── Clients.jsx
│   │   ├── Revenue.jsx
│   │   ├── Messaging.jsx
│   │   ├── Automations.jsx
│   │   └── Settings.jsx
│   ├── services/          # API and Socket.io clients
│   │   ├── api.js
│   │   └── socket.js
│   ├── contexts/          # React contexts
│   │   └── AuthContext.jsx
│   ├── hooks/             # Custom hooks (future)
│   ├── utils/             # Utility functions (future)
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Features Guide

### Team Management

**Location:** `/team`

Add and manage team members:
- View team member cards with status indicators
- See job stats (total jobs, completed, rating)
- Assign scheduled jobs to team members
- Real-time notifications on assignment

**How to use:**
1. Click "Add Team Member"
2. Fill in name, email, phone, and role
3. Click "Assign Job" on any team member card
4. Select from available scheduled jobs
5. Assignment triggers real-time notification

### Notifications Center

**Location:** `/notifications`

Real-time notification system:
- View all notifications with priority badges
- Filter by: All, Unread, Read
- Mark as read/delete notifications
- Real-time updates via Socket.io

**Notification Types:**
- Job Assigned
- Job Completed
- Payment Received
- Review Received
- Automation Triggered
- System Alerts

### Dashboard Layout

Features:
- Persistent sidebar navigation
- Unread notification badge
- User profile menu (Clerk)
- Responsive design

## API Client

The API client (`src/services/api.js`) provides methods for all backend endpoints:

```javascript
import { teamAPI, jobsAPI, notificationsAPI } from '../services/api';

// Team operations
const members = await teamAPI.getAll();
await teamAPI.assignJob(memberId, jobId);

// Job operations
const jobs = await jobsAPI.getAll({ status: 'scheduled' });
await jobsAPI.updateStatus(jobId, 'completed');

// Notifications
const notifications = await notificationsAPI.getAll({ unread: 'true' });
await notificationsAPI.markAsRead(notificationId);
```

## Socket.io Integration

Real-time events handled by `src/services/socket.js`:

```javascript
import socketService from '../services/socket';

// Connect to socket (automatic in AuthContext)
socketService.connect(companyId);

// Listen for events
socketService.onNewNotification((notification) => {
  console.log('New notification:', notification);
});

socketService.onJobAssigned((data) => {
  console.log('Job assigned:', data);
});

socketService.onJobUpdated((job) => {
  console.log('Job updated:', job);
});
```

## Authentication Flow

Using Clerk for authentication:

1. User signs in via Clerk
2. `AuthContext` fetches user from backend
3. Socket.io connection established
4. User ID used for API calls (JWT token auto-attached)

Access user in components:

```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isSignedIn, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isSignedIn) return null;

  return <div>Welcome {user.firstName}!</div>;
}
```

## Building for Production

```bash
npm run build
```

Build output in `dist/` directory.

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_API_URL` (production backend URL)
   - `VITE_SOCKET_URL` (production backend URL)

### Alternative: Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy `dist/` folder to Netlify

3. Set environment variables in Netlify dashboard

## Troubleshooting

### "Clerk not configured" error
- Check `VITE_CLERK_PUBLISHABLE_KEY` in `.env`
- Ensure key starts with `pk_test_` or `pk_live_`

### API requests failing
- Ensure backend is running on port 3001
- Check `VITE_API_URL` in `.env`
- Open browser console for error details

### Socket.io not connecting
- Check backend is running with Socket.io
- Verify `VITE_SOCKET_URL` in `.env`
- Check browser console for connection errors

### Build errors
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite && npm run dev`

## Next Steps

1. Implement Jobs Board with drag-and-drop
2. Add Analytics Dashboard with charts
3. Build Client Management interface
4. Create Revenue & Invoice tracking
5. Implement Messaging Center
6. Add Automations configuration UI

## Contributing

This is an internal project. For questions or issues, contact the development team.

## License

MIT
