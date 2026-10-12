import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductBySlug, getRelatedProducts } from '../data/products'
import { useStore } from '../context/StoreContext'
import { formatPrice } from '../utils/format'
import { ProductGrid } from '../components/ProductCard'

export function ProductPage() {
  const { slug = '' } = useParams()
  const product = getProductBySlug(slug)
  const { addToCart, toggleWishlist, isWishlisted } = useStore()
  const [finish, setFinish] = useState(product?.finishes[0] ?? '')
  const [qty, setQty] = useState(1)
  const [image, setImage] = useState(0)
  const [note, setNote] = useState('')

  useEffect(() => {
    setFinish(product?.finishes[0] ?? '')
    setQty(1)
    setImage(0)
    setNote('')
  }, [product])

  if (!product) {
    return (
      <main id="main" className="page-wrap page-hero">
        <h1>Piece not found</h1>
        <p>
          <Link to="/shop">Return to the collection</Link>
        </p>
      </main>
    )
  }

  const related = getRelatedProducts(product)

  return (
    <main id="main" className="page-wrap">
      <article className="pdp">
        <div className="gallery">
          <div className="gallery-main">
            <img src={product.images[image] ?? product.images[0]} alt={product.name} width={900} height={900} />
          </div>
          <div className="thumbs">
            {product.images.map((src, index) => (
              <button key={src} type="button" onClick={() => setImage(index)} aria-label={`View image ${index + 1}`}>
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        </div>
        <div className="pdp-info">
          <h1>{product.name}</h1>
          <p className="pdp-price">
            {product.compareAt ? <span className="price-was">{formatPrice(product.compareAt)}</span> : null}
            {formatPrice(product.price)}
          </p>
          <p>{product.description}</p>
          <div className="field">
            <label htmlFor="finish">Finish</label>
            <select id="finish" value={finish} onChange={(e) => setFinish(e.target.value)}>
              {product.finishes.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Quantity</label>
            <div className="qty">
              <button type="button" onClick={() => setQty((n) => Math.max(1, n - 1))} aria-label="Decrease quantity">
                −
              </button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((n) => n + 1)} aria-label="Increase quantity">
                +
              </button>
            </div>
          </div>
          <div className="pdp-actions">
            <button
              type="button"
              className="btn"
              onClick={() => {
                addToCart(product.id, qty, finish)
                setNote('Added to bag.')
              }}
            >
              Add to bag
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => toggleWishlist(product.id)}>
              {isWishlisted(product.id) ? 'Saved' : 'Save'}
            </button>
          </div>
          {note ? <p className="form-note">{note}</p> : null}
          <p className="form-note">{product.care}</p>
        </div>
      </article>
      <section className="section">
        <div className="section-heading">
          <h2>You may also like</h2>
        </div>
        <div style={{ height: 24 }} />
        <ProductGrid items={related} />
      </section>
    </main>
  )
}
