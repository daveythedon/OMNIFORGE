const { sequelize } = require('../config/database');
const User = require('./User');
const Team = require('./Team');
const Job = require('./Job');
const Client = require('./Client');
const Notification = require('./Notification');
const Invoice = require('./Invoice');
const AutomationLog = require('./AutomationLog');
const Message = require('./Message');
const MessageTemplate = require('./MessageTemplate');

// Define relationships

// User -> Team Members
User.hasMany(Team, { foreignKey: 'companyId', as: 'teamMembers' });
Team.belongsTo(User, { foreignKey: 'companyId', as: 'company' });
Team.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User -> Jobs
User.hasMany(Job, { foreignKey: 'companyId', as: 'jobs' });
Job.belongsTo(User, { foreignKey: 'companyId', as: 'company' });

// User -> Clients
User.hasMany(Client, { foreignKey: 'companyId', as: 'clients' });
Client.belongsTo(User, { foreignKey: 'companyId', as: 'company' });

// Client -> Jobs
Client.hasMany(Job, { foreignKey: 'clientId', as: 'jobs' });
Job.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Team -> Jobs (assignment)
Team.hasMany(Job, { foreignKey: 'assignedTo', as: 'assignedJobs' });
Job.belongsTo(Team, { foreignKey: 'assignedTo', as: 'assignedTeamMember' });

// Job -> Invoice
Job.hasOne(Invoice, { foreignKey: 'jobId', as: 'invoice' });
Invoice.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// User -> Invoices
User.hasMany(Invoice, { foreignKey: 'companyId', as: 'invoices' });
Invoice.belongsTo(User, { foreignKey: 'companyId', as: 'company' });

// Client -> Invoices
Client.hasMany(Invoice, { foreignKey: 'clientId', as: 'invoices' });
Invoice.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// User -> Notifications
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User -> Automation Logs
User.hasMany(AutomationLog, { foreignKey: 'companyId', as: 'automationLogs' });
AutomationLog.belongsTo(User, { foreignKey: 'companyId', as: 'company' });

// Job -> Automation Logs
Job.hasMany(AutomationLog, { foreignKey: 'relatedJobId', as: 'automationLogs' });
AutomationLog.belongsTo(Job, { foreignKey: 'relatedJobId', as: 'relatedJob' });

// Client -> Automation Logs
Client.hasMany(AutomationLog, { foreignKey: 'relatedClientId', as: 'automationLogs' });
AutomationLog.belongsTo(Client, { foreignKey: 'relatedClientId', as: 'relatedClient' });

// User -> Messages
User.hasMany(Message, { foreignKey: 'companyId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'companyId', as: 'company' });

// Client -> Messages
Client.hasMany(Message, { foreignKey: 'clientId', as: 'messages' });
Message.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Job -> Messages
Job.hasMany(Message, { foreignKey: 'jobId', as: 'messages' });
Message.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// MessageTemplate -> Messages
MessageTemplate.hasMany(Message, { foreignKey: 'templateId', as: 'messages' });
Message.belongsTo(MessageTemplate, { foreignKey: 'templateId', as: 'template' });

// User -> Message Templates
User.hasMany(MessageTemplate, { foreignKey: 'companyId', as: 'messageTemplates' });
MessageTemplate.belongsTo(User, { foreignKey: 'companyId', as: 'company' });

// Sync function for database initialization
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log('✓ Database synchronized successfully');
  } catch (error) {
    console.error('✗ Database sync failed:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Team,
  Job,
  Client,
  Notification,
  Invoice,
  AutomationLog,
  Message,
  MessageTemplate,
  syncDatabase
};
