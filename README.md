# TradeFlow — Automation-Powered Business Operating System

**The first automation-driven operating system for tradesmen** — combining job scheduling, client communication, payments, and AI-driven insights in one platform.

TradeFlow transforms traditional CRM into an intelligent, self-operating business system that automates repetitive tasks, maximizes revenue, and provides real-time business intelligence.

---

## 🎯 What Makes TradeFlow Different

Unlike static management apps like Tradify or Jobber that focus on **tracking**, TradeFlow focuses on **execution** through automation:

- ✅ **Auto-send** review requests after job completion
- ✅ **Auto-generate and send** invoices when jobs are marked complete
- ✅ **Auto-assign** jobs to team members based on availability
- ✅ **Real-time notifications** for job updates, payments, and team activity
- ✅ **AI-powered insights** with momentum score and growth suggestions
- ✅ **Intelligent routing** for daily job optimization
- ✅ **Client messaging center** with SMS and email templates

---

## 🚀 Current Status

### ✅ Implemented (Priority #1)

**Backend Infrastructure:**
- Complete REST API with Express.js + PostgreSQL
- Socket.io for real-time updates
- Clerk authentication integration
- Service abstraction layers for:
  - Twilio (SMS)
  - Stripe (Payments)
  - SendGrid (Email)
  - Google Calendar
  - OpenAI (AI Insights)
  - n8n Webhooks
- Database models for Users, Teams, Jobs, Clients, Invoices, Notifications, Messages, Automations
- Comprehensive API endpoints for all features

**Frontend Features:**
- Modern React app with Vite
- **Team Management** - Add members, assign jobs, view stats
- **Notifications Center** - Real-time alerts with Socket.io
- Dashboard layout with sidebar navigation
- Clerk authentication flow
- API client with automatic JWT token injection
- Socket.io integration for live updates

### 🔧 In Progress (Priority #2-5)

- Jobs Board with Kanban drag-and-drop
- Review & Invoice Automation UI
- Client Messaging Center
- AI Insights Dashboard
- Momentum Score Calculator
- Integration Hub UI
- Daily Report Automation

---

## 📁 Project Structure

```
OMNIFORGE/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Third-party integrations
│   │   ├── middleware/     # Auth, validation, error handling
│   │   └── server.js       # Express server
│   ├── package.json
│   └── README.md
│
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API & Socket.io clients
│   │   ├── contexts/      # React contexts
│   │   └── App.jsx        # Main app
│   ├── package.json
│   └── README.md
│
└── README.md              # This file
```

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Express.js
- **Database:** PostgreSQL with Sequelize ORM
- **Authentication:** Clerk
- **Real-time:** Socket.io
- **Validation:** Joi
- **Security:** Helmet, CORS, Rate Limiting

### Frontend
- **Framework:** React 18 + Vite
- **Routing:** React Router v6
- **Authentication:** Clerk
- **Styling:** Tailwind CSS
- **API Client:** Axios
- **Real-time:** Socket.io Client
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

### Third-Party Integrations (Ready to Connect)
- **Twilio** - SMS notifications
- **Stripe** - Payment processing
- **SendGrid** - Email automation
- **Google Calendar** - Calendar sync
- **OpenAI** - AI insights
- **n8n** - Workflow automation

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Clerk account
- npm or yarn

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/OMNIFORGE.git
cd OMNIFORGE
```

### 2. Set Up Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
createdb tradeflow
npm run dev
```

Backend runs at `http://localhost:3001`

See `backend/README.md` for detailed setup.

### 3. Set Up Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with Clerk keys
npm run dev
```

Frontend runs at `http://localhost:3000`

See `frontend/README.md` for detailed setup.

### 4. Sign Up and Start Using

1. Navigate to `http://localhost:3000`
2. Sign up with Clerk
3. Start adding team members and creating jobs!

---

## 📋 Feature Roadmap

### ✅ Core Functional Layer (Completed)
1. Interactive Job Pipeline
2. New Booking Modal
3. Team Assignments ⭐
4. Client Profiles
5. Revenue & Payments
6. Notifications Center ⭐

### 🔧 Automation & Communication Layer (In Progress)
1. Automation Log
2. Review & Referral Automation
3. Client Communication Panel
4. Invoice Automation
5. Daily Summary Automation

### 📊 Analytics & AI Insight Layer (Backend Ready)
1. Analytics Dashboard
2. Pipeline Conversion Tracking
3. AI Insights
4. Momentum Score
5. Service Breakdown

### 🔌 Integration & Expansion Layer (Backend Ready)
1. Integration Hub
2. AI-Generated Templates
3. Route Optimization
4. Mobile Quick Actions
5. Custom Branding

---

## 🎯 Priority Build Order

1. ✅ **Team Assignments & Notifications** (COMPLETE)
2. 🔧 **Review & Invoice Automations** (In Progress)
3. ⏳ **Client Messaging Center**
4. ⏳ **AI Insights & Momentum Score**
5. ⏳ **Integration Hub & Daily Report Automation**

---

## 📖 Documentation

- **Backend API:** See `backend/README.md`
- **Frontend Guide:** See `frontend/README.md`
- **API Documentation:** Auto-generated docs coming soon

---

## 🔐 Environment Variables

### Backend (`.env`)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tradeflow

# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Third-party (optional - mock by default)
TWILIO_ACCOUNT_SID=xxx
STRIPE_SECRET_KEY=sk_xxx
SENDGRID_API_KEY=xxx
GOOGLE_CLIENT_ID=xxx
OPENAI_API_KEY=sk-xxx
```

### Frontend (`.env`)

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests (coming soon)
cd frontend
npm test
```

---

## 🚢 Deployment

### Backend → Railway.app

```bash
cd backend
railway login
railway init
railway add postgresql
railway up
```

### Frontend → Vercel

```bash
cd frontend
vercel
```

See individual READMEs for detailed deployment instructions.

---

## 🔌 Connecting Third-Party Services

All services have mock implementations and can be activated by:

1. Adding API keys to `.env`
2. Uncommenting service code in `backend/src/services/`

### Example: Activating Twilio SMS

1. Sign up at https://twilio.com
2. Get Account SID, Auth Token, Phone Number
3. Add to `backend/.env`:
   ```env
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```
4. Uncomment Twilio code in `backend/src/services/sms.service.js`
5. Restart backend

Same process for Stripe, SendGrid, Google Calendar, and OpenAI.

---

## 📊 API Overview

### Main Endpoints

- `POST /api/auth/webhook` - Clerk webhook handler
- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Create job
- `PATCH /api/jobs/:id/status` - Update job status
- `GET /api/team` - List team members
- `POST /api/team/:id/assign-job` - Assign job
- `GET /api/notifications` - Get notifications
- `POST /api/messages/sms` - Send SMS
- `POST /api/automations/review-request` - Trigger review request
- `GET /api/analytics/dashboard` - Get analytics

Full API documentation in `backend/README.md`

---

## 🎨 Features in Detail

### Team Management
- Add unlimited team members
- Assign jobs with one click
- Track individual performance
- Real-time assignment notifications
- Status indicators (active, on-job, off-duty)

### Notifications Center
- Real-time alerts via Socket.io
- Priority badges (urgent/high/medium/low)
- Filter by read/unread
- Notification types:
  - Job assignments
  - Payment received
  - Reviews received
  - Automation triggered
  - System alerts

### Automation System
- Auto-send review requests on job completion
- Auto-generate invoices when jobs complete
- Auto-send payment reminders
- Trigger n8n workflows
- Log all automation activity

### AI Insights (Backend Ready)
- Business momentum score
- Growth suggestions
- Revenue trend analysis
- Pipeline conversion tracking
- Service breakdown analytics

---

## 🛡️ Security

- Clerk authentication for secure user management
- JWT tokens for API authorization
- Helmet.js for HTTP security headers
- Rate limiting on all API routes
- CORS protection
- Input validation with Joi schemas
- SQL injection protection via Sequelize ORM

---

## 🤝 Contributing

This is currently a private project. For questions or access, contact the development team.

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support

For issues or questions:
- Backend issues: See `backend/README.md`
- Frontend issues: See `frontend/README.md`
- General questions: Create an issue on GitHub

---

## 🎉 What's Next?

The next priorities are:

1. **Jobs Board** - Kanban-style drag-and-drop pipeline
2. **Review Automation UI** - One-click review request triggers
3. **Invoice Automation UI** - Auto-generate on job completion
4. **Client Messaging** - SMS/Email center with templates
5. **AI Insights Dashboard** - Momentum score and growth suggestions

---

## 🔥 Vision

TradeFlow is positioning to be the **first automation-driven operating system for tradesmen**, going beyond simple tracking to actual execution:

- **Tracking apps** tell you what happened
- **TradeFlow** makes things happen automatically

By combining scheduling, communication, payments, and AI in one intelligent platform, TradeFlow enables small service companies to operate like enterprise businesses with minimal manual work.

---

**Built with [Claude Code](https://claude.com/claude-code)**

🤖 Co-Authored-By: Claude <noreply@anthropic.com>
