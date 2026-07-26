import React, { useState } from 'react'

export function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@logicore.com')
  const [password, setPassword] = useState('admin123')
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (data.success) {
        if (rememberMe) {
          localStorage.setItem('logicore_admin_token', data.token)
        } else {
          sessionStorage.setItem('logicore_admin_token', data.token)
        }
        onLoginSuccess(data.token)
      } else {
        setErrorMsg(data.message || 'Login failed. Please check credentials.')
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('Network or server error. Make sure server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-overlay" data-lenis-prevent="true">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-brand-icon">
            <img src="/logo.png" alt="LogiCore Logo" className="admin-login-logo" />
          </div>
          <h2 className="admin-login-title">LogiCore Admin Access</h2>
          <p className="admin-login-subtitle">Sign in to manage website content and media</p>
        </div>

        {errorMsg && (
          <div className="admin-toast-error">
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label className="admin-input-label">Email Address</label>
            <input
              type="email"
              className="admin-form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@logicore.com"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-input-label">Password</label>
            <input
              type="password"
              className="admin-form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <div className="admin-remember-row">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkbox-label">Remember login session</span>
            </label>
          </div>

          <button type="submit" className="admin-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-icon" /> Authenticating...
              </>
            ) : (
              'Sign In to Admin Panel'
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <p className="default-cred-tip">
            💡 Default Login: <strong>admin@logicore.com</strong> / <strong>admin123</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
