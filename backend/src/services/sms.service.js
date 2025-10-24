/**
 * SMS Service - Twilio Integration
 * Mock implementation - replace with real Twilio when API keys are available
 */

require('dotenv').config();

class SMSService {
  constructor() {
    this.isConfigured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);

    if (this.isConfigured) {
      // Uncomment when ready to connect Twilio
      // const twilio = require('twilio');
      // this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      console.log('✓ Twilio SMS configured');
    } else {
      console.log('⚠ Twilio not configured - using mock SMS service');
    }
  }

  /**
   * Send SMS message
   * @param {string} to - Phone number
   * @param {string} message - Message body
   * @returns {Promise<object>} Result with messageId and status
   */
  async sendSMS(to, message) {
    if (this.isConfigured) {
      try {
        // Uncomment when ready:
        // const result = await this.client.messages.create({
        //   body: message,
        //   from: process.env.TWILIO_PHONE_NUMBER,
        //   to: to
        // });
        // return {
        //   success: true,
        //   messageId: result.sid,
        //   status: result.status
        // };
      } catch (error) {
        console.error('Twilio SMS error:', error);
        throw error;
      }
    }

    // Mock implementation
    console.log(`[MOCK SMS] To: ${to}`);
    console.log(`[MOCK SMS] Message: ${message}`);

    return {
      success: true,
      messageId: `mock_sms_${Date.now()}`,
      status: 'sent',
      mock: true
    };
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(phone, customerName, jobDate, jobTime, serviceType) {
    const message = `Hi ${customerName}! This is a reminder about your ${serviceType} appointment scheduled for ${jobDate} at ${jobTime}. We'll see you then!`;
    return this.sendSMS(phone, message);
  }

  /**
   * Send job completion notification
   */
  async sendJobCompletionNotification(phone, customerName, jobType) {
    const message = `Hi ${customerName}! Your ${jobType} service has been completed. Thank you for choosing us!`;
    return this.sendSMS(phone, message);
  }

  /**
   * Send review request
   */
  async sendReviewRequest(phone, customerName, reviewLink) {
    const message = `Hi ${customerName}! We hope you're happy with our service. Would you mind leaving us a quick review? ${reviewLink}`;
    return this.sendSMS(phone, message);
  }

  /**
   * Send payment reminder
   */
  async sendPaymentReminder(phone, customerName, amount, paymentLink) {
    const message = `Hi ${customerName}! Friendly reminder: your invoice of $${amount} is ready. Pay securely here: ${paymentLink}`;
    return this.sendSMS(phone, message);
  }

  /**
   * Send team assignment notification
   */
  async sendTeamAssignment(phone, technicianName, jobDetails) {
    const message = `Hi ${technicianName}! You've been assigned to: ${jobDetails.serviceType} at ${jobDetails.address} on ${jobDetails.date} at ${jobDetails.time}`;
    return this.sendSMS(phone, message);
  }
}

module.exports = new SMSService();
