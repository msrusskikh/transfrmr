import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/payment/signature'
import { query } from '@/lib/db'

// Allowed IP addresses from payment service
const ALLOWED_IPS = ['178.205.169.35', '81.23.144.157']

interface PaymentCallbackData {
  order_id: string
  status: string
  amount: string
  currency: string
  created_at: string
  finish_at: string
  info: Array<{
    name: string
    quantity: string
    amount: string
  }>
  payment_method: {
    type: string
    pan: string
  }
  signature: string
}

// Get client IP address from request
function getClientIP(request: NextRequest): string | null {
  // Check x-forwarded-for header (most common in proxied environments)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, the first one is the original client
    return forwardedFor.split(',')[0].trim()
  }
  
  // Check x-real-ip header (alternative)
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP.trim()
  }
  
  // No IP found in headers
  return null
}

// Verify IP address is from allowed list
function verifyIP(ip: string | null): boolean {
  if (!ip) {
    return false
  }
  return ALLOWED_IPS.includes(ip)
}

export async function POST(request: NextRequest) {
  try {
    // Verify IP address
    const clientIP = getClientIP(request)
    if (!verifyIP(clientIP)) {
      console.error('Payment callback: Unauthorized IP address:', clientIP)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Parse JSON body
    const body: PaymentCallbackData = await request.json()

    // Validate required fields
    if (!body.order_id || !body.status || !body.signature || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify signature
    const apiKey = process.env.PAYMENT_API_KEY
    if (!apiKey) {
      console.error('PAYMENT_API_KEY not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const isValidSignature = verifyWebhookSignature({
      orderId: body.order_id,
      amount: String(body.amount),
      apiKey,
      receivedSignature: body.signature,
    })

    if (!isValidSignature) {
      console.error('Invalid webhook signature for order:', body.order_id)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Determine payment status
    // The documentation mentions "payment.succeeded" event, but the JSON structure shows "status" field
    // We'll check for both possibilities
    const isSuccess = body.status === 'payment.succeeded' || 
                      body.status === 'succeeded' ||
                      body.status.toLowerCase().includes('success')

    const paymentStatus = isSuccess ? 'succeeded' : body.status

    // Store payment record in database
    try {
      await query(
        `INSERT INTO payments (order_id, status, amount, verified_at, created_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (order_id) 
         DO UPDATE SET status = $2, verified_at = NOW()`,
        [body.order_id, paymentStatus, parseInt(body.amount)]
      )
      console.log('Payment stored in database:', body.order_id, 'Status:', paymentStatus)
    } catch (dbError) {
      console.error('Error storing payment in database:', dbError)
      // Continue even if database storage fails - webhook should still return success
    }

    if (isSuccess) {
      // Payment succeeded - process the payment
      console.log('Payment succeeded for order:', body.order_id)
      
      return NextResponse.json(
        { success: true, message: 'Payment processed' },
        { status: 200 }
      )
    } else {
      // Payment failed or other status
      console.log('Payment status for order:', body.order_id, 'Status:', body.status)
      
      return NextResponse.json(
        { success: true, message: 'Payment status received' },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Payment callback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
