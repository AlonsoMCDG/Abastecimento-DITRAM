import type { VeiculoFormData } from "./schemas/veiculo.form.zod";
import type { VeiculoWriteDTO } from "./schemas/veiculo.write.zod";
import type { VeiculoReadDTO } from "./schemas/veiculo.read.zod";

export function mapFormToWriteDTO(form: VeiculoFormData): VeiculoWriteDTO {
  // A conversão profunda de tipos (string -> number) 
  // já foi tratada lindamente pelo Zod no objeto `form`!
  return {
    modelo: form.modelo,
    placa: form.placa,
    categoria: form.categoria,
    ativo: form.ativo,
    consumo_estimado_combustivel: form.consumo_estimado_combustivel,
    consumo_estimado_oleo: form.consumo_estimado_oleo,
    unidade_consumo: form.unidade_consumo,
    hodometro_atual: form.hodometro_atual,
    capacidade_carga_kg: form.capacidade_carga_kg,
    capacidade_pessoas: form.capacidade_pessoas,
    tipo_combustivel_id: form.tipo_combustivel_id,
  };
}

export function mapReadToForm(data: VeiculoReadDTO): Partial<VeiculoFormData> {
  return {
    modelo: data.modelo,
    placa: data.placa,
    categoria: data.categoria,
    ativo: data.ativo,
    tipo_combustivel_id: data.tipo_combustivel_id,
    unidade_consumo: data.unidade_consumo,
    
    hodometro_atual: data.hodometro_atual,
    consumo_estimado_combustivel: data.consumo_estimado_combustivel,
    consumo_estimado_oleo: data.consumo_estimado_oleo,
    capacidade_carga_kg: data.capacidade_carga_kg,
    capacidade_pessoas: data.capacidade_pessoas,
  };
}