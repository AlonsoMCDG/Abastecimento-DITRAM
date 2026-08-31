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
  // CHOICES (FONTE ÚNICA DE VERDADE DOS ENUMS)
  // Servidos pelos models do backend. NÃO copie listas de opções
  // estáticas nos schemas de UI — aponte para aqui.
  // -----------------------
  choices: {
    base: "/v1/choices/",
    veiculoCategoria: "/v1/choices/veiculo/categoria/",
    veiculoUnidadeConsumo: "/v1/choices/veiculo/unidade_consumo/",
    guiaModalidade: "/v1/choices/guia/modalidade/",
    guiaTipoVeiculo: "/v1/choices/guia/tipo_veiculo/",
    instituicaoTipo: "/v1/choices/instituicao/tipo/",
  },

  // -----------------------
  // FROTA
  // -----------------------
  frota: {
    veiculos: "/v1/frota/veiculos/",
    veiculosLookup: "/v1/frota/veiculos/lookup/",
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
    tiposAtividade: "/v1/operacao/atividades/",
    tiposAtividadeLookup: "/v1/operacao/atividades/lookup/",
    guias: "/v1/operacao/guias/",
  },
}