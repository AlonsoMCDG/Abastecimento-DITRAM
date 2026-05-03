export const ROUTES = {
  // -----------------------
  // SISTEMA E USUÁRIOS
  // -----------------------
  sistema: {
    perfil: "/perfil",
    db: "/sistema/banco",
    usuarios: {
      list: "/usuarios",
      create: "/usuarios/criar",
      edit: (id: number) => `/usuarios/editar/${id}`,
    }
  },

  // -----------------------
  // 1. PESSOAS
  // -----------------------
  pessoas: {
    base: {
      list: "/pessoas",
      create: "/pessoas/criar",
      edit: (id: number) => `/pessoas/editar/${id}`,
    }
  },

  // -----------------------
  // 2. ORGANIZAÇÃO
  // -----------------------
  organizacao: {
    secretarias: {
      list: "/organizacao/secretarias",
      create: "/organizacao/secretarias/criar",
      edit: (id: number) => `/organizacao/secretarias/editar/${id}`,
    },
    instituicoes: {
      list: "/organizacao/instituicoes",
      create: "/organizacao/instituicoes/criar",
      edit: (id: number) => `/organizacao/instituicoes/editar/${id}`,
    }
  },

  // -----------------------
  // 3. FROTA
  // -----------------------
  frota: {
    veiculos: {
      list: "/frota/veiculos",
      create: "/frota/veiculos/criar",
      edit: (id: number) => `/frota/veiculos/editar/${id}`,
    },
    rotas: {
      list: "/frota/rotas",
      create: "/frota/rotas/criar",
      edit: (id: number) => `/frota/rotas/editar/${id}`,
    }
  },

  // -----------------------
  // 4. OPERAÇÃO
  // -----------------------
  operacao: {
    tiposAtividade: {
      list: "/operacao/atividades",
      create: "/operacao/atividades/criar",
      edit: (id: number) => `/operacao/atividades/editar/${id}`,
    },
    guias: {
      list: "/operacao/guias",
      create: "/operacao/guias/criar",
      edit: (id: number) => `/operacao/guias/editar/${id}`,
    }
  },
};