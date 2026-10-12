import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { products, type Product } from '../data/products'
import { DEMO_COUPON } from '../data/site'

export type CartItem = {
  productId: string
  quantity: number
  finish: string
}

type StoreContextValue = {
  cart: CartItem[]
  wishlist: string[]
  coupon: string | null
  cartCount: number
  cartSubtotal: number
  cartDiscount: number
  cartTotal: number
  addToCart: (productId: string, quantity?: number, finish?: string) => void
  setQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  toggleWishlist: (productId: string) => void
  isWishlisted: (productId: string) => boolean
  applyCoupon: (code: string) => { ok: boolean; message: string }
  clearCoupon: () => void
  getCartProducts: () => Array<{ product: Product; quantity: number; finish: string }>
  clearCart: () => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

const CART_KEY = 'couchkraft.cart.mock'
const WISH_KEY = 'couchkraft.wishlist.mock'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => readJson(CART_KEY, []))
  const [wishlist, setWishlist] = useState<string[]>(() => readJson(WISH_KEY, []))
  const [coupon, setCoupon] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem(WISH_KEY, JSON.stringify(wishlist))
  }, [wishlist])

  const cartSubtotal = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.productId)
        return product ? sum + product.price * item.quantity : sum
      }, 0),
    [cart],
  )

  const cartDiscount = coupon === DEMO_COUPON.code ? Math.round(cartSubtotal * (DEMO_COUPON.percent / 100)) : 0

  const value = useMemo<StoreContextValue>(
    () => ({
      cart,
      wishlist,
      coupon,
      cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      cartSubtotal,
      cartDiscount,
      cartTotal: Math.max(0, cartSubtotal - cartDiscount),
      addToCart: (productId, quantity = 1, finish) => {
        setCart((current) => {
          const existing = current.find((item) => item.productId === productId)
          if (existing) {
            return current.map((item) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + quantity, finish: finish ?? item.finish }
                : item,
            )
          }
          const product = products.find((p) => p.id === productId)
          return [...current, { productId, quantity, finish: finish ?? product?.finishes[0] ?? 'Standard' }]
        })
      },
      setQuantity: (productId, quantity) => {
        setCart((current) =>
          quantity <= 0
            ? current.filter((item) => item.productId !== productId)
            : current.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
        )
      },
      removeFromCart: (productId) => setCart((current) => current.filter((item) => item.productId !== productId)),
      toggleWishlist: (productId) => {
        setWishlist((current) =>
          current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId],
        )
      },
      isWishlisted: (productId) => wishlist.includes(productId),
      applyCoupon: (code) => {
        const normalised = code.trim().toUpperCase()
        if (normalised === DEMO_COUPON.code) {
          setCoupon(DEMO_COUPON.code)
          return { ok: true, message: `Demonstration coupon applied (${DEMO_COUPON.percent}% off). Not a live offer.` }
        }
        return { ok: false, message: 'This demonstration coupon is not recognised. Try WARM10.' }
      },
      clearCoupon: () => setCoupon(null),
      getCartProducts: () =>
        cart.flatMap((item) => {
          const product = products.find((p) => p.id === item.productId)
          return product ? [{ product, quantity: item.quantity, finish: item.finish }] : []
        }),
      clearCart: () => {
        setCart([])
        setCoupon(null)
      },
    }),
    [cart, wishlist, coupon, cartSubtotal, cartDiscount],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used within StoreProvider')
  return context
}
