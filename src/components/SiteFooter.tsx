import { Link } from 'react-router-dom'
import { site } from '../data/site'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-wrap footer-grid">
        <div className="footer-brand">
          <Link to="/" className="wordmark">
            CouchKraft
          </Link>
          <p>Handcrafted comfort from Bengaluru. Kiln-dried hardwood, considered silhouettes, and rooms made for living.</p>
        </div>
        <div>
          <h3>Shop</h3>
          <ul>
            <li>
              <Link to="/shop">All pieces</Link>
            </li>
            <li>
              <Link to="/shop?space=living">Living room</Link>
            </li>
            <li>
              <Link to="/shop?space=dining">Dining</Link>
            </li>
            <li>
              <Link to="/shop?space=bedroom">Bedroom</Link>
            </li>
            <li>
              <Link to="/wishlist">Saved pieces</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3>Visit</h3>
          <ul>
            <li>
              <Link to="/about">About us</Link>
            </li>
            <li>
              <Link to="/faq">FAQ</Link>
            </li>
            <li>
              <Link to="/blog">Journal</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/privacy">Privacy</Link>
            </li>
            <li>
              <Link to="/terms">Terms</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3>Contact</h3>
          <p>{site.address}</p>
          <p>
            <a href={site.phoneHref}>{site.phoneDisplay}</a>
          </p>
          <p>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
          <p>
            <a href={site.whatsappHref} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </p>
        </div>
      </div>
      <div className="page-wrap footer-bottom">
        <span>© {new Date().getFullYear()} CouchKraft. All rights reserved.</span>
        <span>Lets Craft Comfort</span>
      </div>
    </footer>
  )
}
