/**
 * Jobs Routes
 * Handles job CRUD and status management
 */

const express = require('express');
const router = express.Router();
const { Job, Client, Team, Invoice } = require('../models');
const { authMiddleware, attachUser, requireAuth } = require('../middleware/auth');
const { validateBody, schemas } = require('../middleware/validation');
const Joi = require('joi');
const webhookService = require('../services/webhook.service');
const { createNotification } = require('../utils/notifications');

// Apply auth to all routes
router.use(authMiddleware, attachUser, requireAuth);

/**
 * Get all jobs
 * GET /api/jobs?status=scheduled&limit=50
 */
router.get('/', async (req, res) => {
  const { status, assignedTo, clientId, limit = 100, offset = 0 } = req.query;

  const where = { companyId: req.user.id };
  if (status) where.status = status;
  if (assignedTo) where.assignedTo = assignedTo;
  if (clientId) where.clientId = clientId;

  const jobs = await Job.findAll({
    where,
    include: [
      { model: Client, as: 'client' },
      { model: Team, as: 'assignedTeamMember' }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: jobs
  });
});

/**
 * Get single job
 * GET /api/jobs/:id
 */
router.get('/:id', async (req, res) => {
  const job = await Job.findOne({
    where: { id: req.params.id, companyId: req.user.id },
    include: [
      { model: Client, as: 'client' },
      { model: Team, as: 'assignedTeamMember' },
      { model: Invoice, as: 'invoice' }
    ]
  });

  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Job not found'
    });
  }

  res.json({
    success: true,
    data: job
  });
});

/**
 * Create new job
 * POST /api/jobs
 */
const createJobSchema = Joi.object({
  customerName: Joi.string().required(),
  customerPhone: Joi.string().required(),
  customerEmail: schemas.email.optional(),
  serviceType: Joi.string().required(),
  serviceAddress: Joi.string().required(),
  scheduledDate: Joi.date().optional(),
  scheduledTime: Joi.string().optional(),
  value: Joi.number().min(0).required(),
  notes: Joi.string().allow('').optional(),
  assignedTo: schemas.uuid.optional()
});

router.post('/', validateBody(createJobSchema), async (req, res) => {
  const jobData = { ...req.body, companyId: req.user.id };

  // Find or create client
  let client = await Client.findOne({
    where: {
      phone: req.body.customerPhone,
      companyId: req.user.id
    }
  });

  if (!client) {
    client = await Client.create({
      companyId: req.user.id,
      name: req.body.customerName,
      phone: req.body.customerPhone,
      email: req.body.customerEmail,
      address: req.body.serviceAddress
    });
  }

  jobData.clientId = client.id;

  // Create job
  const job = await Job.create(jobData);

  // Update client stats
  await client.update({
    totalJobs: client.totalJobs + 1,
    lastContactDate: new Date()
  });

  // Trigger webhook
  await webhookService.triggerNewLead(job);

  // Create notification
  await createNotification(req.user.id, {
    type: 'system_alert',
    title: 'New Lead Created',
    message: `New ${job.serviceType} job for ${job.customerName}`,
    metadata: { jobId: job.id }
  }, req.app.get('io'));

  res.status(201).json({
    success: true,
    data: job
  });
});

/**
 * Update job status
 * PATCH /api/jobs/:id/status
 */
const updateStatusSchema = Joi.object({
  status: Joi.string().valid('new', 'scheduled', 'in-progress', 'completed', 'cancelled').required()
});

router.patch('/:id/status', validateBody(updateStatusSchema), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const job = await Job.findOne({
    where: { id, companyId: req.user.id }
  });

  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Job not found'
    });
  }

  const updates = { status };

  // Set timestamps based on status
  if (status === 'in-progress' && !job.startedAt) {
    updates.startedAt = new Date();
    await webhookService.triggerJobStarted(job);
  } else if (status === 'completed' && !job.completedAt) {
    updates.completedAt = new Date();
    await webhookService.triggerJobCompleted(job);

    // Update client total spent if paid
    if (job.isPaid) {
      const client = await Client.findByPk(job.clientId);
      await client.update({
        totalSpent: parseFloat(client.totalSpent) + parseFloat(job.value)
      });
    }
  } else if (status === 'scheduled') {
    await webhookService.triggerJobScheduled(job);
  }

  await job.update(updates);

  // Emit real-time update
  const io = req.app.get('io');
  io.to(`company-${req.user.id}`).emit('job-updated', job);

  res.json({
    success: true,
    data: job
  });
});

/**
 * Update job
 * PATCH /api/jobs/:id
 */
router.patch('/:id', async (req, res) => {
  const { id } = req.params;

  const job = await Job.findOne({
    where: { id, companyId: req.user.id }
  });

  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Job not found'
    });
  }

  await job.update(req.body);

  res.json({
    success: true,
    data: job
  });
});

/**
 * Delete job
 * DELETE /api/jobs/:id
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const deleted = await Job.destroy({
    where: { id, companyId: req.user.id }
  });

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'Job not found'
    });
  }

  res.json({
    success: true,
    message: 'Job deleted'
  });
});

module.exports = router;
