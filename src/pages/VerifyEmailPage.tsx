import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authApi } from '../lib/auth-api'
import { useAuth } from '../context/AuthContext'

export function VerifyEmailPage() {
  const [params] = useSearchParams()
  const { openAuth } = useAuth()
  const [message, setMessage] = useState('Verifying your email…')
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const token = params.get('token') || ''
    if (!token) {
      setMessage('This verification link is missing a token.')
      return
    }
    void authApi.verify(token).then((result) => {
      if (result.message) {
        setOk(true)
        setMessage(result.message)
      } else {
        setMessage(result.error || 'Unable to verify this email.')
      }
    })
  }, [params])

  return (
    <main id="main" className="page-wrap page-hero">
      <h1>Email verification</h1>
      <p className={ok ? 'auth-success' : 'form-note'}>{message}</p>
      {ok ? (
        <button type="button" className="btn" onClick={() => openAuth('signin')}>
          Sign in
        </button>
      ) : (
        <p>
          <Link to="/">Return home</Link>
        </p>
      )}
    </main>
  )
}
