import { useEffect, useState } from 'react'
import api, { getErrorMessage } from '../services/api'
import AlertMessage from '../components/AlertMessage'
import Loading from '../components/Loading'

export default function Students() {
  const [students, setStudents] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api.get('/students').then(response => setStudents(response.data)).catch(e => setError(getErrorMessage(e))) }, [])
  return <>
    <div className="page-heading"><div><h1 className="h2">Students</h1><p className="text-secondary mb-0">Registered student transport accounts.</p></div></div>
    <AlertMessage message={error} />
    {!students ? <Loading /> : <div className="card"><div className="table-responsive"><table className="table table-hover mb-0"><thead><tr><th>Student ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Department</th><th>Year</th></tr></thead>
      <tbody>{students.map(student => <tr key={student.id}><td>{student.studentId}</td><td>{student.name}</td><td>{student.email}</td><td>{student.phone}</td><td>{student.department}</td><td>{student.year}</td></tr>)}
        {students.length === 0 && <tr><td colSpan="6" className="text-center text-secondary py-4">No students registered.</td></tr>}</tbody></table></div></div>}
  </>
}
