import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../services/api'
import AlertMessage from '../components/AlertMessage'
import Loading from '../components/Loading'
import StatusBadge from '../components/StatusBadge'

export default function StudentDashboard({ user }) {
  const [profile, setProfile] = useState(null)
  const [buses, setBuses] = useState([])
  const [booking, setBooking] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/students/profile'), api.get('/buses'), api.get(`/bookings/student/${user.studentId}`)])
      .then(([profileResponse, busResponse, bookingResponse]) => {
        setProfile(profileResponse.data)
        setBuses(busResponse.data)
        setBooking(bookingResponse.data.find(item => item.status === 'BOOKED') || null)
      })
      .catch(requestError => setError(getErrorMessage(requestError)))
  }, [user.studentId])

  if (error) return <AlertMessage message={error} />
  if (!profile) return <Loading />
  return <>
    <div className="page-heading"><div><h1 className="h2 mb-1">Welcome, {profile.name}</h1><div className="text-secondary">Student ID: <strong>{profile.studentId}</strong></div></div></div>
    <div className="row g-3 mb-4">
      <div className="col-md-4"><div className="card h-100"><div className="card-body"><div className="text-secondary">Available buses</div><div className="stat-value">{buses.filter(bus => bus.status === 'ACTIVE' && bus.availableSeats > 0).length}</div><Link to="/buses">View buses</Link></div></div></div>
      <div className="col-md-4"><div className="card h-100"><div className="card-body"><div className="text-secondary">Your booking</div>{booking ? <><div className="fw-bold mt-2">{booking.busNumber} · Seat {booking.seatNumber}</div><div>{booking.routeName}</div><StatusBadge status={booking.status} /></> : <><div className="my-2">No active booking</div><Link to="/buses">Find a bus</Link></>}</div></div></div>
      <div className="col-md-4"><div className="card h-100"><div className="card-body"><div className="text-secondary">Profile</div><div className="fw-semibold mt-2">{profile.department}</div><div>Year {profile.year}</div><Link to="/profile">View profile</Link></div></div></div>
    </div>
    <h2 className="h4 mb-3">Available transport</h2>
    <div className="row g-3">{buses.filter(bus => bus.status === 'ACTIVE').slice(0, 3).map(bus => <div className="col-md-4" key={bus.id}>
      <div className="card h-100"><div className="card-body"><h3 className="h5">{bus.busNumber}</h3><div>{bus.routeName}</div><div className="text-secondary">Available seats: {bus.availableSeats} / {bus.capacity}</div><Link className="btn btn-sm btn-outline-primary mt-3" to={`/buses/${bus.id}`}>Bus details</Link></div></div>
    </div>)}</div>
  </>
}
