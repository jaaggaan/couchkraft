import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { authApi } from '../lib/auth-api'
import { useAuth } from '../context/AuthContext'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const { openAuth } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  return (
    <main id="main" className="page-wrap page-hero">
      <h1>Set a new password</h1>
      <form
        className="auth-page-form"
        onSubmit={(event) => {
          event.preventDefault()
          const token = params.get('token') || ''
          if (password.length < 8) {
            setError('Password must be at least 8 characters.')
            return
          }
          if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
          }
          setBusy(true)
          setError('')
          void authApi.reset(token, password, confirmPassword).then((result) => {
            setBusy(false)
            if (result.message) setSuccess(result.message)
            else setError(result.error || 'Unable to update this password.')
          })
        }}
      >
        <label className="auth-field">
          New password
          <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label className="auth-field">
          Confirm password
          <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </label>
        {error ? <p className="auth-error">{error}</p> : null}
        {success ? <p className="auth-success">{success}</p> : null}
        {success ? (
          <button type="button" className="btn" onClick={() => openAuth('signin')}>
            Sign in
          </button>
        ) : (
          <button className="btn" type="submit" disabled={busy}>
            {busy ? 'Updating…' : 'Update password'}
          </button>
        )}
      </form>
    </main>
  )
}
