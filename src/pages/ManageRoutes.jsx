import { useCallback, useEffect, useState } from 'react'
import api, { getErrorMessage } from '../services/api'
import AlertMessage from '../components/AlertMessage'
import Loading from '../components/Loading'

const emptyForm = { routeName: '', startPoint: '', destination: '', stops: '' }

export default function ManageRoutes() {
  const [routes, setRoutes] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const load = useCallback(() => api.get('/routes').then(response => setRoutes(response.data))
    .catch(e => setError(getErrorMessage(e))), [])
  useEffect(() => { load() }, [load])

  function edit(route) {
    setEditingId(route.id)
    setForm({ routeName: route.routeName, startPoint: route.startPoint, destination: route.destination, stops: route.stops })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    try {
      if (editingId) await api.put(`/routes/${editingId}`, form)
      else await api.post('/routes', form)
      setSuccess(editingId ? 'Route updated.' : 'Route created.')
      setEditingId(null)
      setForm(emptyForm)
      await load()
    } catch (e) { setError(getErrorMessage(e)) }
  }

  async function remove(id) {
    if (!window.confirm('Delete this route? Routes assigned to buses cannot be deleted.')) return
    setError('')
    try {
      await api.delete(`/routes/${id}`)
      setSuccess('Route deleted.')
      await load()
    } catch (e) { setError(getErrorMessage(e)) }
  }

  return <>
    <div className="page-heading"><div><h1 className="h2">Manage routes</h1><p className="text-secondary mb-0">Define the start, destination, and intermediate stops.</p></div></div>
    <AlertMessage message={error} /><AlertMessage message={success} type="success" />
    <div className="card mb-4"><div className="card-body"><h2 className="h5">{editingId ? 'Edit route' : 'Add a route'}</h2>
      <form className="row g-3" onSubmit={submit}>
        <div className="col-md-6"><label className="form-label">Route name</label><input className="form-control" value={form.routeName} onChange={e => setForm({ ...form, routeName: e.target.value })} required /></div>
        <div className="col-md-6"><label className="form-label">Starting point</label><input className="form-control" value={form.startPoint} onChange={e => setForm({ ...form, startPoint: e.target.value })} required /></div>
        <div className="col-md-6"><label className="form-label">Destination</label><input className="form-control" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} required /></div>
        <div className="col-md-6"><label className="form-label">Stops (comma-separated)</label><input className="form-control" value={form.stops} onChange={e => setForm({ ...form, stops: e.target.value })} placeholder="Uppal, Habsiguda, Tarnaka" required /></div>
        <div className="col-12"><button className="btn btn-primary">{editingId ? 'Save changes' : 'Add route'}</button>{editingId && <button type="button" className="btn btn-link" onClick={() => { setEditingId(null); setForm(emptyForm) }}>Cancel edit</button>}</div>
      </form>
    </div></div>
    {!routes ? <Loading /> : <div className="row g-3">{routes.map(route => <div className="col-md-6" key={route.id}><div className="card h-100"><div className="card-body">
      <div className="d-flex justify-content-between"><h3 className="h5">{route.routeName}</h3><div><button className="btn btn-sm btn-outline-primary me-2" onClick={() => edit(route)}>Edit</button><button className="btn btn-sm btn-outline-danger" onClick={() => remove(route.id)}>Delete</button></div></div>
      <div><strong>From:</strong> {route.startPoint} · <strong>To:</strong> {route.destination}</div><div className="text-secondary mt-2"><strong>Stops:</strong> {route.stops}</div>
    </div></div></div>)}</div>}
  </>
}
