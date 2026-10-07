import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { getErrorMessage } from '../services/api'
import AlertMessage from '../components/AlertMessage'

const initialForm = {
  studentId: '', name: '', email: '', phone: '', department: '', year: 1, username: '', password: '',
}

export default function Register() {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  function update(event) {
    const { name, value } = event.target
    setForm({
      ...form,
      [name]: name === 'year' ? Number(value) : name === 'studentId' ? value.toUpperCase() : value,
    })
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      await api.post('/auth/register', form)
      setMessage('Your student account is ready. Please log in.')
      setTimeout(() => navigate('/login'), 800)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  return <div className="card auth-card"><div className="card-body p-4">
    <h1 className="h3">Student registration</h1>
    <p className="text-secondary">Create your account with your unique Student ID.</p>
    <AlertMessage message={error} />
    <AlertMessage message={message} type="success" />
    <form onSubmit={submit} className="row g-3">
      {[
        ['studentId', 'Student ID (e.g. 24eg110b63)', 'text', '[0-9]{2}[A-Za-z]{2}[0-9]{3}[A-Za-z][0-9]{2}'],
        ['name', 'Full name', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'tel'],
        ['department', 'Department', 'text'], ['year', 'Year of study', 'number'],
        ['username', 'Username', 'text'], ['password', 'Password (min. 8 characters)', 'password'],
      ].map(([name, label, type, pattern]) => <div className={name === 'password' ? 'col-12' : 'col-md-6'} key={name}>
        <label className="form-label" htmlFor={name}>{label}</label>
        <input id={name} name={name} className="form-control" type={type} value={form[name]} onChange={update}
          required min={name === 'year' ? 1 : undefined} max={name === 'year' ? 8 : undefined}
          minLength={name === 'password' ? 8 : undefined} maxLength={name === 'studentId' ? 10 : undefined} pattern={pattern} />
      </div>)}
      <div className="col-12"><button className="btn btn-primary w-100">Register</button></div>
    </form>
    <p className="mb-0 mt-3 text-center">Already registered? <Link to="/login">Login</Link></p>
  </div></div>
}
