import axios, { AxiosInstance } from 'axios';

export function createHttp(baseURL?: string, headers?: Record<string, string>): AxiosInstance {
  const client = axios.create({ 
    baseURL, 
    headers, 
    timeout: 10000 
  });

  // Simple retry (2 lần) với delay tăng dần
  client.interceptors.response.use(undefined, async (error) => {
    const cfg: any = error.config || {};
    cfg.__retryCount = cfg.__retryCount || 0;
    
    if (cfg.__retryCount < 2 && (!error.response || error.response.status >= 500)) {
      cfg.__retryCount++;
      await new Promise(r => setTimeout(r, 300 * cfg.__retryCount));
      return client(cfg);
    }
    
    return Promise.reject(error);
  });

  return client;
}
