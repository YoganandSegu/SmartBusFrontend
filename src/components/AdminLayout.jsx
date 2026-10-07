import { NavLink, Outlet } from 'react-router-dom'

const links = [
  ['Dashboard', '/admin'],
  ['Manage buses', '/admin/buses'],
  ['Manage drivers', '/admin/drivers'],
  ['Manage routes', '/admin/routes'],
  ['Share bus location', '/admin/tracking'],
  ['View students', '/admin/students'],
  ['View bookings', '/admin/bookings'],
]

export default function AdminLayout() {
  return <div className="row g-4">
    <aside className="col-lg-3">
      <div className="card">
        <div className="card-body">
          <h2 className="h6 text-uppercase text-secondary">Administration</h2>
          <nav className="nav nav-pills flex-column gap-1">
            {links.map(([label, path], index) => <NavLink
              key={path}
              to={path}
              end={index === 0}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >{label}</NavLink>)}
          </nav>
        </div>
      </div>
    </aside>
    <section className="col-lg-9"><Outlet /></section>
  </div>
}
