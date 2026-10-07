export default function StatusBadge({ status }) {
  const color = { ACTIVE: 'success', INACTIVE: 'secondary', BOOKED: 'primary', CANCELLED: 'danger' }[status] || 'secondary'
  return <span className={`badge text-bg-${color}`}>{status}</span>
}
