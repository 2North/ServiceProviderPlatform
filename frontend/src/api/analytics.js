import client from './client.js'

export const getSpecialistAnalytics = (specialistId) =>
  client.get(`/analytics/specialist/${specialistId}`).then(r => r.data)
