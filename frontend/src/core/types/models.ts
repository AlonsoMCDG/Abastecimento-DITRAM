// ==========================================
// 1. ORGANIZAÇÃO
// ==========================================

export interface Secretaria {
  id: number;
  nome: string;
  sigla: string;
  ativo: boolean;
}

export interface Instituicao {
  id: number;
  nome: string;
  tipo: string;
  tipo_nome?: string;
  
  secretaria_id: number;
  secretaria_nome?: string;
  secretaria_sigla?: string;
  
  ativo: boolean;
}

// ==========================================
// 2. PESSOAS
// ==========================================

export interface Pessoa {
  id: number;
  cpf: string;
  nome: string;
  ativo: boolean;
}

// ==========================================
// 3. FROTA
// ==========================================

export interface Veiculo {
  id: number;
  modelo: string;
  placa: string;

  categoria: string;
  categoria_nome?: string;

  ativo: boolean;
  
  hodometro_atual: number | string;

  unidade_consumo: string; 
  unidade_consumo_nome?: string;

  consumo_estimado_combustivel?: number | string | null;
  consumo_estimado_oleo?: number | string | null;

  capacidade_carga_kg?: number | null;
  capacidade_pessoas?: number | null;
  
  tipo_combustivel_id: number;
  tipo_combustivel_nome?: string;
}

export interface Rota {
  id: number;
  nome: string;

  distancia_km?: number | string | null;
  ativa: boolean;

  secretaria_id: number;
  secretaria_nome?: string;
  secretaria_sigla?: string;

  detalhes?: string | null;
}

export interface TipoCombustivel {
  id: number;
  nome: string;
  slug?: string | null;
  ativo: boolean;
}

// ==========================================
// 4. OPERAÇÃO
// ==========================================

export interface TipoServico {
  id: number;
  nome: string;
  ativo: boolean;
}

export interface GuiaAbastecimento {
  id: number;
  data_hora: string;

  // ==========================================
  // MODALIDADE
  // ==========================================
  modalidade: string;
  modalidade_nome?: string;

  // ==========================================
  // REFERÊNCIAS (FKs)
  // ==========================================
  pessoa_id: number;
  pessoa_nome?: string;

  veiculo_id?: number | null;
  veiculo_display?: string;

  tipo_veiculo?: string | null;
  veiculo_descricao?: string | null;

  secretaria_id: number;
  secretaria_nome?: string | null;
  secretaria_sigla?: string | null;

  instituicao_id?: number | null;
  instituicao_nome?: string;

  rota_id?: number | null;
  rota_nome?: string | null;

  tipo_atividade_id?: number | null;
  tipo_atividade_nome?: string;

  tipo_combustivel_id: number;
  tipo_combustivel_nome?: string;

  usuario_id?: number;
  usuario_nome?: string;

  // ==========================================
  // COMBUSTÍVEL
  // ==========================================
  quantidade_combustivel: number | string;
  quantidade_oleo?: number | string | null;

  periodo_uso_dias?: number | null;

  // ==========================================
  // OUTROS CAMPOS
  // ==========================================
  observacao?: string | null;
  rota_manual?: string | null;

  // ==========================================
  // CONTROLE
  // ==========================================
  criado_em?: string;
  atualizado_em?: string;

  // ==========================================
  // CAMPOS DE TELA (frontend)
  // ==========================================
  distancia_percorrida?: number | null;
  rota_distancia_km?: number | null;
}

export interface GuiaAbastecimentoWrite {
  data_hora: string;

  modalidade: string;

  pessoa_id: number;

  veiculo_id?: number | null;
  tipo_veiculo?: string | null;
  veiculo_descricao?: string | null;

  secretaria_id: number;

  instituicao_id?: number | null;

  rota_id?: number | null;
  rota_manual?: string | null;

  tipo_atividade_id?: number | null;
  tipo_atividade_nome?: string;

  tipo_combustivel_id: number;

  quantidade_combustivel: number | string;
  quantidade_oleo?: number | string | null;

  periodo_uso_dias?: number | null;

  observacao?: string | null;
}

export interface GuiaAbastecimentoRead {
  id: number;
  data_hora: string;

  modalidade: string;
  modalidade_nome?: string;

  pessoa_id: number;
  pessoa_nome?: string;

  veiculo_id?: number | null;
  veiculo_display?: string;

  tipo_veiculo?: string | null;
  veiculo_descricao?: string | null;

  secretaria_id: number;
  secretaria_nome?: string;
  secretaria_sigla?: string;

  instituicao_id?: number | null;
  instituicao_nome?: string;

  rota_id?: number | null;
  rota_nome?: string | null;

  tipo_atividade_id?: number | null;
  tipo_atividade_nome?: string;

  tipo_combustivel_id: number;
  tipo_combustivel_nome?: string;

  usuario_id?: number;
  usuario_nome?: string;

  quantidade_combustivel: number | string;
  quantidade_oleo?: number | string | null;

  periodo_uso_dias?: number | null;

  observacao?: string | null;

  criado_em?: string;
  atualizado_em?: string;
}

export interface RegistroHodometroDiario {
  id: number;
  guia_id: number;
  data_referencia: string;

  hodometro_inicial: number | string;
  hodometro_final: number | string;

  distancia_percorrida: number | string;
}

// ==========================================
// 5. SISTEMA / USUÁRIOS
// ==========================================

export interface Usuario {
  id: number;
  cpf: string;

  email?: string;
  first_name?: string;
  last_name?: string;
  
  password?: string;

  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;

  can_write_cadastros: boolean;
  can_write_frota: boolean;

  can_create_guia_abastecimento: boolean;
  can_edit_guia_abastecimento: boolean;
  can_delete_guia_abastecimento: boolean;
}
