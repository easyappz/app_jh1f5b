import instance from './axios';

export async function fetchMessages() {
  const response = await instance.get('/api/chat/messages/');
  return response.data;
}

export async function sendMessage({ content }) {
  const response = await instance.post('/api/chat/messages/', {
    content,
  });
  return response.data;
}
