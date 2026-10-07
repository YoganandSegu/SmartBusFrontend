import { useEffect, useState } from 'react'
import api, { getErrorMessage } from '../services/api'
import AlertMessage from '../components/AlertMessage'
import Loading from '../components/Loading'

export default function StudentProfile() {
  const [student, setStudent] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api.get('/students/profile').then(response => setStudent(response.data)).catch(e => setError(getErrorMessage(e))) }, [])
  if (error) return <AlertMessage message={error} />
  if (!student) return <Loading />
  return <div className="card"><div className="card-body"><h1 className="h2 mb-4">Student profile</h1><dl className="row mb-0">
    <dt className="col-sm-3">Student ID</dt><dd className="col-sm-9">{student.studentId}</dd>
    <dt className="col-sm-3">Name</dt><dd className="col-sm-9">{student.name}</dd>
    <dt className="col-sm-3">Email</dt><dd className="col-sm-9">{student.email}</dd>
    <dt className="col-sm-3">Phone</dt><dd className="col-sm-9">{student.phone}</dd>
    <dt className="col-sm-3">Department</dt><dd className="col-sm-9">{student.department}</dd>
    <dt className="col-sm-3">Year</dt><dd className="col-sm-9">{student.year}</dd>
  </dl></div></div>
}
