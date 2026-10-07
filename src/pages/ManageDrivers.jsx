import { useCallback, useEffect, useState } from 'react'
import api, { getErrorMessage } from '../services/api'
import AlertMessage from '../components/AlertMessage'
import Loading from '../components/Loading'

const emptyForm = { name: '', phone: '', password: '', busId: '' }

export default function ManageDrivers() {
  const [drivers, setDrivers] = useState(null)
  const [buses, setBuses] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    try {
      const [driverResponse, busResponse] = await Promise.all([
        api.get('/admin/drivers'),
        api.get('/buses'),
      ])
      setDrivers(driverResponse.data)
      setBuses(busResponse.data)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }, [])

  useEffect(() => { load() }, [load])

  const assignedBusIds = new Set((drivers || []).map(driver => driver.busId))
  const availableBuses = (buses || []).filter(bus => !assignedBusIds.has(bus.id))

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    try {
      await api.post('/admin/drivers', { ...form, busId: Number(form.busId) })
      setForm(emptyForm)
      setSuccess('Driver account created and bus assigned.')
      await load()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  async function remove(driver) {
    if (!window.confirm(`Remove ${driver.name}'s driver account and bus assignment?`)) return
    setError('')
    setSuccess('')
    try {
      await api.delete(`/admin/drivers/${driver.id}`)
      setSuccess('Driver account and bus assignment removed.')
      await load()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  return <>
    <div className="page-heading">
      <div>
        <h1 className="h2">Manage drivers</h1>
        <p className="text-secondary mb-0">Create driver sign-ins using mobile numbers and assign one bus to each driver.</p>
      </div>
    </div>
    <AlertMessage message={error} />
    <AlertMessage message={success} type="success" />
    <div className="card mb-4">
      <div className="card-body">
        <h2 className="h5">Register a driver</h2>
        {buses && availableBuses.length === 0
          ? <p className="mb-0">Create an unassigned bus before registering a driver.</p>
          : <form className="row g-3" onSubmit={submit}>
            <div className="col-md-6">
              <label className="form-label" htmlFor="driverName">Full name</label>
              <input id="driverName" className="form-control" maxLength="100" value={form.name}
                onChange={event => setForm({ ...form, name: event.target.value })} required />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="driverPhone">Mobile number</label>
              <input id="driverPhone" className="form-control" type="tel" autoComplete="tel"
                placeholder="+1 555 123 4567" value={form.phone}
                onChange={event => setForm({ ...form, phone: event.target.value })} required />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="driverPassword">Initial password</label>
              <input id="driverPassword" className="form-control" type="password" minLength="8" maxLength="72"
                autoComplete="new-password" value={form.password}
                onChange={event => setForm({ ...form, password: event.target.value })} required />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="driverBus">Assigned bus</label>
              <select id="driverBus" className="form-select" value={form.busId}
                onChange={event => setForm({ ...form, busId: event.target.value })} required>
                <option value="">Choose an unassigned bus</option>
                {availableBuses.map(bus =>
                  <option key={bus.id} value={bus.id}>{bus.busNumber} — {bus.routeName}</option>)}
              </select>
            </div>
            <div className="col-12">
              <button className="btn btn-primary" disabled={!buses}>Create driver account</button>
            </div>
          </form>}
      </div>
    </div>
    {!drivers || !buses
      ? <Loading />
      : <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead><tr><th>Driver</th><th>Mobile number / login</th><th>Assigned bus</th><th>Actions</th></tr></thead>
            <tbody>
              {drivers.map(driver => <tr key={driver.id}>
                <td>{driver.name}</td>
                <td>{driver.phone}</td>
                <td>{driver.busNumber}</td>
                <td><button className="btn btn-sm btn-outline-danger" onClick={() => remove(driver)}>Remove</button></td>
              </tr>)}
              {drivers.length === 0 && <tr><td colSpan="4" className="text-center text-secondary py-4">No drivers have been registered.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>}
    <div className="alert alert-info mt-3 mb-0">
      Give each driver their mobile number and initial password privately. The driver must sign in and explicitly allow phone GPS access before location is shared.
    </div>
  </>
}
