import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../services/api'
import AlertMessage from '../components/AlertMessage'
import Loading from '../components/Loading'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api.get('/admin/stats').then(response => setStats(response.data)).catch(e => setError(getErrorMessage(e))) }, [])
  return <>
    <div className="page-heading"><div><h1 className="h2">Admin dashboard</h1><p className="text-secondary mb-0">College transport overview.</p></div></div>
    <AlertMessage message={error} />
    {!stats ? <Loading /> : <div className="row g-3 mb-4">
      {[['Total students', stats.totalStudents], ['Total buses', stats.totalBuses], ['Total routes', stats.totalRoutes], ["Today's bookings", stats.todaysBookings]].map(([label, value]) =>
        <div className="col-sm-6 col-xl-3" key={label}><div className="card"><div className="card-body"><div className="text-secondary">{label}</div><div className="stat-value">{value}</div></div></div></div>)}
    </div>}
    <div className="card"><div className="card-body"><h2 className="h5">Transport management</h2><p className="text-secondary">Maintain routes and buses, and review student accounts and seat bookings.</p>
      <div className="d-flex flex-wrap gap-2"><Link className="btn btn-primary" to="/admin/buses">Manage buses</Link><Link className="btn btn-outline-primary" to="/admin/routes">Manage routes</Link><Link className="btn btn-outline-primary" to="/admin/students">View students</Link><Link className="btn btn-outline-primary" to="/admin/bookings">View bookings</Link></div>
    </div></div>
  </>
}
