const faqs = [
  {
    q: 'Is this the live CouchKraft shop?',
    a: 'This is the CouchKraft editorial shop. You can browse, save pieces, check out with the demo payment gateway, and track orders on your account. Live Razorpay keys and courier tracking are not connected yet.',
  },
  {
    q: 'Where is the showroom?',
    a: 'Couchkraft Furniture Store, No. 45, 2nd Floor, Old Madras Road, Near KR Puram Railway Station, KR Puram, Bengaluru, Karnataka - 560036.',
  },
  {
    q: 'How do I get in touch?',
    a: 'Call 8073174325 or email contact@Couchkraft.in — both published on couchkraft.in.',
  },
]

export function FaqPage() {
  return (
    <main id="main" className="page-wrap">
      <div className="page-hero">
        <h1>FAQ</h1>
      </div>
      <div className="faq" style={{ paddingBottom: '4rem' }}>
        {faqs.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p className="form-note">{item.a}</p>
          </details>
        ))}
      </div>
    </main>
  )
}
