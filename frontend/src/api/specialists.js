import client from './client.js'

// Получить профиль специалиста по ID
export const getSpecialistById = (id) =>
  client.get(`/specialists/${id}`).then((r) => r.data)

// Получить профиль специалиста по userId
export const getSpecialistByUserId = (userId) =>
  client.get(`/specialists/user/${userId}`).then((r) => r.data)

// Создать профиль специалиста (только SPECIALIST)
export const createSpecialist = (data) =>
  client.post('/specialists', data).then((r) => r.data)

// Обновить профиль специалиста (только SPECIALIST)
export const updateSpecialist = (id, data) =>
  client.put(`/specialists/${id}`, data).then((r) => r.data)
