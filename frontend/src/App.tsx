import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layouts/Layout";
import Home from "./pages/Home";

// Imports (mantidos os nomes dos seus arquivos atuais)
import SecretariaFormPage from "./pages/cadastros/secretaria/SecretariaFormPage";
import SecretariaListPage from "./pages/cadastros/secretaria/SecretariaListPage";
import RotaListPage from "./pages/cadastros/rota/RotaListPage";
import RotaFormPage from "./pages/cadastros/rota/RotaFormPage";
import InstituicaoListPage from "./pages/cadastros/instituicao/InstituicaoListPage";
import InstituicaoFormPage from "./pages/cadastros/instituicao/InstituicaoFormPage";
import PessoaListPage from "./pages/frota/pessoa/PessoaListPage";
import PessoaFormPage from "./pages/frota/pessoa/PessoaFormPage";
import VeiculoListPage from "./pages/frota/veiculo/VeiculoListPage";
import VeiculoFormPage from "./pages/frota/veiculo/VeiculoFormPage";
import AlocacaoListPage from "./pages/frota/AlocacaoListPage";
import AlocacaoFormPage from "./pages/frota/AlocacaoFormPage";
import UsuarioListPage from "./pages/usuarios/UsuarioListPage";
import UsuarioFormPage from "./pages/usuarios/UsuarioFormPage";
import GuiaAbastecimentoListPage from "./pages/abastecimento/guias/GuiaAbastecimentoListPage";
import { GuiaAbastecimentoFormPage } from "./pages/abastecimento/guias/GuiaAbastecimentoFormPage";
import { LoginPage } from "./pages/login/LoginPage";
import { RegisterPage } from "./pages/login/RegisterPage";
import { PrivateRoute } from "./components/PrivateRoute";
import { isAuthenticated } from "./auth/auth";
import { RequirePermission } from "./components/RequirePermission";
import UsuariosPermissoesPage from "./pages/usuarios/UsuariosPermissoesPage";
import PerfilPage from "./pages/perfil/PerfilPage";
import PerfilEditPage from "./pages/perfil/PerfilEditPage";
import DatabaseDangerPage from "./pages/sistema/DatabaseDangerPage";
import OperadorListPage from "./pages/operacao/operadores/OperadorListPage";
import OperadorFormPage from "./pages/operacao/operadores/OperadorFormPage";

function FallbackRedirect() {
  return isAuthenticated() ? (
    <Navigate to="/home" replace />
  ) : (
    <Navigate to="/login" replace />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="home" replace />} />

            <Route path="home" element={<Home />} />

            {/* ==========================================
                SISTEMA E USUÁRIOS
                ========================================== */}
            <Route path="perfil" element={<PerfilPage />} />
            <Route path="perfil/editar" element={<PerfilEditPage />} />

            <Route
              path="sistema/banco"
              element={
                <RequirePermission allow={(me) => Boolean(me.is_superuser)}>
                  <DatabaseDangerPage />
                </RequirePermission>
              }
            />

            <Route path="usuarios">
              <Route
                index
                element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff)}>
                    <UsuarioListPage />
                  </RequirePermission>
                }
              />
              <Route
                path="criar"
                element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff)}>
                    <UsuarioFormPage />
                  </RequirePermission>
                }
              />
              <Route
                path="editar/:id"
                element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff)}>
                    <UsuarioFormPage />
                  </RequirePermission>
                }
              />
              <Route
                path="permissoes"
                element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff)}>
                    <UsuariosPermissoesPage />
                  </RequirePermission>
                }
              />
            </Route>

            {/* ==========================================
                1. PESSOAS
                ========================================== */}
            <Route path="pessoas">
              <Route index element={<PessoaListPage />} />
              <Route
                path="criar"
                element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_frota)}>
                    <PessoaFormPage />
                  </RequirePermission>
                }
              />
              <Route
                path="editar/:id"
                element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_frota)}>
                    <PessoaFormPage />
                  </RequirePermission>
                }
              />
            </Route>

            {/* ==========================================
                2. ORGANIZAÇÃO
                ========================================== */}
            <Route path="organizacao">
              <Route path="secretarias" element={<SecretariaListPage />} />
              <Route
                path="secretarias/criar"
                element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_cadastros)}>
                    <SecretariaFormPage />
                  </RequirePermission>
                }
              />
              <Route
                path="secretarias/editar/:id"
                element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_cadastros)}>
                    <SecretariaFormPage />
                  </RequirePermission>
                }
              />

              <Route path="instituicoes" element={<InstituicaoListPage />} />
              <Route
                path="instituicoes/criar"
                element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_cadastros)}>
                    <InstituicaoFormPage />
                  </RequirePermission>
                }
              />
              <Route
                path="instituicoes/editar/:id"
                element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_cadastros)}>
                    <InstituicaoFormPage />
                  </RequirePermission>
                }
              />
            </Route>

            {/* ==========================================
                3. FROTA
                ========================================== */}
            <Route path="frota">
              <Route path="veiculos" element={<VeiculoListPage />} />
              <Route
                path="veiculos/criar"
                element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_frota)}>
                    <VeiculoFormPage />
                  </RequirePermission>
                }
              />
              <Route
                path="veiculos/editar/:id"
                element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_frota)}>
                    <VeiculoFormPage />
                  </RequirePermission>
                }
              />

              <Route path="rotas" element={<RotaListPage />} />
              <Route
                path="rotas/criar"
                element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_cadastros)}>
                    <RotaFormPage />
                  </RequirePermission>
                }
              />
              <Route
                path="rotas/editar/:id"
                element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_cadastros)}>
                    <RotaFormPage />
                  </RequirePermission>
                }
              />
            </Route>

            {/* ==========================================
                4. OPERAÇÃO
                ========================================== */}
            <Route path="operacao">
              {/* Guias de Abastecimento */}
              <Route path="guias" element={<GuiaAbastecimentoListPage />} />
              <Route
                path="guias/criar"
                element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_create_guia_abastecimento)}>
                    <GuiaAbastecimentoFormPage />
                  </RequirePermission>
                }
              />
              <Route
                path="guias/editar/:id"
                element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_edit_guia_abastecimento)}>
                    <GuiaAbastecimentoFormPage />
                  </RequirePermission>
                }
              />

              {/* Alocações de Serviço */}
              <Route path="alocacoes" element={<AlocacaoListPage />} />
              <Route
                path="alocacoes/criar"
                element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_frota)}>
                    <AlocacaoFormPage />
                  </RequirePermission>
                }
              />
              <Route
                path="alocacoes/editar/:id"
                element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_frota)}>
                    <AlocacaoFormPage />
                  </RequirePermission>
                }
              />

              {/* Operadores de Veículo */}
              <Route path="operadores" element={<OperadorListPage />} />
              <Route
                path="operadores/criar"
                element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_frota)}>
                    <OperadorFormPage />
                  </RequirePermission>
                }
              />
              <Route
                path="operadores/editar/:id"
                element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_frota)}>
                    <OperadorFormPage />
                  </RequirePermission>
                }
              />
              
              {/* Nota: Quando você criar as páginas de Tipos de Serviço e Operadores de Veículo,
                  basta adicionar as rotas "tipos-servico" e "operadores" aqui dentro! */}
            </Route>

          </Route>
        </Route>

        <Route path="*" element={<FallbackRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;