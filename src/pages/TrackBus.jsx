import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import api, { getErrorMessage } from '../services/api'
import AlertMessage from '../components/AlertMessage'

const LOCATION_REFRESH_INTERVAL_MS = 10_000

function MapCenter({ position }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(position, Math.max(map.getZoom(), 14), { duration: 0.5 })
  }, [map, position])
  return null
}

export default function TrackBus() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialDriverPhone = searchParams.get('driverPhone') || ''
  const initialBusNumber = searchParams.get('busNumber') || ''
  const [searchType, setSearchType] = useState(initialDriverPhone ? 'driver' : 'bus')
  const [searchValue, setSearchValue] = useState(initialDriverPhone || initialBusNumber)
  const [trackedSearch, setTrackedSearch] = useState({
    type: initialDriverPhone ? 'driver' : 'bus',
    value: initialDriverPhone || initialBusNumber.trim().toUpperCase(),
  })
  const [location, setLocation] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!trackedSearch.value) return undefined
    let active = true
    async function loadLocation() {
      try {
        const path = trackedSearch.type === 'driver'
          ? `/tracking/drivers/${encodeURIComponent(trackedSearch.value)}`
          : `/tracking/buses/${encodeURIComponent(trackedSearch.value)}`
        const response = await api.get(path)
        if (active) {
          setLocation(response.data)
          setError('')
        }
      } catch (requestError) {
        if (active) {
          setLocation(null)
          setError(getErrorMessage(requestError))
        }
      }
    }
    loadLocation()
    const interval = window.setInterval(loadLocation, LOCATION_REFRESH_INTERVAL_MS)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [trackedSearch])

  function submit(event) {
    event.preventDefault()
    const value = searchType === 'bus' ? searchValue.trim().toUpperCase() : searchValue.trim()
    setLocation(null)
    setError('')
    setTrackedSearch({ type: searchType, value })
    setSearchParams(value ? { [searchType === 'driver' ? 'driverPhone' : 'busNumber']: value } : {})
  }

  const stale = location && Date.now() - new Date(location.timestamp).getTime() > 60_000
  const position = location ? [location.latitude, location.longitude] : null

  return <>
    <div className="page-heading"><div>
      <h1 className="h2">Track a bus</h1>
      <p className="text-secondary mb-0">Search by bus number or by the mobile number registered to its driver.</p>
    </div></div>
    <form className="row g-2 mb-3" onSubmit={submit}>
      <div className="col-sm-4 col-md-3">
        <label htmlFor="trackSearchType" className="form-label">Search by</label>
        <select id="trackSearchType" className="form-select" value={searchType}
          onChange={event => setSearchType(event.target.value)}>
          <option value="bus">Bus number</option>
          <option value="driver">Driver mobile number</option>
        </select>
      </div>
      <div className="col-sm-8 col-md-5">
        <label htmlFor="trackSearchValue" className="form-label">
          {searchType === 'driver' ? 'Driver mobile number' : 'Bus number'}
        </label>
        <input id="trackSearchValue" className="form-control" value={searchValue}
          onChange={event => setSearchValue(event.target.value)}
          placeholder={searchType === 'driver' ? '+15551234567' : 'BUS-101'}
          type={searchType === 'driver' ? 'tel' : 'text'} required />
      </div>
      <div className="col-sm-4 col-md-3 d-flex align-items-end">
        <button className="btn btn-primary w-100" type="submit">Show location</button>
      </div>
    </form>
    {error && <AlertMessage message={error} />}
    {location && <>
      <div className={`alert ${stale ? 'alert-warning' : 'alert-success'}`}>
        <strong>{location.busNumber}</strong> · {stale ? 'Location may be out of date' : 'Latest location'}
        <span className="d-block small">Updated: {new Date(location.timestamp).toLocaleString()}</span>
      </div>
      <div className="card overflow-hidden">
        <MapContainer center={position} zoom={14} scrollWheelZoom className="bus-map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenter position={position} />
          <CircleMarker center={position} radius={10} pathOptions={{ color: '#155eef', fillColor: '#2e90fa', fillOpacity: 0.9 }}>
            <Popup>{location.busNumber}<br />{new Date(location.timestamp).toLocaleTimeString()}</Popup>
          </CircleMarker>
        </MapContainer>
      </div>
      <p className="small text-secondary mt-2">The map checks for location updates every 10 seconds. Coordinates: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</p>
    </>}
  </>
}
