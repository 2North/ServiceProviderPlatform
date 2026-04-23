import { create } from 'zustand'

// Zustand store для авторизации (только в памяти, без localStorage)
export const useAuthStore = create((set) => ({
  token: null,
  user: null, // { email, role }
  specialistProfileId: null, // ID профиля специалиста, если применимо

  // Сохранить данные после логина / регистрации
  setAuth: (token, user, specialistProfileId = null) =>
    set({ token, user, specialistProfileId }),

  // Установить ID профиля специалиста отдельно
  setSpecialistProfileId: (id) => set({ specialistProfileId: id }),

  // Очистить всё при выходе
  clearAuth: () => set({ token: null, user: null, specialistProfileId: null }),
}))
