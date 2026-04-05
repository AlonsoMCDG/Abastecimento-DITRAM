import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "../assets/css/Layout.css";
import logoImg from "../assets/logo ditram - transparente branco.png";

import { useAuth } from "../auth/AuthContext";
import { ROUTES } from "../routes/routes";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: me, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const isActiveGroup = (startPath: string) => location.pathname.startsWith(startPath);

  const displayName = (() => {
    const first = (me?.first_name || "").trim();
    const last = (me?.last_name || "").trim();
    const full = `${first} ${last}`.trim();
    return full || me?.cpf || "Conta";
  })();

  return (
    <div className="layout-container">
      <nav className="navbar">
        <div className="navbar-content">
          <Link to="/home" className="brand-logo">
            <img 
              src={logoImg} 
              alt="Logo DiTraM" 
              className="navbar-logo-img" 
            />
          </Link>

          <ul className="nav-menu">
            <li>
              <Link to="/home" className={`nav-link ${isActive("/home") ? "active" : ""}`}>
                Home
              </Link>
            </li>

            {/* DOMÍNIO: ORGANIZAÇÃO */}
            <li className="nav-item">
              <button className={`nav-dropdown-btn ${isActiveGroup("/organizacao") ? "active" : ""}`}>
                Organização
              </button>
              <div className="nav-dropdown">
                <Link to={ROUTES.organizacao.secretarias.list} className="nav-dropdown-link">Secretarias</Link>
                <Link to={ROUTES.organizacao.instituicoes.list} className="nav-dropdown-link">Instituições</Link>
              </div>
            </li>

            {/* DOMÍNIO: FROTA E PESSOAS */}
            <li className="nav-item">
              <button className={`nav-dropdown-btn ${isActiveGroup("/frota") || isActiveGroup("/pessoas") ? "active" : ""}`}>
                Frota e Pessoas
              </button>
              <div className="nav-dropdown">
                <Link to={ROUTES.frota.veiculos.list} className="nav-dropdown-link">Veículos</Link>
                <Link to={ROUTES.frota.rotas.list} className="nav-dropdown-link">Rotas</Link>
                <Link to={ROUTES.pessoas.base.list} className="nav-dropdown-link">Motoristas / Operadores</Link>
              </div>
            </li>

            {/* DOMÍNIO: OPERAÇÃO */}
            <li className="nav-item">
              <button className={`nav-dropdown-btn ${isActiveGroup("/operacao") ? "active" : ""}`}>
                Operação
              </button>
              <div className="nav-dropdown">
                <Link to={ROUTES.operacao.guias.list} className="nav-dropdown-link">
                  Histórico de Guias
                </Link>
                <Link to={ROUTES.operacao.alocacoesServico.list} className="nav-dropdown-link">
                  Alocações de Serviço
                </Link>
                <Link to={ROUTES.operacao.operadoresVeiculo.list} className="nav-dropdown-link">
                  Operadores de Veículo
                </Link>
                <Link to={ROUTES.operacao.tiposServico.list} className="nav-dropdown-link">
                  Tipos de Serviço
                </Link>
              </div>
            </li>

            {/* SISTEMA (Admin) */}
            {me?.is_staff && (
              <li className="nav-item">
                <button className={`nav-dropdown-btn ${isActiveGroup("/usuarios") || isActiveGroup("/sistema") ? "active" : ""}`}>
                  Sistema
                </button>
                <div className="nav-dropdown">
                  <Link to={ROUTES.sistema.usuarios.list} className="nav-dropdown-link">Usuários</Link>
                  <Link to="/usuarios/permissoes" className="nav-dropdown-link">Permissões</Link>
                  {me?.is_superuser && (
                    <Link to={ROUTES.sistema.db} className="nav-dropdown-link danger-link">Banco de Dados</Link>
                  )}
                </div>
              </li>
            )}
          </ul>

          {/* ÁREA DE AÇÃO E PERFIL (Lado Direito) */}
          <div className="nav-actions-right">
            {/* O BOTÃO PRINCIPAL DE DESTAQUE */}
            <Link to={ROUTES.operacao.guias.create} className="nav-cta-btn" title="Nova Guia de Abastecimento">
              + Emitir Guia
            </Link>

            <div className="nav-item nav-account">
              <button className="nav-dropdown-btn nav-account-btn">
                {displayName}
              </button>
              <div className="nav-dropdown nav-dropdown-right">
                <Link to={ROUTES.sistema.perfil} className="nav-dropdown-link">Meu Perfil</Link>
                <button
                  type="button"
                  className="nav-dropdown-link nav-dropdown-action"
                  onClick={() => {
                    logout();
                    navigate("/login", { replace: true });
                  }}
                >
                  Sair
                </button>
              </div>
            </div>
          </div>

        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>&copy; 2026 Sistema de Abastecimento DITRAM. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}