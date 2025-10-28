const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AutomationLog = sequelize.define('AutomationLog', {
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
  automationType: {
    type: DataTypes.ENUM(
      'review_request',
      'invoice_sent',
      'payment_reminder',
      'sms_notification',
      'email_notification',
      'webhook_trigger',
      'daily_report',
      'referral_offer',
      'job_assignment',
      'calendar_sync'
    ),
    allowNull: false
  },
  event: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed', 'skipped'),
    defaultValue: 'pending'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  relatedJobId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  relatedClientId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'clients',
      key: 'id'
    }
  },
  payload: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  responseData: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'automation_logs',
  timestamps: true,
  indexes: [
    { fields: ['companyId'] },
    { fields: ['automationType'] },
    { fields: ['status'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = AutomationLog;
