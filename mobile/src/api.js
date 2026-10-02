import axios from 'axios';
import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// The Laravel backend runs on the dev machine's port 8000. Rather than hardcode
// an IP that goes stale whenever the Wi-Fi/DHCP lease changes, derive the host
// from the Metro bundler URL — in development the JS bundle is served from that
// same machine, so its URL carries the exact host the device can reach:
//   • physical device  -> the machine's LAN IP (e.g. 192.168.1.8)
//   • iOS simulator    -> localhost
//   • Android emulator -> 10.0.2.2
// Falls back to a fixed IP if the bundle URL isn't an http dev URL (release build).
const FALLBACK_HOST = '192.168.1.8';

function resolveHost() {
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL; // e.g. http://192.168.1.8:8081/index.bundle?...
    const match = typeof scriptURL === 'string' && scriptURL.match(/^https?:\/\/([^:/]+)/);
    if (match && match[1]) return match[1];
  } catch (e) {
    // ignore and use the fallback below
  }
  return FALLBACK_HOST;
}

export const API_HOST = resolveHost();

// Use the production Render backend when building the standalone APK,
// otherwise use the local dev machine IP for local Expo testing.
export const API_URL = __DEV__ 
  ? `http://${API_HOST}:8000/api` 
  : `https://pharmacy-system-z3dd.onrender.com/api`;

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

// When the server rejects our bearer token (a 401 on an authenticated request),
// the stored session is stale. Clear it and notify the app so it can send the
// user back to the login screen, instead of leaving them staring at screens full
// of silent "failed to load" errors. A 401 from /login is a bad-credentials
// response, not an expired session, so it is passed straight through for
// LoginScreen to display.
let onUnauthorized = null;
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    if (status === 401 && !url.includes('/login')) {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;
