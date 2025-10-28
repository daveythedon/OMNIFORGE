/**
 * Invoices Routes
 * Handles invoice creation and payment tracking
 */

const express = require('express');
const router = express.Router();
const { Invoice, Job, Client } = require('../models');
const { authMiddleware, attachUser, requireAuth } = require('../middleware/auth');
const paymentService = require('../services/payment.service');
const emailService = require('../services/email.service');
const { createNotification } = require('../utils/notifications');

// Apply auth to all routes
router.use(authMiddleware, attachUser, requireAuth);

/**
 * Get all invoices
 * GET /api/invoices?status=sent
 */
router.get('/', async (req, res) => {
  const { status, limit = 100, offset = 0 } = req.query;

  const where = { companyId: req.user.id };
  if (status) where.status = status;

  const invoices = await Invoice.findAll({
    where,
    include: [
      { model: Job, as: 'job' },
      { model: Client, as: 'client' }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: invoices
  });
});

/**
 * Get single invoice
 * GET /api/invoices/:id
 */
router.get('/:id', async (req, res) => {
  const invoice = await Invoice.findOne({
    where: { id: req.params.id, companyId: req.user.id },
    include: [
      { model: Job, as: 'job' },
      { model: Client, as: 'client' }
    ]
  });

  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: 'Invoice not found'
    });
  }

  res.json({
    success: true,
    data: invoice
  });
});

/**
 * Create invoice
 * POST /api/invoices
 */
router.post('/', async (req, res) => {
  const { jobId, amount, tax = 0, dueDate, lineItems, notes } = req.body;

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

  // Generate invoice number
  const invoiceCount = await Invoice.count({
    where: { companyId: req.user.id }
  });
  const invoiceNumber = `INV-${Date.now()}-${invoiceCount + 1}`;

  const invoice = await Invoice.create({
    invoiceNumber,
    companyId: req.user.id,
    jobId: job.id,
    clientId: job.clientId,
    amount,
    tax,
    total: parseFloat(amount) + parseFloat(tax),
    status: 'draft',
    dueDate,
    lineItems: lineItems || [
      {
        description: job.serviceType,
        quantity: 1,
        rate: amount,
        amount
      }
    ],
    notes
  });

  // Update job with invoice reference
  await job.update({ invoiceId: invoice.id });

  res.status(201).json({
    success: true,
    data: invoice
  });
});

/**
 * Send invoice to client
 * POST /api/invoices/:id/send
 */
router.post('/:id/send', async (req, res) => {
  const invoice = await Invoice.findOne({
    where: { id: req.params.id, companyId: req.user.id },
    include: [
      { model: Job, as: 'job' },
      { model: Client, as: 'client' }
    ]
  });

  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: 'Invoice not found'
    });
  }

  // Generate payment link
  const paymentLink = await paymentService.createPaymentLink({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    amount: invoice.total,
    description: `Invoice for ${invoice.job.serviceType}`
  });

  // Send invoice email
  if (invoice.client.email) {
    await emailService.sendInvoice(
      invoice.client.email,
      invoice.client.name,
      invoice.invoiceNumber,
      invoice.total,
      paymentLink
    );
  }

  // Update invoice status
  await invoice.update({
    status: 'sent',
    lastReminderSentAt: new Date()
  });

  res.json({
    success: true,
    data: invoice,
    paymentLink
  });
});

/**
 * Mark invoice as paid
 * POST /api/invoices/:id/mark-paid
 */
router.post('/:id/mark-paid', async (req, res) => {
  const { paymentMethod } = req.body;

  const invoice = await Invoice.findOne({
    where: { id: req.params.id, companyId: req.user.id },
    include: [{ model: Job, as: 'job' }]
  });

  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: 'Invoice not found'
    });
  }

  await invoice.update({
    status: 'paid',
    paidAt: new Date(),
    paymentMethod
  });

  // Mark job as paid
  await invoice.job.update({ isPaid: true });

  // Update client total spent
  const client = await Client.findByPk(invoice.clientId);
  await client.update({
    totalSpent: parseFloat(client.totalSpent) + parseFloat(invoice.total)
  });

  // Create notification
  await createNotification(req.user.id, {
    type: 'payment_received',
    title: 'Payment Received',
    message: `Payment of $${invoice.total} received for invoice ${invoice.invoiceNumber}`,
    metadata: { invoiceId: invoice.id }
  }, req.app.get('io'));

  res.json({
    success: true,
    data: invoice
  });
});

/**
 * Send payment reminder
 * POST /api/invoices/:id/remind
 */
router.post('/:id/remind', async (req, res) => {
  const invoice = await Invoice.findOne({
    where: { id: req.params.id, companyId: req.user.id },
    include: [{ model: Client, as: 'client' }]
  });

  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: 'Invoice not found'
    });
  }

  const paymentLink = await paymentService.createPaymentLink({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    amount: invoice.total
  });

  if (invoice.client.email) {
    await emailService.sendEmail(
      invoice.client.email,
      `Payment Reminder: Invoice ${invoice.invoiceNumber}`,
      `Hi ${invoice.client.name},\n\nThis is a friendly reminder about your outstanding invoice ${invoice.invoiceNumber} for $${invoice.total}.\n\nPay now: ${paymentLink}`
    );
  }

  await invoice.update({
    remindersSent: invoice.remindersSent + 1,
    lastReminderSentAt: new Date()
  });

  res.json({
    success: true,
    message: 'Reminder sent'
  });
});

module.exports = router;
