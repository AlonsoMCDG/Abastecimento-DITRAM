import type {
  VeiculoFormInput,
  VeiculoFormOutput,
} from "../schemas/veiculo.form";

import type {
  VeiculoWriteDTO,
  VeiculoReadDTO,
} from "../schemas/veiculo.dto";


// ============================================================
// FORM → API
// ============================================================

export function mapFormToWriteDTO(
  form: VeiculoFormOutput
): VeiculoWriteDTO {

  return {
    modelo: form.modelo,
    placa: form.placa,
    categoria: form.categoria,

    ativo: form.ativo,

    unidade_consumo: form.unidade_consumo,

    hodometro_atual: form.hodometro_atual,

    consumo_estimado_combustivel:
      form.consumo_estimado_combustivel,

    consumo_estimado_oleo:
      form.consumo_estimado_oleo,

    capacidade_carga_kg:
      form.capacidade_carga_kg,

    capacidade_pessoas:
      form.capacidade_pessoas,

    // O formulário utiliza *_id para facilitar
    // o Select, enquanto o DTO de escrita utiliza
    // o nome do relacionamento.
    tipo_combustivel:
      form.tipo_combustivel_id,
  };
}


// ============================================================
// API → FORM
// ============================================================

export function mapReadToForm(
  data: VeiculoReadDTO
): VeiculoFormInput {

  return {
    modelo: data.modelo,

    placa: data.placa,

    categoria: data.categoria,

    ativo: data.ativo,

    tipo_combustivel_id:
      data.tipo_combustivel_id,

    unidade_consumo:
      data.unidade_consumo,

    hodometro_atual:
      data.hodometro_atual,

    consumo_estimado_combustivel:
      data.consumo_estimado_combustivel,

    consumo_estimado_oleo:
      data.consumo_estimado_oleo,

    capacidade_carga_kg:
      data.capacidade_carga_kg,

    capacidade_pessoas:
      data.capacidade_pessoas,
  };
}