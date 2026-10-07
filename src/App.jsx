import { lazy, Suspense, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/StudentDashboard'
import BusList from './pages/BusList'
import BusDetails from './pages/BusDetails'
import RouteList from './pages/RouteList'
import SeatBooking from './pages/SeatBooking'
import MyBooking from './pages/MyBooking'
import StudentProfile from './pages/StudentProfile'
import AdminDashboard from './pages/AdminDashboard'
import ManageBuses from './pages/ManageBuses'
import ManageRoutes from './pages/ManageRoutes'
import Students from './pages/Students'
import Bookings from './pages/Bookings'
import ManageDrivers from './pages/ManageDrivers'
import Loading from './components/Loading'

const TrackBus = lazy(() => import('./pages/TrackBus'))
const ShareBusLocation = lazy(() => import('./pages/ShareBusLocation'))

function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem('smartbus.user'))
  } catch {
    return null
  }
}

function ProtectedRoute({ user, role, children }) {
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) {
    const destination = user.role === 'ADMIN' ? '/admin' : user.role === 'DRIVER' ? '/driver/tracking' : '/student'
    return <Navigate to={destination} replace />
  }
  return children
}

function App() {
  const [user, setUser] = useState(readSession)
  const navigate = useNavigate()

  function signOut() {
    sessionStorage.removeItem('smartbus.user')
    sessionStorage.removeItem('smartbus.credentials')
    setUser(null)
    navigate('/login')
  }

  const home = user ? (user.role === 'ADMIN' ? '/admin' : user.role === 'DRIVER' ? '/driver/tracking' : '/student') : '/login'

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark app-navbar">
        <div className="container">
          <Link className="navbar-brand fw-bold" to={home}>SmartBus</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="mainNav">
            {user && <div className="navbar-nav me-auto">
              {user.role === 'STUDENT' ? <>
                <Link className="nav-link" to="/student">Dashboard</Link>
                <Link className="nav-link" to="/buses">Buses</Link>
                <Link className="nav-link" to="/routes">Routes</Link>
                <Link className="nav-link" to="/track">Track a bus</Link>
                <Link className="nav-link" to="/my-booking">My booking</Link>
                <Link className="nav-link" to="/profile">Profile</Link>
              </> : user.role === 'DRIVER' ? <Link className="nav-link" to="/driver/tracking">Share location</Link> : null}
            </div>}
            {user
              ? <button className="btn btn-outline-light btn-sm" onClick={signOut}>Sign out</button>
              : <div className="navbar-nav ms-auto">
                <Link className="nav-link" to="/login">Login</Link>
                <Link className="nav-link" to="/register">Register</Link>
              </div>}
          </div>
        </div>
      </nav>
      <main className="container py-4">
        <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to={home} replace />} />
          <Route path="/login" element={user ? <Navigate to={home} replace /> : <Login onLogin={setUser} />} />
          <Route path="/register" element={user ? <Navigate to={home} replace /> : <Register />} />
          <Route path="/student" element={<ProtectedRoute user={user} role="STUDENT"><StudentDashboard user={user} /></ProtectedRoute>} />
          <Route path="/buses" element={<ProtectedRoute user={user} role="STUDENT"><BusList /></ProtectedRoute>} />
          <Route path="/buses/:id" element={<ProtectedRoute user={user} role="STUDENT"><BusDetails /></ProtectedRoute>} />
          <Route path="/routes" element={<ProtectedRoute user={user} role="STUDENT"><RouteList /></ProtectedRoute>} />
          <Route path="/track" element={<ProtectedRoute user={user} role="STUDENT"><TrackBus /></ProtectedRoute>} />
          <Route path="/driver/tracking" element={<ProtectedRoute user={user} role="DRIVER"><ShareBusLocation user={user} /></ProtectedRoute>} />
          <Route path="/book/:busId" element={<ProtectedRoute user={user} role="STUDENT"><SeatBooking user={user} /></ProtectedRoute>} />
          <Route path="/my-booking" element={<ProtectedRoute user={user} role="STUDENT"><MyBooking user={user} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute user={user} role="STUDENT"><StudentProfile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute user={user} role="ADMIN"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="buses" element={<ManageBuses />} />
            <Route path="routes" element={<ManageRoutes />} />
            <Route path="tracking" element={<ShareBusLocation />} />
            <Route path="drivers" element={<ManageDrivers />} />
            <Route path="students" element={<Students />} />
            <Route path="bookings" element={<Bookings />} />
          </Route>
          <Route path="*" element={<section className="alert alert-warning">Page not found.</section>} />
        </Routes>
        </Suspense>
      </main>
      <footer className="text-center text-secondary py-4 small">Smart College Transport Management System</footer>
    </>
  )
}

export default App
