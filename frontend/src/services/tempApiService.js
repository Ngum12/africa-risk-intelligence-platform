// Create a simpler API service temporarily

import axios from 'axios';
import { API_URL } from './config';

const API_BASE_URL = API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const RiskApi = {
  // Add only core methods here
  getHotspots: () => {
    return api.get('/api/risk-hotspots');
  },
  
  // Add other methods as needed, one by one
};

export default RiskApi;