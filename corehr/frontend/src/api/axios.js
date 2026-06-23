import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        if (!refresh) throw new Error('No refresh token')
        const res = await axios.post('/api/auth/refresh/', { refresh })
        const { access } = res.data
        localStorage.setItem('access_token', access)
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`
        original.headers.Authorization = `Bearer ${access}`
        return api(original)
      } catch (_) {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
