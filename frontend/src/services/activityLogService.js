import API from './api';

export const getAllActivityLogs = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.requestId) params.append('requestId', filters.requestId);
  if (filters.action) params.append('action', filters.action);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const response = await API.get(`/activity-log?${params.toString()}`);
  return response.data;
};

export const getRequestActivityLogs = async (requestId) => {
  const response = await API.get(`/activity-log/${requestId}`);
  return response.data;
};