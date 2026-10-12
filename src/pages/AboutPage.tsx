import { lifestyle } from '../data/site'

export function AboutPage() {
  return (
    <main id="main" className="page-wrap">
      <div className="page-hero">
        <h1>Crafted to bring warmth and timeless character into the home</h1>
      </div>
      <section className="lifestyle" style={{ paddingBottom: '4rem' }}>
        <img
          src={lifestyle.living}
          alt="A composed living room with cream upholstery and oak furniture"
          style={{ width: '100%', height: 420, objectFit: 'cover', borderRadius: 8 }}
        />
        <div className="prose">
          <p>
            CouchKraft is a furniture atelier in Bengaluru. Each sofa is built by artisans using kiln-dried hardwood,
            8-way hand-tied springs and high-resilience foam.
          </p>
          <p>
            The collection on this site is an editorial selection for browsing, saving and ordering. Showroom visits
            remain welcome at Old Madras Road, KR Puram.
          </p>
        </div>
      </section>
    </main>
  )
}
