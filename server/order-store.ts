import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { dataDirectory } from './data-path.ts'
import { products } from '../src/data/products.ts'
import { DEMO_COUPON } from '../src/data/site.ts'
import type { Address } from './auth-store.ts'

export const FULFILMENT_STEPS = [
  'placed',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
] as const

export type FulfilmentStatus = (typeof FULFILMENT_STEPS)[number]
export type PaymentStatus = 'pending' | 'unpaid' | 'paid' | 'failed' | 'refunded'

export type OrderContact = {
  name: string
  email: string
  phone: string
}

export type OrderItem = {
  productId: string
  name: string
  slug: string
  image: string
  finish: string
  quantity: number
  unitPrice: number
}

export type Order = {
  id: string
  number: string
  customerId: string
  createdAt: string
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  coupon: string | null
  paymentStatus: PaymentStatus
  fulfilmentStatus: FulfilmentStatus
  shippingAddress: Address | null
  deliveryMethod: string | null
  trackingNumber: string | null
  estimatedDelivery: string | null
  contact: OrderContact | null
  cartFingerprint: string
  amountPaise: number
  razorpayOrderId: string | null
  razorpayPaymentId: string | null
  paymentError: string | null
  paymentMethod: string | null
}

const dataDir = dataDirectory()
const storePath = resolve(dataDir, 'orders.json')

function ensureStore() {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })
  if (!existsSync(storePath)) writeFileSync(storePath, '[]', 'utf8')
}

function readAll(): Order[] {
  ensureStore()
  try {
    return (JSON.parse(readFileSync(storePath, 'utf8')) as Order[]).map(normaliseOrder)
  } catch {
    return []
  }
}

function normaliseOrder(order: Order): Order {
  return {
    ...order,
    contact: order.contact ?? null,
    cartFingerprint: order.cartFingerprint ?? '',
    amountPaise: order.amountPaise ?? Math.round((order.total || 0) * 100),
    razorpayOrderId: order.razorpayOrderId ?? null,
    razorpayPaymentId: order.razorpayPaymentId ?? null,
    paymentError: order.paymentError ?? null,
    paymentMethod: order.paymentMethod ?? null,
  }
}

export function nextTrackingNumber(order: Order) {
  if (order.trackingNumber) return order.trackingNumber
  const digits = order.number.replace(/\D/g, '') || '000000'
  return `CKTRK${digits}${order.id.slice(-4).toUpperCase()}`
}

export function cartFingerprint(
  items: Array<{ productId: string; quantity: number; finish?: string }>,
  coupon: string | null | undefined,
  addressKey: string,
) {
  const lines = items
    .map((item) => `${item.productId}:${item.quantity}:${item.finish || ''}`)
    .sort()
    .join('|')
  return `${lines}::${(coupon || '').trim().toUpperCase()}::${addressKey}`
}

function writeAll(orders: Order[]) {
  ensureStore()
  writeFileSync(storePath, JSON.stringify(orders, null, 2), 'utf8')
}

export function listOrdersForCustomer(customerId: string) {
  return readAll()
    .filter((order) => order.customerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getOrderForCustomer(customerId: string, orderId: string) {
  return listOrdersForCustomer(customerId).find((order) => order.id === orderId) ?? null
}

export function getOrderByNumberForCustomer(customerId: string, number: string) {
  const normalised = number.trim().toUpperCase()
  return listOrdersForCustomer(customerId).find((order) => order.number === normalised) ?? null
}

export function createOrderFromCart(
  customerId: string,
  input: {
    items: Array<{ productId: string; quantity: number; finish?: string }>
    address: Address | null
    coupon?: string | null
    contact?: OrderContact | null
    paymentStatus?: PaymentStatus
    cartFingerprint?: string
  },
) {
  const items: OrderItem[] = []
  for (const line of input.items) {
    const product = products.find((entry) => entry.id === line.productId)
    if (!product || line.quantity < 1) continue
    items.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      finish: line.finish || product.finishes[0] || 'Standard',
      quantity: Math.min(12, Math.round(line.quantity)),
      unitPrice: product.price,
    })
  }
  if (!items.length) return { error: 'empty' as const }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const coupon = input.coupon?.trim().toUpperCase() === DEMO_COUPON.code ? DEMO_COUPON.code : null
  const discount = coupon ? Math.round(subtotal * (DEMO_COUPON.percent / 100)) : 0
  const total = Math.max(0, subtotal - discount)
  const orders = readAll()
  const order: Order = {
    id: randomBytes(10).toString('hex'),
    number: `CK${String(orders.length + 10841).padStart(6, '0')}`,
    customerId,
    createdAt: new Date().toISOString(),
    items,
    subtotal,
    discount,
    total,
    coupon,
    paymentStatus: input.paymentStatus || 'unpaid',
    fulfilmentStatus: 'placed',
    shippingAddress: input.address,
    deliveryMethod: null,
    trackingNumber: null,
    estimatedDelivery: null,
    contact: input.contact ?? null,
    cartFingerprint: input.cartFingerprint || '',
    amountPaise: Math.round(total * 100),
    razorpayOrderId: null,
    razorpayPaymentId: null,
    paymentError: null,
    paymentMethod: null,
  }
  orders.push(order)
  writeAll(orders)
  return { order }
}

export function findReusableCheckoutOrder(customerId: string, fingerprint: string) {
  return (
    listOrdersForCustomer(customerId).find(
      (order) =>
        order.cartFingerprint === fingerprint &&
        order.paymentStatus !== 'paid' &&
        order.paymentStatus !== 'refunded',
    ) ?? null
  )
}

export function saveOrder(next: Order) {
  const orders = readAll()
  const index = orders.findIndex((order) => order.id === next.id)
  if (index === -1) return null
  orders[index] = next
  writeAll(orders)
  return next
}

export function attachRazorpayOrder(orderId: string, customerId: string, razorpayOrderId: string) {
  const order = getOrderForCustomer(customerId, orderId)
  if (!order) return null
  return saveOrder({
    ...order,
    paymentStatus: order.paymentStatus === 'paid' ? 'paid' : 'pending',
    razorpayOrderId,
    paymentError: null,
  })
}

export function markOrderPaymentFailed(orderId: string, customerId: string, message: string) {
  const order = getOrderForCustomer(customerId, orderId)
  if (!order || order.paymentStatus === 'paid') return order
  return saveOrder({
    ...order,
    paymentStatus: 'failed',
    paymentError: message,
  })
}

export function markOrderPaid(
  customerId: string,
  input: {
    orderId: string
    razorpayOrderId: string
    razorpayPaymentId: string
    paymentMethod?: string | null
    deliveryMethod?: string | null
  },
) {
  const order = getOrderForCustomer(customerId, input.orderId)
  if (!order) return { error: 'missing' as const }
  if (order.razorpayOrderId !== input.razorpayOrderId) return { error: 'mismatch' as const }
  if (order.paymentStatus === 'paid') return { order }
  const paid = saveOrder({
    ...order,
    paymentStatus: 'paid',
    fulfilmentStatus: order.fulfilmentStatus === 'placed' ? 'confirmed' : order.fulfilmentStatus,
    razorpayPaymentId: input.razorpayPaymentId,
    paymentMethod: input.paymentMethod ?? order.paymentMethod,
    deliveryMethod: input.deliveryMethod ?? order.deliveryMethod,
    trackingNumber: nextTrackingNumber(order),
    paymentError: null,
  })
  if (!paid) return { error: 'missing' as const }
  return { order: paid }
}

export function markCashOnDelivery(
  customerId: string,
  input: { orderId: string; razorpayOrderId: string },
) {
  const order = getOrderForCustomer(customerId, input.orderId)
  if (!order) return { error: 'missing' as const }
  if (order.razorpayOrderId !== input.razorpayOrderId) return { error: 'mismatch' as const }
  if (order.paymentStatus === 'paid') return { order }
  const next = saveOrder({
    ...order,
    paymentStatus: 'pending',
    fulfilmentStatus: order.fulfilmentStatus === 'placed' ? 'confirmed' : order.fulfilmentStatus,
    paymentMethod: 'cash',
    deliveryMethod: 'Cash on delivery',
    trackingNumber: nextTrackingNumber(order),
    paymentError: null,
  })
  if (!next) return { error: 'missing' as const }
  return { order: next }
}
