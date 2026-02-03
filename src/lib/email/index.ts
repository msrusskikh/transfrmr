import nodemailer from 'nodemailer'
import {
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
} from './templates'

// Check if SMTP is configured
const isSMTPConfigured = () => {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD
  )
}

// Create transporter (only if SMTP is configured)
let transporter: nodemailer.Transporter | null = null

if (isSMTPConfigured()) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
} else {
  console.warn(
    '[Email] SMTP not configured. Email sending will be disabled. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD to enable.'
  )
}

/**
 * Send an email
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<void> {
  if (!transporter) {
    console.warn(
      `[Email] SMTP not configured. Would send email to ${to} with subject: ${subject}`
    )
    // In development, you might want to log the email content
    if (process.env.NODE_ENV === 'development') {
      console.log('[Email] Email content:', { to, subject, html })
    }
    return
  }

  try {
    await transporter.sendMail({
      from: `"Трансформер" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })
    console.log(`[Email] Sent email to ${to}`)
  } catch (error) {
    console.error('[Email] Failed to send email:', error)
    throw error
  }
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  email: string,
  verificationToken: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const verificationUrl = `${appUrl}/api/auth/verify-email?token=${verificationToken}`

  const { subject, html } = getVerificationEmailTemplate(verificationUrl)

  await sendEmail({
    to: email,
    subject,
    html,
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`

  const { subject, html } = getPasswordResetEmailTemplate(resetUrl)

  await sendEmail({
    to: email,
    subject,
    html,
  })
}
