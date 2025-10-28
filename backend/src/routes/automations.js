/**
 * Automations Routes
 * Handles automation logs and triggers
 */

const express = require('express');
const router = express.Router();
const { AutomationLog, Job, Client } = require('../models');
const { authMiddleware, attachUser, requireAuth } = require('../middleware/auth');
const smsService = require('../services/sms.service');
const emailService = require('../services/email.service');
const webhookService = require('../services/webhook.service');

// Apply auth to all routes
router.use(authMiddleware, attachUser, requireAuth);

/**
 * Get automation logs
 * GET /api/automations/logs?type=review_request
 */
router.get('/logs', async (req, res) => {
  const { type, status, limit = 100, offset = 0 } = req.query;

  const where = { companyId: req.user.id };
  if (type) where.automationType = type;
  if (status) where.status = status;

  const logs = await AutomationLog.findAll({
    where,
    include: [
      { model: Job, as: 'relatedJob', required: false },
      { model: Client, as: 'relatedClient', required: false }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: logs
  });
});

/**
 * Trigger review request automation
 * POST /api/automations/review-request
 */
router.post('/review-request', async (req, res) => {
  const { jobId } = req.body;

  const job = await Job.findOne({
    where: { id: jobId, companyId: req.user.id },
    include: [{ model: Client, as: 'client' }]
  });

  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Job not found'
    });
  }

  if (job.status !== 'completed') {
    return res.status(400).json({
      success: false,
      error: 'Job must be completed before requesting review'
    });
  }

  const reviewLink = `https://g.page/r/YOUR_GOOGLE_REVIEW_LINK`;

  try {
    // Send review request via SMS
    await smsService.sendReviewRequest(
      job.customerPhone,
      job.customerName,
      reviewLink
    );

    // Send review request via email if available
    if (job.customerEmail) {
      await emailService.sendReviewRequest(
        job.customerEmail,
        job.customerName,
        reviewLink
      );
    }

    // Update job
    await job.update({
      reviewRequested: true,
      reviewRequestedAt: new Date()
    });

    // Log automation
    const log = await AutomationLog.create({
      companyId: req.user.id,
      automationType: 'review_request',
      event: 'review_request_sent',
      description: `Review request sent to ${job.customerName}`,
      status: 'success',
      relatedJobId: job.id,
      relatedClientId: job.clientId,
      payload: { reviewLink }
    });

    // Trigger webhook
    await webhookService.triggerReviewRequest(job);

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    // Log failure
    await AutomationLog.create({
      companyId: req.user.id,
      automationType: 'review_request',
      event: 'review_request_failed',
      description: `Failed to send review request to ${job.customerName}`,
      status: 'failed',
      errorMessage: error.message,
      relatedJobId: job.id
    });

    throw error;
  }
});

/**
 * Trigger invoice automation
 * POST /api/automations/auto-invoice
 */
router.post('/auto-invoice', async (req, res) => {
  const { jobId } = req.body;

  const job = await Job.findOne({
    where: { id: jobId, companyId: req.user.id },
    include: [{ model: Client, as: 'client' }]
  });

  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Job not found'
    });
  }

  if (job.status !== 'completed') {
    return res.status(400).json({
      success: false,
      error: 'Job must be completed before generating invoice'
    });
  }

  try {
    const { Invoice } = require('../models');
    const paymentService = require('../services/payment.service');

    // Create invoice
    const invoiceCount = await Invoice.count({ where: { companyId: req.user.id } });
    const invoiceNumber = `INV-${Date.now()}-${invoiceCount + 1}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      companyId: req.user.id,
      jobId: job.id,
      clientId: job.clientId,
      amount: job.value,
      tax: 0,
      total: job.value,
      status: 'sent',
      lineItems: [
        {
          description: job.serviceType,
          quantity: 1,
          rate: job.value,
          amount: job.value
        }
      ]
    });

    // Generate payment link
    const paymentLink = await paymentService.createPaymentLink({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.total,
      description: `Invoice for ${job.serviceType}`
    });

    // Send invoice
    if (job.client.email) {
      await emailService.sendInvoice(
        job.client.email,
        job.customerName,
        invoice.invoiceNumber,
        invoice.total,
        paymentLink
      );
    }

    // Log automation
    const log = await AutomationLog.create({
      companyId: req.user.id,
      automationType: 'invoice_sent',
      event: 'invoice_auto_generated',
      description: `Invoice ${invoiceNumber} automatically generated and sent`,
      status: 'success',
      relatedJobId: job.id,
      payload: { invoiceId: invoice.id, paymentLink }
    });

    res.json({
      success: true,
      data: { invoice, log }
    });
  } catch (error) {
    await AutomationLog.create({
      companyId: req.user.id,
      automationType: 'invoice_sent',
      event: 'invoice_auto_failed',
      description: `Failed to auto-generate invoice for job ${job.id}`,
      status: 'failed',
      errorMessage: error.message,
      relatedJobId: job.id
    });

    throw error;
  }
});

/**
 * Get automation statistics
 * GET /api/automations/stats
 */
router.get('/stats', async (req, res) => {
  const { sequelize } = require('../config/database');

  const stats = await AutomationLog.findAll({
    where: { companyId: req.user.id },
    attributes: [
      'automationType',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'success' THEN 1 END")), 'successCount'],
      [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'failed' THEN 1 END")), 'failedCount']
    ],
    group: ['automationType']
  });

  res.json({
    success: true,
    data: stats
  });
});

module.exports = router;
