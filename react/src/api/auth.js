import instance from './axios';

export async function register({ username, password }) {
  const response = await instance.post('/api/members/register/', {
    username,
    password,
  });
  return response.data;
}

export async function login({ username, password }) {
  const response = await instance.post('/api/members/login/', {
    username,
    password,
  });
  return response.data;
}

export function logout() {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('authToken');
    window.localStorage.removeItem('currentMember');
  }
}
