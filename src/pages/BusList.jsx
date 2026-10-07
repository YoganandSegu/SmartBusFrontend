import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../services/api'
import AlertMessage from '../components/AlertMessage'
import Loading from '../components/Loading'
import StatusBadge from '../components/StatusBadge'

export default function BusList() {
  const [buses, setBuses] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api.get('/buses').then(response => setBuses(response.data)).catch(e => setError(getErrorMessage(e))) }, [])
  return <>
    <div className="page-heading"><div><h1 className="h2">Available buses</h1><p className="text-secondary mb-0">Check route and seat availability before booking.</p></div></div>
    <AlertMessage message={error} />
    {!buses ? <Loading /> : buses.length === 0 ? <div className="alert alert-info">No buses have been added yet.</div> :
      <div className="row g-3">{buses.map(bus => <div className="col-md-6 col-lg-4" key={bus.id}><div className="card h-100"><div className="card-body">
        <div className="d-flex justify-content-between"><h2 className="h5">{bus.busNumber}</h2><StatusBadge status={bus.status} /></div>
        <div className="text-secondary">{bus.registrationNumber}</div><hr />
        <div className="mb-2"><strong>Route:</strong> {bus.routeName}</div>
        <div><strong>Capacity:</strong> {bus.capacity} · <strong>Booked:</strong> {bus.bookedSeats} · <strong>Available:</strong> {bus.availableSeats}</div>
        {bus.availableSeats > 0 ? <div className="text-success small mt-2">Seats available</div> : <div className="text-danger small mt-2">Bus full</div>}
        <div className="mt-3 d-flex flex-wrap gap-2"><Link className="btn btn-outline-primary btn-sm" to={`/buses/${bus.id}`}>Details</Link><Link className="btn btn-outline-secondary btn-sm" to={`/track?busNumber=${encodeURIComponent(bus.busNumber)}`}>Track bus</Link>{bus.status === 'ACTIVE' && bus.availableSeats > 0 && <Link className="btn btn-primary btn-sm" to={`/book/${bus.id}`}>Book a seat</Link>}</div>
      </div></div></div>)}</div>}
  </>
}
