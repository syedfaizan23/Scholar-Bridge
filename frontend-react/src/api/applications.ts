import API from './axios';

export const applicationAPI = {
  list:   (params?: any) => API.get('/applications/', { params }),
  create: (data: any)    => API.post('/applications/', data),
  remove: (id: number)   => API.delete(`/applications/${id}/`),
  approve:(id: number, admin_notes?: string) =>
    API.patch(`/applications/${id}/approve/`, { admin_notes }),
  reject: (id: number, admin_notes?: string) =>
    API.patch(`/applications/${id}/reject/`, { admin_notes }),
  expireOverdue: () => API.post('/applications/expire_overdue/'),
  uploadChallan: (id: number, file: File) => {
    const fd = new FormData();
    fd.append('challan_image', file);
    return API.patch(`/applications/${id}/upload_challan/`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
