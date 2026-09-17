import { Paynow } from 'paynow';
import { logger } from '../config/logger';

const INTEGRATION_ID = process.env.PAYNOW_INTEGRATION_ID || '';
const INTEGRATION_KEY = process.env.PAYNOW_INTEGRATION_KEY || '';

// Initialize Paynow
// We will set the return and result URLs dynamically per transaction
export const paynow = new Paynow(INTEGRATION_ID, INTEGRATION_KEY);

paynow.resultUrl = `${process.env.API_URL}/api/payments/paynow-webhook`;
paynow.returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/bookings/success`;

/**
 * Initiate an Express Checkout (Mobile Money) transaction.
 * Best for WhatsApp bot flows.
 */
export async function createExpressPayment(
  reference: string,
  amount: number,
  phone: string,
  email: string = 'customer@famba.co.zw'
) {
  try {
    const payment = paynow.createPayment(reference, email);
    payment.add('Famba Payment', amount);

    // Paynow prefers local format (077...) over international (26377...)
    let localPhone = phone;
    if (localPhone.startsWith('263')) {
      localPhone = '0' + localPhone.substring(3);
    }

    // method can be 'ecocash' or 'onemoney'
    const method = localPhone.startsWith('071') ? 'onemoney' : 'ecocash';

    logger.info(`[Paynow] Initiating express checkout to ${localPhone} for ${amount} via ${method}`);
    const response = await paynow.sendMobile(payment, localPhone, method);

    if (response.success) {
      return {
        success: true,
        pollUrl: response.pollUrl,
        instructions: response.instructions,
        status: response.status,
      };
    } else {
      logger.error('[Paynow] Express checkout failed:', response.error);
      return { success: false, error: response.error };
    }
  } catch (error: any) {
    logger.error('[Paynow] Exception in createExpressPayment:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Initiate a Web Redirect Checkout transaction.
 * Best for website bookings.
 */
export async function createWebPayment(
  reference: string,
  amount: number,
  email: string
) {
  try {
    const payment = paynow.createPayment(reference, email);
    payment.add('Famba Booking', amount);

    logger.info(`[Paynow] Initiating web checkout for ${reference} / ${amount}`);
    const response = await paynow.send(payment);

    if (response.success) {
      return {
        success: true,
        redirectUrl: response.redirectUrl,
        pollUrl: response.pollUrl,
      };
    } else {
      logger.error('[Paynow] Web checkout failed:', response.error);
      return { success: false, error: response.error };
    }
  } catch (error: any) {
    logger.error('[Paynow] Exception in createWebPayment:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Poll Paynow for transaction status
 */
export async function checkPaymentStatus(pollUrl: string) {
  try {
    const status = await paynow.pollTransaction(pollUrl);
    return status;
  } catch (error: any) {
    logger.error('[Paynow] Error polling status:', error);
    return null;
  }
}
