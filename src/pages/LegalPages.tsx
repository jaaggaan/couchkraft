export function PrivacyPage() {
  return (
    <main id="main" className="page-wrap page-hero">
      <h1>Privacy Policy</h1>
      <div className="prose" style={{ paddingBottom: '4rem' }}>
        <p>
          CouchKraft customer accounts on this site store your name, email, optional phone number and a hashed password
          on the local development server. Sessions are kept in an HTTP-only cookie.
        </p>
        <p>No payment details are collected in this phase. Contact details on the live brand site remain as published on couchkraft.in.</p>
      </div>
    </main>
  )
}

export function TermsPage() {
  return (
    <main id="main" className="page-wrap page-hero">
      <h1>Terms of Service</h1>
      <div className="prose" style={{ paddingBottom: '4rem' }}>
        <p>
          This CouchKraft experience is a local e-commerce prototype. Account creation, sign-in and password recovery
          work against the local customer store. Catalogue prices are demonstration data and checkout is not live.
        </p>
      </div>
    </main>
  )
}
