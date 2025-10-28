const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MessageTemplate = sequelize.define('MessageTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('sms', 'email'),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM(
      'appointment_confirmation',
      'appointment_reminder',
      'job_completion',
      'review_request',
      'payment_reminder',
      'thank_you',
      'follow_up',
      'custom'
    ),
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'For email templates'
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Supports variables: {{customerName}}, {{jobDate}}, {{jobType}}, etc.'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'System default template'
  }
}, {
  tableName: 'message_templates',
  timestamps: true,
  indexes: [
    { fields: ['companyId'] },
    { fields: ['type'] },
    { fields: ['category'] }
  ]
});

module.exports = MessageTemplate;
