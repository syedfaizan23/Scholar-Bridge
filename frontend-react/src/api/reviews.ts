import API from './axios';

export const reviewAPI = {
  listPublic: (params?: any) => API.get('/reviews/', { params }),
  mine:   () => API.get('/reviews/mine/'),
  submit: (data: { rating: number; title: string; body: string }) => API.post('/reviews/', data),
  update: (id: number, data: any) => API.patch(`/reviews/${id}/`, data),
  remove: (id: number) => API.delete(`/reviews/${id}/`),
  listAdmin: (params?: any) => API.get('/reviews/', { params }),
  setApproved: (id: number, is_approved: boolean) => API.patch(`/reviews/${id}/`, { is_approved }),
};
