const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Client = sequelize.define('Client', {
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
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  addressCoordinates: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  totalSpent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  totalJobs: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastContactDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'VIP, referral, repeat, etc.'
  },
  source: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'How they found you: referral, google, facebook, etc.'
  },
  preferredContactMethod: {
    type: DataTypes.ENUM('email', 'phone', 'sms'),
    defaultValue: 'phone'
  },
  communicationPreferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      marketing: true,
      reminders: true,
      reviews: true
    }
  }
}, {
  tableName: 'clients',
  timestamps: true,
  indexes: [
    { fields: ['companyId'] },
    { fields: ['phone'] },
    { fields: ['email'] }
  ]
});

module.exports = Client;
