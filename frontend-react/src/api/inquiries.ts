import API from './axios';

export const inquiryAPI = {
  submit: (data: { name: string; email: string; phone?: string; country?: string; subject: string; message: string }) =>
    API.post('/inquiries/', data),
  list:   (params?: any) => API.get('/inquiries/', { params }),
  updateStatus: (id: number, status: string) => API.patch(`/inquiries/${id}/`, { status }),
  remove: (id: number) => API.delete(`/inquiries/${id}/`),
};
