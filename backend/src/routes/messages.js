/**
 * Messages Routes
 * Handles client communication (SMS & Email)
 */

const express = require('express');
const router = express.Router();
const { Message, MessageTemplate, Client } = require('../models');
const { authMiddleware, attachUser, requireAuth } = require('../middleware/auth');
const smsService = require('../services/sms.service');
const emailService = require('../services/email.service');

// Apply auth to all routes
router.use(authMiddleware, attachUser, requireAuth);

/**
 * Get all messages
 * GET /api/messages?clientId=xxx&type=sms
 */
router.get('/', async (req, res) => {
  const { clientId, type, limit = 100, offset = 0 } = req.query;

  const where = { companyId: req.user.id };
  if (clientId) where.clientId = clientId;
  if (type) where.type = type;

  const messages = await Message.findAll({
    where,
    include: [
      { model: Client, as: 'client' },
      { model: MessageTemplate, as: 'template' }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: messages
  });
});

/**
 * Send SMS message
 * POST /api/messages/sms
 */
router.post('/sms', async (req, res) => {
  const { clientId, body, templateId } = req.body;

  const client = await Client.findOne({
    where: { id: clientId, companyId: req.user.id }
  });

  if (!client) {
    return res.status(404).json({
      success: false,
      error: 'Client not found'
    });
  }

  let messageBody = body;

  // Use template if provided
  if (templateId) {
    const template = await MessageTemplate.findByPk(templateId);
    if (template) {
      messageBody = template.body
        .replace(/\{\{customerName\}\}/g, client.name)
        .replace(/\{\{companyName\}\}/g, req.user.companyName || 'TradeFlow');
    }
  }

  // Send SMS
  const result = await smsService.sendSMS(client.phone, messageBody);

  // Save message to database
  const message = await Message.create({
    companyId: req.user.id,
    clientId: client.id,
    type: 'sms',
    direction: 'outbound',
    body: messageBody,
    status: result.success ? 'sent' : 'failed',
    sentAt: new Date(),
    externalId: result.messageId,
    templateId
  });

  res.status(201).json({
    success: true,
    data: message
  });
});

/**
 * Send email message
 * POST /api/messages/email
 */
router.post('/email', async (req, res) => {
  const { clientId, subject, body, templateId } = req.body;

  const client = await Client.findOne({
    where: { id: clientId, companyId: req.user.id }
  });

  if (!client) {
    return res.status(404).json({
      success: false,
      error: 'Client not found'
    });
  }

  if (!client.email) {
    return res.status(400).json({
      success: false,
      error: 'Client has no email address'
    });
  }

  let emailBody = body;
  let emailSubject = subject;

  // Use template if provided
  if (templateId) {
    const template = await MessageTemplate.findByPk(templateId);
    if (template) {
      emailSubject = template.subject || subject;
      emailBody = template.body
        .replace(/\{\{customerName\}\}/g, client.name)
        .replace(/\{\{companyName\}\}/g, req.user.companyName || 'TradeFlow');
    }
  }

  // Send email
  const result = await emailService.sendEmail(client.email, emailSubject, emailBody);

  // Save message to database
  const message = await Message.create({
    companyId: req.user.id,
    clientId: client.id,
    type: 'email',
    direction: 'outbound',
    subject: emailSubject,
    body: emailBody,
    status: result.success ? 'sent' : 'failed',
    sentAt: new Date(),
    externalId: result.messageId,
    templateId
  });

  res.status(201).json({
    success: true,
    data: message
  });
});

/**
 * Get message templates
 * GET /api/messages/templates
 */
router.get('/templates', async (req, res) => {
  const { type, category } = req.query;

  const where = {
    companyId: req.user.id,
    isActive: true
  };
  if (type) where.type = type;
  if (category) where.category = category;

  const templates = await MessageTemplate.findAll({
    where,
    order: [['createdAt', 'DESC']]
  });

  res.json({
    success: true,
    data: templates
  });
});

/**
 * Create message template
 * POST /api/messages/templates
 */
router.post('/templates', async (req, res) => {
  const templateData = { ...req.body, companyId: req.user.id };

  const template = await MessageTemplate.create(templateData);

  res.status(201).json({
    success: true,
    data: template
  });
});

/**
 * Update message template
 * PATCH /api/messages/templates/:id
 */
router.patch('/templates/:id', async (req, res) => {
  const template = await MessageTemplate.findOne({
    where: { id: req.params.id, companyId: req.user.id }
  });

  if (!template) {
    return res.status(404).json({
      success: false,
      error: 'Template not found'
    });
  }

  await template.update(req.body);

  res.json({
    success: true,
    data: template
  });
});

/**
 * Delete message template
 * DELETE /api/messages/templates/:id
 */
router.delete('/templates/:id', async (req, res) => {
  const deleted = await MessageTemplate.destroy({
    where: { id: req.params.id, companyId: req.user.id }
  });

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'Template not found'
    });
  }

  res.json({
    success: true,
    message: 'Template deleted'
  });
});

module.exports = router;
