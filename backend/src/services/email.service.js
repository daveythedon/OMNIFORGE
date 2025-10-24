/**
 * Email Service - SendGrid Integration
 * Mock implementation - replace with real SendGrid when API key is available
 */

require('dotenv').config();

class EmailService {
  constructor() {
    this.isConfigured = !!process.env.SENDGRID_API_KEY;

    if (this.isConfigured) {
      // Uncomment when ready to connect SendGrid
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      // this.client = sgMail;
      console.log('✓ SendGrid email configured');
    } else {
      console.log('⚠ SendGrid not configured - using mock email service');
    }

    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@tradeflow.com';
  }

  /**
   * Send email
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} text - Plain text content
   * @param {string} html - HTML content (optional)
   */
  async sendEmail(to, subject, text, html = null) {
    if (this.isConfigured) {
      try {
        // Uncomment when ready:
        // const msg = {
        //   to,
        //   from: this.fromEmail,
        //   subject,
        //   text,
        //   html: html || text
        // };
        // const result = await this.client.send(msg);
        // return {
        //   success: true,
        //   messageId: result[0].headers['x-message-id'],
        //   status: 'sent'
        // };
      } catch (error) {
        console.error('SendGrid email error:', error);
        throw error;
      }
    }

    // Mock implementation
    console.log(`[MOCK EMAIL] To: ${to}`);
    console.log(`[MOCK EMAIL] Subject: ${subject}`);
    console.log(`[MOCK EMAIL] Body: ${text.substring(0, 100)}...`);

    return {
      success: true,
      messageId: `mock_email_${Date.now()}`,
      status: 'sent',
      mock: true
    };
  }

  /**
   * Send invoice email
   */
  async sendInvoice(to, customerName, invoiceNumber, amount, paymentLink) {
    const subject = `Invoice #${invoiceNumber} from TradeFlow`;
    const text = `Hi ${customerName},\n\nYour invoice #${invoiceNumber} for $${amount} is ready.\n\nPay securely: ${paymentLink}\n\nThank you for your business!`;

    const html = `
      <h2>Invoice #${invoiceNumber}</h2>
      <p>Hi ${customerName},</p>
      <p>Your invoice for <strong>$${amount}</strong> is ready.</p>
      <p><a href="${paymentLink}" style="background:#3B82F6;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Pay Now</a></p>
      <p>Thank you for your business!</p>
    `;

    return this.sendEmail(to, subject, text, html);
  }

  /**
   * Send daily report to owner
   */
  async sendDailyReport(to, companyName, reportData) {
    const subject = `Daily Business Report - ${new Date().toLocaleDateString()}`;

    const text = `
      ${companyName} - Daily Summary

      Jobs Today: ${reportData.jobsToday}
      Revenue Today: $${reportData.revenueToday}
      Completed Jobs: ${reportData.completedJobs}
      Pending Payments: $${reportData.pendingPayments}

      New Leads: ${reportData.newLeads}
      Active Team Members: ${reportData.activeTeam}

      Automations Triggered: ${reportData.automationsTriggered}
    `;

    const html = `
      <h2>${companyName} - Daily Summary</h2>
      <table style="border-collapse:collapse;width:100%;">
        <tr style="background:#f3f4f6;">
          <td style="padding:10px;border:1px solid #ddd;">Jobs Today</td>
          <td style="padding:10px;border:1px solid #ddd;"><strong>${reportData.jobsToday}</strong></td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #ddd;">Revenue Today</td>
          <td style="padding:10px;border:1px solid #ddd;"><strong>$${reportData.revenueToday}</strong></td>
        </tr>
        <tr style="background:#f3f4f6;">
          <td style="padding:10px;border:1px solid #ddd;">Completed Jobs</td>
          <td style="padding:10px;border:1px solid #ddd;">${reportData.completedJobs}</td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #ddd;">Pending Payments</td>
          <td style="padding:10px;border:1px solid #ddd;">$${reportData.pendingPayments}</td>
        </tr>
      </table>
      <p style="margin-top:20px;">New Leads: ${reportData.newLeads} | Active Team: ${reportData.activeTeam}</p>
    `;

    return this.sendEmail(to, subject, text, html);
  }

  /**
   * Send review request email
   */
  async sendReviewRequest(to, customerName, reviewLink) {
    const subject = 'How was our service?';
    const text = `Hi ${customerName},\n\nWe hope you're satisfied with our service! We'd love to hear your feedback.\n\nLeave a review: ${reviewLink}\n\nThank you!`;

    const html = `
      <h2>How was our service?</h2>
      <p>Hi ${customerName},</p>
      <p>We hope you're satisfied with our service! We'd love to hear your feedback.</p>
      <p><a href="${reviewLink}" style="background:#10B981;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Leave a Review</a></p>
      <p>Thank you!</p>
    `;

    return this.sendEmail(to, subject, text, html);
  }

  /**
   * Send appointment confirmation
   */
  async sendAppointmentConfirmation(to, customerName, jobDetails) {
    const subject = 'Appointment Confirmed';
    const text = `Hi ${customerName},\n\nYour appointment is confirmed!\n\nService: ${jobDetails.serviceType}\nDate: ${jobDetails.date}\nTime: ${jobDetails.time}\nAddress: ${jobDetails.address}\n\nWe look forward to serving you!`;

    return this.sendEmail(to, subject, text);
  }
}

module.exports = new EmailService();
