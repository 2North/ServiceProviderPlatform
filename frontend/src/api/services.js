import client from './client.js'

// Получить все услуги
export const getAllServices = () =>
  client.get('/services').then((r) => r.data)

// Получить услугу по ID
export const getServiceById = (id) =>
  client.get(`/services/${id}`).then((r) => r.data)

// Получить услуги специалиста
export const getServicesBySpecialist = (specialistId) =>
  client.get(`/services/specialist/${specialistId}`).then((r) => r.data)

// Получить услуги по категории
export const getServicesByCategory = (categoryId) =>
  client.get(`/services/category/${categoryId}`).then((r) => r.data)

// Создать услугу (только SPECIALIST)
export const createService = (data) =>
  client.post('/services', data).then((r) => r.data)

// Обновить услугу (только SPECIALIST)
export const updateService = (id, data) =>
  client.put(`/services/${id}`, data).then((r) => r.data)

// Удалить услугу (только SPECIALIST)
export const deleteService = (id) =>
  client.delete(`/services/${id}`)
