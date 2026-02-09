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
    // Timeout settings to prevent hanging connections
    connectionTimeout: 10000, // 10 seconds to establish connection
    greetingTimeout: 10000,   // 10 seconds to receive greeting
    socketTimeout: 10000,     // 10 seconds for socket operations
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
    if (error instanceof Error) {
      console.error('[Email] Error details:', {
        message: error.message,
        code: (error as any).code,
        command: (error as any).command,
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
      })
    }
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
  // #region agent log
  console.log('[DEBUG] sendVerificationEmail entry:', { email, hasToken: !!verificationToken, NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL, NODE_ENV: process.env.NODE_ENV })
  fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/lib/email/index.ts:89',message:'sendVerificationEmail entry',data:{email,hasToken:!!verificationToken,tokenLength:verificationToken?.length,NEXT_PUBLIC_APP_URL:process.env.NEXT_PUBLIC_APP_URL,NODE_ENV:process.env.NODE_ENV},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  // #region agent log
  console.log('[DEBUG] appUrl determined:', { appUrl, fallbackUsed: !process.env.NEXT_PUBLIC_APP_URL, envValue: process.env.NEXT_PUBLIC_APP_URL })
  fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/lib/email/index.ts:93',message:'appUrl determined',data:{appUrl,fallbackUsed:!process.env.NEXT_PUBLIC_APP_URL},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const verificationUrl = `${appUrl}/api/auth/verify-email?token=${verificationToken}`
  // #region agent log
  console.log('[DEBUG] verificationUrl generated:', { verificationUrl, urlStartsWithLocalhost: verificationUrl.startsWith('http://localhost') || verificationUrl.startsWith('https://localhost') })
  fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/lib/email/index.ts:95',message:'verificationUrl generated',data:{verificationUrl,urlStartsWithLocalhost:verificationUrl.startsWith('http://localhost')||verificationUrl.startsWith('https://localhost')},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  const { subject, html } = getVerificationEmailTemplate(verificationUrl)

  await sendEmail({
    to: email,
    subject,
    html,
  })
  // #region agent log
  console.log('[DEBUG] sendVerificationEmail exit:', { email, verificationUrl })
  fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/lib/email/index.ts:102',message:'sendVerificationEmail exit',data:{email,verificationUrl},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
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
