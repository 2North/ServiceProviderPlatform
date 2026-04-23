import client from './client.js'

// Получить все категории
export const getAllCategories = () =>
  client.get('/categories').then((r) => r.data)

// Получить категорию по ID
export const getCategoryById = (id) =>
  client.get(`/categories/${id}`).then((r) => r.data)
