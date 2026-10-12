import { useEffect, useState } from 'react'
import { addressesApi, type Address } from '../../lib/orders-api'

const empty = {
  label: 'Home',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postalCode: '',
  country: 'India',
}

export function Addresses() {
  const [addresses, setAddresses] = useState<Address[] | null>(null)
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => {
    setError('')
    void addressesApi.list().then((result) => {
      if (result.status >= 400) setError(result.error || 'Unable to load addresses.')
      else setAddresses(result.addresses)
    })
  }

  useEffect(load, [])

  const field = (key: keyof typeof empty) => (
    <input
      value={form[key]}
      onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
      placeholder={key}
      aria-label={key}
    />
  )

  const startEdit = (address: Address) => {
    setEditingId(address.id)
    setForm({
      label: address.label,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      region: address.region,
      postalCode: address.postalCode,
      country: address.country,
    })
    setError('')
  }

  return (
    <div>
      <h2>Saved addresses</h2>
      <p className="form-note">Addresses are stored on your CouchKraft account and used when you place an order from your bag.</p>
      {error ? <p className="auth-error">{error}</p> : null}
      {!addresses ? <p className="form-note">Loading addresses…</p> : null}
      {addresses && !addresses.length ? <p className="form-note">No addresses saved yet.</p> : null}
      <ul className="address-list">
        {addresses?.map((address) => (
          <li key={address.id}>
            <strong>{address.label}</strong>
            <p>
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ''}
              <br />
              {address.city}, {address.region} {address.postalCode}
              <br />
              {address.country}
            </p>
            <div className="account-actions">
              <button type="button" className="link-btn" onClick={() => startEdit(address)}>
                Edit
              </button>
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  void addressesApi.remove(address.id).then((result) => {
                    if (editingId === address.id) {
                      setEditingId(null)
                      setForm(empty)
                    }
                    if (result.status >= 400) setError(result.error || 'Unable to remove this address.')
                    else load()
                  })
                }}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <h3>{editingId ? 'Edit address' : 'Add an address'}</h3>
      <form
        className="address-form"
        onSubmit={(event) => {
          event.preventDefault()
          setBusy(true)
          setError('')
          const request = editingId ? addressesApi.update(editingId, form) : addressesApi.create(form)
          void request.then((result) => {
            setBusy(false)
            if (result.status >= 400) setError(result.error || 'Unable to save this address.')
            else {
              setForm(empty)
              setEditingId(null)
              load()
            }
          })
        }}
      >
        {field('label')}
        {field('line1')}
        {field('line2')}
        {field('city')}
        {field('region')}
        {field('postalCode')}
        {field('country')}
        <div className="account-actions">
          <button className="btn" type="submit" disabled={busy}>
            {busy ? 'Saving…' : editingId ? 'Update address' : 'Save address'}
          </button>
          {editingId ? (
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setEditingId(null)
                setForm(empty)
              }}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </div>
  )
}
