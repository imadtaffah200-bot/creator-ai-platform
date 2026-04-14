import axios from 'axios'
import { toast } from 'react-hot-toast'
import { requestState } from './requestState'

const baseURL = import.meta.env.VITE_API_URL || 'https://creator-ai-platform-1.onrender.com'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    localStorage.setItem('creator-token', token)
  } else {
    delete api.defaults.headers.common.Authorization
    localStorage.removeItem('creator-token')
  }
}

const savedToken = localStorage.getItem('creator-token')
if (savedToken) {
  api.defaults.headers.common.Authorization = `Bearer ${savedToken}`
}

api.interceptors.request.use((config) => {
  requestState.start()
  return config
})

api.interceptors.response.use(
  (response) => {
    requestState.end()
    return response
  },
  (error) => {
    requestState.end()
    const detail = error?.response?.data?.detail
    if (typeof detail === 'string' && error?.response?.status !== 401) {
      toast.error(detail)
    }
    return Promise.reject(error)
  },
)

export const authStorage = {
  getToken: () => localStorage.getItem('creator-token'),
  setToken: (token: string) => {
    localStorage.setItem('creator-token', token)
    setAuthToken(token)
  },
  clear: () => {
    localStorage.removeItem('creator-token')
    setAuthToken(null)
  },
}
