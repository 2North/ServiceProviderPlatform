import client from './client.js'

export const createReview = (data) =>
  client.post('/reviews', data).then(r => r.data)

export const getReviewsBySpecialist = (specialistId) =>
  client.get(`/reviews/specialist/${specialistId}`).then(r => r.data)
