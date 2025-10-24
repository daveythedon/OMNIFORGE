# TradeFlow Backend API

Automation-powered job management system backend for tradesmen.

## Features

- **Team Management** - Assign jobs to team members with real-time notifications
- **Notifications Center** - Real-time notification system via Socket.io
- **Job Pipeline** - Complete CRUD operations for job lifecycle management
- **Client Management** - Track clients, job history, and revenue
- **Invoice Automation** - Auto-generate and send invoices on job completion
- **Review Automation** - Auto-send review requests after completed jobs
- **Client Messaging** - SMS and email communication with templates
- **Analytics & Insights** - Business metrics, AI-powered insights, momentum score
- **Integration Hub** - Ready-to-connect integrations for Twilio, Stripe, SendGrid, Google Calendar, OpenAI

## Tech Stack

- **Framework:** Express.js
- **Database:** PostgreSQL with Sequelize ORM
- **Authentication:** Clerk
- **Real-time:** Socket.io
- **Validation:** Joi
- **Security:** Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Clerk account (for authentication)

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Required for basic operation
DATABASE_URL=postgresql://user:password@localhost:5432/tradeflow
PORT=3001
NODE_ENV=development

# Clerk Authentication (Required)
CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Set Up Database

Create PostgreSQL database:

```bash
createdb tradeflow
```

Run migrations (database tables will be auto-created on first run):

```bash
npm run dev
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3001`

## API Documentation

### Authentication

All routes (except `/health` and `/api/auth/webhook`) require Clerk authentication.

Include Clerk session token in Authorization header:
```
Authorization: Bearer <clerk_token>
```

### API Endpoints

#### Auth
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/profile` - Update user profile
- `POST /api/auth/webhook` - Clerk webhook handler

#### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create new job
- `PATCH /api/jobs/:id` - Update job
- `PATCH /api/jobs/:id/status` - Update job status
- `DELETE /api/jobs/:id` - Delete job

#### Team
- `GET /api/team` - List team members
- `POST /api/team` - Add team member
- `PATCH /api/team/:id` - Update team member
- `DELETE /api/team/:id` - Remove team member
- `POST /api/team/:id/assign-job` - Assign job to team member
- `GET /api/team/:id/stats` - Get team member statistics

#### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

#### Clients
- `GET /api/clients` - List clients
- `GET /api/clients/:id` - Get client with job history
- `POST /api/clients` - Create client
- `PATCH /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

#### Invoices
- `GET /api/invoices` - List invoices
- `GET /api/invoices/:id` - Get invoice
- `POST /api/invoices` - Create invoice
- `POST /api/invoices/:id/send` - Send invoice to client
- `POST /api/invoices/:id/mark-paid` - Mark invoice as paid
- `POST /api/invoices/:id/remind` - Send payment reminder

#### Messages
- `GET /api/messages` - Get message history
- `POST /api/messages/sms` - Send SMS
- `POST /api/messages/email` - Send email
- `GET /api/messages/templates` - Get message templates
- `POST /api/messages/templates` - Create template
- `PATCH /api/messages/templates/:id` - Update template
- `DELETE /api/messages/templates/:id` - Delete template

#### Automations
- `GET /api/automations/logs` - Get automation logs
- `POST /api/automations/review-request` - Trigger review request
- `POST /api/automations/auto-invoice` - Trigger auto invoice
- `GET /api/automations/stats` - Get automation statistics

#### Analytics
- `GET /api/analytics/dashboard` - Get dashboard metrics
- `GET /api/analytics/revenue-trends` - Get revenue trends
- `GET /api/analytics/service-breakdown` - Service type breakdown
- `GET /api/analytics/insights` - Get AI-powered insights
- `GET /api/analytics/momentum-score` - Get business momentum score
- `GET /api/analytics/pipeline-conversion` - Conversion funnel metrics

## Third-Party Integrations

The backend includes service abstraction layers for easy integration:

### Twilio (SMS)
1. Sign up at https://www.twilio.com
2. Get Account SID, Auth Token, and Phone Number
3. Add to `.env`:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```
4. Uncomment Twilio code in `src/services/sms.service.js`

### Stripe (Payments)
1. Sign up at https://stripe.com
2. Get API keys from Dashboard
3. Add to `.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```
4. Uncomment Stripe code in `src/services/payment.service.js`

### SendGrid (Email)
1. Sign up at https://sendgrid.com
2. Create API key
3. Add to `.env`:
```env
SENDGRID_API_KEY=your_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```
4. Uncomment SendGrid code in `src/services/email.service.js`

### Google Calendar
1. Create project in Google Cloud Console
2. Enable Google Calendar API
3. Create OAuth credentials
4. Add to `.env`:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
```
5. Uncomment Google Calendar code in `src/services/calendar.service.js`

### OpenAI (AI Insights)
1. Sign up at https://platform.openai.com
2. Create API key
3. Add to `.env`:
```env
OPENAI_API_KEY=sk-your_key
```
4. Uncomment OpenAI code in `src/services/ai.service.js`

## Real-Time Notifications

The backend uses Socket.io for real-time updates.

### Frontend Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

// Join company room
socket.emit('join-company', companyId);

// Listen for events
socket.on('new-notification', (notification) => {
  console.log('New notification:', notification);
});

socket.on('job-assigned', (data) => {
  console.log('Job assigned:', data);
});

socket.on('job-updated', (job) => {
  console.log('Job updated:', job);
});
```

## Database Schema

The backend uses the following models:

- **User** - User accounts and company settings
- **Team** - Team members and technicians
- **Job** - Service jobs and their lifecycle
- **Client** - Customer information and history
- **Invoice** - Invoices and payment tracking
- **Notification** - Real-time notification center
- **Message** - SMS and email communication log
- **MessageTemplate** - Communication templates
- **AutomationLog** - Automation execution history

## Deployment

### Railway.app (Recommended)

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login and initialize:
```bash
railway login
railway init
```

3. Add PostgreSQL:
```bash
railway add postgresql
```

4. Set environment variables:
```bash
railway variables set CLERK_SECRET_KEY=sk_...
railway variables set FRONTEND_URL=https://your-frontend.vercel.app
```

5. Deploy:
```bash
railway up
```

### Alternative: Render.com

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add PostgreSQL database
6. Add environment variables

## Development

### Project Structure

```
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Third-party integrations
│   ├── middleware/      # Auth, validation, error handling
│   ├── utils/           # Helper functions
│   └── server.js        # Express server entry point
├── .env.example         # Environment template
├── package.json
└── README.md
```

### Running Tests

```bash
npm test
```

### Code Style

This project uses standard JavaScript conventions. Please ensure:
- Use async/await for asynchronous operations
- Validate inputs with Joi schemas
- Handle errors with try/catch and error middleware
- Add comments for complex logic

## Support

For issues or questions, please create an issue in the GitHub repository.

## License

MIT
