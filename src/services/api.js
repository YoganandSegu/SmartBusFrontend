import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api' })

api.interceptors.request.use((config) => {
  const credentials = sessionStorage.getItem('smartbus.credentials')
  if (credentials) {
    const { username, password } = JSON.parse(credentials)
    const bytes = new TextEncoder().encode(`${username}:${password}`)
    const encoded = btoa(String.fromCharCode(...bytes))
    config.headers.Authorization = `Basic ${encoded}`
  }
  return config
})

export function getErrorMessage(error) {
  return error.response?.data?.message || error.message || 'The request could not be completed.'
}

export default api
