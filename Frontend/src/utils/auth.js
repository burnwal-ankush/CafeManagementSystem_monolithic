export const getToken = () => localStorage.getItem('token');

export const setToken = (token) => localStorage.setItem('token', token);

export const removeToken = () => localStorage.removeItem('token');

export const isAuthenticated = () => !!getToken();

export const getUserRole = () => localStorage.getItem('role');

export const setUserRole = (role) => localStorage.setItem('role', role);

export const logout = () => {
  removeToken();
  localStorage.removeItem('role');
  localStorage.removeItem('user');
};