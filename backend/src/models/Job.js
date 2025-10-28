const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Job = sequelize.define('Job', {
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
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id'
    }
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'team_members',
      key: 'id'
    },
    comment: 'Assigned team member ID'
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  serviceType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'HVAC Repair, Plumbing, Electrical, etc.'
  },
  serviceAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  addressCoordinates: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Lat/lng for route optimization'
  },
  status: {
    type: DataTypes.ENUM('new', 'scheduled', 'in-progress', 'completed', 'cancelled'),
    defaultValue: 'new',
    allowNull: false
  },
  scheduledDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  scheduledTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  internalNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Private notes not visible to customer'
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true
  },
  invoiceId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'invoices',
      key: 'id'
    }
  },
  reviewRequested: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reviewRequestedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'jobs',
  timestamps: true,
  indexes: [
    { fields: ['companyId'] },
    { fields: ['clientId'] },
    { fields: ['assignedTo'] },
    { fields: ['status'] },
    { fields: ['scheduledDate'] },
    { fields: ['isPaid'] }
  ]
});

module.exports = Job;
