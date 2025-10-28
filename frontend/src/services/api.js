/**
 * API Client for TradeFlow Backend
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Get Clerk session token
    const token = await window.Clerk?.session?.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// API Methods
export const authAPI = {
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data)
};

export const jobsAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.patch(`/jobs/${id}`, data),
  updateStatus: (id, status) => api.patch(`/jobs/${id}/status`, { status }),
  delete: (id) => api.delete(`/jobs/${id}`)
};

export const teamAPI = {
  getAll: () => api.get('/team'),
  getById: (id) => api.get(`/team/${id}`),
  create: (data) => api.post('/team', data),
  update: (id, data) => api.patch(`/team/${id}`, data),
  delete: (id) => api.delete(`/team/${id}`),
  assignJob: (id, jobId) => api.post(`/team/${id}/assign-job`, { jobId }),
  getStats: (id) => api.get(`/team/${id}/stats`)
};

export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`)
};

export const clientsAPI = {
  getAll: (params) => api.get('/clients', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.patch(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`)
};

export const invoicesAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  send: (id) => api.post(`/invoices/${id}/send`),
  markPaid: (id, paymentMethod) => api.post(`/invoices/${id}/mark-paid`, { paymentMethod }),
  sendReminder: (id) => api.post(`/invoices/${id}/remind`)
};

export const messagesAPI = {
  getAll: (params) => api.get('/messages', { params }),
  sendSMS: (data) => api.post('/messages/sms', data),
  sendEmail: (data) => api.post('/messages/email', data),
  getTemplates: (params) => api.get('/messages/templates', { params }),
  createTemplate: (data) => api.post('/messages/templates', data),
  updateTemplate: (id, data) => api.patch(`/messages/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/messages/templates/${id}`)
};

export const automationsAPI = {
  getLogs: (params) => api.get('/automations/logs', { params }),
  triggerReviewRequest: (jobId) => api.post('/automations/review-request', { jobId }),
  triggerAutoInvoice: (jobId) => api.post('/automations/auto-invoice', { jobId }),
  getStats: () => api.get('/automations/stats')
};

export const analyticsAPI = {
  getDashboard: (params) => api.get('/analytics/dashboard', { params }),
  getRevenueTrends: (params) => api.get('/analytics/revenue-trends', { params }),
  getServiceBreakdown: () => api.get('/analytics/service-breakdown'),
  getInsights: () => api.get('/analytics/insights'),
  getMomentumScore: () => api.get('/analytics/momentum-score'),
  getPipelineConversion: () => api.get('/analytics/pipeline-conversion')
};

export default api;
