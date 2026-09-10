import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In Expo, 10.0.2.2 is Android emulator localhost, 
// but since the user tests on a physical device via LAN, we use the local IP.
export const API_URL = 'http://192.168.1.2:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
