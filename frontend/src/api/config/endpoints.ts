export const ENDPOINTS = {
  // -----------------------
  // AUTENTICAÇÃO
  // -----------------------
  auth: {
    login: "/login/",
    refresh: "/token/refresh/",
  },

  usuarios: {
    base: "/v1/usuarios/",
    me: "/v1/usuarios/me/",
    register: "/v1/usuarios/register/",
  },

  // -----------------------
  // CORE / SISTEMA
  // -----------------------
  core: {
    stats: "/core/db/stats/",
    seedForce: "/core/db/seed-force/",
    flush: "/core/db/flush/",
    resetAndSeed: "/core/db/reset-and-seed/",
    backupDumpdata: "/core/db/backup/dumpdata/",
    backupSqlite: "/core/db/backup/sqlite/",
    uploadJson: "/core/db/upload-json/",
  },

  // -----------------------
  // FROTA
  // -----------------------
  frota: {
    veiculos: "/v1/frota/veiculos/",
    veiculosLookup: "/v1/frota/veiculos/lookup/",
    tiposVeiculo: "/v1/frota/tipos-veiculo/",
    tiposVeiculoLookup: "/v1/frota/tipos-veiculo/lookup/",
    rotas: "/v1/frota/rotas/",
    rotasLookup: "/v1/frota/rotas/lookup/",
    tiposCombustivel: "/v1/frota/tipos-combustivel/",
    tiposCombustivelLookup: "/v1/frota/tipos-combustivel/lookup/",
  },

  // -----------------------
  // ORGANIZAÇÃO
  // -----------------------
  organizacao: {
    secretarias: "/v1/organizacao/secretarias/",
    secretariasLookup: "/v1/organizacao/secretarias/lookup/",
    instituicoes: "/v1/organizacao/instituicoes/",
    instituicoesLookup: "/v1/organizacao/instituicoes/lookup/",
  },

  // -----------------------
  // PESSOAS
  // -----------------------
  pessoas: {
    base: "/v1/pessoas/base/",
    lookup: "/v1/pessoas/base/lookup/",
  },

  // -----------------------
  // OPERAÇÃO
  // -----------------------
  operacao: {
    tiposServico: "/v1/operacao/tipos-servico/",
    tiposServicoLookup: "/v1/operacao/tipos-servico/lookup/",
    alocacoesServico: "/v1/operacao/alocacoes-servicos/",
    alocacoesServicoLookup: "/v1/operacao/alocacoes-servicos/lookup/",
    operadoresVeiculos: "/v1/operacao/operadores-veiculos/",
    guias: "/v1/operacao/guias/",
  },
}