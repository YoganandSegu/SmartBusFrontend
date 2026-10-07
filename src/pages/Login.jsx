import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { getErrorMessage } from '../services/api'
import AlertMessage from '../components/AlertMessage'

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { data } = await api.post('/auth/login', form)
      sessionStorage.setItem('smartbus.credentials', JSON.stringify(form))
      sessionStorage.setItem('smartbus.user', JSON.stringify(data))
      onLogin(data)
      navigate(data.role === 'ADMIN' ? '/admin' : data.role === 'DRIVER' ? '/driver/tracking' : '/student')
    } catch (requestError) {
      setError(requestError.response?.status === 401 ? 'Username or password is incorrect.' : getErrorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  return <div className="card auth-card"><div className="card-body p-4 p-md-5">
    <h1 className="h3 mb-2">Welcome back</h1>
    <p className="text-secondary">Students and admins sign in with a username. Drivers sign in with their registered mobile number.</p>
    <AlertMessage message={error} />
    <form onSubmit={submit}>
      <label className="form-label" htmlFor="username">Username or driver mobile number</label>
      <input id="username" className="form-control mb-3" autoComplete="username" value={form.username}
        onChange={event => setForm({ ...form, username: event.target.value })} required />
      <label className="form-label" htmlFor="password">Password</label>
      <input id="password" className="form-control mb-4" type="password" autoComplete="current-password" value={form.password}
        onChange={event => setForm({ ...form, password: event.target.value })} required />
      <button className="btn btn-primary w-100" disabled={busy}>{busy ? 'Signing in…' : 'Login'}</button>
    </form>
    <p className="mb-0 mt-3 text-center">New student? <Link to="/register">Create an account</Link></p>
  </div></div>
}
