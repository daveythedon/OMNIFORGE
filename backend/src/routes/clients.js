/**
 * Clients Routes
 * Handles client management and history
 */

const express = require('express');
const router = express.Router();
const { Client, Job } = require('../models');
const { authMiddleware, attachUser, requireAuth } = require('../middleware/auth');

// Apply auth to all routes
router.use(authMiddleware, attachUser, requireAuth);

/**
 * Get all clients
 * GET /api/clients
 */
router.get('/', async (req, res) => {
  const { search, limit = 100, offset = 0 } = req.query;

  const where = { companyId: req.user.id };

  // Search by name or phone
  if (search) {
    const { Op } = require('sequelize');
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { phone: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const clients = await Client.findAll({
    where,
    include: [
      {
        model: Job,
        as: 'jobs',
        attributes: ['id', 'serviceType', 'status', 'value', 'createdAt']
      }
    ],
    order: [['totalSpent', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: clients
  });
});

/**
 * Get single client
 * GET /api/clients/:id
 */
router.get('/:id', async (req, res) => {
  const client = await Client.findOne({
    where: { id: req.params.id, companyId: req.user.id },
    include: [
      {
        model: Job,
        as: 'jobs',
        order: [['createdAt', 'DESC']]
      }
    ]
  });

  if (!client) {
    return res.status(404).json({
      success: false,
      error: 'Client not found'
    });
  }

  res.json({
    success: true,
    data: client
  });
});

/**
 * Create client
 * POST /api/clients
 */
router.post('/', async (req, res) => {
  const clientData = { ...req.body, companyId: req.user.id };

  const client = await Client.create(clientData);

  res.status(201).json({
    success: true,
    data: client
  });
});

/**
 * Update client
 * PATCH /api/clients/:id
 */
router.patch('/:id', async (req, res) => {
  const client = await Client.findOne({
    where: { id: req.params.id, companyId: req.user.id }
  });

  if (!client) {
    return res.status(404).json({
      success: false,
      error: 'Client not found'
    });
  }

  await client.update(req.body);

  res.json({
    success: true,
    data: client
  });
});

/**
 * Delete client
 * DELETE /api/clients/:id
 */
router.delete('/:id', async (req, res) => {
  const deleted = await Client.destroy({
    where: { id: req.params.id, companyId: req.user.id }
  });

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'Client not found'
    });
  }

  res.json({
    success: true,
    message: 'Client deleted'
  });
});

module.exports = router;
