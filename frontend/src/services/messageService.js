import API from './api';

export const getMessages = async (requestId) => {
  const response = await API.get(`/messages/${requestId}`);
  return response.data;
};

export const sendMessage = async (requestId, text) => {
  const response = await API.post('/messages', { requestId, text });
  return response.data;
};