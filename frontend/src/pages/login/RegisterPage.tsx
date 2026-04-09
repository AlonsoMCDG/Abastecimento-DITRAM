import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api/config/authApi";
import { usuarioApi } from "../../api/usuarios/usuariosApi";
import { useAuth } from "../../auth/AuthContext";
import { isAuthenticated } from "../../auth/auth";
import { getApiErrorMessage } from "../../api/config/errorHandlers";

import styles from "./RegisterPage.module.css";
import { IMaskInput } from "react-imask";

export function RegisterPage() {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  // Pegamos o refreshUser para atualizar o contexto após o cadastro/login
  const { refreshUser } = useAuth();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const cpfDigits = cpf.replace(/\D/g, "");
      if (cpfDigits.length !== 11) {
        throw new Error("O CPF deve conter exatamente 11 dígitos.");
      }

      // Registra o usuário
      await usuarioApi.registrar({
        cpf: cpfDigits,
        password,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        email: email || undefined,
      });

      // Faz o login automático
      await authApi.login(cpfDigits, password);
      
      // Atualiza o contexto do React com os dados do novo usuário
      await refreshUser();
      
      // Redireciona para a home
      navigate("/home", { replace: true });
      
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err, "Falha ao realizar cadastro."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.header}>
          <h2>Criar Conta</h2>
          <p>Preencha os dados para solicitar acesso</p>
        </div>

        {errorMsg && (
          <div className={styles.errorBox}>
            <p className={styles.errorMessage}>{errorMsg}</p>
          </div>
        )}

        <div className={styles.inputGroup}>
          <label htmlFor="cpf" className={styles.label}>CPF</label>
          <IMaskInput
            mask="000.000.000-00" // 0 representa números na IMask
            id="cpf"
            type="text"
            className={styles.input}
            placeholder="000.000.000-00"
            value={cpf}
            unmask={false} // false = mantém a máscara visualmente no value
            onAccept={(value) => setCpf(value)} // Na IMask usamos onAccept em vez de onChange
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

        {/* Agrupando Nome e Sobrenome lado a lado para otimizar espaço */}
        <div className={styles.rowGroup}>
          <div className={styles.inputGroup}>
            <label htmlFor="firstName" className={styles.label}>Primeiro nome</label>
            <input
              id="firstName"
              type="text"
              className={styles.input}
              placeholder="Ex: João"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="lastName" className={styles.label}>Sobrenome</label>
            <input
              id="lastName"
              type="text"
              className={styles.input}
              placeholder="Ex: Silva"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            id="email"
            type="email"
            className={styles.input}
            placeholder="joao@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`${styles.button} ${loading ? styles.buttonDisabled : ''}`}
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>

        <p className={styles.smallText}>
          Já tem conta? <Link to="/login" className={styles.link}>Entrar</Link>
        </p>
      </form>
    </div>
  );
}