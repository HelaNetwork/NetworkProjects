import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const analyzeRepository = async (repoUrl, mockId) => {
  const response = await api.post('/analyze', { repoUrl, mockId });
  return response.data;
};

export const queryCodebase = async (query, context) => {
  const response = await api.post('/query', { query, context });
  return response.data;
};

export default api;
