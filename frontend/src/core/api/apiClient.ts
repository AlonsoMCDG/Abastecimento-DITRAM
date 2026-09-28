import axios, { type InternalAxiosRequestConfig, type AxiosError } from "axios";

import {
  ACCESS_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  clearAuthTokens
} from "../auth/auth.utils";

import { ENDPOINTS } from "./endpoints";

// =====================================================
// TIPOS AUXILIARES
// =====================================================

// Fila de requisições retidas
interface FailedQueueItem {
  resolve: (value: string | null) => void;
  reject: (reason?: unknown) => void;
}
// Tipagem estendida para evitar erro de TS no `_retry`
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// =====================================================
// INSTÂNCIA PRINCIPAL
// =====================================================

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL.replace(/\/$/, ""),
  headers: {
    "Content-Type": "application/json",
  },
});

// =====================================================
// REQUEST INTERCEPTOR (JWT automático)
// =====================================================

// Adiciona o token automaticamente em todas as chamadas
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// =====================================================
// CONTROLE DE REFRESH TOKEN
// =====================================================

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

// Processa a fila de requisições (fornece um novo token para todos ou null)

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// =====================================================
// RESPONSE INTERCEPTOR (REFRESH TOKEN)
// =====================================================

// Interceptor para tratar tokens expirados
client.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    if (!error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as CustomAxiosRequestConfig;
    const url = originalRequest.url || "";

    // Se o erro 401 aconteceu na tentativa de login ou refresh, não fazemos nada aqui. 
    // Deixamos o erro chegar no catch() do componente (evita recarregar a página)
    if (url.includes("/login") || url.includes("/token/")) {
      return Promise.reject(error);
    }
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

      // Sem refresh token → logout direto
      if (!refreshToken) {
        processQueue(new Error("Token de refresh inexistente"), null);
        clearAuthTokens();
        window.location.href = ENDPOINTS.auth.login;
        isRefreshing = false;
        return Promise.reject(error);
      }

      return new Promise((resolve, reject) => {
        
        const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, "");
        const refreshUrl = `${baseUrl}${ENDPOINTS.auth.refresh}`;

        // Usa uma nova instância (axios.post) em vez do 'client' para não cair em loop infinito
        axios.post(refreshUrl, {
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
            window.location.href = ENDPOINTS.auth.login;
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