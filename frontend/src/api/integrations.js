import client from './client.js'

export const getGoogleStatus = () =>
  client.get('/integrations/google/status').then(r => r.data)

export const getGoogleAuthUrl = () =>
  client.get('/integrations/google/auth-url').then(r => r.data)

export const disconnectGoogle = () =>
  client.delete('/integrations/google').then(r => r.data)
