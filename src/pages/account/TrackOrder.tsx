import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FULFILMENT_STEPS, ordersApi, type Order } from '../../lib/orders-api'
import { formatDate } from '../../utils/format'

export function TrackOrder() {
  const [params, setParams] = useSearchParams()
  const [number, setNumber] = useState(params.get('number') || '')
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const lookup = (value: string) => {
    setBusy(true)
    setError('')
    setOrder(null)
    void ordersApi.lookup(value).then((result) => {
      setBusy(false)
      if (result.status >= 400) setError(result.error || 'Unable to find that order.')
      else setOrder(result.order)
    })
  }

  useEffect(() => {
    const preset = params.get('number')
    if (preset) lookup(preset)
  }, [params])

  const current = order ? FULFILMENT_STEPS.findIndex((step) => step.id === order.fulfilmentStatus) : -1

  return (
    <div>
      <h2>Track order</h2>
      <p className="form-note">Enter an order number from this account. Other customers’ orders cannot be viewed.</p>
      <form
        className="coupon-form track-form"
        onSubmit={(event) => {
          event.preventDefault()
          setParams({ number })
          lookup(number)
        }}
      >
        <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="e.g. CK010841" aria-label="Order number" />
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Looking…' : 'Track'}
        </button>
      </form>
      {error ? <p className="auth-error">{error}</p> : null}
      {order ? (
        <div className="track-result">
          <h3>{order.number}</h3>
          <p className="form-note">{formatDate(order.createdAt)}</p>
          <ol className="order-timeline">
            {FULFILMENT_STEPS.map((step, index) => (
              <li key={step.id} className={index <= current ? 'is-done' : undefined}>
                <span />
                {step.label}
              </li>
            ))}
          </ol>
          <p className="form-note">
            {order.trackingNumber
              ? `Tracking ID ${order.trackingNumber} (CouchKraft reference, not live courier tracking).`
              : 'No tracking ID has been issued yet. Live courier tracking is not connected.'}
          </p>
          <Link to={`/account/orders/${order.id}`}>View order</Link>
        </div>
      ) : null}
    </div>
  )
}
