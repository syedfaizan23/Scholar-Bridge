import axios from 'axios';

// Relative path so it works the same whether the app is served on
// localhost, a LAN IP, or a real domain — see the "proxy" field in
// package.json for how this resolves in local dev.
const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  r => r,
  async err => {
    const orig = err.config;
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post('/api/auth/token/refresh/', { refresh });
          localStorage.setItem('access_token', data.access);
          orig.headers.Authorization = `Bearer ${data.access}`;
          return API(orig);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export default API;
