import API from './api';

export const submitRequest = async (formData) => {
  const response = await API.post('/requests', formData);
  return response.data;
};

export const getUserRequests = async () => {
  const response = await API.get('/requests/my');
  return response.data;
};

export const getRequestById = async (id) => {
  const response = await API.get(`/requests/${id}`);
  return response.data;
};

export const getAllRequests = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.category) params.append('category', filters.category);
  if (filters.urgency) params.append('urgency', filters.urgency);
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const response = await API.get(`/requests?${params.toString()}`);
  return response.data;
};

export const updateRequestStatus = async (id, statusData) => {
  const response = await API.patch(`/requests/${id}/status`, statusData);
  return response.data;
};
