import API from './api';

export const submitFeedback = async (data) => {
  const response = await API.post('/feedback', data);
  return response.data;
};

export const getFeedback = async (requestId) => {
  const response = await API.get(`/feedback/${requestId}`);
  return response.data;
};

export const updateFeedback = async (requestId, data) => {
  const response = await API.patch(`/feedback/${requestId}`, data);
  return response.data;
};

export const getUserFeedbacks = async () => {
  const response = await API.get('/feedback/user/all');
  return response.data;
};