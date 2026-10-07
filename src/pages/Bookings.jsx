import { useEffect, useState } from 'react'
import api, { getErrorMessage } from '../services/api'
import AlertMessage from '../components/AlertMessage'
import Loading from '../components/Loading'
import StatusBadge from '../components/StatusBadge'

export default function Bookings() {
  const [bookings, setBookings] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api.get('/bookings').then(response => setBookings(response.data)).catch(e => setError(getErrorMessage(e))) }, [])
  return <>
    <div className="page-heading"><div><h1 className="h2">Bookings</h1><p className="text-secondary mb-0">All current and cancelled seat reservations.</p></div></div>
    <AlertMessage message={error} />
    {!bookings ? <Loading /> : <div className="card"><div className="table-responsive"><table className="table table-hover mb-0"><thead><tr><th>Student ID</th><th>Student</th><th>Bus</th><th>Route</th><th>Seat</th><th>Booking date</th><th>Status</th></tr></thead>
      <tbody>{bookings.map(booking => <tr key={booking.id}><td>{booking.studentId}</td><td>{booking.studentName}</td><td>{booking.busNumber}</td><td>{booking.routeName}</td><td>{booking.seatNumber}</td><td>{booking.bookingDate}</td><td><StatusBadge status={booking.status} /></td></tr>)}
        {bookings.length === 0 && <tr><td colSpan="7" className="text-center text-secondary py-4">No bookings yet.</td></tr>}</tbody></table></div></div>}
  </>
}
