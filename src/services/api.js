
import axios from 'axios'

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach Basic Authentication credentials when available
api.interceptors.request.use(
  (config) => {
    const credentials = sessionStorage.getItem(
      'smartbus.credentials'
    )

    if (credentials) {
      try {
        const { username, password } = JSON.parse(credentials)

        const bytes = new TextEncoder().encode(
          `${username}:${password}`
        )

        let binary = ''
        bytes.forEach((byte) => {
          binary += String.fromCharCode(byte)
        })

        const encoded = btoa(binary)

        config.headers.set(
          'Authorization',
          `Basic ${encoded}`
        )
      } catch (error) {
        console.error(
          'Unable to read stored SmartBus credentials.',
          error
        )
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Extract a useful error message from API responses
export function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    'The request could not be completed.'
  )
}

export default api
