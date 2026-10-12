import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { products, searchProducts, type ProductSpace } from '../data/products'
import { ProductGrid } from '../components/ProductCard'

const spaces: { id: ProductSpace | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'living', label: 'Living' },
  { id: 'dining', label: 'Dining' },
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'lounge', label: 'Lounge' },
]

const types = ['Sofa', 'Chair', 'Table', 'Bed', 'Daybed', 'Ottoman', 'Storage', 'Mirror', 'Lighting'] as const

export function ShopPage() {
  const [params, setParams] = useSearchParams()
  const space = (params.get('space') as ProductSpace | null) ?? 'all'
  const type = params.get('type') ?? 'all'
  const sort = params.get('sort') ?? 'featured'
  const q = params.get('q') ?? ''

  const items = useMemo(() => {
    let list = q ? searchProducts(q) : products
    if (space !== 'all') list = list.filter((product) => product.space === space)
    if (type !== 'all') list = list.filter((product) => product.category === type)
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [space, type, sort, q])

  return (
    <main id="main" className="page-wrap">
      <div className="page-hero">
        <h1>The Collection</h1>
        <p className="form-note">
          {q ? `Search results for “${q}”` : 'A curated edit of sofas, seating, tables and quiet companions for the home.'}
        </p>
      </div>
      <div className="shop-toolbar">
        <div className="filters">
          {spaces.map((item) => (
            <button
              key={item.id}
              type="button"
              className={space === item.id || (item.id === 'all' && !params.get('space')) ? 'chip is-on' : 'chip'}
              onClick={() => {
                const next = new URLSearchParams(params)
                if (item.id === 'all') next.delete('space')
                else next.set('space', item.id)
                setParams(next)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="filters">
          <button
            type="button"
            className={type === 'all' ? 'chip is-on' : 'chip'}
            onClick={() => {
              const next = new URLSearchParams(params)
              next.delete('type')
              setParams(next)
            }}
          >
            All types
          </button>
          {types.map((item) => (
            <button
              key={item}
              type="button"
              className={type === item ? 'chip is-on' : 'chip'}
              onClick={() => {
                const next = new URLSearchParams(params)
                next.set('type', item)
                setParams(next)
              }}
            >
              {item}
            </button>
          ))}
        </div>
        <label>
          Sort
          <select
            value={sort}
            onChange={(e) => {
              const next = new URLSearchParams(params)
              next.set('sort', e.target.value)
              setParams(next)
            }}
            aria-label="Sort products"
            style={{ marginLeft: 8, width: 'auto' }}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price, low to high</option>
            <option value="price-desc">Price, high to low</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>
      <ProductGrid items={items} />
      <div style={{ height: 64 }} />
    </main>
  )
}
