/**
 * Team Management Routes
 * Handles team member CRUD and job assignments
 */

const express = require('express');
const router = express.Router();
const { Team, Job, User } = require('../models');
const { authMiddleware, attachUser, requireAuth } = require('../middleware/auth');
const { validateBody, schemas } = require('../middleware/validation');
const Joi = require('joi');
const smsService = require('../services/sms.service');
const emailService = require('../services/email.service');

// Apply auth to all routes
router.use(authMiddleware, attachUser, requireAuth);

/**
 * Get all team members for company
 * GET /api/team
 */
router.get('/', async (req, res) => {
  const teamMembers = await Team.findAll({
    where: { companyId: req.user.id },
    include: [
      {
        model: Job,
        as: 'assignedJobs',
        where: { status: ['scheduled', 'in-progress'] },
        required: false
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.json({
    success: true,
    data: teamMembers
  });
});

/**
 * Create new team member
 * POST /api/team
 */
const createTeamSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  role: Joi.string().required(),
  specialties: Joi.array().items(Joi.string()).default([])
});

router.post('/', validateBody(createTeamSchema), async (req, res) => {
  const { name, email, phone, role, specialties } = req.body;

  // Create team member
  const teamMember = await Team.create({
    companyId: req.user.id,
    userId: req.user.id, // For now, link to company owner
    name,
    email,
    phone,
    role,
    specialties,
    status: 'active'
  });

  // Send welcome notification
  await smsService.sendSMS(
    phone,
    `Welcome to the team! You've been added to ${req.user.companyName || 'TradeFlow'}. You'll receive job assignments via SMS and email.`
  );

  res.status(201).json({
    success: true,
    data: teamMember
  });
});

/**
 * Update team member
 * PATCH /api/team/:id
 */
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const teamMember = await Team.findOne({
    where: { id, companyId: req.user.id }
  });

  if (!teamMember) {
    return res.status(404).json({
      success: false,
      error: 'Team member not found'
    });
  }

  await teamMember.update(updates);

  res.json({
    success: true,
    data: teamMember
  });
});

/**
 * Delete team member
 * DELETE /api/team/:id
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const teamMember = await Team.findOne({
    where: { id, companyId: req.user.id }
  });

  if (!teamMember) {
    return res.status(404).json({
      success: false,
      error: 'Team member not found'
    });
  }

  // Soft delete - mark as inactive
  await teamMember.update({ status: 'inactive' });

  res.json({
    success: true,
    message: 'Team member removed'
  });
});

/**
 * Assign job to team member
 * POST /api/team/:id/assign-job
 */
const assignJobSchema = Joi.object({
  jobId: schemas.uuid.required()
});

router.post('/:id/assign-job', validateBody(assignJobSchema), async (req, res) => {
  const { id } = req.params;
  const { jobId } = req.body;

  const teamMember = await Team.findOne({
    where: { id, companyId: req.user.id }
  });

  if (!teamMember) {
    return res.status(404).json({
      success: false,
      error: 'Team member not found'
    });
  }

  const job = await Job.findOne({
    where: { id: jobId, companyId: req.user.id }
  });

  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Job not found'
    });
  }

  // Assign job
  await job.update({ assignedTo: teamMember.id });

  // Update team member stats
  await teamMember.update({ status: 'on-job' });

  // Send notification to team member
  const jobDetails = {
    serviceType: job.serviceType,
    address: job.serviceAddress,
    date: job.scheduledDate,
    time: job.scheduledTime
  };

  await smsService.sendTeamAssignment(
    teamMember.phone,
    teamMember.name,
    jobDetails
  );

  // Create notification
  const { Notification } = require('../models');
  await Notification.create({
    userId: req.user.id,
    type: 'job_assigned',
    title: 'Job Assigned',
    message: `${job.serviceType} assigned to ${teamMember.name}`,
    priority: 'medium',
    metadata: {
      jobId: job.id,
      teamMemberId: teamMember.id
    }
  });

  // Emit real-time notification
  const io = req.app.get('io');
  io.to(`company-${req.user.id}`).emit('job-assigned', {
    jobId: job.id,
    teamMember: teamMember.name
  });

  res.json({
    success: true,
    data: { job, teamMember }
  });
});

/**
 * Get team member stats
 * GET /api/team/:id/stats
 */
router.get('/:id/stats', async (req, res) => {
  const { id } = req.params;

  const teamMember = await Team.findOne({
    where: { id, companyId: req.user.id },
    include: [
      {
        model: Job,
        as: 'assignedJobs'
      }
    ]
  });

  if (!teamMember) {
    return res.status(404).json({
      success: false,
      error: 'Team member not found'
    });
  }

  const jobs = teamMember.assignedJobs || [];
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const totalRevenue = completedJobs.reduce((sum, j) => sum + parseFloat(j.value), 0);
  const avgRating = completedJobs
    .filter(j => j.rating)
    .reduce((sum, j, _, arr) => sum + j.rating / arr.length, 0);

  const stats = {
    totalJobs: jobs.length,
    completedJobs: completedJobs.length,
    inProgress: jobs.filter(j => j.status === 'in-progress').length,
    totalRevenue: totalRevenue.toFixed(2),
    avgRating: avgRating.toFixed(1)
  };

  res.json({
    success: true,
    data: stats
  });
});

module.exports = router;
