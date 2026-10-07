import { useEffect, useState } from 'react'
import api, { getErrorMessage } from '../services/api'
import AlertMessage from '../components/AlertMessage'
import Loading from '../components/Loading'

export default function RouteList() {
  const [routes, setRoutes] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api.get('/routes').then(response => setRoutes(response.data)).catch(e => setError(getErrorMessage(e))) }, [])
  return <>
    <div className="page-heading"><div><h1 className="h2">Bus routes</h1><p className="text-secondary mb-0">Route start, stops, and college destination.</p></div></div>
    <AlertMessage message={error} />
    {!routes ? <Loading /> : <div className="row g-3">{routes.map(route => <div className="col-md-6 col-lg-4" key={route.id}><div className="card h-100"><div className="card-body">
      <h2 className="h5">{route.routeName}</h2><div><strong>Start:</strong> {route.startPoint}</div><div><strong>Destination:</strong> {route.destination}</div><div className="mt-2"><strong>Stops:</strong><br />{route.stops}</div>
    </div></div></div>)}</div>}
  </>
}
