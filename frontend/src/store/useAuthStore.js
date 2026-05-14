import { create } from 'zustand'

function loadFromSession() {
  try {
    const token = sessionStorage.getItem('token')
    const user = JSON.parse(sessionStorage.getItem('user'))
    const specialistProfileId = sessionStorage.getItem('specialistProfileId')
    return {
      token: token ?? null,
      user: user ?? null,
      specialistProfileId: specialistProfileId ? Number(specialistProfileId) : null,
    }
  } catch {
    return { token: null, user: null, specialistProfileId: null }
  }
}

export const useAuthStore = create((set) => ({
  ...loadFromSession(),

  setAuth: (token, user, specialistProfileId = null) => {
    sessionStorage.setItem('token', token)
    sessionStorage.setItem('user', JSON.stringify(user))
    if (specialistProfileId != null) {
      sessionStorage.setItem('specialistProfileId', String(specialistProfileId))
    }
    set({ token, user, specialistProfileId })
  },

  setSpecialistProfileId: (id) => {
    sessionStorage.setItem('specialistProfileId', String(id))
    set({ specialistProfileId: id })
  },

  clearAuth: () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('specialistProfileId')
    set({ token: null, user: null, specialistProfileId: null })
  },
}))
