/**
 * FleetNest — Email Service (Nodemailer)
 * Handles all transactional emails with beautiful HTML templates
 */

import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email base template with FleetNest branding
function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FleetNest</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0F1629; color: #E2E8F0; }
        .container { max-width: 600px; margin: 0 auto; background: #1a2744; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #1D4ED8, #7C3AED); padding: 32px; text-align: center; }
        .logo { font-size: 28px; font-weight: 800; color: white; letter-spacing: -1px; }
        .logo span { color: #FCD34D; }
        .content { padding: 40px 32px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #2563EB, #7C3AED); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; margin: 24px 0; }
        .footer { background: #0F1629; padding: 24px 32px; text-align: center; color: #64748B; font-size: 14px; }
        .divider { border: none; border-top: 1px solid #2D3748; margin: 24px 0; }
        h1 { color: white; font-size: 24px; margin-bottom: 16px; }
        p { color: #94A3B8; line-height: 1.6; margin-bottom: 12px; }
        .highlight { background: #1e3a5f; border-left: 4px solid #2563EB; padding: 16px; border-radius: 8px; margin: 16px 0; }
        .highlight p { color: #93C5FD; margin: 4px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Fleet<span>Nest</span></div>
          <p style="color: rgba(255,255,255,0.8); margin-top: 8px; font-size: 14px;">Every journey starts here.</p>
        </div>
        <div class="content">${content}</div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} FleetNest Technologies Ltd. All rights reserved.</p>
          <p style="margin-top: 8px;"><a href="${process.env.APP_URL}" style="color: #2563EB;">Visit FleetNest</a> · <a href="${process.env.APP_URL}/privacy" style="color: #2563EB;">Privacy Policy</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export const emailService = {
  /**
   * Send email verification link
   */
  async sendVerificationEmail(email: string, firstName: string, token: string): Promise<void> {
    const verifyUrl = `${process.env.APP_URL}/auth/verify-email?token=${token}`;
    const html = baseTemplate(`
      <h1>Welcome to FleetNest, ${firstName}! 🎉</h1>
      <p>You're almost there! Please verify your email address to unlock all FleetNest features.</p>
      <div style="text-align: center;">
        <a href="${verifyUrl}" class="cta-button">Verify Email Address</a>
      </div>
      <p style="font-size: 14px; color: #64748B;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    `);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'FleetNest <noreply@fleetnest.com>',
      to: email,
      subject: 'Verify your FleetNest email address',
      html,
    });
    logger.info(`Verification email sent to ${email}`);
  },

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, firstName: string, token: string): Promise<void> {
    const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${token}`;
    const html = baseTemplate(`
      <h1>Reset your password</h1>
      <p>Hi ${firstName}, we received a request to reset your FleetNest password.</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="cta-button">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #64748B;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'FleetNest <noreply@fleetnest.com>',
      to: email,
      subject: 'Reset your FleetNest password',
      html,
    });
  },

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(email: string, booking: any): Promise<void> {
    const html = baseTemplate(`
      <h1>Booking Confirmed! ✅</h1>
      <p>Your booking has been successfully placed. Here are the details:</p>
      <div class="highlight">
        <p><strong style="color: white;">Vehicle:</strong> ${booking.listing?.title || 'N/A'}</p>
        <p><strong style="color: white;">Start Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>
        <p><strong style="color: white;">End Date:</strong> ${new Date(booking.endDate).toLocaleDateString()}</p>
        <p><strong style="color: white;">Duration:</strong> ${booking.durationDays} day(s)</p>
        <p><strong style="color: white;">Total Amount:</strong> ₦${booking.totalAmount?.toLocaleString()}</p>
        <p><strong style="color: white;">Booking Ref:</strong> ${booking.id}</p>
      </div>
      <p>Track your booking status in your <a href="${process.env.APP_URL}/dashboard/bookings" style="color: #2563EB;">FleetNest Dashboard</a>.</p>
      <p style="font-size: 14px; color: #64748B;">If you have any questions, contact the company via WhatsApp or the platform chat.</p>
    `);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'FleetNest <noreply@fleetnest.com>',
      to: email,
      subject: '🚗 Your FleetNest booking is confirmed!',
      html,
    });
  },
};
