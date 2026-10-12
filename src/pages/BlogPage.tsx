import { Link } from 'react-router-dom'

const notes = [
  {
    title: 'How a quiet living room is composed',
    excerpt: 'A short editorial note on proportion, oak, and leaving enough air around a sofa.',
  },
  {
    title: 'Why we still specify kiln-dried hardwood',
    excerpt: 'A look at the frames behind CouchKraft seating, drawn from the existing brand story.',
  },
]

export function BlogPage() {
  return (
    <main id="main" className="page-wrap">
      <div className="page-hero">
        <h1>Journal</h1>
        <p className="form-note">Notes on making a quieter home.</p>
      </div>
      <div className="prose" style={{ paddingBottom: '4rem' }}>
        {notes.map((note) => (
          <article key={note.title} style={{ padding: '1.2rem 0', borderBottom: '1px solid var(--line)' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '2rem', fontWeight: 500 }}>{note.title}</h2>
            <p>{note.excerpt}</p>
          </article>
        ))}
        <p style={{ marginTop: '1.5rem' }}>
          <Link to="/about">Read our story</Link>
        </p>
      </div>
    </main>
  )
}
