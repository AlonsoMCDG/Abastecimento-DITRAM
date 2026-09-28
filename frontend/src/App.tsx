import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./core/ui/layouts/Layout";
import Home from "./core/ui/pages/Home";

// ================= DOMÍNIOS =================
import SecretariaFormPage from "./domains/organizacao/secretarias/pages/SecretariaFormPage";
import SecretariaListPage from "./domains/organizacao/secretarias/pages/SecretariaListPage";
import InstituicaoListPage from "./domains/organizacao/instituicoes/pages/InstituicaoListPage";
import InstituicaoFormPage from "./domains/organizacao/instituicoes/pages/InstituicaoFormPage";

import RotaListPage from "./domains/frota/rotas/pages/RotaListPage";
import RotaFormPage from "./domains/frota/rotas/pages/RotaFormPage";
import VeiculoListPage from "./domains/frota/veiculos/pages/VeiculoListPage";
import VeiculoFormPage from "./domains/frota/veiculos/pages/VeiculoFormPage";
import TipoCombustivelListPage from "./domains/frota/tipos-combustivel/pages/TipoCombustivelListPage";
import TipoCombustivelFormPage from "./domains/frota/tipos-combustivel/pages/TipoCombustivelFormPage";

import PessoaListPage from "./domains/pessoas/pages/PessoaListPage";
import PessoaFormPage from "./domains/pessoas/pages/PessoaFormPage";

import GuiaAbastecimentoListPage from "./domains/operacao/guias/pages/GuiaAbastecimentoListPage";
import GuiaAbastecimentoFormPage from "./domains/operacao/guias/pages/GuiaAbastecimentoFormPage";
import TipoAtividadeListPage from "./domains/operacao/tipos-atividade/pages/TipoAtividadeListPage";
import TipoAtividadeFormPage from "./domains/operacao/tipos-atividade/pages/TipoAtividadeFormPage";
import RelatoriosPage from "./domains/operacao/relatorios/pages/RelatoriosPage";

import UsuarioListPage from "./domains/sistema/usuarios/pages/UsuarioListPage";
import UsuarioFormPage from "./domains/sistema/usuarios/pages/UsuarioFormPage";
import UsuariosPermissoesPage from "./domains/sistema/usuarios/pages/UsuariosPermissoesPage";
import PerfilPage from "./domains/sistema/perfil/pages/PerfilPage";
import PerfilEditPage from "./domains/sistema/perfil/pages/PerfilEditPage";
import DatabaseDangerPage from "./domains/system/database/pages/DatabaseDangerPage";

// ================= CORE & AUTH =================
import { LoginPage } from "./core/auth/pages/LoginPage";
import { RegisterPage } from "./core/auth/pages/RegisterPage";
import { PrivateRoute } from "./core/auth/components/PrivateRoute";
import { RequirePermission } from "./core/auth/components/RequirePermission";
import NotFoundPage from "./core/ui/pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ==========================================
            ROTAS PRIVADAS (Requerem Login)
            ========================================== */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<Home />} />

            {/* ====== SISTEMA E USUÁRIOS ====== */}
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
              <Route index element={
                                      <UsuarioListPage />
                }
              />
              <Route path="criar" element={
                                      <UsuarioFormPage />
                }
              />
              <Route path="editar/:id" element={
                                      <UsuarioFormPage />
                }
              />
              <Route path="permissoes" element={
                                      <UsuariosPermissoesPage />
                }
              />
            </Route>

            {/* ====== 1. PESSOAS ====== */}
            <Route path="pessoas">
              <Route index element={<PessoaListPage />} />
              <Route path="criar" element={
                                      <PessoaFormPage />
                }
              />
              <Route path="editar/:id" element={
                                      <PessoaFormPage />
                }
              />
            </Route>

            {/* ====== 2. ORGANIZAÇÃO ====== */}
            <Route path="organizacao">
              <Route path="secretarias" element={<SecretariaListPage />} />
              <Route path="secretarias/criar" element={
                                      <SecretariaFormPage />
                }
              />
              <Route path="secretarias/editar/:id" element={
                                      <SecretariaFormPage />
                }
              />

              <Route path="instituicoes" element={<InstituicaoListPage />} />
              <Route path="instituicoes/criar" element={
                                      <InstituicaoFormPage />
                }
              />
              <Route path="instituicoes/editar/:id" element={
                                      <InstituicaoFormPage />
                }
              />
            </Route>

            {/* ====== 3. FROTA ====== */}
            <Route path="frota">
              {/* Veículos */}
              <Route path="veiculos" element={<VeiculoListPage />} />
              <Route path="veiculos/criar" element={
                                      <VeiculoFormPage />
                }
              />
              <Route path="veiculos/editar/:id" element={
                                      <VeiculoFormPage />
                }
              />

              {/* Rotas */}
              <Route path="rotas" element={<RotaListPage />} />
              <Route path="rotas/criar" element={
                                      <RotaFormPage />
                }
              />
              <Route path="rotas/editar/:id" element={
                                      <RotaFormPage />
                }
              />

              {/* Tipos de Combustível */}
              <Route path="tipos-combustivel" element={<TipoCombustivelListPage />} />
              <Route path="tipos-combustivel/criar" element={
                                      <TipoCombustivelFormPage />
                }
              />
              <Route path="tipos-combustivel/editar/:id" element={
                                      <TipoCombustivelFormPage />
                }
              />
            </Route>

            {/* ====== 4. OPERAÇÃO ====== */}
            <Route path="operacao">
              {/* Guias de Abastecimento */}
              <Route path="guias" element={<GuiaAbastecimentoListPage />} />
              <Route path="guias/criar" element={
                                      <GuiaAbastecimentoFormPage />
                }
              />
              <Route path="guias/editar/:id" element={
                                      <GuiaAbastecimentoFormPage />
                }
              />
              {/* Tipos de Atividade */}
              <Route path="tipos-servico" element={<TipoAtividadeListPage />} />
              <Route path="tipos-servico/criar" element={
                                      <TipoAtividadeFormPage />
                }
              />
              <Route path="tipos-servico/editar/:id" element={
                                      <TipoAtividadeFormPage />
                }
              />
              {/* Relatórios Consolidados */}
              <Route path="relatorios" element={<RelatoriosPage />} />
            </Route>

            {/* ==========================================
                404 INTERNO: Usuário logado digita rota errada
                ========================================== */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        {/* ==========================================
            404 EXTERNO: Visitante digita rota errada
            ========================================== */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;