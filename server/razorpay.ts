import { createHmac, timingSafeEqual } from 'node:crypto'

export type RazorpayConfig = {
  keyId: string
  keySecret: string
}

export type RazorpayOrder = {
  id: string
  amount: number
  currency: string
  receipt?: string
  status: string
}

export function razorpayConfigFrom(env: Record<string, string | undefined>):
  | { ok: true; config: RazorpayConfig }
  | { ok: false; error: string } {
  const keyId = (env.RAZORPAY_KEY_ID || '').trim()
  const keySecret = (env.RAZORPAY_KEY_SECRET || '').trim()
  if (!keyId || !keySecret || keyId.includes('yourKeyId') || keySecret.includes('yourKeySecret')) {
    return {
      ok: false,
      error:
        'Razorpay test keys are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from the Razorpay Dashboard (Test Mode) to a local .env file.',
    }
  }
  if (keyId.startsWith('rzp_live_')) {
    return {
      ok: false,
      error: 'Live Razorpay keys are blocked. This project only accepts rzp_test_ keys until live payments are approved.',
    }
  }
  if (!keyId.startsWith('rzp_test_')) {
    return {
      ok: false,
      error: 'Only Razorpay Test Mode key IDs (rzp_test_…) are allowed.',
    }
  }
  return { ok: true, config: { keyId, keySecret } }
}

export function rupeesToPaise(rupees: number) {
  return Math.round(rupees * 100)
}

export function verifyRazorpaySignature(
  secret: string,
  payload: { orderId: string; paymentId: string; signature: string },
) {
  const expected = createHmac('sha256', secret)
    .update(`${payload.orderId}|${payload.paymentId}`)
    .digest('hex')
  const left = Buffer.from(expected)
  const right = Buffer.from(payload.signature)
  return left.length === right.length && timingSafeEqual(left, right)
}

export async function createRazorpayOrder(
  config: RazorpayConfig,
  input: { amountPaise: number; receipt: string; notes?: Record<string, string> },
): Promise<RazorpayOrder> {
  const auth = Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64')
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: 'INR',
      receipt: input.receipt.slice(0, 40),
      notes: input.notes || {},
    }),
  })
  const data = (await response.json()) as RazorpayOrder & {
    error?: { description?: string }
  }
  if (!response.ok || !data.id) {
    throw new Error(data.error?.description || 'Razorpay could not create a test order.')
  }
  return data
}
