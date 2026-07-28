export const getToken = () => localStorage.getItem('token');

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isLoggedIn = () => !!getToken();

export const getUserRole = () => {
  const user = getUser();
  return user ? user.role : null;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};