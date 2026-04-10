// ==========================================
// 1. ORGANIZAÇÃO
// ==========================================

export interface Secretaria {
  id: number;
  nome: string;
  sigla: string;
}

export interface Instituicao {
  id: number;
  nome: string;
  tipo: string;
  secretaria: number;
}

// ==========================================
// 2. PESSOAS (Antigo Condutor)
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
  id?: number;
  placa: string;
  modelo: string;
  tipo_locomocao: string; // "TERRESTRE" | "FLUVIAL"
  capacidade_carga_kg: number;
  capacidade_pessoas: number;

  tipo_veiculo_id: number;
  tipo_veiculo_nome: string;
  
  tipo_combustivel_id: number;
  tipo_combustivel_nome: string;
  
  consumo_estimado_combustivel: number;
  consumo_estimado_oleo?: number | null;
  hodometro_atual: number;
  unidade_consumo: string; // "KM_POR_L" | "H_POR_L"
  secretaria: number;
}

export interface Rota {
  id: number;
  nome: string;

  // IDs para referências
  secretaria_id?: number | null;
  instituicao_id?: number | null;
  
  // Campos de Leitura (Vindos do ReadSerializer para facilitar a UI)
  secretaria_nome?: string;
  instituicao_nome: string;

  distancia_km?: string | number;  // Usa string|number pois recebe/retorna um valor do tipo Decimal
  consumo_estimado_combustivel: string | number;
  consumo_estimado_oleo: string | number;

  detalhes?: string;
  ativa: boolean;
}

// ==========================================
// 4. OPERAÇÃO
// ==========================================

export interface TipoServico {
  id: number;
  nome: string;
}

export interface AlocacaoServico {
  id: number;
  
  // IDs para referências
  pessoa_id: number;
  tipo_servico_id: number;
  
  // Campos de Leitura (Vindos do ReadSerializer para facilitar a UI)
  pessoa_nome?: string;
  tipo_servico_nome?: string;
  
  is_principal: boolean;
}

export interface OperadorVeiculo { // Antiga Lotacao
  id: number;
  
  // IDs
  pessoa_id: number;
  veiculo_id: number;
  
  // Campos de Leitura
  pessoa_nome?: string;
  veiculo_placa?: string;
  
  is_principal: boolean;
}

export interface GuiaAbastecimento {
  id: number;
  data_hora: string;
  
  // Referências atualizadas para a nova arquitetura
  tipo_servico_id: number; 
  pessoa_id: number;
  veiculo_id: number;
  secretaria_id: number;
  instituicao_id: number;
  rota_id?: number | null;
  tipo_combustivel_id: number;
  tipo_veiculo_id: number;
  
  // Dados extras para visualização (Read)
  pessoa_nome?: string;
  veiculo_placa?: string;
  instituicao_display: string;
  tipo_servico_nome?: string;
  usuario_nome?: string;
  tipo_combustivel_nome: string;
  tipo_veiculo_id_display: string;
  
  // Combustível e Regras
  quantidade_combustivel: number;
  quantidade_oleo?: number | null;

  // Hodômetro
  hodometro_anterior?: number | null;
  hodometro_atual?: number | null;
  distancia_percorrida?: number | null;
  
  observacao?: string;
  
  usuario_id?: number;
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

  can_write_cadastros: boolean;
  can_write_frota: boolean;
  can_create_guia_abastecimento: boolean;
  can_edit_guia_abastecimento: boolean;
  can_delete_guia_abastecimento: boolean;
}

