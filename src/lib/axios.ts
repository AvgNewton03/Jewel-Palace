import axios from 'axios';
import { auth } from './firebase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    // Retrieve the latest token directly from localStorage right before the Axios call
    let token = localStorage.getItem('token');
    
    // Attempt to get a fresh token if the user is loaded
    if (auth.currentUser) {
      try {
        token = await auth.currentUser.getIdToken();
        if (token) {
          localStorage.setItem('token', token);
        }
      } catch (e) {
        console.error("Failed to get fresh token in interceptor", e);
      }
    }

    // Automatically attach the Authorization header to every request
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
