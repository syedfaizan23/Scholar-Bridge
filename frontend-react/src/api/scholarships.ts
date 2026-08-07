import API from './axios';

export const scholarshipAPI = {
  list:       (params?: any) => API.get('/scholarships/', { params }),
  get:        (id: number)   => API.get(`/scholarships/${id}/`),
  eligibility:(id: number)   => API.get(`/scholarships/${id}/check_eligibility/`),
  create:     (data: any)    => API.post('/scholarships/', data),
  update:     (id: number, data: any) => API.patch(`/scholarships/${id}/`, data),
  remove:     (id: number)   => API.delete(`/scholarships/${id}/`),
  getSaved:   ()             => API.get('/saved-scholarships/'),
  save:       (scholarship_id: number) => API.post('/saved-scholarships/', { scholarship_id }),
  unsave:     (scholarship_id: number) =>
    API.delete('/saved-scholarships/remove_by_scholarship/', { data: { scholarship_id } }),
};
