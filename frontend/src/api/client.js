import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore.js'

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Интерцептор запросов: добавляем JWT токен из Zustand store
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default client
