import { useEffect, useRef, useState } from 'react'
import api, { getErrorMessage } from '../services/api'
import AlertMessage from '../components/AlertMessage'
import Loading from '../components/Loading'

const LOCATION_UPDATE_INTERVAL_MS = 10_000

export default function ShareBusLocation({ user }) {
  const [buses, setBuses] = useState(null)
  const [busId, setBusId] = useState('')
  const [sharing, setSharing] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [lastSent, setLastSent] = useState(null)
  const watchId = useRef(null)
  const sendIntervalId = useRef(null)
  const latestPosition = useRef(null)
  const sharingRef = useRef(false)
  const sendingRef = useRef(false)
  const firstFixSent = useRef(false)

  useEffect(() => {
    if (user?.role === 'DRIVER') {
      setBuses([{
        id: user.assignedBusId,
        busNumber: user.assignedBusNumber,
        routeName: 'Your assigned bus',
        status: 'ASSIGNED',
      }])
      setBusId(String(user.assignedBusId))
      return
    }
    api.get('/buses').then(response => setBuses(response.data))
      .catch(requestError => setError(getErrorMessage(requestError)))
  }, [user])

  useEffect(() => () => {
    if (watchId.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId.current)
    }
    if (sendIntervalId.current !== null) {
      window.clearInterval(sendIntervalId.current)
    }
    sharingRef.current = false
  }, [])

  function stopSharing() {
    sharingRef.current = false
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
    if (sendIntervalId.current !== null) {
      window.clearInterval(sendIntervalId.current)
      sendIntervalId.current = null
    }
    setSharing(false)
  }

  async function sendLatestLocation(endpoint) {
    if (!sharingRef.current || !latestPosition.current || sendingRef.current) return
    sendingRef.current = true
    try {
      const position = latestPosition.current
      const response = await api.put(endpoint, {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date(position.timestamp).toISOString(),
      })
      if (sharingRef.current) {
        setLastSent(response.data)
        setMessage(`Location shared for ${response.data.busNumber}. Next update in 10 seconds.`)
        setError('')
      }
    } catch (requestError) {
      if (sharingRef.current) {
        setError(getErrorMessage(requestError))
      }
    } finally {
      sendingRef.current = false
    }
  }

  function startSharing() {
    setError('')
    setMessage('')
    setLastSent(null)
    if (!busId) {
      setError('Select a bus first.')
      return
    }
    if (!navigator.geolocation) {
      setError('This browser does not support location sharing.')
      return
    }
    latestPosition.current = null
    firstFixSent.current = false
    sharingRef.current = true
    setSharing(true)
    setMessage('Waiting for phone location permission and GPS fix…')
    const endpoint = user?.role === 'DRIVER'
      ? '/tracking/driver/location'
      : `/tracking/buses/${busId}/location`
    sendIntervalId.current = window.setInterval(
      () => sendLatestLocation(endpoint),
      LOCATION_UPDATE_INTERVAL_MS,
    )
    watchId.current = navigator.geolocation.watchPosition(position => {
      latestPosition.current = position
      if (!firstFixSent.current) {
        firstFixSent.current = true
        void sendLatestLocation(endpoint)
      }
    }, locationError => {
      const messages = {
        1: 'Location permission was denied. Allow location access in the browser, then start sharing again.',
        2: 'The phone could not determine its current location. Check that Location Services are enabled.',
        3: 'The location request timed out. Try again in an area with a better GPS signal.',
      }
      setError(messages[locationError.code] || 'Could not read the phone location.')
      stopSharing()
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 })
  }

  const selectedBus = buses?.find(bus => String(bus.id) === busId)

  return <>
    <div className="page-heading"><div>
      <h1 className="h2">Share bus location</h1>
      <p className="text-secondary mb-0">
        {user?.role === 'DRIVER'
          ? `Share your phone's GPS location for bus ${user.assignedBusNumber}. Sharing only starts after you allow it.`
          : 'Use this phone’s location permission to send updates for a bus.'}
      </p>
    </div></div>
    <AlertMessage message={error} />
    <AlertMessage message={message} type="info" />
    <div className="card"><div className="card-body">
      {!buses ? <Loading /> : <>
        {user?.role === 'DRIVER'
          ? <p className="form-control-plaintext mb-3"><strong>Assigned bus:</strong> {user.assignedBusNumber}</p>
          : <>
            <label className="form-label" htmlFor="sharingBus">Bus</label>
            <select id="sharingBus" className="form-select mb-3" value={busId}
              onChange={event => setBusId(event.target.value)} disabled={sharing}>
              <option value="">Choose a bus</option>
              {buses.map(bus => <option key={bus.id} value={bus.id}>{bus.busNumber} — {bus.routeName} ({bus.status})</option>)}
            </select>
          </>}
        <div className="d-flex flex-wrap gap-2">
          {!sharing
            ? <button className="btn btn-primary" onClick={startSharing} disabled={!selectedBus}>Start sharing location</button>
            : <button className="btn btn-outline-danger" onClick={stopSharing}>Stop sharing</button>}
        </div>
      </>}
      {sharing && <p className="small text-secondary mt-3 mb-0">
        Keep this page open while sharing. The latest GPS fix is sent immediately, then once every 10 seconds. Your browser may ask you to allow location access.
      </p>}
      {lastSent && <div className="alert alert-light border mt-3 mb-0">
        <strong>Last sent:</strong> {lastSent.latitude.toFixed(5)}, {lastSent.longitude.toFixed(5)}
        <span className="d-block small text-secondary">{new Date(lastSent.timestamp).toLocaleString()}</span>
      </div>}
    </div></div>
    <div className="alert alert-warning mt-3">
      For phone location access, open the site over HTTPS or on localhost. The development server at another computer’s IP address may not be treated as a secure origin by the browser.
    </div>
  </>
}
