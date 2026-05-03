import { client } from '../api/apiClient';
import { ENDPOINTS } from "../api/endpoints";
import {
  ACCESS_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from "./auth.utils";
import { getApiErrorMessage } from "../api/errorHandlers"


// Tipagem exata do que o Django Rest Framework (SimpleJWT) retorna
interface LoginResponse {
  access: string;
  refresh: string;
}

export const authApi = {
  login: async (cpf: string, password: string): Promise<LoginResponse> => {
    try {
      // 3. Tipagem aplicada no método post e uso do Endpoint centralizado
      const response = await client.post<LoginResponse>(ENDPOINTS.auth.login, { 
        cpf, 
        password 
      });

      // Salva os tokens no localStorage
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, response.data.access);
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, response.data.refresh);

      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err));
    }
  }
};

