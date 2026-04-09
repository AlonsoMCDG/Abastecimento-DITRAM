import axios, { type InternalAxiosRequestConfig } from "axios";
import { ACCESS_TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY, clearAuthTokens } from "../../auth/auth";

// Tipagem para a fila de requisições retidas
interface FailedQueueItem {
  resolve: (value: string | null) => void;
  reject: (reason?: any) => void;
}

// Tipagem estendida para evitar erro de TS no `_retry`
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Adiciona o token automaticamente em todas as chamadas
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Variáveis para gerenciar a fila de requisições
let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

// Processa a fila de requisições (fornece um novo token para todos ou null)
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor para tratar tokens expirados
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    
    // Deu erro de autorização (401) e é a primeira tentativa
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Se já estamos renovando o token, coloca esta requisição na fila
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

      // Se não tem o refresh, nem gasta rede. Corta direto.
      if (!refreshToken) {
        processQueue(new Error("Token de refresh inexistente"), null);
        clearAuthTokens(); // Garanta que essa função limpa tanto o access quanto o refresh no seu auth.ts
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY); 
        window.location.href = '/login';
        isRefreshing = false;
        return Promise.reject(error);
      }
      
      return new Promise((resolve, reject) => {
        // Usa uma nova instância (axios.post) em vez do 'client' para não cair em loop infinito
        axios.post(`${import.meta.env.VITE_API_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        })
          .then((res) => {
            const { access } = res.data;
            localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, access);
            
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access}`;
            }

            processQueue(null, access); // Libera a fila passando o novo token
            resolve(client(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null); // Rejeita toda a fila passando o erro
            clearAuthTokens();
            localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
            window.location.href = '/login';
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);