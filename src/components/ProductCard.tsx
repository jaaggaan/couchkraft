import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../data/products'
import { useStore } from '../context/StoreContext'
import { formatPrice } from '../utils/format'
import { HeartIcon } from './Icons'

type ProductCardProps = {
  product: Product
  showPrice?: boolean
}

export function ProductCard({ product, showPrice = true }: ProductCardProps) {
  const { toggleWishlist, isWishlisted } = useStore()
  const wished = isWishlisted(product.id)
  const images = product.images.slice(0, 4)
  const [index, setIndex] = useState(0)
  const timer = useRef<number | null>(null)

  const clearTimer = () => {
    if (timer.current) {
      window.clearInterval(timer.current)
      timer.current = null
    }
  }

  const stopSlide = () => {
    clearTimer()
    setIndex(0)
  }

  const startSlide = () => {
    if (images.length < 2) return
    clearTimer()
    const tick = () => setIndex((current) => (current + 1) % images.length)
    tick()
    timer.current = window.setInterval(tick, 1400)
  }

  useEffect(() => () => clearTimer(), [])

  return (
    <article className="product-card">
      <figure onPointerEnter={startSlide} onPointerLeave={stopSlide}>
        <Link to={`/product/${product.slug}`} className="product-slider-link" aria-label={product.name}>
          <div className="product-slider" style={{ transform: `translateX(-${index * 100}%)` }}>
            {images.map((src, imageIndex) => (
              <img
                key={src}
                src={src}
                alt={imageIndex === 0 ? product.name : `${product.name}, view ${imageIndex + 1}`}
                width={640}
                height={600}
                loading={imageIndex === 0 ? 'lazy' : 'lazy'}
              />
            ))}
          </div>
        </Link>
        <div className="slide-dots" aria-hidden="true">
          {images.map((src, imageIndex) => (
            <span key={src} className={imageIndex === index ? 'is-on' : undefined} />
          ))}
        </div>
        <button
          type="button"
          className={wished ? 'wish is-on' : 'wish'}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={wished}
          onClick={() => toggleWishlist(product.id)}
        >
          <HeartIcon filled={wished} />
        </button>
      </figure>
      <div className="product-meta">
        <Link to={`/product/${product.slug}`}>{product.name}</Link>
        {showPrice ? (
          <span>
            {product.compareAt ? <span className="price-was">{formatPrice(product.compareAt)}</span> : null}
            <strong>{formatPrice(product.price)}</strong>
          </span>
        ) : null}
      </div>
    </article>
  )
}

export function ProductGrid({ items, showPrice = true }: { items: Product[]; showPrice?: boolean }) {
  if (!items.length) {
    return <p className="form-note">No pieces match this view. Try another filter or search.</p>
  }

  return (
    <div className="product-grid">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} showPrice={showPrice} />
      ))}
    </div>
  )
}
