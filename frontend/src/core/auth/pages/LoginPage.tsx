import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../auth.api';
import { useAuth } from '../useAuth';
import { isAuthenticated } from '../auth.utils';
import { getApiErrorMessage } from '../../api/errorHandlers';

import styles from './LoginPage.module.css';

export const LoginPage = () => {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  // Redireciona caso o usuário já tenha token ao acessar a tela de login
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const cpfDigits = cpf.replace(/\D/g, "");
      if (cpfDigits.length !== 11) {
        setErrorMsg("O CPF deve conter exatamente 11 dígitos.");
        setLoading(false);
        return;
      }

      // Tenta o login (salva token no localstorage)
      await authApi.login(cpfDigits, password);
      
      // Busca dados do usuário.
      await refreshUser(true);
      navigate('/home', { replace: true });
      
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error('Falha na autenticação', {
          endpoint: err.config?.url,
          status: err.response?.status,
          code: err.code,
        });
      }
      let message = getApiErrorMessage(err, "Falha ao realizar login.");
      
      // Tradução rápida para mensagens comuns do Django/SimpleJWT
      if (message.includes("No active account found")) {
        message = "CPF ou senha incorretos.";
      } else if (message.includes("User is inactive")) {
        message = "Sua conta está desativada. Entre em contato com o administrador.";
      }
      
      // Atualiza o estado para exibir na tela sem recarregar
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.header}>
          <h2>Acesso ao Sistema</h2>
          <p>Informe suas credenciais para continuar</p>
        </div>
        
        {errorMsg && (
          <div className={styles.errorBox}>
            <p className={styles.errorMessage}>{errorMsg}</p>
          </div>
        )}

        <div className={styles.inputGroup}>
          <label htmlFor="cpf" className={styles.label}>CPF</label>
          <input
            id="cpf"
            type="text"
            className={styles.input}
            placeholder="000.000.000-00"
            value={cpf}
            inputMode="numeric"
            onChange={(event) => setCpf(event.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>Senha</label>
          <input
            id="password"
            type="password"
            className={styles.input}
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className={`${styles.button} ${loading ? styles.buttonDisabled : ''}`}
        >
          {loading ? 'Autenticando...' : 'Entrar'}
        </button>

      </form>
    </div>
  );
};
