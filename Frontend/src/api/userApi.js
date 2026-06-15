import authApi from './authApi';

export const getUsers = async () => {
  const response = await authApi.get('/users');
  return response.data;
};

export const deactivateUser = async (userId) => {
  const response = await authApi.put(`/users/${userId}/deactivate`);
  return response.data;
};