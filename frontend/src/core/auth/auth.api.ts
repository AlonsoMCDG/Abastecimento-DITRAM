import { client } from '../api/apiClient';
import { ENDPOINTS } from "../api/endpoints";
import {
  ACCESS_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from "./auth.utils";


// Tipagem exata do que o Django Rest Framework (SimpleJWT) retorna
interface LoginResponse {
  access: string;
  refresh: string;
}

export const authApi = {
  login: async (cpf: string, password: string): Promise<LoginResponse> => {
    const response = await client.post<LoginResponse>(ENDPOINTS.auth.login, {
      cpf,
      password,
    });

    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, response.data.access);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, response.data.refresh);

    return response.data;
  }
};
