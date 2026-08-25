import axios from 'axios';
const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use((config) => {
  try {
    const s = JSON.parse(localStorage.getItem('auth-storage'));
    if (s?.state?.accessToken) config.headers.Authorization = `Bearer ${s.state.accessToken}`;
  } catch {}
  return config;
});
api.interceptors.response.use(r => r, async (error) => {
  const orig = error.config;
  if (error.response?.status === 401 && !orig._retry) {
    orig._retry = true;
    try {
      const s = JSON.parse(localStorage.getItem('auth-storage'));
      if (s?.state?.refreshToken) {
        const { data } = await axios.post('/api/auth/refresh', { refreshToken: s.state.refreshToken });
        s.state.accessToken = data.accessToken; s.state.refreshToken = data.refreshToken;
        localStorage.setItem('auth-storage', JSON.stringify(s));
        orig.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(orig);
      }
    } catch { localStorage.removeItem('auth-storage'); window.location.href = '/login'; }
  }
  return Promise.reject(error);
});
export default api;
