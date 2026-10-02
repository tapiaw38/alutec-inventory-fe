import axios from 'axios';

export const inventoryApi = axios.create({
  baseURL: import.meta.env.QCLI_API_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});
