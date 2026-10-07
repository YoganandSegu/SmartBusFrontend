import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../services/api'
import AlertMessage from '../components/AlertMessage'
import Loading from '../components/Loading'
import StatusBadge from '../components/StatusBadge'

const emptyForm = { busNumber: '', registrationNumber: '', capacity: 40, routeId: '', status: 'ACTIVE' }

export default function ManageBuses() {
  const [buses, setBuses] = useState(null)
  const [routes, setRoutes] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const load = useCallback(async () => {
    try {
      const [busResponse, routeResponse] = await Promise.all([api.get('/buses'), api.get('/routes')])
      setBuses(busResponse.data)
      setRoutes(routeResponse.data)
    } catch (e) { setError(getErrorMessage(e)) }
  }, [])
  useEffect(() => { load() }, [load])

  function edit(bus) {
    setEditingId(bus.id)
    setForm({ busNumber: bus.busNumber, registrationNumber: bus.registrationNumber, capacity: bus.capacity, routeId: bus.routeId, status: bus.status })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    try {
      const payload = { ...form, capacity: Number(form.capacity), routeId: Number(form.routeId) }
      if (editingId) await api.put(`/buses/${editingId}`, payload)
      else await api.post('/buses', payload)
      setSuccess(editingId ? 'Bus updated.' : 'Bus created.')
      setForm(emptyForm)
      setEditingId(null)
      await load()
    } catch (e) { setError(getErrorMessage(e)) }
  }

  async function remove(id) {
    if (!window.confirm('Delete this bus?')) return
    setError('')
    try {
      await api.delete(`/buses/${id}`)
      setSuccess('Bus deleted.')
      await load()
    } catch (e) { setError(getErrorMessage(e)) }
  }

  return <>
    <div className="page-heading"><div><h1 className="h2">Manage buses</h1><p className="text-secondary mb-0">Create, update, and remove college buses.</p></div></div>
    <AlertMessage message={error} /><AlertMessage message={success} type="success" />
    <div className="card mb-4"><div className="card-body"><h2 className="h5">{editingId ? 'Edit bus' : 'Add a bus'}</h2>
      {routes.length === 0 ? <p className="mb-0">Add a <Link to="/admin/routes">route</Link> before creating a bus.</p> :
        <form className="row g-3" onSubmit={submit}>
          <div className="col-md-6"><label className="form-label">Bus number</label><input className="form-control" value={form.busNumber} onChange={e => setForm({ ...form, busNumber: e.target.value })} required /></div>
          <div className="col-md-6"><label className="form-label">Registration number</label><input className="form-control" value={form.registrationNumber} onChange={e => setForm({ ...form, registrationNumber: e.target.value })} required /></div>
          <div className="col-md-4"><label className="form-label">Capacity</label><input className="form-control" type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} required /></div>
          <div className="col-md-4"><label className="form-label">Route</label><select className="form-select" value={form.routeId} onChange={e => setForm({ ...form, routeId: e.target.value })} required><option value="">Choose route</option>{routes.map(route => <option key={route.id} value={route.id}>{route.routeName}</option>)}</select></div>
          <div className="col-md-4"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option>ACTIVE</option><option>INACTIVE</option></select></div>
          <div className="col-12"><button className="btn btn-primary">{editingId ? 'Save changes' : 'Add bus'}</button>{editingId && <button type="button" className="btn btn-link" onClick={() => { setEditingId(null); setForm(emptyForm) }}>Cancel edit</button>}</div>
        </form>}
    </div></div>
    {!buses ? <Loading /> : <div className="card"><div className="table-responsive"><table className="table table-hover mb-0"><thead><tr><th>Bus</th><th>Registration</th><th>Route</th><th>Capacity</th><th>Seats</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>{buses.map(bus => <tr key={bus.id}><td>{bus.busNumber}</td><td>{bus.registrationNumber}</td><td>{bus.routeName}</td><td>{bus.capacity}</td><td>{bus.availableSeats} available</td><td><StatusBadge status={bus.status} /></td><td className="text-nowrap"><button className="btn btn-sm btn-outline-primary me-2" onClick={() => edit(bus)}>Edit</button><button className="btn btn-sm btn-outline-danger" onClick={() => remove(bus.id)}>Delete</button></td></tr>)}
        {buses.length === 0 && <tr><td colSpan="7" className="text-center text-secondary py-4">No buses have been added.</td></tr>}</tbody></table></div></div>}
  </>
}
