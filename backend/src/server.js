/**
 * TradeFlow Backend Server
 * Main entry point for the Express application
 */

require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');

const { testConnection, sequelize } = require('./config/database');
const { syncDatabase } = require('./models');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const clientRoutes = require('./routes/clients');
const teamRoutes = require('./routes/team');
const notificationRoutes = require('./routes/notifications');
const invoiceRoutes = require('./routes/invoices');
const messageRoutes = require('./routes/messages');
const automationRoutes = require('./routes/automations');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const server = http.createServer(app);

// Socket.io setup for real-time notifications
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Make io accessible in routes
app.set('io', io);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/automations', automationRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-company', (companyId) => {
    socket.join(`company-${companyId}`);
    console.log(`Socket ${socket.id} joined company-${companyId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server gracefully...');
  server.close(async () => {
    await sequelize.close();
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database (creates tables if they don't exist)
    await syncDatabase(false);

    // Start listening
    server.listen(PORT, () => {
      console.log('');
      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.log('║                                                           ║');
      console.log('║          🔧 TradeFlow Backend Server Running 🔧           ║');
      console.log('║                                                           ║');
      console.log('╚═══════════════════════════════════════════════════════════╝');
      console.log('');
      console.log(`  ➜ Local:   http://localhost:${PORT}`);
      console.log(`  ➜ API:     http://localhost:${PORT}/api`);
      console.log(`  ➜ Health:  http://localhost:${PORT}/health`);
      console.log('');
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, io };
