import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')

    if (!orderId) {
      return NextResponse.json(
        { error: 'order_id parameter is required' },
        { status: 400 }
      )
    }

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'pre-fix',
        hypothesisId: 'H4',
        location: 'src/app/api/payment/verify/route.ts:GET',
        message: 'Verify payment called',
        data: { orderId },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion agent log

    // Step 1: Check database first (fast path)
    try {
      const dbResult = await query(
        'SELECT order_id, status, amount, verified_at FROM payments WHERE order_id = $1',
        [orderId]
      )

      if (dbResult.rows.length > 0) {
        const payment = dbResult.rows[0]
        if (payment.status === 'succeeded') {
          // Payment already verified and stored
          return NextResponse.json({
            status: 'succeeded',
            order_id: payment.order_id,
            amount: payment.amount,
            verified_at: payment.verified_at,
            source: 'database',
          })
        }
        // Payment exists but not succeeded - return current status
        return NextResponse.json({
          status: payment.status,
          order_id: payment.order_id,
          amount: payment.amount,
          source: 'database',
        })
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Continue to API check if database fails
    }

    // Step 2: Check payment gateway API if not in database
    try {
      // Import status check function directly instead of HTTP call
      const merchantId = process.env.PAYMENT_MERCHANT_ID
      const apiKey = process.env.PAYMENT_API_KEY

      if (!merchantId || !apiKey) {
        return NextResponse.json(
          { error: 'Payment gateway not configured' },
          { status: 500 }
        )
      }

      const PAYMENT_API_URL = 'https://pro.selfwork.ru/merchant/v1/status'
      const authString = Buffer.from(`${merchantId}:${apiKey}`).toString('base64')
      
      const apiResponse = await fetch(
        `${PAYMENT_API_URL}?order_id=${encodeURIComponent(orderId)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!apiResponse.ok) {
        if (apiResponse.status === 404) {
          return NextResponse.json(
            { error: 'Order not found', status: 'not_found' },
            { status: 404 }
          )
        }
        // API error - return error for retry
        return NextResponse.json(
          { error: 'Failed to verify payment status', status: 'error' },
          { status: 500 }
        )
      }

      const apiData = await apiResponse.json()

      // Step 3: Store in database if payment succeeded
      if (apiData.status === 'succeeded') {
        try {
          await query(
            `INSERT INTO payments (order_id, status, amount, verified_at, created_at)
             VALUES ($1, $2, $3, NOW(), NOW())
             ON CONFLICT (order_id) 
             DO UPDATE SET status = $2, verified_at = NOW()`,
            [orderId, 'succeeded', apiData.amount]
          )
        } catch (storeError) {
          console.error('Error storing payment in database:', storeError)
          // Continue even if storage fails
        }
      }

      return NextResponse.json({
        ...apiData,
        source: 'api',
      })
    } catch (apiError) {
      console.error('API error:', apiError)
      return NextResponse.json(
        { error: 'Payment verification failed', status: 'error' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
