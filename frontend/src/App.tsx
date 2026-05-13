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
import { GuiaAbastecimentoFormPage } from "./domains/operacao/guias/pages/GuiaAbastecimentoFormPage_old";
import TipoAtividadeListPage from "./domains/operacao/tipos-atividade/pages/TipoAtividadeListPage";
import TipoAtividadeFormPage from "./domains/operacao/tipos-atividade/pages/TipoAtividadeFormPage";

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
                  <RequirePermission allow={(me) => Boolean(me.is_staff)}>
                    <UsuarioListPage />
                  </RequirePermission>
                }
              />
              <Route path="criar" element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff)}>
                    <UsuarioFormPage />
                  </RequirePermission>
                }
              />
              <Route path="editar/:id" element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff)}>
                    <UsuarioFormPage />
                  </RequirePermission>
                }
              />
              <Route path="permissoes" element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff)}>
                    <UsuariosPermissoesPage />
                  </RequirePermission>
                }
              />
            </Route>

            {/* ====== 1. PESSOAS ====== */}
            <Route path="pessoas">
              <Route index element={<PessoaListPage />} />
              <Route path="criar" element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_frota)}>
                    <PessoaFormPage />
                  </RequirePermission>
                }
              />
              <Route path="editar/:id" element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_frota)}>
                    <PessoaFormPage />
                  </RequirePermission>
                }
              />
            </Route>

            {/* ====== 2. ORGANIZAÇÃO ====== */}
            <Route path="organizacao">
              <Route path="secretarias" element={<SecretariaListPage />} />
              <Route path="secretarias/criar" element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_cadastros)}>
                    <SecretariaFormPage />
                  </RequirePermission>
                }
              />
              <Route path="secretarias/editar/:id" element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_cadastros)}>
                    <SecretariaFormPage />
                  </RequirePermission>
                }
              />

              <Route path="instituicoes" element={<InstituicaoListPage />} />
              <Route path="instituicoes/criar" element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_cadastros)}>
                    <InstituicaoFormPage />
                  </RequirePermission>
                }
              />
              <Route path="instituicoes/editar/:id" element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_cadastros)}>
                    <InstituicaoFormPage />
                  </RequirePermission>
                }
              />
            </Route>

            {/* ====== 3. FROTA ====== */}
            <Route path="frota">
              {/* Veículos */}
              <Route path="veiculos" element={<VeiculoListPage />} />
              <Route path="veiculos/criar" element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_frota)}>
                    <VeiculoFormPage />
                  </RequirePermission>
                }
              />
              <Route path="veiculos/editar/:id" element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_frota)}>
                    <VeiculoFormPage />
                  </RequirePermission>
                }
              />

              {/* Rotas */}
              <Route path="rotas" element={<RotaListPage />} />
              <Route path="rotas/criar" element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_cadastros)}>
                    <RotaFormPage />
                  </RequirePermission>
                }
              />
              <Route path="rotas/editar/:id" element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_cadastros)}>
                    <RotaFormPage />
                  </RequirePermission>
                }
              />

              {/* Tipos de Combustível */}
              <Route path="tipos-combustivel" element={<TipoCombustivelListPage />} />
              <Route path="tipos-combustivel/criar" element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_cadastros)}>
                    <TipoCombustivelFormPage />
                  </RequirePermission>
                }
              />
              <Route path="tipos-combustivel/editar/:id" element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_cadastros)}>
                    <TipoCombustivelFormPage />
                  </RequirePermission>
                }
              />
            </Route>

            {/* ====== 4. OPERAÇÃO ====== */}
            <Route path="operacao">
              {/* Guias de Abastecimento */}
              <Route path="guias" element={<GuiaAbastecimentoListPage />} />
              <Route path="guias/criar" element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_create_guia_abastecimento)}>
                    <GuiaAbastecimentoFormPage />
                  </RequirePermission>
                }
              />
              <Route path="guias/editar/:id" element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_edit_guia_abastecimento)}>
                    <GuiaAbastecimentoFormPage />
                  </RequirePermission>
                }
              />
              {/* Tipos de Atividade */}
              <Route path="tipos-servico" element={<TipoAtividadeListPage />} />
              <Route path="tipos-servico/criar" element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_cadastros)}>
                    <TipoAtividadeFormPage />
                  </RequirePermission>
                }
              />
              <Route path="tipos-servico/editar/:id" element={
                  <RequirePermission allow={(me) => Boolean(me.is_staff || me.can_write_cadastros)}>
                    <TipoAtividadeFormPage />
                  </RequirePermission>
                }
              />
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