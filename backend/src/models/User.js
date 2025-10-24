const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  clerkId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    comment: 'Clerk user ID for authentication'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('owner', 'admin', 'tradesman', 'customer'),
    defaultValue: 'tradesman',
    allowNull: false
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  companyLogo: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL to uploaded logo'
  },
  brandingColors: {
    type: DataTypes.JSONB,
    defaultValue: {
      primary: '#3B82F6',
      secondary: '#10B981'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      notifications: {
        email: true,
        sms: true,
        push: true
      },
      automations: {
        reviewRequests: true,
        invoiceReminders: true,
        dailyReports: true
      }
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    { fields: ['clerkId'] },
    { fields: ['email'] },
    { fields: ['role'] }
  ]
});

module.exports = User;
