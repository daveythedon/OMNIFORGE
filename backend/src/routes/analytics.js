/**
 * Analytics Routes
 * Handles business analytics, insights, and momentum score
 */

const express = require('express');
const router = express.Router();
const { Job, Client, Invoice } = require('../models');
const { authMiddleware, attachUser, requireAuth } = require('../middleware/auth');
const { Op } = require('sequelize');
const aiService = require('../services/ai.service');

// Apply auth to all routes
router.use(authMiddleware, attachUser, requireAuth);

/**
 * Get dashboard analytics
 * GET /api/analytics/dashboard
 */
router.get('/dashboard', async (req, res) => {
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    };
  }

  // Get all jobs
  const allJobs = await Job.findAll({
    where: { companyId: req.user.id, ...dateFilter }
  });

  // Get completed jobs
  const completedJobs = allJobs.filter(j => j.status === 'completed');

  // Calculate total revenue
  const totalRevenue = completedJobs
    .filter(j => j.isPaid)
    .reduce((sum, j) => sum + parseFloat(j.value), 0);

  // Calculate average job value
  const avgJobValue = completedJobs.length > 0
    ? totalRevenue / completedJobs.length
    : 0;

  // Calculate conversion rate
  const newLeads = allJobs.filter(j => j.status === 'new').length;
  const scheduledJobs = allJobs.filter(j => j.status === 'scheduled').length;
  const conversionRate = allJobs.length > 0
    ? (completedJobs.length / allJobs.length) * 100
    : 0;

  // Get active clients
  const activeClients = await Client.count({
    where: { companyId: req.user.id }
  });

  // Get pending payments
  const pendingPayments = await Invoice.sum('total', {
    where: {
      companyId: req.user.id,
      status: { [Op.in]: ['sent', 'viewed', 'overdue'] }
    }
  }) || 0;

  res.json({
    success: true,
    data: {
      totalRevenue: totalRevenue.toFixed(2),
      avgJobValue: avgJobValue.toFixed(2),
      conversionRate: conversionRate.toFixed(1),
      activeClients,
      totalJobs: allJobs.length,
      completedJobs: completedJobs.length,
      newLeads,
      scheduledJobs,
      pendingPayments: parseFloat(pendingPayments).toFixed(2)
    }
  });
});

/**
 * Get revenue trends
 * GET /api/analytics/revenue-trends?days=30
 */
router.get('/revenue-trends', async (req, res) => {
  const { days = 30 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const jobs = await Job.findAll({
    where: {
      companyId: req.user.id,
      status: 'completed',
      completedAt: { [Op.gte]: startDate }
    },
    attributes: ['completedAt', 'value'],
    order: [['completedAt', 'ASC']]
  });

  // Group by date
  const dailyRevenue = {};
  jobs.forEach(job => {
    const date = job.completedAt.toISOString().split('T')[0];
    dailyRevenue[date] = (dailyRevenue[date] || 0) + parseFloat(job.value);
  });

  const trends = Object.entries(dailyRevenue).map(([date, revenue]) => ({
    date,
    revenue: parseFloat(revenue).toFixed(2)
  }));

  res.json({
    success: true,
    data: trends
  });
});

/**
 * Get service breakdown
 * GET /api/analytics/service-breakdown
 */
router.get('/service-breakdown', async (req, res) => {
  const { sequelize } = require('../config/database');

  const breakdown = await Job.findAll({
    where: { companyId: req.user.id },
    attributes: [
      'serviceType',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('value')), 'totalValue']
    ],
    group: ['serviceType']
  });

  res.json({
    success: true,
    data: breakdown.map(item => ({
      service: item.serviceType,
      count: parseInt(item.dataValues.count),
      totalValue: parseFloat(item.dataValues.totalValue || 0).toFixed(2)
    }))
  });
});

/**
 * Get AI insights
 * GET /api/analytics/insights
 */
router.get('/insights', async (req, res) => {
  // Gather analytics data
  const jobs = await Job.findAll({
    where: { companyId: req.user.id }
  });

  const completedJobs = jobs.filter(j => j.status === 'completed');
  const totalRevenue = completedJobs
    .filter(j => j.isPaid)
    .reduce((sum, j) => sum + parseFloat(j.value), 0);

  const avgJobValue = completedJobs.length > 0
    ? totalRevenue / completedJobs.length
    : 0;

  const conversionRate = jobs.length > 0
    ? (completedJobs.length / jobs.length) * 100
    : 0;

  const activeClients = await Client.count({
    where: { companyId: req.user.id }
  });

  const analyticsData = {
    totalRevenue,
    completedJobs: completedJobs.length,
    conversionRate,
    avgJobValue,
    activeClients
  };

  // Generate AI insights
  const insights = await aiService.generateInsights(analyticsData);

  res.json({
    success: true,
    data: { insights }
  });
});

/**
 * Get momentum score
 * GET /api/analytics/momentum-score
 */
router.get('/momentum-score', async (req, res) => {
  // Calculate business metrics for momentum score
  const jobs = await Job.findAll({
    where: { companyId: req.user.id }
  });

  const completedJobs = jobs.filter(j => j.status === 'completed');
  const totalRevenue = completedJobs
    .filter(j => j.isPaid)
    .reduce((sum, j) => sum + parseFloat(j.value), 0);

  // Calculate revenue growth (mock - compare to previous period)
  const revenueGrowth = 15; // Mock 15% growth

  // Completion rate
  const completionRate = jobs.length > 0
    ? (completedJobs.length / jobs.length) * 100
    : 0;

  // Average rating
  const avgRating = completedJobs
    .filter(j => j.rating)
    .reduce((sum, j, _, arr) => sum + j.rating / arr.length, 0) || 4.5;

  // Mock response time (minutes)
  const avgResponseTime = 45;

  // Payment collection rate
  const paidJobs = completedJobs.filter(j => j.isPaid).length;
  const paymentCollectionRate = completedJobs.length > 0
    ? (paidJobs / completedJobs.length) * 100
    : 0;

  const businessData = {
    revenueGrowth,
    completionRate,
    avgRating,
    avgResponseTime,
    paymentCollectionRate
  };

  const momentumScore = await aiService.calculateMomentumScore(businessData);

  res.json({
    success: true,
    data: momentumScore
  });
});

/**
 * Get pipeline conversion funnel
 * GET /api/analytics/pipeline-conversion
 */
router.get('/pipeline-conversion', async (req, res) => {
  const jobs = await Job.findAll({
    where: { companyId: req.user.id }
  });

  const statusCounts = {
    new: jobs.filter(j => j.status === 'new').length,
    scheduled: jobs.filter(j => j.status === 'scheduled').length,
    inProgress: jobs.filter(j => j.status === 'in-progress').length,
    completed: jobs.filter(j => j.status === 'completed').length
  };

  const total = jobs.length;

  const conversions = {
    leadToScheduled: total > 0 ? (statusCounts.scheduled / total) * 100 : 0,
    scheduledToCompleted: statusCounts.scheduled > 0
      ? (statusCounts.completed / statusCounts.scheduled) * 100
      : 0,
    overallConversion: total > 0 ? (statusCounts.completed / total) * 100 : 0
  };

  res.json({
    success: true,
    data: {
      counts: statusCounts,
      conversions,
      total
    }
  });
});

module.exports = router;
