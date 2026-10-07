import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { getErrorMessage } from '../services/api'
import AlertMessage from '../components/AlertMessage'
import Loading from '../components/Loading'
import StatusBadge from '../components/StatusBadge'

export default function BusDetails() {
  const { id } = useParams()
  const [bus, setBus] = useState(null)
  const [route, setRoute] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    api.get(`/buses/${id}`).then(async response => {
      setBus(response.data)
      const routeResponse = await api.get(`/routes/${response.data.routeId}`)
      setRoute(routeResponse.data)
    }).catch(e => setError(getErrorMessage(e)))
  }, [id])
  if (error) return <AlertMessage message={error} />
  if (!bus || !route) return <Loading />
  return <div className="card"><div className="card-body p-4">
    <div className="page-heading"><div><h1 className="h2">{bus.busNumber}</h1><p className="text-secondary mb-0">{bus.registrationNumber}</p></div><StatusBadge status={bus.status} /></div>
    <div className="row g-4"><div className="col-md-6"><h2 className="h5">Seat availability</h2><p>Capacity: {bus.capacity}</p><p>Booked: {bus.bookedSeats}</p><p>Available: {bus.availableSeats}</p></div>
      <div className="col-md-6"><h2 className="h5">{route.routeName}</h2><p>{route.startPoint} → {route.destination}</p><p><strong>Stops:</strong> {route.stops}</p></div></div>
    {bus.status === 'ACTIVE' && bus.availableSeats > 0
      ? <Link className="btn btn-primary" to={`/book/${bus.id}`}>Book a seat</Link>
      : <div className="alert alert-warning mb-0">{bus.status !== 'ACTIVE' ? 'This bus is inactive.' : 'This bus is full.'}</div>}
  </div></div>
}
