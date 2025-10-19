import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: ({ token, user }) => set({ token, user }),
      clear: () => set({ token: null, user: null })
    }),
    {
      name: 'hrms-auth-store'
    }
  )
);

export const selectToken = () => useAuthStore.getState().token;
export const selectUser = () => useAuthStore.getState().user;