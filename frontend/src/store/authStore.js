import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios.js';
const useAuthStore = create(persist(
  (set, get) => ({
    user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false,
    login: async (email, password) => {
      set({ isLoading: true });
      try {
        const { data } = await api.post('/auth/login', { email, password });
        set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken, isAuthenticated: true, isLoading: false });
        return { success: true };
      } catch (e) { set({ isLoading: false }); return { success: false, error: e.response?.data?.error || 'Login failed' }; }
    },
    register: async (name, email, password) => {
      set({ isLoading: true });
      try {
        const { data } = await api.post('/auth/register', { name, email, password });
        set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken, isAuthenticated: true, isLoading: false });
        return { success: true };
      } catch (e) { set({ isLoading: false }); return { success: false, error: e.response?.data?.error || 'Registration failed' }; }
    },
    logout: async () => {
      try { await api.post('/auth/logout'); } catch {}
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
    },
    updateUser: (u) => set({ user: { ...get().user, ...u } })
  }),
  { name: 'auth-storage', partialize: s => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken, isAuthenticated: s.isAuthenticated }) }
));
export default useAuthStore;
