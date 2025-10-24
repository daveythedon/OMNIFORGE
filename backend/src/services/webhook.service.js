/**
 * Webhook Service - n8n Integration
 * Triggers automation workflows in n8n
 */

require('dotenv').config();
const axios = require('axios').default || require('axios');

class WebhookService {
  constructor() {
    this.baseUrl = process.env.N8N_WEBHOOK_BASE_URL || 'https://n8n.yourdomain.com/webhook';
    this.isConfigured = !!process.env.N8N_WEBHOOK_BASE_URL;

    if (!this.isConfigured) {
      console.log('⚠ n8n webhook URL not configured - using mock webhooks');
    }
  }

  /**
   * Trigger webhook
   * @param {string} event - Event name (e.g., 'new-lead', 'job-completed')
   * @param {object} data - Event payload
   */
  async trigger(event, data) {
    const webhookUrl = `${this.baseUrl}/${event}`;

    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data
    };

    try {
      if (this.isConfigured) {
        // Uncomment when n8n is configured:
        // const response = await axios.post(webhookUrl, payload, {
        //   headers: { 'Content-Type': 'application/json' },
        //   timeout: 5000
        // });
        //
        // return {
        //   success: true,
        //   status: response.status,
        //   webhookUrl
        // };
      }

      // Mock implementation
      console.log(`[MOCK WEBHOOK] Event: ${event}`);
      console.log(`[MOCK WEBHOOK] URL: ${webhookUrl}`);
      console.log(`[MOCK WEBHOOK] Payload:`, JSON.stringify(payload, null, 2));

      return {
        success: true,
        status: 200,
        webhookUrl,
        mock: true
      };
    } catch (error) {
      console.error(`Webhook trigger failed for ${event}:`, error.message);
      return {
        success: false,
        error: error.message,
        webhookUrl
      };
    }
  }

  /**
   * Trigger new lead webhook
   */
  async triggerNewLead(jobData) {
    return this.trigger('new-lead', {
      jobId: jobData.id,
      customer: jobData.customerName,
      phone: jobData.customerPhone,
      service: jobData.serviceType,
      value: jobData.value
    });
  }

  /**
   * Trigger job scheduled webhook
   */
  async triggerJobScheduled(jobData) {
    return this.trigger('job-scheduled', {
      jobId: jobData.id,
      customer: jobData.customerName,
      date: jobData.scheduledDate,
      time: jobData.scheduledTime,
      assignedTo: jobData.assignedTo
    });
  }

  /**
   * Trigger job started webhook
   */
  async triggerJobStarted(jobData) {
    return this.trigger('job-started', {
      jobId: jobData.id,
      customer: jobData.customerName,
      startedAt: jobData.startedAt,
      assignedTo: jobData.assignedTo
    });
  }

  /**
   * Trigger job completed webhook
   */
  async triggerJobCompleted(jobData) {
    return this.trigger('job-completed', {
      jobId: jobData.id,
      customer: jobData.customerName,
      completedAt: jobData.completedAt,
      value: jobData.value,
      rating: jobData.rating
    });
  }

  /**
   * Trigger payment received webhook
   */
  async triggerPaymentReceived(paymentData) {
    return this.trigger('payment-received', {
      invoiceId: paymentData.invoiceId,
      jobId: paymentData.jobId,
      amount: paymentData.amount,
      method: paymentData.method
    });
  }

  /**
   * Trigger review request webhook
   */
  async triggerReviewRequest(jobData) {
    return this.trigger('review-request', {
      jobId: jobData.id,
      customer: jobData.customerName,
      phone: jobData.customerPhone,
      email: jobData.customerEmail
    });
  }
}

module.exports = new WebhookService();
