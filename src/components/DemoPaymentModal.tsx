import { useState } from 'react'
import { formatPrice } from '../utils/format'
import { CloseIcon } from './Icons'

export type DemoMethod = 'card' | 'cash' | 'upi' | 'netbanking'

type Props = {
  amount: number
  orderNumber: string
  busy: boolean
  onClose: () => void
  onPay: (method: DemoMethod, action: 'success' | 'fail') => void
}

const methods: { id: DemoMethod; label: string; note: string }[] = [
  { id: 'card', label: 'Card', note: 'Visa, Mastercard, RuPay' },
  { id: 'upi', label: 'UPI', note: 'Any UPI ID' },
  { id: 'netbanking', label: 'Net banking', note: 'Major Indian banks' },
  { id: 'cash', label: 'Cash', note: 'Pay on delivery' },
]

export function DemoPaymentModal({ amount, orderNumber, busy, onClose, onPay }: Props) {
  const [method, setMethod] = useState<DemoMethod>('card')
  const [card, setCard] = useState('4111 1111 1111 1111')
  const [expiry, setExpiry] = useState('12/28')
  const [cvv, setCvv] = useState('123')
  const [upi, setUpi] = useState('asha@okhdfcbank')
  const [bank, setBank] = useState('HDFC Bank')
  const [error, setError] = useState('')

  const submit = (action: 'success' | 'fail') => {
    if (method === 'card' && card.replace(/\s/g, '').length < 12) {
      setError('Enter a demo card number.')
      return
    }
    if (method === 'upi' && !upi.includes('@')) {
      setError('Enter a demo UPI ID.')
      return
    }
    setError('')
    onPay(method, action)
  }

  return (
    <div className="auth-backdrop" onClick={onClose}>
      <div className="demo-gateway" role="dialog" aria-modal="true" aria-labelledby="demo-pay-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="icon-btn auth-close" aria-label="Close" onClick={onClose}>
          <CloseIcon />
        </button>
        <p className="form-note">Demo gateway · no money is charged</p>
        <h2 id="demo-pay-title">Pay for {orderNumber}</h2>
        <p className="demo-amount">{formatPrice(amount)}</p>

        <div className="demo-methods" role="tablist" aria-label="Payment method">
          {methods.map((entry) => (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={method === entry.id}
              className={method === entry.id ? 'is-on' : undefined}
              onClick={() => {
                setMethod(entry.id)
                setError('')
              }}
            >
              <strong>{entry.label}</strong>
              <span>{entry.note}</span>
            </button>
          ))}
        </div>

        {method === 'card' ? (
          <div className="demo-fields">
            <label className="auth-field">
              Card number
              <input value={card} onChange={(event) => setCard(event.target.value)} inputMode="numeric" />
            </label>
            <div className="checkout-split">
              <label className="auth-field">
                Expiry
                <input value={expiry} onChange={(event) => setExpiry(event.target.value)} />
              </label>
              <label className="auth-field">
                CVV
                <input value={cvv} onChange={(event) => setCvv(event.target.value)} />
              </label>
            </div>
          </div>
        ) : null}

        {method === 'upi' ? (
          <label className="auth-field">
            UPI ID
            <input value={upi} onChange={(event) => setUpi(event.target.value)} placeholder="name@upi" />
          </label>
        ) : null}

        {method === 'netbanking' ? (
          <label className="auth-field">
            Bank
            <select value={bank} onChange={(event) => setBank(event.target.value)}>
              <option>HDFC Bank</option>
              <option>State Bank of India</option>
              <option>ICICI Bank</option>
              <option>Axis Bank</option>
            </select>
          </label>
        ) : null}

        {method === 'cash' ? (
          <p className="form-note">You will pay in cash when the order is delivered. A tracking ID is issued as soon as the order is confirmed.</p>
        ) : null}

        {error ? <p className="auth-error">{error}</p> : null}

        <button className="btn checkout-pay" type="button" disabled={busy} onClick={() => submit('success')}>
          {busy ? 'Confirming…' : method === 'cash' ? 'Place cash on delivery order' : `Pay ${formatPrice(amount)}`}
        </button>
        {method !== 'cash' ? (
          <button type="button" className="auth-text-link" disabled={busy} onClick={() => submit('fail')}>
            Simulate failed payment
          </button>
        ) : null}
      </div>
    </div>
  )
}
