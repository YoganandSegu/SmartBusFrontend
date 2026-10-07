import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api, { getErrorMessage } from '../services/api'
import AlertMessage from '../components/AlertMessage'
import Loading from '../components/Loading'

export default function SeatBooking({ user }) {
  const { busId } = useParams()
  const [bus, setBus] = useState(null)
  const [seatNumber, setSeatNumber] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  useEffect(() => { api.get(`/buses/${busId}`).then(response => setBus(response.data)).catch(e => setError(getErrorMessage(e))) }, [busId])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.post('/bookings', { studentId: user.studentId, busId: Number(busId), routeId: bus.routeId, seatNumber: Number(seatNumber) })
      navigate('/my-booking', { state: { message: 'Bus seat booked successfully.' } })
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      const refresh = await api.get(`/buses/${busId}`).catch(() => null)
      if (refresh) setBus(refresh.data)
    } finally {
      setBusy(false)
    }
  }
  if (!bus) return <><AlertMessage message={error} /><Loading /></>
  return <div className="card auth-card"><div className="card-body p-4">
    <h1 className="h3">Book a seat</h1>
    <p className="text-secondary">{bus.busNumber} · {bus.routeName} · {bus.availableSeats} seats available</p>
    <div className="alert alert-light border">Booking as <strong>{user.studentId}</strong> ({user.name}). Only one active booking is allowed per student.</div>
    <AlertMessage message={error} />
    {bus.status !== 'ACTIVE' || bus.availableSeats < 1
      ? <div className="alert alert-danger">This bus is unavailable. <Link to="/buses">Choose another bus</Link>.</div>
      : <form onSubmit={submit}>
        <label className="form-label" htmlFor="seatNumber">Seat number (1–{bus.capacity})</label>
        <input id="seatNumber" className="form-control mb-3" type="number" min="1" max={bus.capacity}
          value={seatNumber} onChange={event => setSeatNumber(event.target.value)} required />
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Booking…' : 'Confirm booking'}</button>
        <Link className="btn btn-link" to={`/buses/${bus.id}`}>Cancel</Link>
      </form>}
  </div></div>
}
