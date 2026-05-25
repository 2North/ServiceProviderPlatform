import client from './client.js'

export const createPaymentIntent = (bookingId) =>
  client.post(`/bookings/${bookingId}/payment`).then(r => r.data)

export const getPayment = (paymentId) =>
  client.get(`/payments/${paymentId}`).then(r => r.data)

export const refundPayment = (paymentId, reason = '') =>
  client.post(`/payments/${paymentId}/refund`, null, { params: { reason } }).then(r => r.data)
