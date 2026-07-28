/**
 * Famba — Email Service (Nodemailer)
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

// Email base template with Famba branding
function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Famba</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #FAFCFB; color: #0B192C; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; }
        .header { background: #008767; padding: 32px; text-align: center; }
        .logo { font-size: 32px; font-weight: 800; color: white; letter-spacing: -1px; }
        .logo span { color: #A7F3D0; }
        .content { padding: 40px 32px; }
        .cta-button { display: inline-block; background: #008767; color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; margin: 24px 0; }
        .footer { background: #F8FAFC; padding: 24px 32px; text-align: center; color: #64748B; font-size: 14px; border-top: 1px solid #E2E8F0; }
        .divider { border: none; border-top: 1px solid #E2E8F0; margin: 24px 0; }
        h1 { color: #0B192C; font-size: 24px; margin-bottom: 16px; font-weight: 700; }
        p { color: #475569; line-height: 1.6; margin-bottom: 12px; }
        .highlight { background: #E6F4F1; border-left: 4px solid #008767; padding: 16px; border-radius: 8px; margin: 16px 0; }
        .highlight p { color: #0B192C; margin: 4px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">famba<span>.</span></div>
          <p style="color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px; font-weight: 600;">Move More. Live Better.</p>
        </div>
        <div class="content">${content}</div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Famba Technologies Ltd (KUNAKA TECH). All rights reserved.</p>
          <p style="margin-top: 8px;"><a href="${process.env.APP_URL}" style="color: #008767;">Visit Famba</a> · <a href="${process.env.APP_URL}/privacy" style="color: #008767;">Privacy Policy</a></p>
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
      <h1>Welcome to Famba, ${firstName}! 🎉</h1>
      <p>You're almost there! Please verify your email address to unlock all Famba services.</p>
      <div style="text-align: center;">
        <a href="${verifyUrl}" class="cta-button">Verify Email Address</a>
      </div>
      <p style="font-size: 14px; color: #64748B;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    `);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Famba <noreply@famba.co.zw>',
      to: email,
      subject: 'Verify your Famba email address',
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
      <p>Hi ${firstName}, we received a request to reset your Famba password.</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="cta-button">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #64748B;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Famba <noreply@famba.co.zw>',
      to: email,
      subject: 'Reset your Famba password',
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
        <p><strong style="color: #0B192C;">Vehicle/Service:</strong> ${booking.listing?.title || 'N/A'}</p>
        <p><strong style="color: #0B192C;">Start Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>
        <p><strong style="color: #0B192C;">End Date:</strong> ${new Date(booking.endDate).toLocaleDateString()}</p>
        <p><strong style="color: #0B192C;">Duration:</strong> ${booking.durationDays} day(s)</p>
        <p><strong style="color: #0B192C;">Total Amount:</strong> $${booking.totalAmount?.toLocaleString()}</p>
        <p><strong style="color: #0B192C;">Booking Ref:</strong> ${booking.id}</p>
      </div>
      <p>Track your booking status in your <a href="${process.env.APP_URL}/dashboard/bookings" style="color: #008767;">Famba Dashboard</a>.</p>
      <p style="font-size: 14px; color: #64748B;">If you have any questions, contact the provider via WhatsApp or the platform chat.</p>
    `);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Famba <noreply@famba.co.zw>',
      to: email,
      subject: '🚗 Your Famba booking is confirmed!',
      html,
    });
  },
};
