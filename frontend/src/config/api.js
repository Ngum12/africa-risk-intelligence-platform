// API configuration

export const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://africa-risk-api.onrender.com' 
  : 'http://localhost:8000';