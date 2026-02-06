import crypto from 'crypto'

/**
 * Generate a unique order ID (UUID format, max 35 chars)
 */
export function generateOrderId(): string {
  // Generate UUID and ensure it's max 35 chars (UUIDs are 36 chars with dashes)
  // Remove dashes to make it shorter: 32 chars
  return crypto.randomUUID().replace(/-/g, '').substring(0, 35)
}

/**
 * Generate payment signature for payment initiation
 * Signature = SHA-256(order_id + amount + info[0][name] + info[0][quantity] + info[0][amount] + ... + api_key)
 */
export function generatePaymentSignature(params: {
  orderId: string
  amount: string
  info: Array<{ name: string; quantity: number; amount: number }>
  apiKey: string
}): string {
  const { orderId, amount, info, apiKey } = params

  // Build signature string according to documentation
  // Format: order_id + amount + info[0][name] + info[0][quantity] + info[0][amount] + info[1][name] + ...
  let signatureString = orderId + amount

  // Add all info items in order
  for (const item of info) {
    signatureString += item.name + String(item.quantity) + String(item.amount)
  }

  // Add API key at the end
  signatureString += apiKey

  // Calculate SHA-256 hash (hex lowercase)
  const hash = crypto.createHash('sha256').update(signatureString).digest('hex')

  return hash
}

/**
 * Verify webhook callback signature
 * Signature = SHA-256(order_id + amount + api_key)
 */
export function verifyWebhookSignature(params: {
  orderId: string
  amount: string
  apiKey: string
  receivedSignature: string
}): boolean {
  const { orderId, amount, apiKey, receivedSignature } = params

  // Build signature string: order_id + amount + api_key
  const signatureString = orderId + amount + apiKey

  // Calculate SHA-256 hash (hex lowercase)
  const calculatedHash = crypto.createHash('sha256').update(signatureString).digest('hex')

  // Compare signatures (constant-time comparison to prevent timing attacks)
  return crypto.timingSafeEqual(
    Buffer.from(calculatedHash, 'hex'),
    Buffer.from(receivedSignature, 'hex')
  )
}
