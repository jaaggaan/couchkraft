import { Link } from 'react-router-dom'
import { products } from '../data/products'
import { useStore } from '../context/StoreContext'
import { ProductGrid } from '../components/ProductCard'

export function WishlistPage() {
  const { wishlist } = useStore()
  const items = products.filter((product) => wishlist.includes(product.id))

  return (
    <main id="main" className="page-wrap">
      <div className="page-hero">
        <h1>Saved pieces</h1>
        <p className="form-note">Pieces you save stay in this browser until you remove them.</p>
      </div>
      {items.length ? (
        <ProductGrid items={items} />
      ) : (
        <div className="account-empty">
          <p>Nothing saved yet. Use the heart on a piece to keep it here.</p>
          <Link className="btn" to="/shop">
            Browse the collection
          </Link>
        </div>
      )}
      <div style={{ height: 64 }} />
    </main>
  )
}
