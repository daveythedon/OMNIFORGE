const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Team member user ID'
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Company owner user ID'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'technician',
    comment: 'Job role: technician, installer, supervisor, etc.'
  },
  specialties: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Service types this team member specializes in'
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  currentLocation: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'GPS coordinates for route optimization'
  },
  status: {
    type: DataTypes.ENUM('active', 'on-job', 'off-duty', 'inactive'),
    defaultValue: 'active'
  },
  stats: {
    type: DataTypes.JSONB,
    defaultValue: {
      totalJobs: 0,
      completedJobs: 0,
      avgRating: 0,
      totalRevenue: 0
    }
  }
}, {
  tableName: 'team_members',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['companyId'] },
    { fields: ['status'] }
  ]
});

module.exports = Team;
