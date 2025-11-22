import axios from 'axios';

export const instance = axios.create({
  timeout: 30000,
  baseURL: '/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = window.localStorage.getItem('authToken');
      if (token) {
        if (!config.headers) {
          config.headers = {};
        }
        config.headers.Authorization = 'Token ' + token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);

    const errorData = {
      type: 'fetchError',
      url: error.config?.url,
      request: {
        headers: error.config?.headers,
        data: error.config?.data,
      },
      response: {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message,
      },
      pathname: window?.location?.pathname,
    };

    console.error('Глобальная ошибка:', errorData);

    window.parent.postMessage(errorData, '*');

    return Promise.reject(error);
  }
);

export default instance;
