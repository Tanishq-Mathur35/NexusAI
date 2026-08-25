import { create } from 'zustand';
import { analyticsService } from '../services/api.js';
const useAnalyticsStore = create((set) => ({
  overview: null, emotions: null, isLoading: false,
  fetchOverview: async () => { set({ isLoading: true }); try { const { data } = await analyticsService.overview(); set({ overview: data, isLoading: false }); } catch { set({ isLoading: false }); } },
  fetchEmotions: async () => { try { const { data } = await analyticsService.emotions(); set({ emotions: data }); } catch {} },
  fetchAll: async () => { set({ isLoading: true }); try { const [ov, em] = await Promise.all([analyticsService.overview(), analyticsService.emotions()]); set({ overview: ov.data, emotions: em.data, isLoading: false }); } catch { set({ isLoading: false }); } }
}));
export default useAnalyticsStore;
