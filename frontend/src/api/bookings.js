import client from './client.js'

export const createBooking = (data) =>
  client.post('/bookings', data).then(r => r.data)

export const getBookingsByClient = (clientId) =>
  client.get(`/bookings/client/${clientId}`).then(r => r.data)

export const getBookingsBySpecialist = (specialistId) =>
  client.get(`/bookings/specialist/${specialistId}`).then(r => r.data)

export const updateBookingStatus = (bookingId, status) =>
  client.patch(`/bookings/${bookingId}/status`, null, { params: { status } }).then(r => r.data)
