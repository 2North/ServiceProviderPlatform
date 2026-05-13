import client from './client.js'

export const createOrder = (data) =>
  client.post('/orders', data).then(r => r.data)

export const getOpenOrders = () =>
  client.get('/orders').then(r => r.data)

export const getOrdersByClient = (clientId) =>
  client.get(`/orders/client/${clientId}`).then(r => r.data)

export const respondToOrder = (data) =>
  client.post('/orders/respond', data).then(r => r.data)

export const getOrderResponses = (orderId) =>
  client.get(`/orders/${orderId}/responses`).then(r => r.data)

export const acceptOrderResponse = (responseId) =>
  client.patch(`/orders/responses/${responseId}/accept`).then(r => r.data)
