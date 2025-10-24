/**
 * Payment Service - Stripe Integration
 * Mock implementation - replace with real Stripe when API keys are available
 */

require('dotenv').config();

class PaymentService {
  constructor() {
    this.isConfigured = !!process.env.STRIPE_SECRET_KEY;

    if (this.isConfigured) {
      // Uncomment when ready to connect Stripe
      // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      // this.client = stripe;
      console.log('✓ Stripe payment configured');
    } else {
      console.log('⚠ Stripe not configured - using mock payment service');
    }
  }

  /**
   * Create payment link
   * @param {object} invoiceData - Invoice details
   * @returns {Promise<string>} Payment link URL
   */
  async createPaymentLink(invoiceData) {
    if (this.isConfigured) {
      try {
        // Uncomment when ready:
        // const paymentLink = await this.client.paymentLinks.create({
        //   line_items: [{
        //     price_data: {
        //       currency: 'usd',
        //       product_data: {
        //         name: `Invoice #${invoiceData.invoiceNumber}`,
        //         description: invoiceData.description
        //       },
        //       unit_amount: Math.round(invoiceData.amount * 100)
        //     },
        //     quantity: 1
        //   }],
        //   metadata: {
        //     invoiceId: invoiceData.id,
        //     customerId: invoiceData.clientId
        //   }
        // });
        // return paymentLink.url;
      } catch (error) {
        console.error('Stripe payment link error:', error);
        throw error;
      }
    }

    // Mock implementation
    return `https://mock-stripe-checkout.com/invoice/${invoiceData.invoiceNumber}`;
  }

  /**
   * Create payment intent for custom checkout
   */
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    if (this.isConfigured) {
      // Uncomment when ready:
      // const paymentIntent = await this.client.paymentIntents.create({
      //   amount: Math.round(amount * 100),
      //   currency,
      //   metadata
      // });
      // return paymentIntent;
    }

    // Mock implementation
    return {
      id: `pi_mock_${Date.now()}`,
      client_secret: `mock_secret_${Date.now()}`,
      amount: amount * 100,
      currency,
      status: 'requires_payment_method',
      mock: true
    };
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhook(payload, signature) {
    if (this.isConfigured && process.env.STRIPE_WEBHOOK_SECRET) {
      // Uncomment when ready:
      // const event = this.client.webhooks.constructEvent(
      //   payload,
      //   signature,
      //   process.env.STRIPE_WEBHOOK_SECRET
      // );
      // return event;
    }

    // Mock - just parse the payload
    return JSON.parse(payload);
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentIntentId) {
    if (this.isConfigured) {
      // const paymentIntent = await this.client.paymentIntents.retrieve(paymentIntentId);
      // return paymentIntent.status;
    }

    // Mock
    return 'succeeded';
  }

  /**
   * Process refund
   */
  async createRefund(paymentIntentId, amount = null) {
    if (this.isConfigured) {
      // const refund = await this.client.refunds.create({
      //   payment_intent: paymentIntentId,
      //   amount: amount ? Math.round(amount * 100) : undefined
      // });
      // return refund;
    }

    // Mock
    return {
      id: `re_mock_${Date.now()}`,
      amount: amount * 100,
      status: 'succeeded',
      mock: true
    };
  }
}

module.exports = new PaymentService();
