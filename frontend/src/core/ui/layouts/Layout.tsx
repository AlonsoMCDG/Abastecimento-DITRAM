import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./Layout.css"
import logoImg from "../../assets/logo ditram - transparente branco.png"

import { useAuth } from "../../auth/useAuth";
import { ROUTES } from "../../routes/routes";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: me, logout } = useAuth();

  // Estado para controle dos dropdowns no mobile
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  const isActiveGroup = (startPath: string) => location.pathname.startsWith(startPath);

  const displayName = (() => {
    const first = (me?.first_name || "").trim();
    const last = (me?.last_name || "").trim();
    const full = `${first} ${last}`.trim();
    return full || me?.cpf || "Conta";
  })();

  // Funções de controle
  const toggleDropdown = (menuName: string) => {
    setOpenDropdown(prev => prev === menuName ? null : menuName);
  };

  const closeDropdowns = () => {
    setOpenDropdown(null);
  };

  const closeAllMenus = () => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="layout-container">
      <nav className="navbar">
        <div className="navbar-content">

          {/* Cabeçalho Mobile (Sempre visível) */}
          <div className="navbar-mobile-header">
            <Link to="/home" className="brand-logo" onClick={closeAllMenus}>
              <img src={logoImg} alt="Logo DiTraM" className="navbar-logo-img" />
            </Link>

            {/* Botão Sanduíche */}
            <button 
              className="mobile-menu-toggle" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Abrir menu"
            >
              {isMobileMenuOpen ? (
                /* Ícone de Fechar (X) */
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                /* Ícone Hamburguer */
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>

          {/* Área Colapsável (Oculta no mobile até clicar no botão) */}
          <div className={`navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`}>
            <ul className="nav-menu">
              <li>
                <Link to="/home"
                  className={`nav-link ${isActive("/home") ? "active" : ""}`} 
                  onClick={closeDropdowns}
                >
                  Home
                </Link>
              </li>

              {/* OPERAÇÃO */}
              <li className="nav-item">
                <button 
                  className={`nav-dropdown-btn ${isActiveGroup("/operacao") ? "active" : ""}`}
                  onClick={() => toggleDropdown("operacao")}
                >
                  Operação
                </button>
                <div className={`nav-dropdown ${openDropdown === "operacao" ? "mobile-open" : ""}`}>
                  <Link to={ROUTES.operacao.guias.list} className="nav-dropdown-link" onClick={closeDropdowns}>Histórico de Guias</Link>
                  <Link to={ROUTES.operacao.tiposAtividade.list} className="nav-dropdown-link" onClick={closeDropdowns}>Tipos de Serviço</Link>
                </div>
              </li>

              {/* FROTA E PESSOAS */}
              <li className="nav-item">
                <button 
                  className={`nav-dropdown-btn ${isActiveGroup("/frota") || isActiveGroup("/pessoas") ? "active" : ""}`}
                  onClick={() => toggleDropdown("frota")}
                >
                  Frota e Pessoas
                </button>
                <div className={`nav-dropdown ${openDropdown === "frota" ? "mobile-open" : ""}`}>
                  <Link to={ROUTES.frota.veiculos.list} className="nav-dropdown-link" onClick={closeDropdowns}>Veículos</Link>
                  <Link to={ROUTES.frota.rotas.list} className="nav-dropdown-link" onClick={closeDropdowns}>Rotas</Link>
                  <Link to={ROUTES.pessoas.base.list} className="nav-dropdown-link" onClick={closeDropdowns}>Motoristas / Operadores</Link>
                </div>
              </li>
              
              {/* ORGANIZAÇÃO */}
              <li className="nav-item">
                <button 
                  className={`nav-dropdown-btn ${isActiveGroup("/organizacao") ? "active" : ""}`}
                  onClick={() => toggleDropdown("organizacao")}
                >
                  Organização
                </button>
                <div className={`nav-dropdown ${openDropdown === "organizacao" ? "mobile-open" : ""}`}>
                  <Link to={ROUTES.organizacao.secretarias.list} className="nav-dropdown-link" onClick={closeDropdowns}>Secretarias</Link>
                  <Link to={ROUTES.organizacao.instituicoes.list} className="nav-dropdown-link" onClick={closeDropdowns}>Instituições</Link>
                </div>
              </li>

              {/* SISTEMA (Admin) */}
              {me?.is_staff && (
                <li className="nav-item">
                  <button 
                    className={`nav-dropdown-btn ${isActiveGroup("/usuarios") || isActiveGroup("/sistema") ? "active" : ""}`}
                    onClick={() => toggleDropdown("sistema")}
                  >
                    Sistema
                  </button>
                  
                  <div className={`nav-dropdown ${openDropdown === "sistema" ? "mobile-open" : ""}`}>
                    <Link to={ROUTES.sistema.usuarios.list} className="nav-dropdown-link" onClick={closeDropdowns}>
                      Usuários
                    </Link>
                    <Link to="/usuarios/permissoes" className="nav-dropdown-link" onClick={closeDropdowns}>
                      Permissões
                    </Link>
                    {me?.is_superuser && (
                      <Link to={ROUTES.sistema.db} className="nav-dropdown-link danger-link" onClick={closeDropdowns}>Banco de Dados</Link>
                    )}
                  </div>
                </li>
              )}
            </ul>

            {/* ÁREA DE AÇÃO E PERFIL (Lado Direito Isolado) */}
            <div className="nav-actions-right">
              <Link to={ROUTES.operacao.guias.create} className="nav-cta-btn" title="Nova Guia de Abastecimento">
                + Emitir Guia
              </Link>

              <div className="nav-item nav-account">
                <button 
                  className="nav-dropdown-btn nav-account-btn"
                  onClick={() => toggleDropdown("conta")}
                >
                  {displayName}
                </button>
                <div className={`nav-dropdown nav-dropdown-right ${openDropdown === "conta" ? "mobile-open" : ""}`}>
                  <Link to={ROUTES.sistema.perfil} className="nav-dropdown-link" onClick={closeDropdowns}>
                    Meu Perfil
                  </Link>
                  <button
                    type="button"
                    className="nav-dropdown-link nav-dropdown-action"
                    onClick={() => {
                      closeDropdowns();
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
          {/* Fim da Área Colapsável */}

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