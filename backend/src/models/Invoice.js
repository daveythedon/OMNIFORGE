const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'),
    defaultValue: 'draft'
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true
  },
  stripePaymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  remindersSent: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastReminderSentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lineItems: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of {description, quantity, rate, amount}'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'invoices',
  timestamps: true,
  indexes: [
    { fields: ['invoiceNumber'] },
    { fields: ['companyId'] },
    { fields: ['jobId'] },
    { fields: ['status'] },
    { fields: ['dueDate'] }
  ]
});

module.exports = Invoice;
