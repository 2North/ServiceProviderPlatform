import client from './client.js'

export const getSpecialistAnalytics = (specialistId) =>
  client.get(`/analytics/specialist/${specialistId}`).then(r => r.data)

const base = (profileId) => `/specialists/${profileId}/analytics`

export const getRevenue = (profileId, from, to) =>
  client.get(`${base(profileId)}/revenue`, { params: { from, to } }).then(r => r.data)

export const getWorkload = (profileId, from, to) =>
  client.get(`${base(profileId)}/workload`, { params: { from, to } }).then(r => r.data)

export const getRatingHistory = (profileId, from, to) =>
  client.get(`${base(profileId)}/rating-history`, { params: { from, to } }).then(r => r.data)

export const getServicesBreakdown = (profileId) =>
  client.get(`${base(profileId)}/services-breakdown`).then(r => r.data)

export const getAnalyticsSummary = (profileId) =>
  client.get(`${base(profileId)}/summary`).then(r => r.data)
