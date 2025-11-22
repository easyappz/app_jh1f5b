import instance from './axios';

export async function getCurrentMember() {
  const response = await instance.get('/api/members/me/');
  return response.data;
}

export async function updateCurrentMember(data) {
  const response = await instance.put('/api/members/me/', data);
  return response.data;
}
