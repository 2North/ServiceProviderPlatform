import client from './client.js'

// Регистрация нового пользователя
export const register = (data) =>
  client.post('/auth/register', data).then((r) => r.data)

// Вход в систему
export const login = (data) =>
  client.post('/auth/login', data).then((r) => r.data)
