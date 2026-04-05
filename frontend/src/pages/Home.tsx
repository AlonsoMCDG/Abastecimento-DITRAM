import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { secretariaApi } from "../api/organizacao/secretariasApi";
import { ROUTES } from "../routes/routes";
import type { Secretaria } from "../types/models";
import { useAuth } from "../auth/AuthContext";
import "../assets/css/Home.css";

function normalizeSigla(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: me } = useAuth();

  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Tenta buscar no endpoint correto baseado na nova api (verifique se exportou listar em secretariasApi)
    secretariaApi.listar()
      .then((secRes) => {
        const data: any = secRes.data;
        const lista = Array.isArray(data) ? data : (data?.results || []);
        setSecretarias(lista);
      })
      .catch(() => setSecretarias([]))
      .finally(() => setLoading(false));
  }, [location.key]);

  const siglaToId = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of secretarias) {
      if (s.id && s.sigla) map.set(normalizeSigla(s.sigla), s.id);
    }
    return map;
  }, [secretarias]);

  const nome = useMemo(() => {
    const first = (me?.first_name || "").trim();
    const last = (me?.last_name || "").trim();
    return `${first} ${last}`.trim() || me?.cpf || "Operador";
  }, [me]);

  const goToGuiaCreate = (sigla?: string) => {
    if (!sigla) {
      navigate(ROUTES.operacao.guias.create);
      return;
    }
    
    // Fallback de SEMA para SEMAS caso o banco tenha a sigla diferente
    const id = siglaToId.get(sigla) || (sigla === "SEMA" ? siglaToId.get("SEMAS") : undefined);
    
    if (id) {
      navigate(`${ROUTES.operacao.guias.create}?secretaria=${id}`);
    } else {
      // Se não achar a secretaria, navega pro formulário limpo para evitar travar o usuário
      navigate(ROUTES.operacao.guias.create); 
    }
  };

  const atalhosSecretaria = [
    { sigla: "SEME", display: "Educação", badgeClass: "seme" },
    { sigla: "SAUDE", display: "Saúde", badgeClass: "saude" },
    { sigla: "SEMA", display: "Ação Social", badgeClass: "sema" },
    { sigla: "SEMAF", display: "Finanças", badgeClass: "semaf" },
  ];

  return (
    <div className="home">
      <div className="home-hero">
        <h1>Painel de Operações</h1>
        <p>Olá, <strong>{nome}</strong>. O que vamos fazer agora?</p>
        
        {/* Call To Action Principal GIGANTE no centro da tela */}
        <div className="hero-main-action" style={{ marginTop: "2rem" }}>
          <button 
            className="btn-primary-large" 
            onClick={() => goToGuiaCreate()}
            style={{ padding: "1rem 3rem", fontSize: "1.2rem", fontWeight: "bold", borderRadius: "8px", cursor: "pointer" }}
          >
            + Emitir Nova Guia de Abastecimento
          </button>
        </div>
      </div>

      <div className="home-section">
        <h2 className="home-section-title">Atalhos: Iniciar Guia por Secretaria</h2>
        <p style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "#666" }}>
          Clique em uma secretaria abaixo para abrir o formulário já pré-preenchido.
        </p>
        
        <div className="home-cards">
          {atalhosSecretaria.map((c) => (
            <button
              key={c.sigla}
              className="home-card"
              type="button"
              disabled={loading}
              onClick={() => goToGuiaCreate(c.sigla)}
              title={`Emitir guia para ${c.display}`}
            >
              <div className="home-card-head">
                <h3 className="home-card-title">{c.sigla}</h3>
                <span className={`home-card-badge ${c.badgeClass}`}>Nova Guia</span>
              </div>
              <p className="home-card-desc">Secretaria de {c.display}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="home-section">
        <h2 className="home-section-title">Acesso Rápido</h2>
        <div className="home-links">
          {/* O Histórico de Guias vem primeiro */}
          <Link className="home-link" to={ROUTES.operacao.guias.list}>
            📄 Histórico de Guias
          </Link>
          <Link className="home-link" to={ROUTES.frota.veiculos.list}>
            🚛 Veículos
          </Link>
          <Link className="home-link" to={ROUTES.pessoas.base.list}>
            👷 Motoristas / Operadores
          </Link>
          <Link className="home-link" to={ROUTES.organizacao.secretarias.list}>
            🏛️ Secretarias
          </Link>
          {me?.is_staff && (
            <Link className="home-link" to={ROUTES.sistema.usuarios.list}>
              ⚙️ Gerenciar Usuários
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}