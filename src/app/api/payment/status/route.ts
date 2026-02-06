import { NextRequest, NextResponse } from 'next/server'

const PAYMENT_API_URL = 'https://pro.selfwork.ru/merchant/v1/status'

export async function GET(request: NextRequest) {
  try {
    const merchantId = process.env.PAYMENT_MERCHANT_ID
    const apiKey = process.env.PAYMENT_API_KEY

    if (!merchantId || !apiKey) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')

    if (!orderId) {
      return NextResponse.json(
        { error: 'order_id parameter is required' },
        { status: 400 }
      )
    }

    // Make request to payment gateway with HTTP Basic Auth
    const authString = Buffer.from(`${merchantId}:${apiKey}`).toString('base64')
    
    const response = await fetch(`${PAYMENT_API_URL}?order_id=${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        )
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to check payment status' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
