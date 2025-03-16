
import axios from 'axios';

export const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // This enables sending cookies with requests
});
