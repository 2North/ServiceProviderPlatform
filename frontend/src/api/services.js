import client from './client.js'

// Получить все услуги (постранично)
export const getAllServices = ({ page = 0, size = 9 } = {}) =>
    client.get('/services', { params: { page, size } }).then((r) => r.data)

// Получить услугу по ID
export const getServiceById = (id) =>
  client.get(`/services/${id}`).then((r) => r.data)

// Получить услуги специалиста
export const getServicesBySpecialist = (specialistId) =>
  client.get(`/services/specialist/${specialistId}`).then((r) => r.data)

// Получить услуги по категории (постранично)
export const getServicesByCategory = (categoryId, { page = 0, size = 9 } = {}) =>
  client.get(`/services/category/${categoryId}`, { params: { page, size } }).then((r) => r.data)

// Создать услугу (только SPECIALIST)
export const createService = (data) =>
  client.post('/services', data).then((r) => r.data)

// Обновить услугу (только SPECIALIST)
export const updateService = (id, data) =>
  client.put(`/services/${id}`, data).then((r) => r.data)

// Удалить услугу (только SPECIALIST)
export const deleteService = (id, specialistProfileId) =>
  client.delete(`/services/${id}`, { params: { specialistProfileId } })
