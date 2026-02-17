import { NextRequest, NextResponse } from 'next/server'
import { generateOrderId, generatePaymentSignature } from '@/lib/payment/signature'

// Production price: 3,290 ₽ (329000 kopecks)
const PAYMENT_AMOUNT = 329000 // 3,290 ₽ in kopecks
const PRODUCT_NAME = 'Доступ к курсу "ИИ для работы"'
const PRODUCT_QUANTITY = 1

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.PAYMENT_API_KEY
    const merchantId = process.env.PAYMENT_MERCHANT_ID

    if (!apiKey || !merchantId) {
      console.error('Payment gateway credentials not configured')
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    // Generate unique order ID
    const orderId = generateOrderId()

    // Prepare product info
    const info = [
      {
        name: PRODUCT_NAME,
        quantity: PRODUCT_QUANTITY,
        amount: PAYMENT_AMOUNT,
      },
    ]

    // Generate signature
    const signature = generatePaymentSignature({
      orderId,
      amount: String(PAYMENT_AMOUNT),
      info,
      apiKey,
    })

    // Return payment form data
    return NextResponse.json({
      orderId,
      amount: PAYMENT_AMOUNT,
      signature,
      info,
      paymentUrl: 'https://pro.selfwork.ru/merchant/v1/init',
    })
  } catch (error) {
    console.error('Error initializing payment:', error)
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}
