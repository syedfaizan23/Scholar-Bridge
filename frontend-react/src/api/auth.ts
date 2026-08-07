import API from './axios';

export const authAPI = {
  login:       (email: string, password: string) => API.post('/auth/login/', { email, password }),
  register:    (data: any) => API.post('/auth/register/', data),
  logout:      (refresh: string) => API.post('/auth/logout/', { refresh }),
  getProfile:  () => API.get('/auth/profile/'),
  updateProfile: (data: any) => API.patch('/auth/profile/', data),
  getDashboardStats: () => API.get('/auth/dashboard/stats/'),
  getAdminStats:     () => API.get('/auth/admin/dashboard/stats/'),
  getStudents:       (page = 1) => API.get(`/auth/admin/students/?page=${page}`),
  toggleStudent:     (id: number) => API.patch(`/auth/admin/students/${id}/toggle_active/`),
  deleteStudent:     (id: number) => API.delete(`/auth/admin/students/${id}/`),
};
