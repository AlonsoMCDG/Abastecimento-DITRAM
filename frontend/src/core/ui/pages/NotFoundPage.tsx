import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.errorCode}>404</h1>
        <h2 style={styles.title}>Página não encontrada</h2>
        <p style={styles.message}>
          A página que você está procurando pode ter sido removida, mudado de nome
          ou está temporariamente indisponível.
        </p>
        <button 
          onClick={() => navigate("/")} 
          style={styles.button}
        >
          ← Voltar para o Início
        </button>
      </div>
    </div>
  );
}

// Estilos isolados para não depender de CSS externo nessa tela de erro
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f8fafc", // Fundo cinza bem clarinho (padrão do sistema)
    padding: "20px",
  },
  content: {
    textAlign: "center",
    maxWidth: "500px",
  },
  errorCode: {
    fontSize: "6rem",
    fontWeight: "bold",
    color: "#2563eb", // Azul primário
    margin: "0",
    lineHeight: "1",
  },
  title: {
    fontSize: "2rem",
    color: "#1e293b",
    marginTop: "1rem",
    marginBottom: "1rem",
  },
  message: {
    color: "#64748b",
    fontSize: "1.1rem",
    lineHeight: "1.5",
    marginBottom: "2rem",
  },
  button: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 24px",
    fontSize: "1rem",
    fontWeight: "600",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};