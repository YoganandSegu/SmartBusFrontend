import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api, { getErrorMessage } from '../services/api'
import AlertMessage from '../components/AlertMessage'
import Loading from '../components/Loading'
import StatusBadge from '../components/StatusBadge'

export default function MyBooking({ user }) {
  const [bookings, setBookings] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const location = useLocation()
  const load = useCallback(() => api.get(`/bookings/student/${user.studentId}`)
    .then(response => setBookings(response.data)).catch(e => setError(getErrorMessage(e))), [user.studentId])
  useEffect(() => {
    setSuccess(location.state?.message || '')
    load()
  }, [location.state, load])

  async function cancel(id) {
    setError('')
    try {
      const { data } = await api.delete(`/bookings/${id}`)
      setSuccess(data.message)
      await load()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }
  return <>
    <div className="page-heading"><div><h1 className="h2">My booking</h1><p className="text-secondary mb-0">Your active and previous seat reservations.</p></div><Link className="btn btn-primary" to="/buses">Find a bus</Link></div>
    <AlertMessage message={success} type="success" /><AlertMessage message={error} />
    {!bookings ? <Loading /> : bookings.length === 0 ? <div className="alert alert-info">You have not made a booking yet.</div> :
      <div className="row g-3">{bookings.map(booking => <div className="col-md-6" key={booking.id}><div className="card"><div className="card-body">
        <div className="d-flex justify-content-between"><h2 className="h5">{booking.busNumber}</h2><StatusBadge status={booking.status} /></div>
        <div>{booking.routeName} · Seat {booking.seatNumber}</div><div className="text-secondary">Booked {booking.bookingDate}</div>
        {booking.status === 'BOOKED' && <button className="btn btn-outline-danger btn-sm mt-3" onClick={() => cancel(booking.id)}>Cancel booking</button>}
      </div></div></div>)}</div>}
  </>
}
