import client from './client.js'

export const createSlot = (data) =>
  client.post('/slots', data).then(r => r.data)

export const getAvailableSlots = (specialistId) =>
  client.get(`/slots/specialist/${specialistId}`).then(r => r.data)

export const getSlotsByDate = (specialistId, date) =>
  client.get(`/slots/specialist/${specialistId}/date/${date}`).then(r => r.data)
