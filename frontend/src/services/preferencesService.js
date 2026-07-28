import API from './api';

export const getPreferences = async () => {
  const response = await API.get('/preferences');
  return response.data;
};

export const updatePreferences = async (data) => {
  const response = await API.patch('/preferences', data);
  return response.data;
};