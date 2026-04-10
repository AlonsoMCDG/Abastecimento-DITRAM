import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { secretariaApi } from "../api/organizacao/secretariasApi";
import { ROUTES } from "../routes/routes";
import type { Secretaria } from "../types/models";
import { useAuth } from "../auth/AuthContext";
import "../assets/css/Home.css";

// Remove acentos e padroniza para busca precisa
function normalizeSigla(s: string) {
  return s?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim() || "";
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: me } = useAuth();

  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError(false);
    secretariaApi.listar()
      .then((secRes) => {
        const data: any = secRes.data;
        const lista = Array.isArray(data) ? data : (data?.results || []);
        setSecretarias(lista);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [location.key]);

  const siglaToId = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of secretarias) {
      if (s.id && s.sigla) map.set(normalizeSigla(s.sigla), s.id);
    }
    return map;
  }, [secretarias]);

  const nomeUsuario = useMemo(() => {
    const first = (me?.first_name || "").trim();
    const last = (me?.last_name || "").trim();
    return `${first} ${last}`.trim() || me?.cpf || "Operador";
  }, [me]);

  const goToGuiaCreate = (siglaAlvo?: string) => {
    if (!siglaAlvo) {
      navigate(ROUTES.operacao.guias.create);
      return;
    }
    
    // Normaliza a sigla do clique para bater com a do mapa (ex: SAÚDE -> SAUDE)
    const id = siglaToId.get(normalizeSigla(siglaAlvo));
    
    if (id) {
      navigate(`${ROUTES.operacao.guias.create}?secretaria=${id}`);
    } else {
      console.warn(`ID não encontrado para a sigla: ${siglaAlvo}`);
      navigate(ROUTES.operacao.guias.create); 
    }
  };

  const atalhosSecretaria = [
    { sigla: "SEME", display: "Educação", icon: "📚", badgeClass: "seme" },
    { sigla: "SAÚDE", display: "Saúde", icon: "🏥", badgeClass: "saude" },
    { sigla: "SEMA", display: "Ação Social", icon: "🤝", badgeClass: "sema" },
    { sigla: "SEMAF", display: "Finanças", icon: "💰", badgeClass: "semaf" },
  ];

  return (
    <div className="home">
      <div className="home-hero">
        <h1>Painel de Operações</h1>
        <p>Olá, <strong>{nomeUsuario}</strong>. O que vamos fazer agora?</p>
        
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
        
        {error ? (
          <div className="home-error">
            <p>Não foi possível carregar as secretarias.</p>
            <button onClick={fetchData}>Tentar novamente</button>
          </div>
        ) : (
          <div className="home-cards">
            {loading ? (
              // Skeleton Loading
              [1, 2, 3, 4].map(i => <div key={i} className="home-card loading-skeleton" style={{ height: '120px' }}></div>)
            ) : (
              atalhosSecretaria.map((c) => (
                <button
                  key={c.sigla}
                  className="home-card"
                  type="button"
                  onClick={() => goToGuiaCreate(c.sigla)}
                  title={`Emitir guia para ${c.display}`}
                >
                  <div className="home-card-head">
                    {/* Alterado: Mostrar o Nome (display) no título */}
                    <h3 className="home-card-title">{c.display}</h3>
                    <span className={`home-card-badge ${c.badgeClass}`}>Nova Guia</span>
                  </div>
                  {/* Detalhe menor para a sigla */}
                  <p className="home-card-desc">Secretaria - {c.sigla}</p>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="home-section">
        <h2 className="home-section-title">Acesso Rápido</h2>
        <div className="home-links">
          <Link className="home-link" to={ROUTES.operacao.guias.list}>📄 Histórico de Guias</Link>
          <Link className="home-link" to={ROUTES.frota.veiculos.list}>🚛 Veículos</Link>
          <Link className="home-link" to={ROUTES.pessoas.base.list}>👷 Motoristas</Link>
          <Link className="home-link" to={ROUTES.organizacao.secretarias.list}>🏛️ Secretarias</Link>
          {me?.is_staff && (
            <Link className="home-link" to={ROUTES.sistema.usuarios.list}>⚙️ Usuários</Link>
          )}
        </div>
      </div>
    </div>
  );
}