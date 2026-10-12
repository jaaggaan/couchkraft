import { site } from '../data/site'

export function ContactPage() {
  return (
    <main id="main" className="page-wrap">
      <div className="page-hero">
        <h1>Contact</h1>
      </div>
      <div className="prose" style={{ paddingBottom: '4rem' }}>
        <p>{site.address}</p>
        <p>
          Phone: <a href={site.phoneHref}>{site.phoneDisplay}</a>
        </p>
        <p>
          Email: <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
        <p>
          WhatsApp:{' '}
          <a href={site.whatsappHref} target="_blank" rel="noreferrer">
            Message us
          </a>
        </p>
        <p>Hours listed on the current site: {site.hours}.</p>
      </div>
    </main>
  )
}
