import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/config/authApi';
import { useAuth } from '../../auth/AuthContext';
import { isAuthenticated } from '../../auth/auth';
import { getApiErrorMessage } from '../../api/config/errorHandlers';

export const LoginPage = () => {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  
  // 1. Extraímos o refreshUser do nosso estado global
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
        throw new Error("O CPF deve conter exatamente 11 dígitos.");
      }

      // 2. Realiza o login (salva os tokens no localStorage)
      await authApi.login(cpfDigits, password);
      
      // 3. MAGIA AQUI: Força o Contexto a buscar os dados do usuário (/me/) 
      // usando o token que acabou de ser salvo, populando a memória do React.
      await refreshUser();
      
      // 4. Só agora redirecionamos, com o estado global já atualizado!
      navigate('/home', { replace: true });
      
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err, "Falha ao realizar login."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Acesso ao Sistema</h2>
        
        {errorMsg && <p style={styles.error}>{errorMsg}</p>}

        <div style={styles.inputGroup}>
          <label htmlFor="cpf">CPF</label>
          <input
            id="cpf"
            type="text"
            placeholder="Apenas números (11 dígitos)"
            value={cpf}
            onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
            required
            maxLength={11} // Limita o input visualmente também
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          style={loading ? styles.buttonDisabled : styles.button}
        >
          {loading ? 'Autenticando...' : 'Entrar'}
        </button>

        <p style={styles.smallText}>
          Não tem cadastro? <Link to="/register">Criar conta</Link>
        </p>
      </form>
    </div>
  );
};

// Estilização básica inline para teste rápido
const styles: { [key: string]: React.CSSProperties } = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f5' },
  form: { padding: '2rem', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '350px' },
  inputGroup: { marginBottom: '1rem', display: 'flex', flexDirection: 'column' },
  error: { color: 'red', fontSize: '0.85rem', marginBottom: '1rem' },
  button: { padding: '0.8rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  buttonDisabled: { padding: '0.8rem', backgroundColor: '#ccc', border: 'none', borderRadius: '4px', cursor: 'not-allowed' },
  smallText: { marginTop: '1rem', fontSize: '0.9rem', textAlign: 'center' },
};